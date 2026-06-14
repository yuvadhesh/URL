const express = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const csv = require('csv-parser');
const Url = require('../models/Url');
const Click = require('../models/Click');
const auth = require('../middleware/auth');
const router = express.Router();

// Setup Multer for CSV upload in-memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Helper: Validate URL
const validateUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

// Helper: Generate unique short code
const generateUniqueCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8); // 6 character alphanumeric code
    const existing = await Url.findOne({ shortCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// @route   POST api/urls/shorten
// @desc    Create a shortened URL
// @access  Private
router.post('/shorten', auth, async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    if (!validateUrl(originalUrl)) {
      return res.status(400).json({ message: 'Invalid URL format. Include http:// or https://' });
    }

    let code = '';
    if (customAlias) {
      // Clean custom alias: alphanumeric or hyphen
      const cleanAlias = customAlias.trim().replace(/\s+/g, '-').toLowerCase();
      if (!/^[a-z0-9-_]+$/i.test(cleanAlias)) {
        return res.status(400).json({ message: 'Custom alias must be alphanumeric, hyphens, or underscores only' });
      }

      // Check if alias exists
      const existingAlias = await Url.findOne({ shortCode: cleanAlias });
      if (existingAlias) {
        return res.status(400).json({ message: 'This custom alias is already taken' });
      }
      code = cleanAlias;
    } else {
      code = await generateUniqueCode();
    }

    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ message: 'Invalid expiration date' });
      }
      if (expiryDate < new Date()) {
        return res.status(400).json({ message: 'Expiration date must be in the future' });
      }
    }

    const newUrl = new Url({
      originalUrl,
      shortCode: code,
      userId: req.user.id,
      expiresAt: expiryDate,
    });

    const savedUrl = await newUrl.save();
    res.status(201).json(savedUrl);
  } catch (error) {
    console.error('Shorten URL error:', error);
    res.status(500).json({ message: 'Server error creating shortened URL' });
  }
});

// @route   GET api/urls
// @desc    Get all URLs for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ message: 'Server error fetching URLs' });
  }
});

// @route   PUT api/urls/:id
// @desc    Edit destination URL
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Destination URL is required' });
    }

    if (!validateUrl(originalUrl)) {
      return res.status(400).json({ message: 'Invalid URL format. Include http:// or https://' });
    }

    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    url.originalUrl = originalUrl;
    const updatedUrl = await url.save();

    res.json(updatedUrl);
  } catch (error) {
    console.error('Edit URL error:', error);
    res.status(500).json({ message: 'Server error updating URL' });
  }
});

// @route   DELETE api/urls/:id
// @desc    Delete a shortened URL
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    await Url.findByIdAndDelete(req.params.id);
    // Delete associated click logs
    await Click.deleteMany({ urlId: req.params.id });

    res.json({ message: 'URL and its analytics deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error deleting URL' });
  }
});

// @route   POST api/urls/bulk
// @desc    Bulk shorten URLs from raw pasted text (textarea input)
// @access  Private
router.post('/bulk', auth, async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of URLs' });
    }

    const originalUrls = urls
      .map((u) => u.trim())
      .filter((u) => u && validateUrl(u));

    if (originalUrls.length === 0) {
      return res.status(400).json({ message: 'No valid URLs found in the list. Make sure to include http:// or https://' });
    }

    const results = [];
    for (const targetUrl of originalUrls) {
      const code = await generateUniqueCode();
      const newUrl = new Url({
        originalUrl: targetUrl,
        shortCode: code,
        userId: req.user.id,
      });
      const saved = await newUrl.save();
      results.push(saved);
    }

    res.status(201).json({
      message: `Successfully shortened ${results.length} URLs`,
      urls: results,
    });
  } catch (error) {
    console.error('Bulk shorten error:', error);
    res.status(500).json({ message: 'Server error during bulk shortening' });
  }
});

// @route   GET api/urls/:id/analytics
// @desc    Get analytics report for a specific URL (used in dashboard)
// @access  Private
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    // Get basic stats
    const totalClicks = await Click.countDocuments({ urlId: url._id });
    const lastClickRecord = await Click.findOne({ urlId: url._id }).sort({ timestamp: -1 });

    // Recent 50 clicks
    const recentClicks = await Click.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(50);

    // Device breakdown aggregation
    const deviceBreakdown = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Browser breakdown aggregation
    const browserBreakdown = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // OS breakdown aggregation
    const osBreakdown = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily trends aggregation for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = await Click.aggregate([
      { 
        $match: { 
          urlId: url._id, 
          timestamp: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      url,
      analytics: {
        totalClicks,
        lastVisited: lastClickRecord ? lastClickRecord.timestamp : null,
        recentClicks,
        deviceBreakdown: deviceBreakdown.map(item => ({ label: item._id || 'Unknown', value: item.count })),
        browserBreakdown: browserBreakdown.map(item => ({ label: item._id || 'Unknown', value: item.count })),
        osBreakdown: osBreakdown.map(item => ({ label: item._id || 'Unknown', value: item.count })),
        dailyTrends: dailyTrends.map(item => ({ date: item._id, clicks: item.count }))
      }
    });
  } catch (error) {
    console.error('Fetch URL analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics data' });
  }
});

// @route   GET api/urls/server-info
// @desc    Get server host and port details (including local IP)
// @access  Public
router.get('/server-info', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        localIp = alias.address;
        break;
      }
    }
    if (localIp !== 'localhost') break;
  }
  
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.headers.host}`;
  
  res.json({
    localIp,
    port: process.env.PORT || 5000,
    baseUrl
  });
});

// @route   GET api/urls/public/stats/:shortCode
// @desc    Get public analytics report by shortCode (no authentication required)
// @access  Public
router.get('/public/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Shortened link not found' });
    }

    // Get basic stats
    const totalClicks = await Click.countDocuments({ urlId: url._id });
    const lastClickRecord = await Click.findOne({ urlId: url._id }).sort({ timestamp: -1 });

    // Device breakdown aggregation
    const deviceBreakdown = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Browser breakdown aggregation
    const browserBreakdown = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily trends aggregation for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = await Click.aggregate([
      { 
        $match: { 
          urlId: url._id, 
          timestamp: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      url: {
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        clicksCount: url.clicksCount
      },
      analytics: {
        totalClicks,
        lastVisited: lastClickRecord ? lastClickRecord.timestamp : null,
        deviceBreakdown: deviceBreakdown.map(item => ({ label: item._id || 'Unknown', value: item.count })),
        browserBreakdown: browserBreakdown.map(item => ({ label: item._id || 'Unknown', value: item.count })),
        dailyTrends: dailyTrends.map(item => ({ date: item._id, clicks: item.count }))
      }
    });
  } catch (error) {
    console.error('Fetch public analytics error:', error);
    res.status(500).json({ message: 'Server error fetching public stats' });
  }
});

module.exports = router;
