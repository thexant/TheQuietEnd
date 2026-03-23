const WebSocket = require("ws");
const http = require("http");

// Configuration
const CONFIG = {
  wsPort: process.env.WS_PORT || 8081,
  httpPort: process.env.HTTP_PORT || 8082,
  heartbeatInterval: 30000
};

// Track connected clients
const clients = new Set();

// Create WebSocket server
const wss = new WebSocket.Server({ port: CONFIG.wsPort });

console.log(`WebSocket server starting on port ${CONFIG.wsPort}`);

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total clients: ${clients.size}`);

  // Send initial connection confirmation
  ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));

  // Setup heartbeat
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  let sent = 0;

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      sent++;
    }
  });

  console.log(`Broadcast "${message.type}" to ${sent} client(s)`);
}

// HTTP server for PHP to trigger notifications
const httpServer = http.createServer((req, res) => {
  // Only allow POST to /notify
  if (req.method === "POST" && req.url === "/notify") {
    broadcast({
      type: "new_message",
      timestamp: Date.now()
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

httpServer.listen(CONFIG.httpPort, "127.0.0.1", () => {
  console.log(`HTTP notify endpoint on http://127.0.0.1:${CONFIG.httpPort}/notify`);
});

// Heartbeat to detect stale connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      clients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, CONFIG.heartbeatInterval);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

console.log(`Dashboard WebSocket server running on ws://localhost:${CONFIG.wsPort}`);
