<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Rate limiting (simple session-based) - skip for read-only get_messages
$action = $_GET['action'] ?? '';
if ($action !== 'get_messages') {
    session_start();
    $rateLimitKey = 'api_last_request';
    $rateLimitDelay = 1; // 1 second between requests

    if (isset($_SESSION[$rateLimitKey])) {
        $elapsed = time() - $_SESSION[$rateLimitKey];
        if ($elapsed < $rateLimitDelay) {
            http_response_code(429);
            echo json_encode(['error' => 'Rate limit exceeded']);
            exit;
        }
    }
    $_SESSION[$rateLimitKey] = time();
}

// Load config
$configPath = __DIR__ . '/data/config.json';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration not found']);
    exit;
}

$config = json_decode(file_get_contents($configPath), true);
if (!$config || !isset($config['terminal'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid configuration']);
    exit;
}

switch ($action) {
    case 'validate_code':
        handleValidateCode($config);
        break;

    case 'gm_update':
        handleGMUpdate($config);
        break;

    case 'send_message':
        handleSendMessage($config);
        break;

    case 'get_messages':
        handleGetMessages();
        break;

    case 'clear_messages':
        handleClearMessages($config);
        break;

    case 'character_update':
        handleCharacterUpdate($config);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function handleValidateCode($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';

    // Constant time delay for all requests (timing attack protection)
    usleep(100000); // 100ms delay

    // Check GM code
    if (isset($config['terminal']['gmCode']) &&
        hash_equals($config['terminal']['gmCode'], $code)) {
        echo json_encode([
            'valid' => true,
            'type' => 'gm'
        ]);
        return;
    }

    // Check character codes
    if (isset($config['terminal']['characterCodes'])) {
        foreach ($config['terminal']['characterCodes'] as $charCode) {
            if (hash_equals($charCode['code'], $code)) {
                // Check if system is locked down (GM maintenance mode)
                if (!empty($config['terminal']['lockedDown'])) {
                    http_response_code(403);
                    echo json_encode([
                        'valid' => false,
                        'error' => 'System is in maintenance mode. Please try again later.',
                        'locked' => true
                    ]);
                    return;
                }

                // Load character data
                $charFile = __DIR__ . '/' . $charCode['characterFile'];
                $charData = file_exists($charFile)
                    ? json_decode(file_get_contents($charFile), true)
                    : null;

                // Load ship data if configured
                $shipData = null;
                if (!empty($config['shipFile'])) {
                    $shipFile = __DIR__ . '/' . $config['shipFile'];
                    $shipData = file_exists($shipFile)
                        ? json_decode(file_get_contents($shipFile), true)
                        : null;
                }

                echo json_encode([
                    'valid' => true,
                    'type' => 'character',
                    'character' => $charData,
                    'ship' => $shipData,
                    'characterName' => $charCode['characterName']
                ]);
                return;
            }
        }
    }

    http_response_code(401);
    echo json_encode(['valid' => false, 'error' => 'Invalid code']);
}

function handleGMUpdate($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';
    $updates = $input['updates'] ?? [];

    // Verify GM code
    if (!isset($config['terminal']['gmCode']) ||
        !hash_equals($config['terminal']['gmCode'], $code)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    try {
        // Update lock status in config
        if (isset($updates['lockedDown'])) {
            updateTerminalConfigField($config, 'lockedDown', (bool)$updates['lockedDown']);
        }

        // Update location parts in config
        if (isset($updates['locationParts'])) {
            updateConfigFile($config, 'locationParts', $updates['locationParts']);
        }

        // Update lore file
        if (isset($updates['loreContent'])) {
            $loreFile = __DIR__ . '/' . $config['loreFile'];
            file_put_contents($loreFile, $updates['loreContent'], LOCK_EX);
        }

        // Update location info file
        if (isset($updates['locationInfoContent'])) {
            $locationInfoFile = __DIR__ . '/' . $config['locationInfoFile'];
            file_put_contents($locationInfoFile, $updates['locationInfoContent'], LOCK_EX);
        }

        // Update notable characters
        if (isset($updates['notableCharacters'])) {
            $notableFile = __DIR__ . '/' . $config['notableCharactersFile'];
            $notableData = ['characters' => $updates['notableCharacters']];
            file_put_contents($notableFile,
                json_encode($notableData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                LOCK_EX);
        }

        echo json_encode([
            'success' => true,
            'timestamp' => date('c')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Update failed: ' . $e->getMessage()]);
    }
}

function updateConfigFile($config, $key, $value) {
    $configPath = __DIR__ . '/data/config.json';

    // File locking for safe concurrent writes
    $fp = fopen($configPath, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        throw new Exception('Could not lock config file');
    }

    // Read current config
    $fileSize = filesize($configPath);
    $currentConfig = json_decode(fread($fp, $fileSize ?: 1), true);

    // Update specified key
    $currentConfig[$key] = $value;

    // Write back
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($currentConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function updateTerminalConfigField($config, $key, $value) {
    $configPath = __DIR__ . '/data/config.json';

    // File locking for safe concurrent writes
    $fp = fopen($configPath, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        throw new Exception('Could not lock config file');
    }

    // Read current config
    $fileSize = filesize($configPath);
    $currentConfig = json_decode(fread($fp, $fileSize ?: 1), true);

    // Update terminal section key
    if (!isset($currentConfig['terminal'])) {
        $currentConfig['terminal'] = [];
    }
    $currentConfig['terminal'][$key] = $value;

    // Write back
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($currentConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function handleSendMessage($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';
    $type = $input['type'] ?? '';
    $text = $input['text'] ?? '';
    $metadata = $input['metadata'] ?? [];

    // Validate code (character or GM)
    $characterName = null;
    $isGM = false;

    // Check if GM code
    if (isset($config['terminal']['gmCode']) && hash_equals($config['terminal']['gmCode'], $code)) {
        $isGM = true;
        $characterName = 'GM';
    } else {
        // Check character codes
        if (isset($config['terminal']['characterCodes'])) {
            foreach ($config['terminal']['characterCodes'] as $charCode) {
                if (hash_equals($charCode['code'], $code)) {
                    $characterName = $charCode['characterName'];
                    break;
                }
            }
        }
    }

    if (!$characterName) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid code']);
        return;
    }

    // Check if system is locked and user is not GM
    if (!$isGM && !empty($config['terminal']['lockedDown'])) {
        http_response_code(403);
        echo json_encode(['error' => 'System is in maintenance mode. Messages disabled.', 'locked' => true]);
        return;
    }

    // Validate message type
    $validTypes = $isGM ? ['world', 'gm', 'npc', 'roll'] : ['say', 'act', 'ooc', 'roll'];
    if (!in_array($type, $validTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid message type']);
        return;
    }

    // Validate text
    if (empty(trim($text))) {
        http_response_code(400);
        echo json_encode(['error' => 'Message text required']);
        return;
    }

    // Parse NPC messages for GM
    if ($isGM && $type === 'npc') {
        // Expected format: [Name] Say text or [Name] Act text
        if (preg_match('/^\[(.+?)\]\s+(Say|Act)\s+(.+)$/i', $text, $matches)) {
            $metadata['npcName'] = $matches[1];
            $metadata['npcAction'] = strtolower($matches[2]);
            $text = $matches[3];
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'NPC format: [Name] Say text or [Name] Act text']);
            return;
        }
    }

    // Create message object
    $messageId = 'msg-' . time() . '-' . bin2hex(random_bytes(4));
    $message = [
        'id' => $messageId,
        'timestamp' => date('c'),
        'type' => $type,
        'characterName' => $characterName,
        'text' => $text,
        'metadata' => $metadata
    ];

    // Load messages file
    $messagesPath = __DIR__ . '/data/messages.json';
    $fp = fopen($messagesPath, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not lock messages file']);
        return;
    }

    try {
        $fileSize = filesize($messagesPath);
        $content = $fileSize > 0 ? fread($fp, $fileSize) : '{"messages":[]}';
        $data = json_decode($content, true);

        if (!isset($data['messages'])) {
            $data['messages'] = [];
        }

        // Append message
        $data['messages'][] = $message;

        // Write back
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        // Notify WebSocket server of new message
        notifyWebSocket();

        echo json_encode([
            'success' => true,
            'messageId' => $messageId
        ]);
    } catch (Exception $e) {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save message: ' . $e->getMessage()]);
    }
}

function notifyWebSocket() {
    // Non-blocking notification to WebSocket server
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'timeout' => 0.1
        ]
    ]);
    @file_get_contents('http://127.0.0.1:8082/notify', false, $context);
}

function handleGetMessages() {
    $since = $_GET['since'] ?? null;

    $messagesPath = __DIR__ . '/data/messages.json';
    if (!file_exists($messagesPath)) {
        echo json_encode(['messages' => []]);
        return;
    }

    $content = file_get_contents($messagesPath);
    $data = json_decode($content, true);

    if (!isset($data['messages'])) {
        echo json_encode(['messages' => []]);
        return;
    }

    $messages = $data['messages'];

    // Filter by since timestamp if provided
    if ($since) {
        $messages = array_filter($messages, function($msg) use ($since) {
            return $msg['timestamp'] > $since;
        });
        $messages = array_values($messages); // Re-index array
    }

    echo json_encode(['messages' => $messages]);
}

function handleClearMessages($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';

    // Verify GM code
    if (!isset($config['terminal']['gmCode']) ||
        !hash_equals($config['terminal']['gmCode'], $code)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $messagesPath = __DIR__ . '/data/messages.json';

    try {
        file_put_contents($messagesPath, json_encode(['messages' => []], JSON_PRETTY_PRINT), LOCK_EX);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to clear messages: ' . $e->getMessage()]);
    }
}

function handleCharacterUpdate($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? '';
    $updates = $input['updates'] ?? [];
    $targetCharacterFile = $input['characterFile'] ?? null; // For GM editing other characters

    // Check if this is a GM
    $isGM = isset($config['terminal']['gmCode']) &&
            hash_equals($config['terminal']['gmCode'], $code);

    // Find which character this code belongs to (if not GM)
    $characterFile = null;
    if ($isGM && $targetCharacterFile) {
        // GM can edit any character - validate the file exists in config
        $validFile = false;
        if (isset($config['terminal']['characterCodes'])) {
            foreach ($config['terminal']['characterCodes'] as $charCode) {
                if ($charCode['characterFile'] === $targetCharacterFile) {
                    $validFile = true;
                    break;
                }
            }
        }
        if ($validFile) {
            $characterFile = $targetCharacterFile;
        }
    } else if (!$isGM) {
        // Regular character - find their file
        if (isset($config['terminal']['characterCodes'])) {
            foreach ($config['terminal']['characterCodes'] as $charCode) {
                if (hash_equals($charCode['code'], $code)) {
                    $characterFile = $charCode['characterFile'];
                    break;
                }
            }
        }
    }

    if (!$characterFile) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    // Check if system is locked and user is not GM
    if (!$isGM && !empty($config['terminal']['lockedDown'])) {
        http_response_code(403);
        echo json_encode(['error' => 'System is in maintenance mode. Updates disabled.', 'locked' => true]);
        return;
    }

    $charPath = __DIR__ . '/' . $characterFile;
    if (!file_exists($charPath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Character file not found']);
        return;
    }

    // Allowed fields that can be updated
    $allowedFields = [
        'conditions.injured', 'conditions.exposed', 'conditions.shaken',
        'conditions.exhausted', 'conditions.contaminated', 'conditions.compromised',
        'wounds.wound1', 'wounds.wound2', 'wounds.wound3',
        'health.clock1', 'health.clock2', 'health.clock3', 'health.clock4',
        'tracks.rads', 'gear.items'
    ];

    try {
        // File locking for safe concurrent writes
        $fp = fopen($charPath, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            throw new Exception('Could not lock character file');
        }

        // Read current character data
        $fileSize = filesize($charPath);
        $charData = json_decode(fread($fp, $fileSize ?: 1), true);

        if (!$charData) {
            throw new Exception('Invalid character data');
        }

        // Apply only allowed updates
        foreach ($updates as $key => $value) {
            if (in_array($key, $allowedFields)) {
                // Special handling for gear.items - validate structure
                if ($key === 'gear.items') {
                    if (!is_array($value)) {
                        continue;
                    }
                    // Sanitize each item
                    $sanitizedItems = [];
                    foreach ($value as $item) {
                        if (!is_array($item)) continue;
                        $sanitizedItems[] = [
                            'id' => $item['id'] ?? ('entry-' . time() . '-' . bin2hex(random_bytes(3))),
                            'name' => substr($item['name'] ?? '', 0, 100),
                            'type' => in_array($item['type'] ?? '', ['weapon', 'armor', 'item']) ? $item['type'] : 'item',
                            'tags' => substr($item['tags'] ?? '', 0, 200),
                            'description' => substr($item['description'] ?? '', 0, 500)
                        ];
                    }
                    $charData[$key] = $sanitizedItems;
                } else {
                    $charData[$key] = $value;
                }
            }
        }

        // Write back
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($charData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode([
            'success' => true,
            'timestamp' => date('c'),
            'gear' => $charData['gear.items'] ?? []
        ]);
    } catch (Exception $e) {
        if (isset($fp) && is_resource($fp)) {
            flock($fp, LOCK_UN);
            fclose($fp);
        }
        http_response_code(500);
        echo json_encode(['error' => 'Update failed: ' . $e->getMessage()]);
    }
}
?>
