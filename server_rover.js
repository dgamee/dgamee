const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3030;

let db = null;

// MongoDB config
const mongoUrl = 'mongodb://192.168.1.114:27017';
const dbName = 'ROVER';
const collectionName = 'TELEMETRY';

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(client => {
  console.log('✅ Connected to MongoDB');
  db = client.db(dbName);
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err);
});

// Root route
app.get('/', (req, res) => {
  res.send('Telemetry server is running!');
});

// Telemetry endpoint
app.post('/telemetry', async (req, res) => {
  const telemetry = req.body;

  if (!telemetry || Object.keys(telemetry).length === 0) {
    return res.status(400).send('Missing telemetry payload');
  }

  console.log('📡 Received telemetry:', telemetry);

  try {
    if (!db) {
      console.error('❌ MongoDB not connected');
      return res.status(503).send('Database not connected');
    }

    telemetry.timestamp = new Date(); // auto add server time

    const result = await db.collection(collectionName).insertOne(telemetry);
    console.log('✅ Telemetry saved with _id:', result.insertedId);
    res.send('Telemetry saved!');
  } catch (err) {
    console.error('❌ Error saving telemetry to DB:', err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Telemetry server running at http://0.0.0.0:${PORT}`);
});
