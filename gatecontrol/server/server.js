const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

// Configuration
const CONFIG = {
  port: process.env.PORT || 8080,
  heartbeatTimeout: 60000,
  cleanupInterval: 15000,
  pingLatencyMin: 50,
  pingLatencyMax: 500
};

// State
const players = new Map(); // gateId -> PlayerState
const pingMatrix = new Map(); // "sourceGate:targetGate" -> {outbound, inbound}

class PlayerState {
  constructor(gateId, operatorCallsign, shiftStart, ws) {
    this.playerId = uuidv4();
    this.gateId = gateId;
    this.operatorCallsign = operatorCallsign;
    this.shiftStart = shiftStart;
    this.connectedAt = Date.now();
    this.lastHeartbeat = Date.now();
    this.ws = ws;
    this.dndMsg = false;
    this.dndPing = false;
    this.dndAll = false;
    this.gameActive = false; // true when in active game with running timer
  }

  toJSON() {
    return {
      gateId: this.gateId,
      operatorCallsign: this.operatorCallsign,
      connectedAt: this.connectedAt,
      shiftStart: this.shiftStart,
      dndMsg: this.dndMsg,
      dndPing: this.dndPing,
      gameActive: this.gameActive
    };
  }
}

// Utility functions
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializePingMatrix(gateA, gateB) {
  const keyAB = `${gateA}:${gateB}`;
  const keyBA = `${gateB}:${gateA}`;

  if (!pingMatrix.has(keyAB)) {
    pingMatrix.set(keyAB, {
      outbound: randomRange(CONFIG.pingLatencyMin, CONFIG.pingLatencyMax),
      inbound: randomRange(CONFIG.pingLatencyMin, CONFIG.pingLatencyMax)
    });
  }

  if (!pingMatrix.has(keyBA)) {
    pingMatrix.set(keyBA, {
      outbound: randomRange(CONFIG.pingLatencyMin, CONFIG.pingLatencyMax),
      inbound: randomRange(CONFIG.pingLatencyMin, CONFIG.pingLatencyMax)
    });
  }
}

function getPingMatrix(gateId) {
  const matrix = {};

  for (const [key, value] of pingMatrix.entries()) {
    const [source, target] = key.split(":");
    if (source === gateId) {
      if (!matrix[source]) matrix[source] = {};
      matrix[source][target] = value;
    }
  }

  return matrix;
}

function broadcast(msg, excludeGateId = null) {
  const msgStr = JSON.stringify(msg);

  for (const [gateId, player] of players.entries()) {
    if (gateId === excludeGateId) continue;
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msgStr);
    }
  }
}

function sendToPlayer(gateId, msg) {
  const player = players.get(gateId);
  if (player && player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(msg));
  }
}

// Message handlers
function handleConnect(ws, data) {
  const { gateId, operatorCallsign, shiftStart } = data;

  // Validation
  if (!gateId || !gateId.startsWith("GATE-")) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "INVALID_GATE_ID", message: "Gate ID must start with GATE-" }
    });
    return;
  }

  // Remove existing player with same gate ID (reconnection)
  if (players.has(gateId)) {
    const existing = players.get(gateId);
    existing.ws.close();
    players.delete(gateId);
  }

  // Create player
  const player = new PlayerState(gateId, operatorCallsign, shiftStart, ws);
  players.set(gateId, player);

  // Initialize ping matrix for this player vs all others
  for (const [otherGateId] of players.entries()) {
    if (otherGateId !== gateId) {
      initializePingMatrix(gateId, otherGateId);
    }
  }

  // Send welcome to connecting player
  sendToPlayer(gateId, {
    type: "welcome",
    timestamp: Date.now(),
    data: {
      playerId: player.playerId,
      playerCount: players.size,
      pingMatrix: getPingMatrix(gateId)
    }
  });

  // Don't broadcast player list yet - wait for game_state_change to indicate player is active
  // This prevents duplicate join messages with incorrect counts

  console.log(`Player connected: ${gateId} (${operatorCallsign}) - Total: ${players.size}`);
}

function handleDisconnect(gateId, reason = "disconnect") {
  const player = players.get(gateId);
  if (!player) return;

  players.delete(gateId);

  // Clean up ping matrix
  const keysToDelete = [];
  for (const key of pingMatrix.keys()) {
    if (key.includes(gateId)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => pingMatrix.delete(k));

  // Broadcast updated player list with reason and gateId
  broadcastPlayerList("leave", reason, gateId);

  console.log(`Player disconnected: ${gateId} (${reason}) - Total: ${players.size}`);
}

function handlePingPlayer(data) {
  const { sourceGateId, targetGateId } = data;

  const targetPlayer = players.get(targetGateId);
  if (!targetPlayer) {
    sendToPlayer(sourceGateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "PLAYER_NOT_FOUND", message: `Player ${targetGateId} not found` }
    });
    return;
  }

  // Check DND
  if (targetPlayer.dndPing || targetPlayer.dndAll) {
    sendToPlayer(sourceGateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "PLAYER_DND", message: `Player ${targetGateId} is in DND mode` }
    });
    return;
  }

  // Get expected latency
  const key = `${sourceGateId}:${targetGateId}`;
  const latency = pingMatrix.get(key);
  const expectedLatency = latency ? latency.outbound : 300;

  // Forward ping to target with delay
  setTimeout(() => {
    sendToPlayer(targetGateId, {
      type: "ping_received",
      timestamp: Date.now(),
      data: {
        sourceGateId,
        sourceOperator: players.get(sourceGateId)?.operatorCallsign || "UNKNOWN",
        expectedLatency
      }
    });
  }, expectedLatency);
}

function handleAckPlayer(data) {
  const { sourceGateId, targetGateId, latency } = data;

  // Get expected latency for return path
  const keyReturn = `${sourceGateId}:${targetGateId}`;
  const latencyReturn = pingMatrix.get(keyReturn);
  const expectedLatency = latencyReturn ? latencyReturn.inbound : 300;

  // Forward ACK back to original pinger with delay
  setTimeout(() => {
    sendToPlayer(targetGateId, {
      type: "ack_received",
      timestamp: Date.now(),
      data: {
        sourceGateId,
        sourceOperator: players.get(sourceGateId)?.operatorCallsign || "UNKNOWN",
        actualLatency: latency,
        expectedLatency
      }
    });
  }, expectedLatency);
}

function handleMessage(data) {
  const { gateId, operatorCallsign, text, senderRelayScore } = data;

  // Validation
  if (!text || text.length > 160) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "MESSAGE_TOO_LONG", message: "Message must be 1-160 characters" }
    });
    return;
  }

  // Broadcast to all players with individual delays
  for (const [targetGateId, targetPlayer] of players.entries()) {
    if (targetGateId === gateId) continue; // Don't send to self
    if (targetPlayer.dndMsg || targetPlayer.dndAll) continue; // Skip DND players

    // Get transmission delay
    const key = `${gateId}:${targetGateId}`;
    const latency = pingMatrix.get(key);
    const delay = latency ? latency.outbound : 300;

    sendToPlayer(targetGateId, {
      type: "message_received",
      timestamp: Date.now(),
      data: {
        gateId,
        operatorCallsign,
        text,
        delay,
        senderRelayScore: senderRelayScore || 0
      }
    });
  }

  console.log(`Message from ${gateId}: ${text}`);
}

function handleDndUpdate(data) {
  const { gateId, dndMsg, dndPing, dndAll } = data;

  const player = players.get(gateId);
  if (!player) return;

  player.dndMsg = dndMsg;
  player.dndPing = dndPing;
  player.dndAll = dndAll;

  broadcastPlayerList("update");

  console.log(`DND update: ${gateId} - msg:${dndMsg} ping:${dndPing} all:${dndAll}`);
}

function handleGameStateChange(data) {
  const { gateId, gameActive, reason } = data;

  const player = players.get(gateId);
  if (!player) return;

  const previousState = player.gameActive;
  player.gameActive = gameActive;

  // Broadcast player list with appropriate change type
  if (previousState && !gameActive) {
    // Player stopped playing (went offline)
    broadcastPlayerList("leave", reason || "disconnect", gateId);
    console.log(`Player went offline: ${gateId} (gameActive: false, reason: ${reason || "disconnect"})`);
  } else if (!previousState && gameActive) {
    // Player started playing (went online)
    broadcastPlayerList("join");
    console.log(`Player went online: ${gateId} (gameActive: true)`);
  } else {
    // No change in online status
    broadcastPlayerList("update");
  }
}

function handleHeartbeat(gateId) {
  const player = players.get(gateId);
  if (player) {
    player.lastHeartbeat = Date.now();
  }
}

function broadcastPlayerList(changeType, reason = null, gateId = null) {
  // Only include players who are actively playing (gameActive: true)
  const activePlayerArray = Array.from(players.values())
    .filter(p => p.gameActive)
    .map(p => p.toJSON());

  broadcast({
    type: "player_list",
    timestamp: Date.now(),
    data: {
      players: activePlayerArray,
      playerCount: activePlayerArray.length,
      changeType,
      reason,
      gateId
    }
  });
}

// Cleanup stale connections
function cleanupStaleConnections() {
  const now = Date.now();
  const staleGates = [];

  for (const [gateId, player] of players.entries()) {
    if (now - player.lastHeartbeat > CONFIG.heartbeatTimeout) {
      staleGates.push(gateId);
    }
  }

  staleGates.forEach(gateId => {
    console.log(`Cleaning up stale connection: ${gateId}`);
    handleDisconnect(gateId);
  });
}

// WebSocket server
const wss = new WebSocket.Server({ port: CONFIG.port });

wss.on("connection", (ws) => {
  let gateId = null;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case "connect":
          gateId = msg.data.gateId;
          handleConnect(ws, msg.data);
          break;
        case "disconnect":
          if (gateId) handleDisconnect(gateId, msg.data.reason);
          break;
        case "ping_player":
          handlePingPlayer(msg.data);
          break;
        case "ack_player":
          handleAckPlayer(msg.data);
          break;
        case "message":
          handleMessage(msg.data);
          break;
        case "dnd_update":
          handleDndUpdate(msg.data);
          break;
        case "game_state_change":
          handleGameStateChange(msg.data);
          break;
        case "heartbeat":
          handleHeartbeat(msg.data.gateId);
          break;
        default:
          console.warn("Unknown message type:", msg.type);
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    if (gateId) handleDisconnect(gateId);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// Start cleanup interval
setInterval(cleanupStaleConnections, CONFIG.cleanupInterval);

console.log(`Multiplayer server running on ws://localhost:${CONFIG.port}`);
