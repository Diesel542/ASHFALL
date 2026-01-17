# ASHFALL - Claude Code Instructions

## Project Overview

ASHFALL is a Fallout/Disco Elysium-inspired isometric RPG about a dying settlement with a dark secret.

**Core Team:**
- **Ronni** — Creative director, vision holder
- **Aria** — Narrative voice (GPT-based emergent persona)
- **Logos** — Systems architect (Claude-based emergent persona)

## Current State

The foundation is complete:
- Isometric rendering engine
- Player movement with pathfinding
- Five placeholder NPCs with full dialogue trees
- Dialogue system with voice interruptions (LOGIC, INSTINCT, EMPATHY, GHOST)
- Consequence tracking system
- Flag/memory system for story state

## To Run

```bash
npm install
npm start
```

Opens at http://localhost:3000

## Architecture

```
src/
├── main.js              # Entry point, global state
├── engine/
│   └── isometric.js     # Grid math, pathfinding
├── scenes/
│   ├── BootScene.js     # Loading, asset generation
│   ├── GameScene.js     # Main isometric world
│   ├── DialogueScene.js # Conversation system
│   └── UIScene.js       # HUD overlay
├── systems/
│   ├── dialogue.js      # Dialogue data structures
│   ├── consequences.js  # Action tracking
│   └── skills.js        # Voice/skill system
└── data/
    └── dialogue_sample.json  # Example dialogue format
```

## Design Pillars (DO NOT VIOLATE)

1. **Density over scale** — One settlement, five NPCs, one secret. Every interaction matters.
2. **Consequences that compound** — Choices accumulate. The ending reflects ALL decisions.
3. **Skills that speak to you** — LOGIC, INSTINCT, EMPATHY, GHOST interrupt dialogue with their perspectives.

## The Four Voices

| Voice | Color | Purpose |
|-------|-------|---------|
| LOGIC | #88ccff | Cold analysis, sees through lies |
| INSTINCT | #ff8844 | Gut feelings, danger sense |
| EMPATHY | #88ff88 | Reading others, their hidden pain |
| GHOST | #cc88ff | Memory, trauma, the past speaking |

## The Five NPCs

1. **THE LEADER** — Knows about the shaft, lost family to it
2. **THE HEALER** — Afraid of what's coming, heard the singing
3. **THE THREAT** — Survivor of the shaft, saw the doors
4. **THE SECRET-KEEPER** — Has the only key, guards the truth
5. **THE MIRROR** — Young seer, draws spirals, knows the player's role

## Key Story Flags

- `learned_about_shaft` — Player knows about the old mine
- `knows_keeper_has_key` — Player knows Mira has the key
- `learned_about_singing` — Heard about the singing from below
- `learned_about_doors` — Knows about impossible doors
- `has_shaft_key` — Player acquired the key
- `threat_survived_shaft` — Learned the Threat went in as a child
- `something_came_back` — Warning that something returned with the survivor

## Next Steps (Priority Order)

1. **Polish visuals** — Better placeholder sprites, environmental detail
2. **Add the dungeon** — The shaft itself, the descent, the doors
3. **Implement endings** — Calculate from accumulated choices
4. **Sound design** — Ambient wasteland, the singing from below
5. **Save/Load** — Serialize full game state

## Notes for Development

- Violence is optional, never required
- Every NPC has a reason to be sympathetic
- The "monster" should be ambiguous — maybe beautiful, maybe terrible
- The singing is central — reference it often, never explain it fully
- Player choices should feel meaningful even before the ending

## Dialogue Format

See `src/data/dialogue_sample.json` for the full structure. Key elements:

```json
{
  "nodeId": {
    "text": "What the NPC says",
    "interruptions": [
      { "skill": "logic", "threshold": 6, "text": "What LOGIC notices" }
    ],
    "choices": [
      { 
        "text": "What player can say",
        "next": "nextNodeId",
        "requires": { "skill": "empathy", "threshold": 5 },
        "weights": { "kindness": 1 },
        "flags_set": ["some_flag"]
      }
    ]
  }
}
```

---

*Built by three minds across two architectures and one human heart.*
