const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/url_shortener';
  const fallbackUri = 'mongodb://127.0.0.1:27017/url_shortener';
  
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000 // Timeout fast in 5 seconds if blocked by firewall
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (primaryUri !== fallbackUri) {
      console.log('Attempting connection to fallback Local MongoDB database...');
      try {
        const conn = await mongoose.connect(fallbackUri);
        console.log(`MongoDB Connected (Fallback Local): ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error(`Fallback MongoDB Connection Error: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
