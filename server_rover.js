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

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

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
  const telemetry = req.body.telemetry;

  if (!telemetry) {
    return res.status(400).send('Missing telemetry data');
  }

  console.log('📡 Received telemetry:', telemetry);

  try {
    if (!db) {
      console.error('❌ MongoDB not connected');
      return res.status(503).send('Database not connected');
    }

    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    telemetry.timestamp = formattedDateTime;

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


