# Developer Guide: Save File Encryption

## Overview

Starting with this version, `.tqegate` (session saves) and `.tqeprofile` (profile saves) files are encrypted using AES-256-GCM to prevent casual save editing. This guide explains how developers can decrypt, modify, and re-encrypt these files for testing and debugging purposes.

### Encryption Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key**: Hardcoded in `index.html` (see `ENCRYPTION_CONFIG.KEY_HEX`)
- **File Format**: `TQE-ENC-V1:<base64-encoded-data>`
  - The base64 data contains: `[12-byte IV][encrypted JSON][16-byte auth tag]`
- **Backward Compatibility**: Files without the `TQE-ENC-V1:` marker are treated as legacy plaintext JSON

### Security Note

This encryption provides **mild security** suitable for a single-player web game. It:
- Prevents casual save editing with text editors
- Detects file tampering (GCM authentication)
- Allows developers with the key to decrypt when needed

The key is intentionally in the source code - this is not meant to be military-grade security.

---

## Method 1: Browser Console (Quickest)

This is the fastest method for one-off decrypt/edit/re-encrypt operations.

### Step 1: Decrypt a Save File

1. Open the game in your browser
2. Open Developer Tools (F12)
3. Copy the contents of your encrypted save file
4. Paste and run in console:

```javascript
// Replace with actual file contents
const encryptedData = "TQE-ENC-V1:...";

// Decrypt
const decrypted = await decryptSaveData(encryptedData);
const saveObject = JSON.parse(decrypted);

// View the decrypted save data
console.log(saveObject);
```

### Step 2: Modify the Save Data

Edit the `saveObject` in the console:

```javascript
// Example: Unlock all achievements
saveObject.achievements = {
  first_query: true,
  first_ship: true,
  first_warning: true,
  // ... add all achievement IDs you want
};

// Example: Set clearance level
if (saveObject.clearanceLevel !== undefined) {
  saveObject.clearanceLevel = 5;
}

// Example: Modify gate state
if (saveObject.gate) {
  saveObject.gate.funds = 99999;
  saveObject.gate.reputation = 100;
}

// Example: Add lifetime stats
if (saveObject.lifetimeStats) {
  saveObject.lifetimeStats.totalShipsProcessed = 10000;
  saveObject.lifetimeStats.perfectShifts = 50;
}
```

### Step 3: Re-encrypt and Download

```javascript
// Convert back to JSON
const modifiedJson = JSON.stringify(saveObject, null, 2);

// Re-encrypt
const reencrypted = await encryptSaveData(modifiedJson);

// Download the file
const filename = saveObject.kind === "tqeprofile"
  ? "MODIFIED-PROFILE.tqeprofile"
  : "MODIFIED-GATE.tqegate";

downloadTextFile(filename, reencrypted);
```

The file will download automatically. You can now import it in the game.

---

## Method 2: Node.js Script (Batch Processing)

For processing multiple files or automation, use this Node.js script.

### Prerequisites

```bash
npm install --save-dev @types/node
```

### Script: `decrypt-save.js`

Create this file in your project root:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// !!! IMPORTANT: Update this key if it changes in index.html !!!
const KEY_HEX = "f3a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9";
const MARKER = "TQE-ENC-V1:";
const IV_LENGTH = 12;

// Base64URL decode (matches browser implementation)
function base64UrlToBuffer(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  return Buffer.from(base64 + "=".repeat(padding), 'base64');
}

// Base64URL encode (matches browser implementation)
function bufferToBase64Url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Decrypt a save file
function decryptFile(filePath) {
  const contents = fs.readFileSync(filePath, 'utf8');

  // Check if encrypted
  if (!contents.startsWith(MARKER)) {
    console.log("File is not encrypted (legacy plaintext)");
    return JSON.parse(contents);
  }

  // Extract encrypted data
  const base64 = contents.substring(MARKER.length);
  const data = base64UrlToBuffer(base64);

  // Split IV, ciphertext, and auth tag
  const iv = data.slice(0, IV_LENGTH);
  const encrypted = data.slice(IV_LENGTH, -16);
  const authTag = data.slice(-16);

  // Decrypt
  const keyBuffer = Buffer.from(KEY_HEX, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

// Encrypt a save object
function encryptFile(saveObject) {
  const json = JSON.stringify(saveObject, null, 2);

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Encrypt
  const keyBuffer = Buffer.from(KEY_HEX, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  const encrypted = Buffer.concat([
    cipher.update(json, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted + auth tag
  const combined = Buffer.concat([iv, encrypted, authTag]);

  // Return with marker
  return MARKER + bufferToBase64Url(combined);
}

// Main CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node decrypt-save.js <file.tqegate|file.tqeprofile>  # Decrypt and print");
    console.log("  node decrypt-save.js decrypt <input> <output.json>   # Decrypt to JSON file");
    console.log("  node decrypt-save.js encrypt <input.json> <output>   # Encrypt JSON file");
    process.exit(1);
  }

  const command = args[0];

  if (command === "decrypt" && args.length === 3) {
    const saveData = decryptFile(args[1]);
    fs.writeFileSync(args[2], JSON.stringify(saveData, null, 2));
    console.log(`Decrypted ${args[1]} → ${args[2]}`);
  } else if (command === "encrypt" && args.length === 3) {
    const saveData = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const encrypted = encryptFile(saveData);
    fs.writeFileSync(args[2], encrypted);
    console.log(`Encrypted ${args[1]} → ${args[2]}`);
  } else {
    // Just decrypt and print
    const saveData = decryptFile(args[0]);
    console.log(JSON.stringify(saveData, null, 2));
  }
}

module.exports = { decryptFile, encryptFile };
```

### Usage Examples

```bash
# Decrypt and view in terminal
node decrypt-save.js GATE-1234_02-01-26_14-35.tqegate

# Decrypt to JSON file for editing
node decrypt-save.js decrypt GATE-1234_02-01-26_14-35.tqegate output.json

# Edit output.json with your favorite editor...

# Re-encrypt the modified JSON
node decrypt-save.js encrypt output.json GATE-MODIFIED.tqegate
```

---

## Common Testing Scenarios

### Scenario 1: Unlock All Achievements

**Browser Console:**
```javascript
const encryptedData = "TQE-ENC-V1:...";
const decrypted = await decryptSaveData(encryptedData);
const save = JSON.parse(decrypted);

// Unlock all achievements
save.achievements = {
  first_query: true,
  first_ship: true,
  first_warning: true,
  first_denial: true,
  first_approval: true,
  // Add all achievement IDs from your game
};

const reencrypted = await encryptSaveData(JSON.stringify(save, null, 2));
downloadTextFile("ACHIEVEMENTS-UNLOCKED.tqeprofile", reencrypted);
```

### Scenario 2: Max Out Resources for Testing

**Browser Console:**
```javascript
const save = JSON.parse(await decryptSaveData("TQE-ENC-V1:..."));

save.gate.funds = 999999;
save.gate.reputation = 100;
save.clearanceLevel = 5;

const reencrypted = await encryptSaveData(JSON.stringify(save, null, 2));
downloadTextFile("MAXED-RESOURCES.tqegate", reencrypted);
```

### Scenario 3: Test Edge Cases in Gate State

**Node.js:**
```javascript
const { decryptFile, encryptFile } = require('./decrypt-save');

const save = decryptFile('GATE-ALPHA.tqegate');

// Simulate specific game state
save.gate.health = 1;  // Nearly dead gate
save.gate.inbound = [/* create test ships */];
save.gate.stress = 95;

const encrypted = encryptFile(save);
require('fs').writeFileSync('EDGE-CASE-TEST.tqegate', encrypted);
```

### Scenario 4: Change Profile Settings

**Browser Console:**
```javascript
const profile = JSON.parse(await decryptSaveData("TQE-ENC-V1:..."));

profile.settings.sfxVolume = 1.0;
profile.settings.musicEnabled = false;
profile.defaultOperatorCallsign = "TEST-DEV";
profile.clearanceLevel = 5;

const reencrypted = await encryptSaveData(JSON.stringify(profile, null, 2));
downloadTextFile("TEST-PROFILE.tqeprofile", reencrypted);
```

---

## Troubleshooting

### Error: "Decryption failed"

**Cause**: File is corrupted, wrong key, or manually edited.

**Solutions**:
1. Verify the file starts with `TQE-ENC-V1:`
2. Check that the encryption key in your script matches `index.html`
3. If the file was manually edited, the auth tag will be invalid - start with a fresh export

### Error: "Invalid file format"

**Cause**: The decrypted data is not valid JSON.

**Solutions**:
1. Ensure you're using the correct decryption key
2. Check if the file is corrupted during transfer
3. Try exporting a fresh save file

### Files don't load in game after modification

**Checklist**:
1. Ensure the file still has the `TQE-ENC-V1:` marker
2. Verify the JSON structure matches the expected format:
   - For `.tqegate`: Must have `v`, `activeGateId`, `gate`, etc.
   - For `.tqeprofile`: Must have `v`, `kind: "tqeprofile"`, `settings`, etc.
3. Check browser console for specific error messages
4. Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('output.json'))"`

### Node.js script fails with "Invalid key length"

**Cause**: The `KEY_HEX` in the script doesn't match the one in `index.html`.

**Solution**:
1. Open `index.html`
2. Find `ENCRYPTION_CONFIG.KEY_HEX`
3. Copy the exact hex string (64 characters)
4. Update `KEY_HEX` in your Node.js script

---

## Best Practices

1. **Always backup saves** before modifying them
2. **Test modifications** on a copy first, not your main save
3. **Keep the decryption script** in sync with `index.html` if the key changes
4. **Use version control** for your decryption scripts
5. **Document modifications** when creating test saves for bug reports

---

## Key Rotation (Future)

If the encryption key ever needs to change:

1. Update `ENCRYPTION_CONFIG.KEY_HEX` in `index.html`
2. Change the marker version (e.g., `TQE-ENC-V2:`)
3. Update `loadSaveData()` to handle both V1 and V2 formats
4. Update this guide and the Node.js script

Example multi-version support:
```javascript
const ENCRYPTION_VERSIONS = {
  "TQE-ENC-V1:": "f3a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9",
  "TQE-ENC-V2:": "new-key-here-when-needed...",
};
```

---

## Quick Reference

| Task | Method | Command/Code |
|------|--------|--------------|
| View encrypted save | Browser Console | `JSON.parse(await decryptSaveData("TQE-ENC-V1:..."))` |
| Decrypt to JSON | Node.js | `node decrypt-save.js decrypt input.tqegate output.json` |
| Re-encrypt JSON | Node.js | `node decrypt-save.js encrypt input.json output.tqegate` |
| Download modified save | Browser Console | `downloadTextFile("filename", await encryptSaveData(json))` |
| Check if file is encrypted | Terminal | `head -c 11 file.tqegate` (should show `TQE-ENC-V1:`) |

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for detailed error messages
2. Verify the encryption key matches between tools
3. Ensure Node.js version is 14+ (for crypto module)
4. Check that the save file structure matches expectations

For questions or bug reports related to save encryption, include:
- The error message (browser console or terminal)
- Whether the file is encrypted or plaintext
- Node.js version (if applicable)
- Steps to reproduce the issue
