const mongoose = require('mongoose');
const net = require('net');

// Helper to check if a port is in use
const isPortFree = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
};

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prepmetrics';

    // Parse port from URI if it's local
    const portMatch = mongoUri.match(/:(\d+)\//);
    const port = portMatch ? parseInt(portMatch[1], 10) : 27017;
    const isLocalhost = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');

    if (isLocalhost && await isPortFree(port)) {
      console.log(`No active database on port ${port}. Starting mongodb-memory-server...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: port,
          dbName: mongoUri.split('/').pop() || 'prepmetrics'
        }
      });
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Auto-seed if database is empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Running seeder...');
      const seed = require('../seeds/seeder');
      await seed();
    }
  } catch (err) {
    console.error(`DB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
