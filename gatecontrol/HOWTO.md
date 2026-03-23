# Gate Control Terminal - Complete HOWTO Guide

## Table of Contents
1. [What is Gate Control Terminal?](#what-is-gate-control-terminal)
2. [Getting Started](#getting-started)
3. [Understanding Your Interface](#understanding-your-interface)
4. [Ship Management & Traffic Control](#ship-management--traffic-control)
5. [Gate Systems & Maintenance](#gate-systems--maintenance)
6. [Commands Reference](#commands-reference)
7. [How to Lose (Severing Conditions)](#how-to-lose-severing-conditions)
8. [Survival Strategies & Tips](#survival-strategies--tips)
9. [What Happens When You Lose](#what-happens-when-you-lose)
10. [Advanced Features](#advanced-features)
11. [Settings & Customization](#settings--customization)

---

## What is Gate Control Terminal?

Gate Control Terminal is a real-time simulation game where you manage a space transit hub called a "gate." Gates are massive structures that stabilize corridor routes, allowing ships to jump between distant star systems that would otherwise be unreachable.

### Your Role

As a gate operator, you are responsible for:
- **Processing ship traffic** - Reviewing incoming and outgoing vessels, approving safe ships, and denying hazardous ones
- **Maintaining systems** - Keeping your gate's power, communications, facilities, and corridors operational
- **Surviving your shift** - Avoiding critical failures that would SEVER your gate from the network (game over)
- **Earning credits** - Building wage through efficient operations and good decision-making

### Win Condition

Your official shift ends at **8 hours** (or your chosen shift length), but you can continue indefinitely if you stay vigilant. Success means:
- Surviving without severing
- Maximizing your wage through efficient ship processing
- Maintaining all critical systems
- Building a high score based on performance density

### The Stakes

One critical mistake can instantly end your session:
- Approving a ship with Vacuum Bloom, Raiders, or Pirates
- Running out of fuel
- Losing all communications relays
- Missing a CRITICAL TOW deadline by several minutes

The game never pauses. Systems degrade randomly. Ships keep arriving. You must stay active and alert.

---

## Getting Started

### First Launch

1. **Enter your operator callsign** (optional) - This is your display name
2. **Choose your gate** - Select GATE-00 through GATE-99 (affects procedural generation)
3. **Set shift length** - Multiple options available:
   - Quick shifts: 15 MIN, 30 MIN, 1 HR, 2 HR
   - Standard shifts: 4 HR, 8 HR (recommended for first-time players)
   - Extended shifts: 12 HR, 24 HR
   - **UNLIMITED mode** - Timer runs forever until SEVER or RESET
   - **ENDURANCE mode** - UNLIMITED mode with saves disabled (hardcore challenge)
   - **CUSTOM** - Set your own duration (hours and minutes)
4. **Click BEGIN** - Your shift starts immediately

### The First 5 Minutes

Your first few minutes are critical for establishing good habits:

**Minute 1-2: Learn the Interface**
- Locate the TRAFFIC panel (ships awaiting processing)
- Find the SYSTEMS panel (gate health monitoring)
- Identify the TERMINAL panel (commands and logs)
- Note your current WAGE (top right)

**Minute 3-5: Process Your First Ships**
1. Click **DTL** (Detail) on the first ship in INBOUND queue
2. Read the ship information carefully
3. Look for hazard warnings; if the ship is UNKNOWN or info is masked, run SCAN to reveal hazards
4. If clean, click **APP** (Approve) - You earn +4 credits
5. If hazardous, click **DENY** and provide a reason

**Critical First Habit:** ALWAYS check DETAIL before approving any ship. One missed hazard = instant game over.

### Understanding the Core Loop

Your ongoing responsibilities cycle through:
1. **Check incoming traffic** → Review ship details → Approve or deny
2. **Monitor systems** → Watch for DEGRADED facilities → Issue repairs
3. **Acknowledge relay pings** → Click ACK when relays send PING requests
4. **Order resources** → Keep fuel above 30%, supply above 20%
5. **Run SCAN regularly** → Detect hidden threats on cooldown (~10s)

---

## Understanding Your Interface

### Top Bar

**Left Side:**
- **Operator Callsign** - Your name (editable by clicking)
- **Gate ID** - Your assigned gate identifier
- **Connection Status** - ONLINE (green) or OFFLINE MODE (red) for multiplayer
- **WAGE** - Total credits earned this shift
- **Shift Timer** - Hours:Minutes:Seconds elapsed / total shift length
- **Beacon Status** - "BEACON ONLINE" (green), "BEACON FAULT" (yellow), or "BEACON OFFLINE" (red)
- **Gate Health** - "OK" (green), "DEGRADED" (yellow), or "CRITICAL" (red)
- **Alerts** - Count of pending warnings (relay pings, system failures)

**Right Side:**
- **Theme Selector** - Color scheme (16+ themes available)
- **Sound Controls** - SFX, Music, Keyboard volume toggles
- **VFX Toggle** - Visual effects (HIGH/LOW mode for performance)
- **BREAK** - Take paid break (pauses game, costs 25 CR/min)
- **SCORE** - View detailed statistics and current score
- **OPTIONS** - Access settings panel
- **HELP** - Opens the quick reference guide
- **RESET** - Wipes your session completely (DANGER!)

### TRAFFIC Panel

Displays two queues of ships:

**INBOUND Queue**
- Ships arriving AT your gate from elsewhere
- Must be checked for hazards before approval
- Approving hazardous inbound ships can instantly SEVER your gate
- Shows: Ship ID, Priority, Type, Cargo, Status

**OUTBOUND Queue**
- Ships departing FROM your gate to other locations
- Have countdown timers (deadlines)
- Missing CRITICAL deadlines can trigger severe penalties (TOW can sever if very late)
- Cannot be decontaminated (must deny if contaminated)

**Ship Information Display:**
- **ID** - Vessel identifier (e.g., V-9012)
- **Priority** - CRITICAL, URGENT, or STANDARD
- **Type** - HAULER, LINER, TRANSPORT, TOW, PERSONAL, SHUTTLE
- **Cargo** - What the ship is carrying
- **Status** - Various states (DOCKED, AWAITING APPROVAL, DECON IN PROGRESS, etc.)

**Action Buttons:**
- **DTL** - View full ship details (ALWAYS use this before approving)
- **QRY** - Query ship for identification
- **DECON** - Start decontamination (for inbound ships in WAITING DECON)
- **APP** - Approve ship for transit (+4 credits)
- **DENY** - Refuse ship entry/exit
- **HOLD** - Pause ship for 30-60 seconds (can only use once per ship)

### SYSTEMS Panel

Monitors your gate's operational health across multiple subsections:

**1. Gate Systems**
- **Beacon** - Your gate's visibility signal to the network
  - States: ONLINE / FAULT / OFFLINE
  - If OFFLINE, fewer ships arrive
  - No direct repair - use RESYNC command

- **Alignment** - Gate positioning accuracy for safe transit
  - States: WITHIN TOLERANCE / DRIFTING / OUT OF TOLERANCE
  - If OUT OF TOLERANCE, ships cannot transit safely
  - Fix: Click REALIGN button or type REALIGN command

- **Sync** - Network synchronization state
  - States: SYNC / ASYNC / FAULT
  - If FAULT, gate connection becomes unstable
  - Fix: Click RESYNC button or type RESYNC command
  - **Sever Timer:** If ALIGNMENT is OUT OF TOLERANCE or SYNC is FAULT, a 60s countdown starts. At 30s the klaxon sounds. At 0, the gate SEVERS (GATE ALIGNMENT LOST or GATE SYNC LOST).

**2. Corridor Systems (Links)**
- Transit paths connecting your gate to other locations (usually 3-4 links: A, B, C, D)
- States: STABLE / DEGRADED / INTERMITTENT / OFFLINE
- If ALL corridors go OFFLINE → INSTANT SEVER
- No direct repair - corridors degrade and recover randomly
- Maintain overall gate health to reduce degradation risk

**3. Facility Systems**
- **Decon Bay** - Required for DECON operations
- **Fuel Manifold** - Manages fuel distribution
- **Dock Clamps** - Secures ships during processing
- **Beacon Amplifier** - Boosts gate beacon signal strength
- States: ONLINE / CONGESTED / DEGRADED / OFFLINE
- Repair options:
- **Quick Repair:** Click REPAIR button (70% success rate, 15-30s; 5s cooldown between attempts; failed repairs can knock systems OFFLINE)
  - **Work Order:** Click WO button (100% success, ~1-3 minutes, costs supply). Work orders are only allowed on OFFLINE systems (DEGRADED must use REPAIR).
- If ALL facilities go OFFLINE with no active work orders → SEVER

**4. Resources**
- **FUEL** - Drains continuously
  - At 25% or less: CRITICAL warning
  - At 0%: Power loss → INSTANT SEVER
  - Order fuel at 30-40%, not when critical
  - Cost: Credits (varies by amount)
  - Order amount: 1-99 units; delivery takes ~2-4.5 minutes

- **SUPPLY** - Used for work orders and decontamination
  - Doesn't drain passively
  - Running out prevents repairs and decon operations
  - Order when below 30% if active maintenance needed
  - Order amount: 1-99 units; delivery takes ~2-4.5 minutes

**5. Concourse**
- Current ship population at your gate (range: 6-26+)
- Increases when you approve ships
- Decreases over time as ships depart
- High levels (overcrowding) can cause issues
- Fix: Type PURGE or click PURGE button (costs 10 FUEL, 10s cooldown; confirmation required)

**6. Relays**
- Communication stations that maintain your connection to the network
- Usually 2-3 relays per gate (labeled R-XXXX)
- States: ONLINE / WEAK / FAULT / CRITICAL / OFFLINE
- **CRITICAL:** Relays send PING requests that you MUST acknowledge within 5 seconds
- If ALL relays go OFFLINE, a sever timer starts (10s base). A BROADCAST button appears that can extend the timer in small increments.
- Click ACK button or type ACK [relay-id] immediately when pinged
- Enable audio to hear ping alerts

**7. Maintenance**
- Active work orders display here
- Shows what's being repaired and estimated completion time
- Multiple work orders can run simultaneously

### TERMINAL Panel

**Three Sections:**

**Console Log (Left)**
- Displays command output and system responses
- Shows results of your actions
- Scrolls automatically with new messages

**Events Log (Right)**
- Automatic notifications from gate systems
- Alerts about degraded systems, ship arrivals, relay pings
- Color-coded by severity

**Command Input (Bottom)**
- Type commands like STATUS, DETAIL V-9012, APPROVE V-9012
- Press Enter to submit
- Press Arrow Up to recall last command
- Press Esc to clear input

**Maintenance Buttons (Above Input):**
- **REALIGN** - Fixes alignment drift and can improve corridor links (10s cooldown)
- **RESYNC** - Attempts to restore sync and sometimes beacon (10s cooldown; success depends on relay health)
- **PURGE** - Clears low-priority traffic (costs 10 FUEL, 10s cooldown)
- **SCAN** - Detects hidden threats on ships (10s cooldown)

---

## Ship Management & Traffic Control

### Ship Processing Workflow

**1. Ship Arrives in Queue**
- Appears in INBOUND or OUTBOUND traffic panel
- Shows basic information (ID, type, cargo, priority)

**2. Initial Review**
- Check priority level (CRITICAL ships need immediate attention)
- Note cargo type and ship type
- Look for any immediate red flags in status

**3. Detailed Inspection**
- Click **DTL** to view full ship details
- Review transponder status
- Check for hazard flags and effects (many hazards stay hidden until SCAN)
- Read operator notes if any

**4. Threat Assessment**
- Use **SCAN** command if suspicious (cooldown: 10s)
- Use **QUERY** if transponder shows UNKNOWN or MISMATCH
- Use **HOLD** if you need time to investigate (30-60s pause, once per ship)

**5. Decision**
- **APPROVE** if ship is safe (+4 credits)
- **DENY** if ship has hazards or fails checks (+3 credits if correct)
- **DECON** inbound ships that enter **WAITING DECON** (docked) before they can proceed

### Ship Hazards Reference

| Hazard | Where | What happens if it gets through | How to handle |
|--------|-------|----------------------------------|---------------|
| **VACUUM BLOOM** | Inbound (docking) | Gate SEVERS on breach | DENY: "QUARANTINE REQUIRED" |
| **RAIDERS / PIRATES** | Inbound (docking) | Gate SEVERS on hostile docking | SCAN to reveal, then DENY: "AUTHORITIES NOTIFIED" |
| **CORRIDOR RADIATION** | Outbound only | Contaminated departure (severe operator error) | DENY: "RADIATION HAZARD" |

**Note:** Hazardous ships generally spawn as **UNKNOWN**; SCAN is required to reveal them in most cases.

### Ship Actions Explained

**APPROVE (APP)**
- Clears ship for transit through your gate
- Earnings: +4 credits
- Inbound ships enter Concourse (increases population)
- Outbound ships depart (decreases population, meets deadline)
- **WARNING:** Approving inbound Vacuum Bloom or Raider/Pirate ships can SEVER the gate when they dock

**DENY**
- Refuses ship entry/exit
- Earnings: +3 credits if correct, -2 credits if incorrect
- Must provide a reason when denying
- Common reasons:
  - "QUARANTINE REQUIRED" - For Vacuum Bloom
  - "AUTHORITIES NOTIFIED" - For Raiders/Pirates
  - "RADIATION HAZARD" - For contaminated ships
- **TIP:** Incorrect denials cost credits but won't end your game. When in doubt, DENY.

**HOLD**
- Pauses ship processing for 30-60 seconds
- Gives you time to run SCAN or QUERY
- Can only be used ONCE per ship - use wisely
- Ship will resume normal countdown after hold expires
- Useful for suspicious ships or when you need time

**QUERY (QRY)**
- Requests ship identification from vessel
- Use on ships with UNKNOWN or MISMATCH transponder status
- Ship responds after a short delay (3-8 seconds)
- Per-ship cooldown: ~3 seconds between queries
- Some ships won't respond or will give false information
- Use SCAN to verify truthfulness

**DECONTAMINATION (DECON)**
- Starts decontamination for INBOUND ships in **WAITING DECON** state
- Requirements:
  - DECON BAY facility must be ONLINE
  - Costs SUPPLY
  - Takes ~3-6 minutes (50% longer if transponder is not VALID)
- **Exposure timer:** When an inbound ship is waiting to decon, a 30-60s exposure countdown starts. If it hits 0, the gate SEVERS.
- **On failure:** Decon can fail; when it does, the ship returns to WAITING DECON with a short retry window (~20s).
- Ship status changes to "DECON IN PROGRESS" during procedure

**DETAIL (DTL)**
- Shows complete ship information:
  - Vessel ID and type
  - Current state
  - Cargo manifest
  - Transponder status (VERIFIED, UNKNOWN, MISMATCH)
  - Priority level
  - Effects and hazards (THIS IS CRITICAL)
  - Operator notes
  - ETA / Deadline
  - Assigned dock slot
- **ALWAYS check DETAIL before approving**

### Understanding Ship Priority Levels

**CRITICAL Priority**
- Emergency vessels (often TOW or VIP-related)
- Tight deadlines; penalties are severe
- Missing a CRITICAL deadline can trigger hard penalties, and TOW requests can SEVER the gate if allowed to run very late
- Process these FIRST, but still check for hazards
- Use HOLD if you need time to verify safety

**URGENT Priority**
- Important vessels with moderate deadlines
- Missing deadline applies a credit penalty (severity depends on request)
- Process quickly after CRITICAL ships
- Still dangerous if hazardous

**STANDARD Priority**
- Regular traffic with relaxed deadlines
- Missing deadline applies a small credit penalty
- Process after higher priorities
- Still check for hazards before approving

### Transponder Status

**VERIFIED**
- Ship identification confirmed and valid
- Generally trustworthy
- Still check for hazards (SCAN regularly)

**UNKNOWN**
- Ship hasn't responded to identification request
- Use QUERY to request identification
- May be normal delay or sign of trouble
- Use SCAN if suspicious

**MISMATCH**
- Ship's transponder doesn't match expected signature
- Could be technical issue or impersonation
- Use QUERY and SCAN
- Consider HOLD while investigating

### Outbound Deadline Management

Outbound ships have countdown timers showing time until departure deadline:

- **Green timer (>60s remaining):** Safe to process normally
- **Yellow timer (30-60s remaining):** Process soon
- **Red timer (<30s remaining):** URGENT - process immediately

**Consequences of Missing Deadlines:**
- **CRITICAL ships:** Severe penalties (denials, resource loss, or system degradation). TOW requests can SEVER the gate if allowed to run very late (5+ minutes overdue).
- **URGENT ships:** Credit penalties
- **STANDARD ships:** Minor credit penalties

**Strategy:**
1. Always check CRITICAL ships first
2. If CRITICAL ship looks suspicious, use HOLD immediately
3. Run SCAN while ship is on HOLD
4. Make decision before HOLD expires
5. Better to deny a suspicious CRITICAL ship than risk severing

---

## Gate Systems & Maintenance

### Gate Core Systems

#### Beacon
**What it does:** Broadcasts your gate's position and availability to the network

**Status Indicators:**
- ONLINE (green) - Functioning normally
- FAULT (yellow) - Degraded but operational
- OFFLINE (red) - Not broadcasting

**Impact:**
- OFFLINE beacon = fewer ships arrive
- Not immediately critical but reduces traffic and earnings
- Can make it harder to earn credits for fuel/supplies

**How to fix:**
- No direct repair button
- Use RESYNC command (sometimes restores beacon)
- May recover randomly over time
- Focus on preventing total system failure

#### Alignment
**What it does:** Maintains precise gate positioning for safe transit calculations

**Status Indicators:**
- WITHIN TOLERANCE (green) - Properly aligned
- DRIFTING (yellow) - Losing alignment, needs attention soon
- OUT OF TOLERANCE (red) - Misaligned, transit unsafe

**Impact:**
- OUT OF TOLERANCE = ships cannot safely transit
- Prevents ship approvals
- Can lead to deadline failures

**How to fix:**
- Click **REALIGN** button
- Type **REALIGN** command
- Cooldown: 10 seconds
- Restores alignment to WITHIN TOLERANCE and can improve corridor link status
- Use preventively when showing DRIFTING

**Best Practice:**
- Realign at DRIFTING status (yellow)
- Don't wait for OUT OF TOLERANCE (red)
- Keep an eye on this during busy periods

#### Sync
**What it does:** Maintains network synchronization with other gates and control systems

**Status Indicators:**
- SYNC (green) - Properly synchronized
- ASYNC (yellow) - Losing sync
- FAULT (red) - Out of sync, unstable connection

**Impact:**
- FAULT status makes gate connection unstable
- Can contribute to corridor degradation
- May lead to severing if combined with other failures

**How to fix:**
- Click **RESYNC** button
- Type **RESYNC** command
- Cooldown: 10 seconds
- Outcome depends on relay health; it can restore SYNC and often recovers the beacon
- Healthy relays improve your odds

**Best Practice:**
- Reset at ASYNC status (yellow)
- Prioritize relay health to prevent sync issues
- Use preventively during stable periods

### Corridor Systems

**What they are:** Transit paths (like highways) connecting your gate to other locations

**Typical Setup:** 3-4 corridors labeled A, B, C, D

**Status Indicators:**
- STABLE (green) - Normal operation
- DEGRADED (yellow) - Weakening, may become intermittent
- INTERMITTENT (orange) - Unstable, frequent disruptions
- OFFLINE (red) - No longer functional

**CRITICAL WARNING:**
- If ALL corridors go OFFLINE → INSTANT SEVER
- This is an instant game-over condition
- No exceptions

**How they work:**
- Corridors degrade randomly over time
- They can also recover randomly
- No direct player control
- Overall gate health affects corridor stability

**How to maintain:**
- Keep other systems healthy (reduces corridor stress)
- Maintain relays (helps stabilize network)
- Keep alignment and sync in good state
- Monitor corridor health constantly

**What to do when corridors degrade:**
- If 1-2 corridors OFFLINE: Not critical yet, but concerning
- If ALL corridors DEGRADED: Focus on gate health, prepare for potential issues
- If 2+ corridors OFFLINE and 1 INTERMITTENT: HIGH RISK - avoid risky actions
- Cannot directly repair corridors - focus on prevention

### Facilities

Three critical facility systems:

#### Decon Bay
**Purpose:** Decontaminates inbound ships that reach **WAITING DECON**

**States:**
- ONLINE (green) - Ready to decontaminate ships
- CONGESTED (yellow) - Busy or slowed
- DEGRADED (yellow) - Functioning but unstable, may fail soon
- OFFLINE (red) - Cannot perform decontamination

**Impact:**
- Required for DECON operations
- If OFFLINE: DECON cannot start; exposure timers still run on waiting ships, so prioritize repairs before approving inbound docks

**Repair Options:**
- **Quick Repair:** Click REPAIR button (70% success, 15-30s; 5s cooldown between attempts; failed repairs can knock systems OFFLINE)
- **Work Order:** Click WO button (100% success, ~1-3 minutes, costs SUPPLY; only available when OFFLINE)

#### Fuel Manifold
**Purpose:** Manages fuel distribution across gate systems

**States:**
- ONLINE (green) - Normal fuel management
- CONGESTED (yellow) - Slower/inefficient routing
- DEGRADED (yellow) - Increased fuel consumption
- OFFLINE (red) - Fuel system compromised

**Impact:**
- DEGRADED increases fuel drain rate
- OFFLINE severely impacts fuel efficiency
- Can accelerate path to fuel depletion

**Repair Options:**
- Same as Decon Bay (REPAIR or WORKORDER (WO button))

#### Dock Clamps
**Purpose:** Secures ships during processing and docking procedures

**States:**
- ONLINE (green) - Normal docking operations
- CONGESTED (yellow) - Reduced docking throughput
- DEGRADED (yellow) - Slower ship processing
- OFFLINE (red) - Docking complications

**Impact:**
- DEGRADED may slow ship processing
- OFFLINE can cause ship handling issues
- May affect ability to process ships efficiently

**Repair Options:**
- Same as other facilities (REPAIR or WORKORDER (WO button))

### Facility Repair Strategies

**Quick Repair (REPAIR button/command):**
- Success rate: 70%
- Takes 15-30 seconds to resolve
- Cooldown: 5 seconds between attempts
- No supply cost
- Failed repairs can leave the system DEGRADED or knock it OFFLINE

**Work Order (WO button / WORKORDER command):**
- Success rate: 100%
- Takes ~1-3 minutes
- Costs SUPPLY while active
- Only available when the system is OFFLINE
- Multiple work orders can run simultaneously

**When to use which:**
- **Use REPAIR when:**
  - Facility is DEGRADED
  - You can afford a failed attempt
  - You need a fast result
- **Use WORK ORDER when:**
  - Facility is OFFLINE
  - You need a guaranteed fix
  - You have supply available

**Degradation notes:**
- DEGRADED systems can worsen over time
- Treat DEGRADED as a warning and repair early
### Resources Management

#### FUEL

**What it does:** Powers your entire gate operation

**Drain Rate:**
- Continuous passive drain
- Increases if Fuel Manifold is DEGRADED/OFFLINE
- PURGE command costs 10 FUEL

**Critical Thresholds:**
- 40%: Recommended order point
- 25%: CRITICAL warning appears
- 0%: Power loss → INSTANT SEVER

**How to order:**
- Use the +/- buttons or type an amount in the Resources panel, then click ORDER
- Type: ORDER FUEL [amount] (e.g., ORDER FUEL 50)
- Costs 1 credit per unit
- Order amount: 1-99 units
- Takes ~2-4.5 minutes to deliver
- Maximum: 100%

**Best Practices:**
- Order fuel at 35-40%, not when critical
- Keep enough credits for fuel orders
- Order larger amounts less frequently (more efficient)
- Never let fuel drop below 20% if possible
- Remember: Fuel delivery takes time!

#### SUPPLY

**What it does:** Resource for work orders and decontamination operations

**Usage:**
- Work orders drain supply while active
- Decontamination drains supply while active
- Does NOT drain passively

**Impact of running out:**
- Cannot issue work orders
- Cannot decontaminate ships
- Facilities cannot be guaranteed-repaired

**How to order:**
- Use the +/- buttons or type an amount in the Resources panel, then click ORDER
- Type: ORDER SUPPLY [amount] (e.g., ORDER SUPPLY 30)
- Costs 1 credit per unit
- Order amount: 1-99 units
- Takes ~2-4.5 minutes to deliver
- Maximum: 100%

**Best Practices:**
- Order supply when below 30% if active maintenance needed
- Keep buffer for emergency work orders
- If many facilities degrading, order supply early
- More cost-effective than fuel (use work orders liberally)

### Concourse Management

**What it is:** The current population of ships at your gate

**How it changes:**
- Increases when you APPROVE ships
- Decreases over time as ships depart naturally
- Typical range: 6-26+ ships

**Impact of high concourse:**
- Overcrowding can cause system stress
- Increases chance of facility subsystems degrading
- Can slow overall operations
- No immediate sever risk, but problematic
 - **Separate risk:** More than 3 ships WAITING TO DOCK is a sever condition (watch the dock queue)

**How to manage:**
- Click **PURGE** button
- Type **PURGE** command
- Cost: 10 FUEL
- Cooldown: 10 seconds
- Effect: Clears low-priority traffic immediately

**When to PURGE:**
- Concourse above 20 ships
- Systems heavily degraded (reduce stress)
- Low on supply (fewer ships = fewer issues)
- Preparing for difficult period

**When NOT to PURGE:**
- Fuel below 30% (PURGE costs 10 fuel)
- Concourse at normal levels (6-15 ships)
- Everything running smoothly

### Relay Network

**What relays are:** Communication stations that maintain your network connection

**Typical Setup:** 2-3 relays per gate (e.g., R-A847, R-B293, R-C561)

**Status Indicators:**
- ONLINE (green) - Functioning normally
- WEAK (yellow) - Degraded signal
- FAULT (orange) - Malfunctioning
- CRITICAL (red) - Near failure
- OFFLINE (red) - Not operational

**CRITICAL WARNING:**
- If ALL relays go OFFLINE, a sever timer starts (10s base). A BROADCAST button appears that can extend the timer in small increments.
- This is the most common game-over condition
- Completely preventable with proper relay management

**How Relays Work:**

1. **Relay Pings:**
   - Relays periodically send PING requests
   - You have 5 SECONDS to acknowledge (ACK)
   - Missing an ACK damages relay health by 25-40%
   - Multiple missed pings = relay goes WEAK → FAULT → CRITICAL → OFFLINE

2. **Acknowledging Pings:**
   - **Method 1:** Click the ACK button that appears on the relay
   - **Method 2:** Type ACK [relay-id] (e.g., ACK R-A847)
   - Audio alert plays when ping arrives (enable sound!)
   - Must acknowledge within 5 seconds to avoid health damage

3. **Relay Maintenance:**
   - Use STABILIZE for proactive maintenance on ONLINE/WEAK relays
   - Use RESTORE for reactive repairs on degraded relays
   - STABILIZE is refused if the relay is already very healthy (>=85%)
   - RESTORE does not work on OFFLINE relays
   - OFFLINE relays may recover randomly or via work orders
   - Regular STABILIZE use prevents degradation to critical levels

**Relay Commands:**

**ACK [relay-id]**
- Acknowledges a relay ping
- MUST be done within 5 seconds of ping
- Prevents 25-40% health damage
- Example: ACK R-A847
- Most important command in the game

**PING [relay-id]**
- Manually tests relay connection
- Shows relay response time
- Use to check relay health
- Example: PING R-A847

**STABILIZE [relay-id]**
- Proactive maintenance for ONLINE/WEAK relays
- Boosts health by 10-20%
- Caps at 95% health
- 30-second cooldown per relay
- Cannot be spammed
- Refused if relay is already at >=85% health
- Example: STABILIZE R-A847
- Use regularly to prevent degradation

**RESTORE [relay-id]**
- Reactive repair for degraded relays
- Only works on WEAK/FAULT/CRITICAL relays (not OFFLINE)
- Success rate based on relay health:
  - ONLINE (75-100% health): 92% success
  - WEAK (50-74% health): 80% success
  - FAULT (25-49% health): 65% success
  - CRITICAL (1-24% health): 50% success
- Failures do nothing (no backfire or cascade)
- Success restores to 85-95% health
- Example: RESTORE R-A847

**Best Practices:**
- Enable audio to hear ping alerts
- ACK pings IMMEDIATELY (drop everything)
- Use STABILIZE on cooldown (30s) on healthy relays
- Use RESTORE early (higher success rate at better health)
- Missing ACKs damages health but isn't instant death
- Keep relays above 75% health with proactive STABILIZE
- If 2 relays OFFLINE, be VERY careful with the last one

---

## Commands Reference

### Essential Commands

**STATUS**
- Shows overall gate health summary
- Displays all system states
- Quick overview of what needs attention
- Example: `STATUS`

**DETAIL [ship-id]**
- Shows complete ship information
- Required before approving ships
- Example: `DETAIL V-9012`

**APPROVE [ship-id]** or **APP [ship-id]**
- Clears ship for transit
- Earns +4 credits
- Example: `APPROVE V-9012` or `APP V-9012`

**DENY [ship-id] [reason]**
- Refuses ship entry/exit with reason
- Earns +3 credits if correct, -2 if incorrect
- Example: `DENY V-9012 QUARANTINE REQUIRED`

**SCAN**
- Detects hidden threats on all ships in queue
- Cooldown: 10 seconds
- Critical for detecting hidden Raiders and Pirates
- Example: `SCAN`

**REALIGN**
- Fixes alignment drift
- Cooldown: 10 seconds
- Example: `REALIGN`

**RESYNC**
- Restores sync, sometimes beacon
- Cooldown: 10 seconds
- Example: `RESYNC`

**PURGE**
- Clears low-priority traffic
- Costs 10 FUEL
- Cooldown: 10 seconds
- Example: `PURGE`

**ACK [relay-id]**
- Acknowledges relay ping
- MUST do within 5 seconds
- Example: `ACK R-A847`

**ORDER FUEL [amount]**
- Orders fuel shipment
- Amount: 1-99 units; 1 CR per unit; delivery ~2-4.5 minutes
- Example: `ORDER FUEL 50`

**ORDER SUPPLY [amount]**
- Orders supply shipment
- Amount: 1-99 units; 1 CR per unit; delivery ~2-4.5 minutes
- Example: `ORDER SUPPLY 30`

### Information Commands

**HELP** or **?**
- Shows command list
- Example: `HELP`

**LINKS**
- Views corridor status
- Shows all transit paths and their states
- Example: `LINKS`

**LIST** or **LIST INBOUND** or **LIST OUTBOUND** or **LIST DOCKED**
- Lists ships in queues
- Example: `LIST DOCKED`

**RELAYS**
- Shows relay network status
- Displays pending ACKs
- Example: `RELAYS`

**REPAIR [system-name]**
- Attempts quick facility repair (70% success; 15-30s; failed repairs can knock systems OFFLINE)
- Cooldown: 5 seconds between attempts
- Example: `REPAIR DECON`

**WORKORDER [system-name]**
- Issues guaranteed work order for facility (100% success)
- Costs supply, takes ~1-3 minutes, only available when the system is OFFLINE
- Example: `WORKORDER DECON`

### Ship Commands

**DETAIL [ship-id]** or **DTL [ship-id]**
- Full ship information
- Example: `DETAIL V-9012`

**QUERY [ship-id]** or **QRY [ship-id]**
- Requests ship identification
- Example: `QUERY V-9012`

**DECON [ship-id]**
- Starts decontamination (requires Decon Bay ONLINE, costs supply, ship must be in WAITING DECON)
- Example: `DECON V-9012`

**HOLD [ship-id]**
- Pauses ship for 30-60 seconds (once per ship)
- Example: `HOLD V-9012`

**NOTE [ship-id] [text]**
- Adds operator notes to ship record
- Example: `NOTE V-9012 Suspicious transponder signature`

### Relay Commands

**ACK [relay-id]**
- Acknowledges relay ping (CRITICAL - must do within 5 seconds)
- Prevents 25-40% health damage
- Example: `ACK R-A847`

**PING [relay-id]**
- Tests relay connection
- Example: `PING R-A847`

**STABILIZE [relay-id]**
- Proactive maintenance for ONLINE/WEAK relays
- Boosts health by 10-20%, 30-second cooldown
- Example: `STABILIZE R-A847`

**RESTORE [relay-id]**
- Reactive repair for degraded relays
- Success rate 50-92% based on relay health
- No backfire on failure
- Example: `RESTORE R-A847`

### Utility Commands

**EXPORT**
- Downloads save file (.tqegate)
- Preserves your session
- Example: `EXPORT`

**THEME [color]**
- Changes visual theme
- Type `THEME` with no arguments to see your unlocked list
- Example: `THEME cyan`

**CLEAR**
- Clears console log
- Example: `CLEAR`

**TIME**
- Shows current shift time
- Example: `TIME`

### Multiplayer Commands

**PING GATE-[id]**
- Sends ping to another gate operator
- Example: `PING GATE-42`

**ACK GATE-[id]**
- Acknowledges ping from another gate operator
- Example: `ACK GATE-42`

**MSG GATE-[id] [message]**
- Sends message to another gate operator
- Example: `MSG GATE-15 Hello from Gate-07!`

**DND PING** or **DND MSG** or **DND ALL**
- Toggles Do Not Disturb mode
- PING: Blocks incoming pings
- MSG: Blocks incoming messages
- ALL: Blocks both
- Example: `DND MSG`

### Command Shortcuts

- **Arrow Up**: Recalls last command
- **Enter**: Submits command
- **Esc**: Clears input or dismisses help panel

---

## How to Lose (Severing Conditions)

"Severing" means your gate disconnects from the network and your session ends. Here are all the ways you can lose:

### 1. FUEL DEPLETION
**Condition:** FUEL reaches 0%

**What happens:** Power loss → Gate powers down → SEVERED

**Why it happens:**
- Didn't order fuel in time
- Ran out of credits to buy fuel
- Fuel Manifold OFFLINE increased drain rate
- Too many PURGE commands (costs 10 fuel each)

**Prevention:**
- Order fuel when below 35-40%, not when critical
- Keep enough credits for fuel orders
- Repair Fuel Manifold when DEGRADED
- Limit PURGE usage when fuel is low
- Remember fuel delivery takes time!

### 2. RELAY FAILURE
**Condition:** All relays OFFLINE past the sever timer

**What happens:** Network disconnected → Communications lost → SEVERED

**Why it happens:**
- Ignored relay PING requests
- Didn't ACK pings within 5 seconds
- Let relays degrade to OFFLINE without maintenance

**Prevention:**
- ACK relay pings IMMEDIATELY when they appear
- Enable audio to hear ping alerts
- Never ignore ping alarm
- If relay goes WEAK, ACK future pings promptly
- Use STABILIZE proactively to keep relays healthy
- Avoid letting multiple relays fail simultaneously

**Last Resort - Emergency Broadcast:**
- If ALL relays go OFFLINE, a BROADCAST button appears
- Spam-click it to extend the sever timer (+1.5s per click)
- Requires constant clicking to stay alive
- Cannot focus on other tasks while broadcasting
- Risky but gives a final chance for relay recovery or work order completion

**This is the #1 cause of game over - always ACK pings!**

### 3. ALIGNMENT/SYNC LOSS
**Condition:** ALIGNMENT OUT OF TOLERANCE or SYNC FAULT for 60 seconds

**What happens:** Gate destabilizes ƒ+' SEVERED (GATE ALIGNMENT LOST or GATE SYNC LOST)

**Why it happens:**
- Ignored REALIGN or RESYNC warnings
- System drift compounded by poor relay health
- Let critical gate systems run unstable too long

**Prevention:**
- Use REALIGN and RESYNC as soon as warnings appear
- Keep relays healthy to reduce sync drift
- Watch the Gate Systems timer and fix before the 30s klaxon

### 4. CORRIDOR COLLAPSE
**Condition:** All corridor links OFFLINE

**What happens:** Lost network connection → Gate isolated → SEVERED

**Why it happens:**
- Random degradation (no direct fix available)
- Poor overall gate health
- Multiple system failures stressing corridors

**Prevention:**
- Maintain overall gate health
- Keep systems stable to reduce corridor stress
- Monitor corridor status constantly
- Keep alignment and sync healthy
- Maintain relay network

**Note:** This is largely random but maintaining healthy systems reduces risk

### 5. FACILITY FAILURE
**Condition:** All facilities OFFLINE with no active work orders

**What happens:** Critical system failure → Gate inoperable → SEVERED

**Why it happens:**
- Let facilities degrade from DEGRADED to OFFLINE without repairing
- Didn't issue work orders in time
- Ran out of supply for work orders
- Ignored facility health warnings

**Prevention:**
- Repair facilities at DEGRADED status (don't wait for OFFLINE)
- Issue work orders on critical facilities for guaranteed repair
- Keep supply available for work orders
- Monitor facility health constantly

**Degradation note:** DEGRADED systems can worsen over time; repair early


### 6. DOCK TRAFFIC CONGESTION
**Condition:** More than 3 ships WAITING TO DOCK

**What happens:** Dock gridlock ? SEVERED

**Why it happens:**
- Approved inbound ships faster than docks clear
- Decon/servicing backlog
- Ignored WAITING TO DOCK queue

**Prevention:**
- Keep dock slots moving (DECON/servicing)
- Avoid approving inbound ships when docks are full or Decon Bay is OFFLINE
- Clear backlog before approving more inbound traffic

### 7. VACUUM BLOOM
**Condition:** Approved INBOUND ship with Vacuum Bloom reaches gate

**What happens:** Outbreak spreads → Gate contaminated → INSTANT SEVERED

**Why it happens:**
- Approved hazardous ship without checking DETAIL
- Didn't read ship information carefully
- Missed hazard warning in ship details

**Prevention:**
- ALWAYS check DETAIL before approving ANY ship
- Look for "VACUUM BLOOM" in red text
- DENY any ship with Vacuum Bloom
- Use reason: "QUARANTINE REQUIRED"

**This is instant and irreversible - no warnings, no countdown**

### 8. RAIDERS/PIRATES
**Condition:** Approved INBOUND ship with Raiders or Pirates docks at your gate

**What happens:** Hostile forces attack → Gate destroyed → INSTANT SEVERED

**Why it happens:**
- Approved hostile ships without detection
- Didn't use SCAN regularly
- Missed hidden threats

**Prevention:**
- Use SCAN command on cooldown (~10s)
- SCAN detects hidden Raiders and Pirates
- Check DETAIL after SCAN to see results
- DENY ships with Raiders/Pirates
- Use reason: "AUTHORITIES NOTIFIED"

**Raiders and Pirates are hidden - only visible after SCAN**

### 9. RADIATION EXPOSURE
**Condition:** A ship remains in WAITING DECON until the exposure timer expires

**What happens:** Gate exposure to radiation ? Systems failure ? SEVERED

**Why it happens:**
- DECON not started in time
- Decon Bay OFFLINE or ignored
- Decon failure not retried quickly

**Prevention:**
- Start DECON immediately on WAITING DECON ships
- Keep Decon Bay ONLINE (repair it before approving inbound docks)
- If DECON fails, retry within the short exposure window
- DENY outbound ships that show Corridor Radiation
### 10. CRITICAL DEADLINE FAILURE
**Condition:** A CRITICAL outbound ship misses its deadline (especially TOW requests)

**What happens:** Severe penalties. TOW requests can SEVER the gate if allowed to run very late (5+ minutes overdue).

**Why it happens:**
- Didn't prioritize high-urgency ships
- Spent too much time investigating without HOLD
- Missed the warning timer

**Prevention:**
- Process CRITICAL priority ships FIRST
- Watch countdown timers on outbound ships
- Use HOLD if you need time to verify safety
- Make a decision before the timer expires
- Better to deny a suspicious CRITICAL ship than let it time out
### 11. ENTERING DEBT
**Condition:** Reaching 0 (or less) total WAGE

**What happens:** Bankrupt operator → Terminated → INSTANT SEVERED

**Why it happens:**
- Too many incorrect denials (-2 credits each)
- Spending on resources without earning enough
- Cumulative small mistakes

**Prevention:**
- Keep an eye on WAGE constantly
- Avoid incorrect denials (when in doubt, check DETAIL first)
- Don't overspend on resources
- Approve ships to earn credits (+4 each)
- Remember: Baseline wage is 1 credit/minute + a base 8 credits, plus action bonuses

---

## Survival Strategies & Tips

### Critical Habits (Do These Always)

1. **Check DETAIL on EVERY ship before approving**
   - One missed hazard = instant game over
   - Takes 2-3 seconds, saves your session
   - Read the entire ship information
   - Look for red text warnings

2. **Use SCAN on cooldown (~10s)**
   - Detects hidden Raiders and Pirates
   - 60-second cooldown means you should use it constantly
   - Make it part of your rhythm
   - Scan → Process ships → Scan → Process ships

3. **ACK relay pings IMMEDIATELY**
   - Drop everything when you hear ping alarm
   - 5-second window is very tight
   - Enable audio to hear alerts
   - Most common cause of game over

4. **Order FUEL at 35-40%, not when critical**
   - Fuel delivery takes ~2-4.5 minutes
   - Waiting until 25% is risky
   - Fuel at 20% = potential emergency
   - Always keep credits for fuel

5. **Repair facilities at DEGRADED status**
   - Don't wait for OFFLINE (harder to fix)
   - DEGRADED → OFFLINE takes 2-5 minutes
   - Use REPAIR for quick fix (70% success; failed repairs usually stay degraded)
   - Use WORKORDER (WO button) for a guaranteed fix (100% success, costs supply)

6. **Watch outbound ship deadlines**
   - CRITICAL TOW requests can SEVER if very late
   - Yellow/red timers = process immediately
   - Use HOLD on suspicious ships to buy time
   - Make decision before HOLD expires

7. **When in doubt, use HOLD**
   - Pauses ship for 30-60 seconds
   - Gives you time to SCAN and investigate
   - Can only use once per ship
   - Better to HOLD than rush dangerous approval

8. **Incorrect DENYs cost credits but won't end your game**
   - Denying safe ship = -2 credits
   - Approving inbound Vacuum Bloom or Raider/Pirate ships can SEVER the gate on docking
   - When suspicious, DENY and provide reason
   - Better safe than sorry

9. **Use REALIGN and RESYNC preventively**
   - 10-second cooldowns are short
   - Use at yellow status, not red
   - Prevents critical system failures
   - Make it part of your routine

10. **Remember your passive income**
    - Earn 1 credit per minute baseline (plus base 8 credits and action bonuses)
    - +4 credits per ship approval
    - +3 credits per correct denial
    - Process ships efficiently to maximize earnings

### Advanced Survival Techniques

**Priority Management**
1. **Immediate priorities (drop everything):**
   - Relay pings (ACK within 5 seconds)
   - CRITICAL deadline ships (red timer <30s)
   - Fuel at 15% or less

2. **High priorities (handle soon):**
   - Facilities showing OFFLINE
   - CRITICAL ships with low timers
   - Alignment OUT OF TOLERANCE
   - Sync at FAULT

3. **Medium priorities (regular attention):**
   - Facilities showing DEGRADED
   - URGENT deadline ships
   - Fuel at 30-35%
   - Supply at 20-30%
   - Running SCAN (on cooldown (~10s))

4. **Low priorities (when convenient):**
   - STANDARD deadline ships
   - Alignment DRIFTING
   - Sync ASYNC
   - Beacon FAULT
   - Concourse above 20

**Resource Management Strategy**

**Fuel:**
- Target range: 40-70%
- Order in larger batches (more efficient)
- Example: Order 50 fuel at 40%, not 20 fuel at 30%
- Reserve at least 50 credits for emergency fuel

**Supply:**
- Target range: 30-60%
- Used for work orders and decon
- Order based on maintenance needs
- If multiple facilities DEGRADED, order 40-50 supply
- If everything stable, can run lower

**Credits:**
- Always keep 50+ credits as emergency buffer
- Fuel orders can cost 30-60 credits
- Supply orders cost 20-40 credits
- Don't spend last credits on non-essentials

**The SCAN-Process Loop**

Develop a rhythm:
1. Type SCAN (starts cooldown)
2. Process 1-2 ships while SCAN on cooldown
3. Check DETAIL → APPROVE or DENY
4. SCAN again (cooldown finished)
5. Repeat

This ensures constant threat detection.

**Ship Processing Checklist**

For EVERY ship:
- [ ] Check priority level
- [ ] Click DETAIL
- [ ] Read transponder status
- [ ] Check for hazard warnings (red text)
- [ ] Check cargo and type
- [ ] Verify last SCAN was recent (<=20s ago)
- [ ] Make decision: APP, DENY, HOLD, DECON, QUERY

**Emergency Response Plans**

**Fuel Emergency (Below 20%):**
1. Stop using PURGE (costs 10 fuel)
2. Order maximum fuel immediately
3. Process ships quickly for credits
4. Repair Fuel Manifold if DEGRADED/OFFLINE
5. Deny risky ships (don't waste time investigating)

**Relay Emergency (2+ relays OFFLINE):**
1. Enable audio if not already on
2. ACK remaining relay immediately when pinged
3. Do NOT use RESTORE (too risky)
4. Focus on keeping last relay alive
5. Wait for offline relays to recover randomly

**Facility Emergency (2+ facilities OFFLINE):**
1. Order supply if low
2. Issue work orders on all OFFLINE facilities
3. Use REPAIR on remaining DEGRADED facilities
4. Process ships quickly for credits
5. Avoid risky approvals (limited capacity)

**Corridor Emergency (3+ corridors DEGRADED/OFFLINE):**
1. Focus on overall gate health
2. Keep alignment WITHIN TOLERANCE
3. Keep sync at SYNC
4. Maintain relay network
5. Hope corridors recover (no direct fix)
6. Avoid other risky actions

**Multiple Emergencies (Everything Failing):**
1. ACK relay pings (highest priority)
2. Check fuel level (if <10%, order immediately)
3. Issue work orders on critical facilities
4. Process only safe ships (check DETAIL carefully)
5. Use REALIGN and RESYNC on cooldown
6. Stay calm, prioritize ruthlessly

**Common Mistakes to Avoid**

1. **Approving without checking DETAIL**
   - Leads to: Vacuum Bloom, Raiders, Pirates sever
   - Fix: ALWAYS click DTL before APP

2. **Ignoring relay pings**
   - Leads to: All relays offline → sever
   - Fix: Enable audio, ACK immediately

3. **Ordering fuel too late**
   - Leads to: Fuel reaches 0% before delivery
   - Fix: Order at 35-40%, not 25%

4. **Not using SCAN regularly**
   - Leads to: Approving ships with hidden threats
   - Fix: SCAN on cooldown (~10s)

5. **Letting facilities degrade to OFFLINE**
   - Leads to: All facilities offline → sever
   - Fix: Repair at DEGRADED status

6. **Missing CRITICAL deadlines**
   - Leads to: Instant sever
   - Fix: Process CRITICAL ships first, use HOLD if needed

7. **Running out of credits**
   - Leads to: Can't buy fuel → fuel depletion → sever
   - Fix: Always keep 50+ credit buffer

8. **Wasting HOLD on safe ships**
   - Leads to: No HOLD available for suspicious ships
   - Fix: Only HOLD when truly suspicious

9. **Using PURGE when low on fuel**
   - Leads to: Fuel depletion
   - Fix: Only PURGE when fuel >40%

10. **Panicking during emergencies**
    - Leads to: Mistakes, wrong priorities
    - Fix: Stay calm, follow priority list, focus on what matters

### Time-Based Strategies

**First Hour (Getting Established):**
- Learn interface layout
- Develop SCAN-Process rhythm
- Maintain healthy resource levels (fuel >50%, supply >40%)
- Build credit buffer (100+ credits)
- Stay conservative (DENY when suspicious)

**Hours 2-4 (Peak Difficulty):**
- Systems start degrading more frequently
- Ship traffic increases
- Focus on rhythm and consistency
- Use work orders liberally (guaranteed fixes)
- Stay ahead of maintenance

**Hours 5-7 (Endurance Phase):**
- Fatigue becomes a factor (for the player!)
- Maintain habits (SCAN, ACK, DETAIL)
- Don't get complacent
- Take optional breaks if needed (BREAK button - costs credits)
- Stay focused on priorities

**Hour 8+ (Victory Lap / Extended Modes):**
- Official shift complete (if playing timed mode)
- Can continue indefinitely
- Difficulty doesn't decrease
- Stay vigilant
- Set personal goals (credits earned, ships processed)
- **UNLIMITED/ENDURANCE modes:** No end time - keep going until you sever
- **Extended shifts (12HR, 24HR):** Pace yourself, use breaks strategically

---

## What Happens When You Lose

### Severed Screen

When your gate severs (game over), you'll see a summary screen with:

**Session Statistics:**
- **Gate ID** - Which gate you were operating
- **Time of Loss** - Shift time when severing occurred
- **Cause of Loss** - Specific reason for severing (e.g., "FUEL DEPLETION", "ALL RELAYS OFFLINE", "VACUUM BLOOM OUTBREAK")
- **Shift Time** - Total time elapsed during your session
- **Ships Approved** - Number of ships you successfully processed
- **Ships Denied** - Number of ships you refused
- **Wage** - Total credits earned during shift
- **Final Score** - Your performance score
- **Mode** - Game mode you were playing (NORMAL, UNLIMITED, ENDURANCE)

**What You Can Do:**
- **Restart Gate** - Returns to start screen to begin new session
- Review your statistics and see what went wrong
- Learn from the cause of loss for next attempt

**After Severing:**
- Session cannot be resumed (even if you saved before)
- Statistics are displayed but not permanently stored
- No penalty for losing - just start again
- Each attempt is a learning experience

**Common "Cause of Loss" Messages:**
- "Gate Power Loss" - Fuel hit 0%
- "OPERATOR ENTERED DEBT" - Wage dropped to 0 or below
- "Gate Relay Disconnected" - All relays offline past the sever timer
- "GATE ALIGNMENT LOST" - Alignment stayed out of tolerance too long
- "GATE SYNC LOST" - Sync stayed in FAULT too long
- "Losing Connection to the Corridor Network" - All corridors offline
- "Gate System Failure" - All facilities offline with no work orders
- "DOCK TRAFFIC CONGESTION" - Too many ships waiting to dock
- "Vacuum Bloom Outbreak" - Vacuum Bloom reached the gate
- "Pirater / Raider attack" - Raiders or pirates docked
- "GATE EXPOSURE TO RADIATION" - Exposure timer expired while waiting to decon
- "EMERGENCY TOW FAILURE: <ID> LOST" - TOW request ran very late
---

## Advanced Features

### Game Modes

**Normal Mode (Timed Shift)**
- Select shift length from multiple options:
  - Quick: 15 MIN, 30 MIN, 1 HR, 2 HR
  - Standard: 4 HR, 8 HR (recommended for first-time players)
  - Extended: 12 HR, 24 HR
  - Custom: Set any duration you want
- Official shift ends at chosen time
- Can continue beyond shift end
- Score calculated based on shift length and completion percentage
- Saves enabled (can EXPORT and resume)

**Unlimited Mode**
- Timer runs forever until SEVER or RESET
- No official end time
- Score calculated differently (performance density over time)
- For experienced players seeking endurance challenges
- Same difficulty as Normal Mode
- Saves enabled

**Endurance Mode**
- Same as UNLIMITED mode but with saves disabled
- No EXPORT command available
- Cannot save and resume
- True hardcore challenge - one continuous run
- If you close browser or refresh page, session is lost
- For ultimate test of skill and endurance
- Score calculated like UNLIMITED mode

### Scoring System

Your score measures efficiency and performance density, not just time survived.

**Score Factors:**

**Positive Contributions:**
- Ships approved (+points)
- Correct denials (+points)
- Decon operations completed (+points)
- Work orders completed (+points)
- Relay acknowledgments (+points)
- Deadlines met (+points)
- Wage earned (+points)

**Negative Contributions:**
- Incorrect denials (-points)
- Deadlines missed (-points)
- Operator errors (-points)
- Critical misses (-points)
- Inbound timeouts (-points)

**Score Calculation:**
- **Normal Mode:** Based on shift length completion percentage
- **Unlimited Mode:** Based on performance density over time

**Viewing Your Score:**
- Click SCORE button in top right
- Shows detailed statistics breakdown
- Displays current score
- Shows session details (gate ID, operator, time elapsed)
- Lists traffic, maintenance, performance stats

### Multiplayer (Ambient Network)

Gate Control Terminal features ambient multiplayer - you can see and interact with other operators managing different gates.

**How It Works:**
- Connect to server when game starts
- See online operators in "Gate Network" panel
- Send/receive pings and messages
- Other operators are managing their own gates independently
- No direct impact on your gate (purely social)

**Connection Status:**
- **Top left corner (below gate ID):** Shows connection status
- **ONLINE** with green light = connected to multiplayer server
- **OFFLINE MODE** with red light = offline mode (single player)
- Connection status doesn't affect core gameplay
- Can play entirely offline if server unavailable

**Multiplayer Commands:**

**PING GATE-[id]**
- Sends ping to another gate operator
- They see notification
- Friendly greeting or check-in
- Example: `PING GATE-42`

**ACK GATE-[id]**
- Acknowledges ping from another gate operator
- Shows you received their ping
- Example: `ACK GATE-42`

**MSG GATE-[id] [message]**
- Sends text message to another gate operator
- Chat with other players
- Share experiences, warnings, tips
- Example: `MSG GATE-15 Almost at 4 hours!`

**DND (Do Not Disturb)**
- Blocks incoming multiplayer notifications
- Options:
  - `DND PING` - Blocks pings only
  - `DND MSG` - Blocks messages only
  - `DND ALL` - Blocks both
- Toggle on/off by typing same command again
- Useful when you need to focus

**Gate Network Panel:**
- Located in SYSTEMS panel
- Shows list of online operators
- Displays pending pings/messages
- Click ACK button to acknowledge
- Collapsible section

**Multiplayer Tips:**
- Multiplayer is optional (can play offline)
- Other operators cannot affect your gate
- Useful for shared experience and community
- Can be distracting - use DND if needed
- Makes the game feel less lonely

### Save/Load System

**EXPORT (Save Game):**
- Type EXPORT command or click EXPORT button
- Downloads .tqegate save file
- Preserves entire session state:
  - Gate state (all systems, ships, resources)
  - Shift time elapsed
  - Statistics and score
  - Operator callsign
  - All in-progress work orders
- **Not available in ENDURANCE mode**

**LOAD FILE (Load Game):**
- Available on start screen
- Click "LOAD FILE" button
- Select .tqegate file
- Resumes exactly where you left off
- Can resume after browser crash or intentional break
- Works with all modes except ENDURANCE

**Best Practices:**
- Export after successful milestones (2hr, 4hr, 6hr)
- Export before risky decisions
- Keep multiple saves for different runs
- Save file names include gate ID and timestamp
- Can export during active shift (doesn't pause game)
- **ENDURANCE mode players:** No saves available - true hardcore experience

**Save File Naming:**
- Format: `gate-[ID]-[timestamp].tqegate`
- Example: `gate-07-2024-01-15T14-30-00.tqegate`
- Automatically generated
- Can rename files for organization

### Break System

**Taking Paid Breaks:**
- Click BREAK button in game controls
- Costs 25 credits per minute
- Pauses game completely
 - Disabled in co-op mode
- Fuel doesn't drain
- Systems don't degrade
- Ships don't arrive
- Timer shows break duration
- Click RESUME to continue

**When to Use Breaks:**
- Need bathroom break
- Want to study ship/system state
- Feeling overwhelmed
- Planning strategy
- Just need a pause

**Cost Consideration:**
- 25 credits per minute adds up
- 5-minute break = 125 credits
- Only use when necessary
- Alternative: EXPORT and close browser

---

## Settings & Customization

### Visual Themes

**Available Themes:**
- **green** - Default, classic terminal green
- **red** - Alert red aesthetic
- **blue** - Cool blue tones
- **purple** - Violet/purple theme
- **amber** - Warm amber/yellow
- **cyan** - Bright cyan/teal
- **orange** - Orange accent theme
- **black** - Monochrome black/white
- **lightblue** - Light mode, blue accents
- **lightred** - Light mode, red accents
- **lightgreen** - Light mode, green accents
- **paper** - Light mode, paper aesthetic
- **pinkblack** - Pink on black
- **browngold** - Brown/gold theme
- **christmas** - Festive red/green (seasonal)
- **halloween** - Orange/green spooky (seasonal)
- **soviet** - Red/yellow Soviet aesthetic
- **synthwave** - Purple/cyan retro
- **earth** - Earth-inspired blue/gold palette
- **federation** - Blue/yellow dawn palette
- **sunset** - Pink/orange sunset palette

**Changing Theme:**
- Click theme dropdown in top right
- Type: `THEME [color]` (e.g., `THEME cyan`)
- Changes immediately
- Saved to browser storage
- Affects all UI colors

**Light vs Dark Themes:**
- Most themes are dark mode (easier on eyes)
- Light themes: lightblue, lightred, lightgreen, paper, earth
- Light themes better for bright environments
- Dark themes better for low-light environments

### Audio Settings

**SFX (Sound Effects):**
- Toggle button in top right
- Controls all sound effects:
  - Relay ping alerts (CRITICAL for gameplay)
  - Ship processing sounds
  - Button clicks
  - System alerts
  - Maintenance operations
- Volume slider (0-100%)
- Recommended: ON (especially for relay pings)

**Music:**
- Toggle button in top right
- Ambient background music
- Volume slider (0-100%)
- Adaptive (changes based on game state)
- Purely atmospheric (not gameplay critical)

**Keyboard Sounds:**
- Toggle button in top right
- Typing sounds when entering commands
- Volume slider (0-100%)
- Nostalgic terminal aesthetic
- Purely cosmetic

**Audio Best Practices:**
- Keep SFX ON for relay ping alerts
- Relay pings have audio alarm (critical!)
- Music and keyboard are optional
- Adjust volumes to preference
- Test audio on first launch

### Visual Effects (VFX)

**VFX Modes:**
- **HIGH** - Full visual effects (default)
  - Glow effects
  - Animations
  - Blur effects
  - Particle effects
  - Backdrop filters

- **LOW** - Reduced effects for performance
  - Minimal animations
  - No blur/backdrop filters
  - Better FPS on low-end devices
  - Cleaner, simpler visuals

**When to Use LOW:**
- Game feels laggy
- Low-end device (old phone, tablet)
- Want cleaner interface
- Battery saving on mobile
- Prefer minimal aesthetics

**Changing VFX:**
- Click VFX button in top right
- Toggles HIGH/LOW
- Changes apply immediately
- Saved to browser storage

### Operator Customization

**Operator Callsign:**
- Your display name
- Appears in top left
- Visible to other players in multiplayer
- Editable anytime:
  - Click callsign in top left
  - Type new name
  - Press Enter to save
  - Press Esc to cancel

**Gate Selection:**
- Choose GATE-00 through GATE-99 at start
- Affects procedural generation:
  - Ship names
  - Random events
  - System behavior (slightly)
- Different gates = different experiences
- Can't change during session

**Shift Length:**
- Set at game start
- Options:
  - Quick shifts: 15 MIN, 30 MIN, 1 HR, 2 HR
  - Standard shifts: 4 HR, 8 HR
  - Extended shifts: 12 HR, 24 HR
  - UNLIMITED mode (timer runs forever)
  - ENDURANCE mode (unlimited with no saves)
  - CUSTOM (set your own hours and minutes)
- Affects score calculation
- Can continue beyond chosen time (except UNLIMITED/ENDURANCE which never end)
- Shift length displayed in top bar

### Interface Options

**Command Input:**
- Supports command history (Arrow Up for last command)
- Case-insensitive (APPROVE = approve)
- Autocomplete suggestions (partial)
- Click buttons as alternative to typing

**Accessibility:**
- High contrast themes available
- Monospace fonts for clarity
- Keyboard navigation supported
- Screen reader compatible (aria labels)
- Color-blind friendly options

**Mobile Support:**
- Responsive design works on all screen sizes
- Touch-optimized buttons for easy tapping
- Swipe gestures for collapsible panels
- Safe area insets (handles notches, rounded corners)
- Works on phones and tablets
- PWA installable (Progressive Web App):
  - Add to home screen on mobile devices
  - Works offline after first load
  - App-like experience
  - No app store needed
- Recommended to play in landscape on phones for better visibility

### Advanced Settings

**Hard Reset:**
- Button in top right (red, labeled RESET)
- Wipes ALL session data
- Returns to start screen
- Cannot be undone
- Use carefully!

**Data Management:**
- Game saves to browser localStorage
- Export saves to files (.tqegate)
- Can clear browser data to reset
- No cloud saves (local only)

---

## Quick Reference Tables

### Ship Hazards

| Hazard | Detection | Handling |
|--------|-----------|----------|
| Vacuum Bloom | SCAN (usually) | DENY: "QUARANTINE REQUIRED" |
| Raiders / Pirates | SCAN | DENY: "AUTHORITIES NOTIFIED" |
| Corridor Radiation (outbound only) | SCAN (usually) | DENY: "RADIATION HAZARD" |

### System Status Guide

| System | Green | Yellow | Red | Fix Method |
|--------|-------|--------|-----|------------|
| Beacon | ONLINE | FAULT | OFFLINE | RESYNC command |
| Alignment | WITHIN TOLERANCE | DRIFTING | OUT OF TOLERANCE | REALIGN command |
| Sync | SYNC | ASYNC | FAULT | RESYNC command |
| Corridors | STABLE | DEGRADED | OFFLINE | No direct fix (maintain gate health) |
| Facilities | ONLINE | DEGRADED | OFFLINE | REPAIR (70%) or WORKORDER (100%) |
| Relays | ONLINE | WEAK | FAULT/CRITICAL/OFFLINE | ACK pings, STABILIZE, RESTORE |

### Priority Tiers

| Priority | Action | Deadline Type | Consequence of Failure |
|----------|--------|---------------|------------------------|
| CRITICAL | Process immediately | Tight | Severe penalties; TOW can sever if very late |
| URGENT | Process soon | Short | Credit penalties |
| STANDARD | Process when able | Relaxed | Minor credit penalties |

### Resource Guidelines

| Resource | Order At | Critical At | Order Amount | Delivery Time |
|----------|----------|-------------|--------------|---------------|
| FUEL | 35-40% | 25% | 1-99 units | ~2-4.5 minutes |
| SUPPLY | 30% | 20% | 1-99 units | ~2-4.5 minutes |

### Severing Conditions Summary

| Condition | Type | Warning Time | Prevention |
|-----------|------|--------------|------------|
| Fuel Depletion (0%) | Instant | Yes (low fuel alert) | Order fuel early |
| Operator Debt (<=0) | Instant | Yes (wage visible) | Keep wage positive |
| Relay Network Offline | Countdown (10s + BROADCAST) | Yes (ACK alarm) | ACK pings, use BROADCAST if severing |
| Alignment Out of Tolerance or Sync Fault | Countdown (60s) | Yes (timer + klaxon) | REALIGN/RESYNC immediately |
| Corridor Collapse (all offline) | Instant | Yes (status visible) | Maintain gate health |
| All Facilities Offline + No Work Orders | Instant | Yes (status visible) | REPAIR/WORKORDER before total loss |
| Dock Traffic Congestion (>3 waiting to dock) | Instant | Yes (queue visible) | Clear backlog quickly |
| Exposure Timer Expired (WAITING DECON) | Instant | Yes (exposure timer) | Start DECON quickly |
| Vacuum Bloom Breach | Instant on docking | No | SCAN, then DENY |
| Raider/Pirate Docking | Instant on docking | No | SCAN, then DENY |
| Emergency TOW Failure (very late) | Delayed sever | Yes (deadline timer) | Prioritize TOW deadlines |

---
## Glossary

**ACK** - Acknowledge; responding to relay pings or gate network pings

**APP** - Approve; clearing a ship for transit

**Concourse** - The current population of ships at your gate

**Corridor** - Transit path connecting gates; like highways between locations

**DECON** - Decontamination procedure for inbound ships in WAITING DECON

**DTL** - Detail; viewing complete ship information

**Facility** - Gate subsystem (Decon Bay, Fuel Manifold, Dock Clamps)

**Gate** - Transit hub structure that stabilizes corridor routes for ship travel

**Hazard** - Dangerous condition on a ship (Vacuum Bloom, Raiders, etc.)

**HOLD** - Temporarily pausing a ship's processing (30-60 seconds, once per ship)

**Inbound** - Ships arriving AT your gate from other locations

**Outbound** - Ships departing FROM your gate to other locations

**PING** - Signal request from relay or another gate operator

**PURGE** - Command to clear low-priority traffic from concourse

**QRY** - Query; requesting ship identification

**REALIGN** - Command to fix gate alignment drift

**Relay** - Communication station maintaining network connection

**RESYNC** - Command to restore sync and sometimes beacon

**SCAN** - Command to detect hidden threats on ships

**SEVER/Severing** - Gate disconnecting from network (game over)

**Shift** - Your work period as gate operator (15 min to 24 hours, UNLIMITED/ENDURANCE, or CUSTOM)

**Supply** - Resource used for work orders and decontamination

**Sync** - Network synchronization state

**Transponder** - Ship identification system (VERIFIED, UNKNOWN, MISMATCH)

**WAGE** - Total credits earned during your shift

**WO** - Work Order; guaranteed facility repair (100% success, costs supply)

---

## Final Tips for Success

1. **Stay calm under pressure** - Panic leads to mistakes
2. **Develop a rhythm** - SCAN → Process → Repeat
3. **Trust your instincts** - If a ship feels suspicious, investigate or deny
4. **Keep audio on** - Relay ping alerts save lives
5. **DETAIL is your friend** - Check it on every ship
6. **ACK first, think later** - Relay pings are top priority
7. **Order resources early** - Don't wait for critical levels
8. **Repair at yellow, not red** - Prevention is easier than cure
9. **Use work orders liberally** - Supply is cheaper than severing
10. **Learn from mistakes** - Every sever teaches something

Remember: Your goal is to survive your shift, maintain your gate, and earn credits. Stay vigilant, trust the process, and keep your gate connected to the network.

Good luck, Operator.

---

## Quick Start Cheat Sheet

For players who want to jump in immediately, here are the absolute essentials:

**First 3 Actions:**
1. Check INBOUND queue
2. Click DTL on first ship
3. If no red warnings, click APP; if warnings, click DENY

**The 5 Critical Rules:**
1. **ALWAYS** check DETAIL before approving ships
2. **ACK relay pings IMMEDIATELY** (within 5 seconds)
3. **Use SCAN on cooldown (~10s)** to detect hidden threats
4. **Order fuel at 35-40%**, never wait for critical
5. **Repair facilities at DEGRADED**, not OFFLINE

**Sever Triggers to Avoid:**
- VACUUM BLOOM (inbound docking)
- RAIDERS / PIRATES (inbound docking; requires SCAN to detect)
- Exposure timer expiring on WAITING DECON ships
- All relays offline past the sever timer (use BROADCAST if needed)
- Fuel at 0%, alignment/sync fault lasting 60s, or all corridors offline
- TOW CRITICAL requests left 5+ minutes overdue

**Basic Commands:**
- `DETAIL [ship-id]` or click DTL - View ship info
- `APPROVE [ship-id]` or click APP - Clear ship (+4 CR)
- `DENY [ship-id] [reason]` or click DENY - Refuse ship (+3 CR if correct)
- `SCAN` - Detect hidden threats (use constantly)
- `ACK [relay-id]` or click ACK button - Acknowledge relay ping (5 seconds!)
- `STABILIZE [relay-id]` or click STABILIZE button - Proactive relay maintenance
- `RESTORE [relay-id]` or click RESTORE button - Repair degraded relay
- `REALIGN` - Fix alignment drift
- `RESYNC` - Restore sync
- `ORDER FUEL 50` - Order fuel
- `HELP` - Show command list

**What to Watch:**
- Relay pings (ACK immediately!)
- Fuel level (order at 35-40%)
- Facility health (repair when DEGRADED)
- Ship details (check EVERY ship before approval)
- Outbound deadlines (process CRITICAL ships first)

**Remember:**
- The game never pauses
- One mistake can end your session
- When in doubt, DENY (costs credits but won't sever)
- Enable audio for relay ping alerts
- SCAN regularly - hidden threats are common

**First Goal:**
Survive 1 hour. Then 2. Then 4. Each milestone is an achievement.

---

**END TRANSMISSION**
