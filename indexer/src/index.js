import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory database of captured accessGranted events
const db = {
  events: [
    {
      id: "simulated-event-1",
      blockNumber: 1542120,
      txHash: "0x3c7e4367f08d0e513220a221f7a0de932df0c7e2",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      type: "access",
      details: "Access Granted. Anonymous proof verified: event-id-98df71"
    },
    {
      id: "simulated-event-2",
      blockNumber: 1542185,
      txHash: "0x4bb7cd9b49a60fa9e382f1b0a221a932df0c7e92",
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
      type: "registration",
      details: "Admin registered 1 new commitment leaf to the allowlist."
    }
  ],
  syncStatus: {
    currentBlock: 1542312,
    targetBlock: 1542312,
    status: "Synced",
    contractAddress: "cloak_contract1q95gskv9uxlqnswkxp095gskv9u3d2p7x92"
  }
};

// Middleware for console logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/status - Get current indexing status
app.get('/api/status', (req, res) => {
  res.json(db.syncStatus);
});

// GET /api/events - Get all captured accessGranted events
app.get('/api/events', (req, res) => {
  res.json(db.events);
});

// POST /api/events - Broadcast a new accessGranted event (called by frontend when ZK proof verifies)
app.post('/api/events', (req, res) => {
  const { eventId, type, details, txHash } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId" });
  }

  // Increment block count to simulate blockchain progression
  db.syncStatus.currentBlock += Math.floor(Math.random() * 5) + 1;
  db.syncStatus.targetBlock = db.syncStatus.currentBlock;

  const newEvent = {
    id: eventId,
    blockNumber: db.syncStatus.currentBlock,
    txHash: txHash || `0x${crypto.randomUUID().replace(/-/g, '').substring(0, 40)}`,
    timestamp: new Date().toLocaleTimeString(),
    type: type || "access",
    details: details || `Access Granted. Anonymous proof verified: ${eventId}`
  };

  db.events.unshift(newEvent);
  console.log(`[Indexer] Indexed new event: ${newEvent.id} at block ${newEvent.blockNumber}`);

  res.status(201).json({ message: "Event indexed successfully", event: newEvent });
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` CloakPass Event Indexer running on port ${PORT} `);
  console.log(` Status endpoint: http://localhost:${PORT}/api/status `);
  console.log(` Events endpoint: http://localhost:${PORT}/api/events `);
  console.log(`==================================================`);
});
