const express = require('express');
const Url = require('../models/Url');
const Click = require('../models/Click');
const router = express.Router();

// Helper: Parse user agent into device, browser, and OS
const parseUserAgent = (uaString) => {
  if (!uaString) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }

  let device = 'Desktop';
  if (/mobile|android|iphone|ipod|phone/i.test(uaString)) {
    device = 'Mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(uaString)) {
    device = 'Tablet';
  }

  let browser = 'Unknown';
  if (/edg/i.test(uaString)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(uaString)) {
    browser = 'Chrome';
  } else if (/firefox|iceweasel/i.test(uaString)) {
    browser = 'Firefox';
  } else if (/safari/i.test(uaString) && !/chrome|crios|edg/i.test(uaString)) {
    browser = 'Safari';
  } else if (/msie|trident/i.test(uaString)) {
    browser = 'Internet Explorer';
  }

  let os = 'Unknown';
  if (/windows/i.test(uaString)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(uaString)) {
    os = 'macOS';
  } else if (/android/i.test(uaString)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(uaString)) {
    os = 'iOS';
  } else if (/linux/i.test(uaString)) {
    os = 'Linux';
  }

  return { browser, os, device };
};

// Error page generator for beautiful fallback
const generateErrorPage = (title, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: radial-gradient(circle at center, #111827 0%, #0b0f19 100%);
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        .container {
          text-align: center;
          padding: 3rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px rgba(255, 255, 255, 0.08) solid;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          max-width: 450px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 1.1rem;
          color: #9ca3af;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          text-decoration: none;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          color: #0b0f19;
          font-weight: 600;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 242, 254, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="/" class="btn">Back to Home</a>
      </div>
    </body>
    </html>
  `;
};

// @route   GET /r/:shortCode
// @desc    Redirect short code to original URL and track click analytics
// @access  Public
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the URL mapping
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).send(generateErrorPage('404 Not Found', 'The shortened link you are looking for does not exist or has been removed.'));
    }

    // Check expiration
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).send(generateErrorPage('Link Expired', 'This shortened link has expired and is no longer available.'));
    }

    // Record Click Analytics in background
    const userAgent = req.headers['user-agent'];
    const { browser, os, device } = parseUserAgent(userAgent);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    // Create Click record
    const click = new Click({
      urlId: url._id,
      browser,
      os,
      device,
      ip: ip === '::1' ? '127.0.0.1' : ip,
    });

    await click.save();

    // Increment total clicks
    url.clicksCount += 1;
    await url.save();

    // Issue Redirect
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect handler error:', error);
    res.status(500).send(generateErrorPage('Server Error', 'An error occurred while redirecting you. Please try again later.'));
  }
});

module.exports = router;
