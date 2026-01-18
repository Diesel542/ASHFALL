# ASHFALL

A dying settlement at the edge of a toxic wasteland.
Five people clinging to what remains of their lives.
One secret beneath the ground that will save them — or end them.

Violence is optional. Choices bleed. The voices in your head don't always agree.

---

## The Game

ASHFALL is an isometric RPG where every conversation matters. NPCs are driven by Claude AI, responding dynamically to your words while staying true to their trauma, secrets, and relationships. Four internal voices—LOGIC, INSTINCT, EMPATHY, and GHOST—comment on everything, pulling you in different directions.

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
- **Arc Gates** (A-E): Progressive revelation of secrets
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

- **Engine:** Phaser.js
- **Language:** JavaScript (ES6+)
- **Build:** Vite
- **AI:** Anthropic Claude API
- **Style:** Isometric pixel art

---

## Project Structure

```
src/
├── agents/           # NPC agent classes (Mara, Jonas, Rask, Edda, Kale)
├── config/           # API config, tone bible, Curie guardrails
├── data/             # Relationships, endings, triggers, scene data
├── entities/         # Curie-Δ entity
├── scenes/           # Phaser scenes (dialogue, opening)
└── systems/          # Core systems
    ├── AgentRunner.js        # Orchestrates all systems
    ├── NarrativeEngine.js    # Act structure, gates, endings
    ├── QuestArchetypes.js    # 8 quest templates
    ├── RelationshipManager.js # NPC-to-NPC dynamics
    ├── VoiceReactor.js       # Internal voice responses
    ├── LocationContext.js    # World locations
    ├── WeatherSystem.js      # Environmental mood
    └── ...
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

*Built by three minds across two architectures and one human heart.*
