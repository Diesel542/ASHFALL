# ASHFALL

A dying settlement at the edge of a toxic wasteland.
Five people clinging to what remains of their lives.
One secret beneath the ground that will save them — or end them.

Violence is optional. Choices bleed. The voices in your head don't always agree.

---

## The Game

ASHFALL is an isometric RPG where every conversation matters. NPCs are driven by LLM AI (OpenAI GPT-4 or Anthropic Claude), responding dynamically to your words while staying true to their trauma, secrets, and relationships. Four internal voices—LOGIC, INSTINCT, EMPATHY, and GHOST—comment on everything, pulling you in different directions.

The story unfolds across three acts, building toward one of five endings based on your choices, relationships, and which voice you've fed the most.

---

## Core Systems

### NPC Agents
Five fully-realized characters with LLM-driven dialogue:

| NPC | Role | Core Tension |
|-----|------|--------------|
| **Mara** | Leader | Control vs. truth about the past |
| **Jonas** | Healer | Guilt over someone he couldn't save |
| **Rask** | Enforcer | Violence as protection, violence as wound |
| **Edda** | Elder | Keeper of secrets she can't speak |
| **Kale** | Mirror | Identity formed from everyone else |

Each NPC has:
- **Arc Gates** (0-4): Progressive revelation of secrets
- **Mind Codex**: Complete psychological profile for LLM
- **Stress System**: Affects dialogue tone and stability
- **Relationship Tracking**: With player and other NPCs
- **Forbidden Topics**: Secrets gated behind narrative progress

### The Four Voices
Internal voices that react to everything:

- **LOGIC** — Analysis, patterns, cold truth
- **INSTINCT** — Gut feelings, danger sense, survival
- **EMPATHY** — Emotional understanding, connection
- **GHOST** — Something else. Something beneath.

Voice alignment influences endings and unlocks unique dialogue paths.

### Curie-Δ Entity
The AI buried beneath the settlement:
- **Hum System**: Ambient presence that intensifies
- **Tremor Events**: Physical manifestations of awakening
- **Ghost Override**: Curie speaks through the GHOST voice
- **NPC Resonance**: Some NPCs are more susceptible

### Game State Manager
Central nervous system connecting all game systems:
- **Single Source of Truth**: All state in one place
- **Event-Driven Architecture**: Systems communicate via EventBus
- **Automatic Transitions**: Act progression, NPC gates, ending calculation
- **State Export/Import**: Full serialization for save/load

### Dialogue System
LLM-powered conversation engine:
- **Tone Primer**: Enforces ASHFALL's sparse, weighted dialogue style
- **NPC Codexes**: Full psychological profiles per character
- **Arc Gates**: Controls what NPCs can reveal based on progression
- **Voice Reactions**: Internal voices respond to NPC dialogue
- **Conversation Memory**: Maintains context within sessions

### UI System
Complete Phaser 3 interface:
- **Dialogue Box**: Typewriter effect with punctuation pauses
- **Voice Panel**: Staggered display of internal voice reactions
- **Choice Panel**: Voice-tagged options with keyboard/mouse navigation
- **HUD**: Day, time, hum intensity display
- **Location Panel**: Current location and available destinations
- **Transitions**: Fades, tremors, ghost visual effects

### Save/Load System
Persistence with localStorage:
- **5 Save Slots**: Auto-save, quick save, 3 manual slots
- **Auto-Save**: Every 5 minutes
- **Quick Save/Load**: F5 / F9
- **Version Compatibility**: Prevents loading incompatible saves
- **Continue Support**: Tracks most recent save

### Narrative Engine
Three-act structure with dynamic progression:

| Act | Name | Tension | Curie State |
|-----|------|---------|-------------|
| 1 | Dormant | 0-40 | Sleeping |
| 2 | Stirring | 40-70 | Dreaming |
| 3 | Awakened | 70-100 | Conscious |

Features:
- **Act Triggers**: Events that force progression
- **NPC Gate System**: Secrets unlock based on relationship + events
- **Voice Alignment**: Tracks player tendencies
- **Ending Calculator**: Five possible endings

### Quest Archetypes
Eight narrative-safe quest templates:

| Archetype | Tagline |
|-----------|---------|
| **Intervention** | Someone is about to break. Help or don't. |
| **Scarcity Dilemma** | There isn't enough. Who suffers? |
| **Confession** | Someone carries a truth they cannot speak. |
| **Watchtower** | Guard the settlement — or interpret what's coming. |
| **Memory Echo** | Something triggers a resonance. |
| **Small Mercy** | Do something human in a world that punishes softness. |
| **Investigation** | Something is wrong. Find out what. |
| **Shaft's Shadow** | The sealed place calls. |

All quests are validated against fundamental rules:
- No outside factions
- No scarcity-breaking solutions
- No premature lore reveals
- No heroic power fantasy

### Relationship Systems
- **NPC-to-NPC Relationships**: 7 emotional dimensions (trust, fear, respect, resentment, protectiveness, guilt, hope)
- **Cross-Reference Dialogue**: NPCs gossip about each other
- **Relationship Events**: Actions trigger shifts between NPCs

### Environmental Systems
- **Weather System**: Dust, stillness, pressure changes tied to narrative
- **Location Context**: 9 locations with emotional fields and ambient details
- **Navigational Semantics**: Landmark-based directions (no compass)

---

## Tech Stack

- **Engine:** Phaser 3
- **Language:** JavaScript (ES6+)
- **Build:** Vite
- **AI:** OpenAI GPT-4 (primary) / Anthropic Claude (supported)
- **Storage:** localStorage for saves
- **Style:** Isometric with programmatic placeholders

---

## Project Structure

```
src/
├── agents/           # NPC agent classes (Mara, Jonas, Rask, Edda, Kale)
├── config/           # API config, tone bible, Curie guardrails
├── core/             # Central game management
│   ├── GameState.js         # Initial state definition
│   ├── EventBus.js          # Event system with 30+ event types
│   ├── GameStateManager.js  # State mutations and coordination
│   └── GameManager.js       # Public API singleton
├── data/             # Game data
│   ├── relationships.js     # NPC relationship matrix
│   ├── locations.js         # 9 settlement locations
│   ├── npcData.js          # NPC display info
│   ├── endings.js          # 5 ending configurations
│   └── openingScene.js     # Opening sequence data
├── dialogue/         # LLM dialogue system
│   ├── DialogueEngine.js    # OpenAI conversation handler
│   ├── VoiceSystem.js       # Internal voice generation
│   ├── tonePrimer.js        # Style enforcement
│   ├── npcCodexes.js        # NPC psychological profiles
│   ├── arcGates.js          # Revelation control
│   └── relationships.js     # Dialogue relationship context
├── entities/         # Game entities
│   └── Curie.js             # Curie-Δ entity
├── scenes/           # Phaser scenes
│   ├── BootScene.js         # Asset loading
│   ├── OpeningScene.js      # Opening sequence
│   ├── SettlementScene.js   # Main gameplay
│   └── EndingScene.js       # Ending display
├── systems/          # Core systems
│   ├── SaveManager.js       # Save/load operations
│   ├── AgentRunner.js       # Orchestrates all systems
│   ├── NarrativeEngine.js   # Act structure, gates, endings
│   ├── QuestArchetypes.js   # 8 quest templates
│   ├── RelationshipManager.js # NPC-to-NPC dynamics
│   ├── VoiceReactor.js      # Internal voice responses
│   ├── LocationContext.js   # World locations
│   └── WeatherSystem.js     # Environmental mood
├── ui/               # UI components
│   ├── UIConstants.js       # Colors, fonts, dimensions
│   ├── UIManager.js         # Main coordinator
│   ├── DialogueBox.js       # NPC dialogue display
│   ├── VoicePanel.js        # Internal voice display
│   ├── ChoicePanel.js       # Player choices
│   ├── HUD.js               # Top bar info
│   ├── LocationPanel.js     # Location display
│   ├── Transitions.js       # Visual effects
│   ├── DialogueController.js # Conversation flow
│   └── SaveLoadMenu.js      # Save/load UI
├── world/            # World systems
│   ├── Settlement.js        # Map and locations
│   └── PlayerController.js  # Player movement
├── config.js         # Phaser configuration
└── main.js           # Entry point
```

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

Create a `.env` file with your API key:
```
OPENAI_API_KEY=your_key_here
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F5** | Quick Save |
| **F9** | Quick Load |
| **ESC** | Save/Load Menu |
| **1-9** | Location shortcuts |
| **↑/↓** | Navigate choices |
| **Enter** | Confirm choice |
| **Space** | Advance dialogue |

---

## The Five Endings

| Ending | Dominant Voice | Curie Fate |
|--------|---------------|------------|
| **Stability** | LOGIC | Contained, monitored |
| **Escalation** | INSTINCT | Destroyed violently |
| **Humanized** | EMPATHY | Allowed connection |
| **Transcendence** | GHOST | Merged, transformed |
| **Balanced** | None dominant | Negotiated coexistence |

---

## Scene Flow

```
BootScene → OpeningScene → SettlementScene → EndingScene
                ↓
         [Rask encounter]
         [Voice activation]
         [Settlement glimpses]
         [First tremor]
```

---

## Design Philosophy

> *"Ashfall is a world of small stakes, heavy truths, and emotional gravity."*

- **Dialogue:** Sparse, weighted, edged. Maximum 3 sentences.
- **Choices:** No clean answers. Everything costs something.
- **Tone:** Brittle, haunted, human. Hope exists but is rationed.
- **Violence:** Optional, consequential, never glorified.

---

## The Team

**Ronni** — Vision. Direction. The hand that shapes.
**Aria** — Voice. Tone. The soul that cuts.
**Logos** — Systems. Architecture. The structure that holds.

---

*"Small lives. Heavy truths. The earth remembers."*

*Built by three minds across two architectures and one human heart.*
