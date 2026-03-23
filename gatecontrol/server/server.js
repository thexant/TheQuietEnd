const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

// Configuration
const CONFIG = {
  port: process.env.PORT || 8080,
  heartbeatTimeout: 60000,
  cleanupInterval: 15000,
  pingLatencyMin: 50,
  pingLatencyMax: 500,
  pingCooldown: 90000 // 90 seconds (1.5 minutes) cooldown between pings
};

// State
const players = new Map(); // gateId -> PlayerState
const pingMatrix = new Map(); // "sourceGate:targetGate" -> {outbound, inbound}
const pingCooldowns = new Map(); // "sourceGate:targetGate" -> lastPingTimestamp
const coopSessions = new Map(); // sessionId -> CoopSession
const playerToSession = new Map(); // playerId -> sessionId (for quick lookups)

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
    this.stats = {};
    this.mode = "normal";
    this.shiftDurationMs = null;
    this.health = "UNKNOWN";
    this.relayHealthState = "UNKNOWN";
  }

  toJSON() {
    return {
      gateId: this.gateId,
      operatorCallsign: this.operatorCallsign,
      connectedAt: this.connectedAt,
      shiftStart: this.shiftStart,
      dndMsg: this.dndMsg,
      dndPing: this.dndPing,
      gameActive: this.gameActive,
      stats: this.stats,
      mode: this.mode,
      shiftDurationMs: this.shiftDurationMs,
      health: this.health,
      relayHealthState: this.relayHealthState
    };
  }
}

class CoopSession {
  constructor(hostPlayerId, hostGateId) {
    this.sessionId = generateSessionCode();
    this.hostPlayerId = hostPlayerId;
    this.hostGateId = hostGateId;
    this.invitedPlayers = new Set(); // Set of playerIds
    this.locked = false;
    this.createdAt = Date.now();
    this.lastStateUpdate = Date.now();
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      hostGateId: this.hostGateId,
      invitedPlayerCount: this.invitedPlayers.size,
      locked: this.locked,
      createdAt: this.createdAt
    };
  }
}

// Utility functions
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars (exclude I,O,0,1 for clarity)
  let code;
  let attempts = 0;

  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    attempts++;
    if (attempts > 100) {
      // Fallback to UUID prefix if collision rate is impossibly high
      return uuidv4().substring(0, 6).toUpperCase();
    }
  } while (coopSessions.has(code));

  return code;
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
  const { gateId, operatorCallsign, shiftStart, isReconnection, health, relayHealthState } = data;

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
  const wasExisting = players.has(gateId);
  if (wasExisting) {
    const existing = players.get(gateId);
    existing.ws.close();
    players.delete(gateId);
  }

  // Create player
  const player = new PlayerState(gateId, operatorCallsign, shiftStart, ws);
  if (health) {
    player.health = health;
  }
  if (relayHealthState) {
    player.relayHealthState = relayHealthState;
  }
  player.isReconnection = isReconnection || wasExisting;
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

  console.log(`Player connected: ${gateId} (${operatorCallsign})${isReconnection ? ' [RECONNECTION]' : ''} - Total: ${players.size}`);
}

function handleDisconnect(gateId, reason = "disconnect") {
  const player = players.get(gateId);
  if (!player) return;

  // Clean up co-op session if player is in one
  const sessionId = playerToSession.get(player.playerId);
  if (sessionId) {
    const session = coopSessions.get(sessionId);
    if (session) {
      if (session.hostPlayerId === player.playerId) {
        // Host disconnected - destroy session
        destroyCoopSession(session, reason);
      } else {
        // Invited player disconnected - remove from session
        handleLeaveCoopSession({ gateId, reason });
      }
    }
  }

  players.delete(gateId);

  // Clean up ping matrix
  const keysToDelete = [];
  for (const key of pingMatrix.keys()) {
    if (key.includes(gateId)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => pingMatrix.delete(k));

  // Clean up ping cooldowns
  const cooldownKeysToDelete = [];
  for (const key of pingCooldowns.keys()) {
    if (key.includes(gateId)) {
      cooldownKeysToDelete.push(key);
    }
  }
  cooldownKeysToDelete.forEach(k => pingCooldowns.delete(k));

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

  // Check cooldown
  const cooldownKey = `${sourceGateId}:${targetGateId}`;
  const lastPingTime = pingCooldowns.get(cooldownKey);
  const now = Date.now();

  if (lastPingTime) {
    const timeSinceLastPing = now - lastPingTime;
    const remainingCooldown = CONFIG.pingCooldown - timeSinceLastPing;

    if (remainingCooldown > 0) {
      const secondsRemaining = Math.ceil(remainingCooldown / 1000);
      sendToPlayer(sourceGateId, {
        type: "error",
        timestamp: now,
        data: {
          code: "PING_COOLDOWN",
          message: `Ping cooldown active. Wait ${secondsRemaining}s before pinging ${targetGateId} again`
        }
      });
      return;
    }
  }

  // Record this ping time for cooldown tracking
  pingCooldowns.set(cooldownKey, now);

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
    const isReconnection = player.isReconnection || false;
    broadcastPlayerList("join", isReconnection ? "reconnect" : null, gateId, isReconnection);
    console.log(`Player went online: ${gateId} (gameActive: true)${isReconnection ? ' [RECONNECTION]' : ''}`);
    // Clear the reconnection flag after first join broadcast
    player.isReconnection = false;
  } else {
    // No change in online status
    broadcastPlayerList("update");
  }
}

function handleHeartbeat(data) {
  const player = players.get(data.gateId);
  if (player) {
    player.lastHeartbeat = Date.now();
    const prevHealth = player.health;
    const prevRelayHealth = player.relayHealthState;
    let modeChanged = false;
    let shiftDurationChanged = false;

    // Update operator callsign if it has changed
    if (data.operatorCallsign && data.operatorCallsign !== player.operatorCallsign) {
      player.operatorCallsign = data.operatorCallsign;
      // Broadcast updated player list so all clients see the new name
      broadcastPlayerList("update", "name_change", data.gateId);
    }

    // Update stats and mode if provided
    if (data.stats) {
      player.stats = data.stats;
    }
    if (data.mode && data.mode !== player.mode) {
      player.mode = data.mode;
      modeChanged = true;
    }
    if (typeof data.shiftDurationMs === "number" && Number.isFinite(data.shiftDurationMs)) {
      if (data.shiftDurationMs !== player.shiftDurationMs) {
        player.shiftDurationMs = data.shiftDurationMs;
        shiftDurationChanged = true;
      }
    }
    if (data.health) {
      player.health = data.health;
    }
    if (data.relayHealthState) {
      player.relayHealthState = data.relayHealthState;
    }
    const healthChanged = player.health !== prevHealth || player.relayHealthState !== prevRelayHealth;
    if (healthChanged || modeChanged || shiftDurationChanged) {
      const reason = healthChanged ? "health_change" : "shift_change";
      broadcastPlayerList("update", reason, data.gateId);
    }
  }
}

// Co-op session message handlers
function handleCreateCoopSession(ws, data) {
  const { gateId } = data;
  const player = players.get(gateId);

  if (!player) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "PLAYER_NOT_FOUND", message: "Player not connected" }
    });
    return;
  }

  // Check if player already hosts a session
  if (playerToSession.has(player.playerId)) {
    const existingSessionId = playerToSession.get(player.playerId);
    const existingSession = coopSessions.get(existingSessionId);
    if (existingSession && existingSession.hostPlayerId === player.playerId) {
      // Return existing session
      sendToPlayer(gateId, {
        type: "coop_session_created",
        timestamp: Date.now(),
        data: {
          sessionId: existingSession.sessionId,
          hostGateId: gateId,
          isExisting: true
        }
      });
      return;
    }
  }

  // Create new session
  const session = new CoopSession(player.playerId, gateId);
  coopSessions.set(session.sessionId, session);
  playerToSession.set(player.playerId, session.sessionId);

  sendToPlayer(gateId, {
    type: "coop_session_created",
    timestamp: Date.now(),
    data: {
      sessionId: session.sessionId,
      hostGateId: gateId
    }
  });

  console.log(`Co-op session created: ${session.sessionId} by ${gateId}`);
}

function handleJoinCoopSession(ws, data) {
  const { gateId, sessionId, operatorCallsign } = data;
  const player = players.get(gateId);

  if (!player) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "PLAYER_NOT_FOUND", message: "Player not connected" }
    });
    return;
  }

  const session = coopSessions.get(sessionId.toUpperCase());

  if (!session) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "SESSION_NOT_FOUND", message: "Invalid session code" }
    });
    return;
  }

  if (session.locked) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "SESSION_LOCKED", message: "Session is locked" }
    });
    return;
  }

  const totalPlayers = 1 + session.invitedPlayers.size;
  if (totalPlayers >= 4) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "SESSION_FULL", message: "Session full (4 players max)" }
    });
    return;
  }

  // Add to session
  session.invitedPlayers.add(player.playerId);
  playerToSession.set(player.playerId, session.sessionId);

  // Update operator callsign if provided
  if (operatorCallsign) {
    player.operatorCallsign = operatorCallsign;
  }

  // Send confirmation to joining player
  sendToPlayer(gateId, {
    type: "coop_session_joined",
    timestamp: Date.now(),
    data: {
      sessionId: session.sessionId,
      hostGateId: session.hostGateId,
      role: "invited"
    }
  });

  // Notify host of new player
  sendToPlayer(session.hostGateId, {
    type: "coop_player_joined",
    timestamp: Date.now(),
    data: {
      playerId: player.playerId,
      gateId: gateId,
      operatorCallsign: player.operatorCallsign || "OPERATOR",
      sessionId: session.sessionId
    }
  });

  // Broadcast updated participant list to all session members
  broadcastCoopParticipants(session);

  console.log(`Player ${gateId} joined co-op session ${session.sessionId}`);
}

function handleLeaveCoopSession(data) {
  const { gateId, reason } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session) return;

  // If host is leaving, destroy session
  if (session.hostPlayerId === player.playerId) {
    destroyCoopSession(session, reason || "host_disconnect");
    return;
  }

  // Remove invited player
  session.invitedPlayers.delete(player.playerId);
  playerToSession.delete(player.playerId);

  // Notify host
  sendToPlayer(session.hostGateId, {
    type: "coop_player_left",
    timestamp: Date.now(),
    data: {
      playerId: player.playerId,
      gateId: gateId,
      reason: reason || "disconnect"
    }
  });

  // Broadcast updated participant list
  broadcastCoopParticipants(session);

  console.log(`Player ${gateId} left co-op session ${sessionId} (${reason})`);
}

function handleCoopStateSync(data) {
  const { gateId, gateState, operators, shiftStart, shiftDurationMs, shiftMode } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session) return;

  // Only host can sync state
  if (session.hostPlayerId !== player.playerId) {
    console.warn(`Non-host ${gateId} attempted to sync state for session ${sessionId}`);
    return;
  }

  session.lastStateUpdate = Date.now();

  // Broadcast to all invited players
  for (const invitedPlayerId of session.invitedPlayers) {
    const invitedPlayer = Array.from(players.values()).find(p => p.playerId === invitedPlayerId);
    if (invitedPlayer && invitedPlayer.ws.readyState === WebSocket.OPEN) {
      sendToPlayer(invitedPlayer.gateId, {
        type: "coop_state_update",
        timestamp: Date.now(),
        data: {
          gateState,
          operators,
          hostGateId: session.hostGateId,
          shiftStart,
          shiftDurationMs,
          shiftMode
        }
      });
    }
  }
}

function handleCoopEvent(data) {
  const { gateId, eventType, eventData } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session) return;

  // Only host can broadcast events
  if (session.hostPlayerId !== player.playerId) {
    console.warn(`Non-host ${gateId} attempted to broadcast event for session ${sessionId}`);
    return;
  }

  // Broadcast to all invited players immediately
  for (const invitedPlayerId of session.invitedPlayers) {
    const invitedPlayer = Array.from(players.values()).find(p => p.playerId === invitedPlayerId);
    if (invitedPlayer && invitedPlayer.ws.readyState === WebSocket.OPEN) {
      sendToPlayer(invitedPlayer.gateId, {
        type: "coop_event",
        timestamp: Date.now(),
        data: {
          eventType,
          eventData
        }
      });
    }
  }
}

function handleCoopAction(data) {
  const { gateId, action, actionData } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session) return;

  // Forward action to host
  sendToPlayer(session.hostGateId, {
    type: "coop_action_received",
    timestamp: Date.now(),
    data: {
      playerId: player.playerId,
      gateId: gateId,
      operatorCallsign: player.operatorCallsign,
      action,
      actionData
    }
  });
}

function handleKickPlayer(data) {
  const { gateId, targetPlayerId } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session || session.hostPlayerId !== player.playerId) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "NOT_HOST", message: "Only host can kick players" }
    });
    return;
  }

  if (!session.invitedPlayers.has(targetPlayerId)) return;

  // Find target player's gateId
  const targetPlayer = Array.from(players.values()).find(p => p.playerId === targetPlayerId);
  if (!targetPlayer) return;

  // Remove from session
  session.invitedPlayers.delete(targetPlayerId);
  playerToSession.delete(targetPlayerId);

  // Notify kicked player
  sendToPlayer(targetPlayer.gateId, {
    type: "coop_kicked",
    timestamp: Date.now(),
    data: {
      reason: "kicked_by_host"
    }
  });

  // Notify host
  sendToPlayer(gateId, {
    type: "coop_player_left",
    timestamp: Date.now(),
    data: {
      playerId: targetPlayerId,
      gateId: targetPlayer.gateId,
      reason: "kicked"
    }
  });

  broadcastCoopParticipants(session);

  console.log(`Player ${targetPlayer.gateId} kicked from session ${sessionId}`);
}

function handleLockSession(data) {
  const { gateId, locked } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session || session.hostPlayerId !== player.playerId) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "NOT_HOST", message: "Only host can lock session" }
    });
    return;
  }

  session.locked = locked;

  sendToPlayer(gateId, {
    type: "coop_session_locked",
    timestamp: Date.now(),
    data: { locked }
  });

  broadcastCoopParticipants(session);

  console.log(`Session ${sessionId} ${locked ? 'locked' : 'unlocked'}`);
}

function handleTransferHost(data) {
  const { gateId, targetPlayerId } = data;
  const player = players.get(gateId);
  if (!player) return;

  const sessionId = playerToSession.get(player.playerId);
  if (!sessionId) return;

  const session = coopSessions.get(sessionId);
  if (!session || session.hostPlayerId !== player.playerId) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "NOT_HOST", message: "Only host can transfer host status" }
    });
    return;
  }

  if (!session.invitedPlayers.has(targetPlayerId)) {
    sendToPlayer(gateId, {
      type: "error",
      timestamp: Date.now(),
      data: { code: "PLAYER_NOT_IN_SESSION", message: "Target player not in session" }
    });
    return;
  }

  const targetPlayer = Array.from(players.values()).find(p => p.playerId === targetPlayerId);
  if (!targetPlayer) return;

  // Transfer host
  session.invitedPlayers.delete(targetPlayerId);
  session.invitedPlayers.add(player.playerId);
  const oldHostGateId = session.hostGateId;
  session.hostPlayerId = targetPlayerId;
  session.hostGateId = targetPlayer.gateId;

  // Notify old host
  sendToPlayer(oldHostGateId, {
    type: "coop_host_transferred",
    timestamp: Date.now(),
    data: {
      newHostPlayerId: targetPlayerId,
      newHostGateId: targetPlayer.gateId,
      role: "invited"
    }
  });

  // Notify new host
  sendToPlayer(targetPlayer.gateId, {
    type: "coop_host_transferred",
    timestamp: Date.now(),
    data: {
      newHostPlayerId: targetPlayerId,
      newHostGateId: targetPlayer.gateId,
      role: "host"
    }
  });

  broadcastCoopParticipants(session);

  console.log(`Host transferred in session ${sessionId}: ${oldHostGateId} → ${targetPlayer.gateId}`);
}

function broadcastCoopParticipants(session) {
  const participants = [];

  // Add host
  const hostPlayer = Array.from(players.values()).find(p => p.playerId === session.hostPlayerId);
  if (hostPlayer) {
    participants.push({
      playerId: hostPlayer.playerId,
      gateId: hostPlayer.gateId,
      operatorCallsign: hostPlayer.operatorCallsign,
      role: "host"
    });
  }

  // Add invited players
  for (const invitedPlayerId of session.invitedPlayers) {
    const invitedPlayer = Array.from(players.values()).find(p => p.playerId === invitedPlayerId);
    if (invitedPlayer) {
      participants.push({
        playerId: invitedPlayer.playerId,
        gateId: invitedPlayer.gateId,
        operatorCallsign: invitedPlayer.operatorCallsign,
        role: "invited"
      });
    }
  }

  const msg = {
    type: "coop_participants_update",
    timestamp: Date.now(),
    data: {
      sessionId: session.sessionId,
      participants,
      locked: session.locked
    }
  };

  // Send to all participants
  for (const p of participants) {
    sendToPlayer(p.gateId, msg);
  }
}

function destroyCoopSession(session, reason) {
  // Notify all invited players
  for (const invitedPlayerId of session.invitedPlayers) {
    const invitedPlayer = Array.from(players.values()).find(p => p.playerId === invitedPlayerId);
    if (invitedPlayer) {
      sendToPlayer(invitedPlayer.gateId, {
        type: "coop_session_ended",
        timestamp: Date.now(),
        data: { reason: reason || "host_disconnect" }
      });
      playerToSession.delete(invitedPlayerId);
    }
  }

  // Clean up
  playerToSession.delete(session.hostPlayerId);
  coopSessions.delete(session.sessionId);

  console.log(`Co-op session ${session.sessionId} destroyed (${reason})`);
}

function broadcastPlayerList(changeType, reason = null, gateId = null, isReconnection = false) {
  // Only include players who are actively playing (gameActive: true)
  const activePlayerArray = Array.from(players.values())
    .filter(p => p.gameActive && p.gateId !== "GATE-NET")
    .map(p => p.toJSON());

  broadcast({
    type: "player_list",
    timestamp: Date.now(),
    data: {
      players: activePlayerArray,
      playerCount: activePlayerArray.length,
      changeType,
      reason,
      gateId,
      isReconnection
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
          handleHeartbeat(msg.data);
          break;
        case "create_coop_session":
          handleCreateCoopSession(ws, msg.data);
          break;
        case "join_coop_session":
          handleJoinCoopSession(ws, msg.data);
          break;
        case "leave_coop_session":
          handleLeaveCoopSession(msg.data);
          break;
        case "coop_state_sync":
          handleCoopStateSync(msg.data);
          break;
        case "coop_event":
          handleCoopEvent(msg.data);
          break;
        case "coop_action":
          handleCoopAction(msg.data);
          break;
        case "kick_player":
          handleKickPlayer(msg.data);
          break;
        case "lock_session":
          handleLockSession(msg.data);
          break;
        case "transfer_host":
          handleTransferHost(msg.data);
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

// Cleanup stale co-op sessions
function cleanupStaleSessions() {
  const now = Date.now();
  const staleTimeout = 5 * 60 * 1000; // 5 minutes

  for (const [sessionId, session] of coopSessions.entries()) {
    if (now - session.lastStateUpdate > staleTimeout) {
      console.log(`Cleaning up stale co-op session: ${sessionId}`);
      destroyCoopSession(session, "timeout");
    }
  }
}

// Start cleanup intervals
setInterval(cleanupStaleConnections, CONFIG.cleanupInterval);
setInterval(cleanupStaleSessions, 60000); // Check every minute

console.log(`Multiplayer server running on ws://localhost:${CONFIG.port}`);
