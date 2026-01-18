# ASHFALL: Relationship Matrix Implementation

## Overview

This document implements the **social physics** of Ashfall: how each NPC perceives every other NPC, what tensions exist between them, and how player actions shift these relationships.

**Core principle:** NPCs don't exist in isolation. When you ask Edda about Rask, her answer carries the weight of everything she believes about him.

---

## 1. Relationship Data Structure

```javascript
// src/data/relationships.js

/**
 * RELATIONSHIP MATRIX
 * 
 * Each NPC has feelings toward every other NPC.
 * These feelings affect:
 * - How they speak about each other
 * - What they reveal or hide
 * - How they react to player actions involving others
 * 
 * Dimensions:
 * - trust: How much they believe/rely on the other
 * - fear: How much they're afraid of/intimidated by them
 * - guilt: How much they feel responsible for the other's pain
 * - respect: How much they admire/value them
 * - protection: How much they want to shield/guard them
 * - resentment: How much they resent/blame them
 * - understanding: How well they actually know the other
 */

export const NPC_RELATIONSHIPS = {

  mara: {
    jonas: {
      trust: 30,
      fear: 0,
      guilt: 20,
      respect: 40,
      protection: 35,
      resentment: 45,
      understanding: 25,
      
      perception: "Weak but necessary. Could help if he'd stop drowning in guilt.",
      tension: "Frustrated by his refusal to practice medicine",
      hidden: "Hides a protective streak she despises in herself",
      
      dialogueColor: {
        neutral: "He could help—if he'd stop drowning in his own guilt.",
        positive: "Jonas stepped up. I... didn't expect that.",
        negative: "He let another one go. I don't have room for passengers."
      },
      
      shiftTriggers: [
        { event: 'jonas_healed_someone', trust: +15, respect: +20, resentment: -10 },
        { event: 'jonas_refused_to_help', resentment: +15, trust: -10 },
        { event: 'player_showed_mara_vulnerability', understanding: +10 }
      ]
    },

    rask: {
      trust: 15,
      fear: 25,
      guilt: 0,
      respect: 40,
      protection: 0,
      resentment: 30,
      understanding: 20,
      
      perception: "A weapon. Useful—until he isn't.",
      tension: "Watches him constantly, sees him as a risk to manage",
      hidden: "Grudgingly respects his discipline",
      
      dialogueColor: {
        neutral: "He's a weapon. Useful—until he isn't.",
        positive: "He protected the children. Maybe I misjudged.",
        negative: "I knew he was trouble. Should have acted sooner."
      },
      
      shiftTriggers: [
        { event: 'rask_protected_child', trust: +20, fear: -15, respect: +15 },
        { event: 'player_defended_rask', resentment: +20, trust: -10 }, // toward player
        { event: 'rask_violence_triggered', fear: +30, trust: -25 }
      ]
    },

    edda: {
      trust: 25,
      fear: 15,
      guilt: 10,
      respect: 35,
      protection: 10,
      resentment: 40,
      understanding: 15,
      
      perception: "Talks in riddles. Sometimes the riddles worry me.",
      tension: "Treats her insights as paranoia, but suspects she knows something real",
      hidden: "Annoyed she can't control the old woman",
      
      dialogueColor: {
        neutral: "Edda talks in riddles. Sometimes the riddles worry me.",
        positive: "She warned me. I should have listened.",
        negative: "Her whispers spread fear. We can't afford that."
      },
      
      shiftTriggers: [
        { event: 'edda_hinted_shaft_to_mara', fear: +15, resentment: +10 },
        { event: 'edda_proven_right', respect: +20, understanding: +15 },
        { event: 'mara_overheard_edda_about_brother', trust: -30, fear: +20 }
      ]
    },

    kale: {
      trust: 20,
      fear: 0,
      guilt: 5,
      respect: 15,
      protection: 20,
      resentment: 25,
      understanding: 10,
      
      perception: "He tries. That's the best I can say.",
      tension: "Sees him as unreliable, thinks he needs discipline",
      hidden: "Uses him for errands because he won't argue",
      
      dialogueColor: {
        neutral: "He tries. That's the best I can say.",
        positive: "Kale handled it. Maybe there's something there.",
        negative: "I can't rely on someone who doesn't know who he is."
      },
      
      shiftTriggers: [
        { event: 'player_mentored_kale', resentment: +10 }, // suspicious of player
        { event: 'kale_showed_competence', respect: +15, trust: +10 },
        { event: 'kale_mirrored_cruelty', resentment: +20, protection: -10 }
      ]
    }
  },

  jonas: {
    mara: {
      trust: 35,
      fear: 45,
      guilt: 40,
      respect: 60,
      protection: 15,
      resentment: 10,
      understanding: 30,
      
      perception: "She carries too much alone. No one should.",
      tension: "Intimidated by her decisiveness, believes she blames him for the 23",
      hidden: "Quietly admires her strength",
      
      dialogueColor: {
        neutral: "She carries too much alone. No one should.",
        positive: "She let someone help her. First time I've seen that.",
        negative: "She blames me. Maybe she should."
      },
      
      shiftTriggers: [
        { event: 'player_showed_mara_vulnerability', fear: -15, understanding: +20 },
        { event: 'mara_blamed_jonas', guilt: +25, fear: +15 },
        { event: 'mara_thanked_jonas', trust: +20, guilt: -10 }
      ]
    },

    rask: {
      trust: 30,
      fear: 50,
      guilt: 0,
      respect: 35,
      protection: 10,
      resentment: 0,
      understanding: 45,
      
      perception: "He's not what people fear. He's worse, and better.",
      tension: "Afraid of his past, but knows he isn't dangerous to children",
      hidden: "Sees the sadness beneath the violence",
      
      dialogueColor: {
        neutral: "He's not what people fear. He's worse, and better.",
        positive: "Rask... he understands pain. Different kind than mine.",
        negative: "I was wrong about him. The violence was always there."
      },
      
      shiftTriggers: [
        { event: 'jonas_healed_someone', trust: +10 }, // from Rask
        { event: 'rask_opened_up_to_jonas', understanding: +25, fear: -20 },
        { event: 'rask_violence_triggered', fear: +40, trust: -20 }
      ]
    },

    edda: {
      trust: 50,
      fear: 35,
      guilt: 30,
      respect: 55,
      protection: 20,
      resentment: 0,
      understanding: 25,
      
      perception: "She knows too much. I know too little.",
      tension: "Respects her intuition but can't handle her knowledge about the 23",
      hidden: "Fears what she might tell him",
      
      dialogueColor: {
        neutral: "She knows too much. I know too little.",
        positive: "Edda... she sees things. Maybe she can help.",
        negative: "I can't be around her. She knows what I did."
      },
      
      shiftTriggers: [
        { event: 'player_comforted_jonas', trust: +15 }, // Edda approves
        { event: 'edda_mentioned_23_to_jonas', fear: +30, guilt: +20 },
        { event: 'jonas_confessed_to_edda', guilt: -20, trust: +25 }
      ]
    },

    kale: {
      trust: 40,
      fear: 0,
      guilt: 15,
      respect: 30,
      protection: 70,
      resentment: 0,
      understanding: 35,
      
      perception: "He tries to be everyone. Someone should tell him he's enough.",
      tension: "Sees a lonely child in need of guidance",
      hidden: "Feels protective, more than he admits",
      
      dialogueColor: {
        neutral: "He tries to be everyone. Someone should tell him he's enough.",
        positive: "Kale smiled today. A real one. It matters.",
        negative: "I scared him. God, I scared him."
      },
      
      shiftTriggers: [
        { event: 'jonas_snapped_at_kale', guilt: +30, protection: +20 },
        { event: 'kale_found_identity', protection: -10, respect: +20 },
        { event: 'kale_mirrored_jonas_kindness', trust: +15, understanding: +15 }
      ]
    }
  },

  rask: {
    mara: {
      trust: 25,
      fear: 35,
      guilt: 0,
      respect: 55,
      protection: 5,
      resentment: 20,
      understanding: 30,
      
      perception: "She thinks I'm trouble. Not wrong.",
      tension: "Respects her strength but fears her suspicion",
      hidden: "Deliberately avoids conflict with her",
      
      dialogueColor: {
        neutral: "She thinks I'm trouble. Not wrong.",
        positive: "She trusts me with the children now. Means something.",
        negative: "She'll come for me eventually. Always do."
      },
      
      shiftTriggers: [
        { event: 'mara_trusted_rask', trust: +25, fear: -20 },
        { event: 'mara_accused_rask', resentment: +20, trust: -15 },
        { event: 'rask_proved_loyal', respect: +15 }
      ]
    },

    jonas: {
      trust: 35,
      fear: 0,
      guilt: 10,
      respect: 40,
      protection: 25,
      resentment: 0,
      understanding: 35,
      
      perception: "Weak, but kind. Wonders why he avoids the clinic.",
      tension: "Doesn't understand Jonas's paralysis",
      hidden: "Respects his gentleness",
      
      dialogueColor: {
        neutral: "Gentle hands. Shame they stay still.",
        positive: "He saved her. Hands remembered what he forgot.",
        negative: "He let them die. Some weaknesses kill."
      },
      
      shiftTriggers: [
        { event: 'jonas_healed_someone', respect: +25, trust: +15 },
        { event: 'jonas_opened_up_to_rask', understanding: +20, protection: +10 },
        { event: 'jonas_refused_to_help_dying', resentment: +15 }
      ]
    },

    edda: {
      trust: 40,
      fear: 20,
      guilt: 0,
      respect: 45,
      protection: 15,
      resentment: 0,
      understanding: 20,
      
      perception: "She knows things. Respects her silence.",
      tension: "Doesn't understand her fear, but senses it",
      hidden: "Knows she's not afraid of him specifically",
      
      dialogueColor: {
        neutral: "She talks to the wind. Sometimes it talks back.",
        positive: "Edda trusts me near the children. Rare.",
        negative: "Something spooked her. Wasn't me."
      },
      
      shiftTriggers: [
        { event: 'rask_overheard_shaft_hints', fear: +25, understanding: +10 },
        { event: 'edda_confided_in_rask', trust: +20, protection: +15 },
        { event: 'rask_guarded_shaft', respect: +10 }
      ]
    },

    kale: {
      trust: 35,
      fear: 0,
      guilt: 25,
      respect: 20,
      protection: 80,
      resentment: 0,
      understanding: 50,
      
      perception: "He'll break if no one teaches him how not to.",
      tension: "Sees himself in Kale's lostness",
      hidden: "Watches him quietly, protectively",
      
      dialogueColor: {
        neutral: "He'll break if no one teaches him how not to.",
        positive: "Kid found his feet. Good.",
        negative: "I taught him wrong. My fault."
      },
      
      shiftTriggers: [
        { event: 'kale_violent_choice', guilt: +40, protection: +20 },
        { event: 'kale_found_identity', guilt: -15, respect: +20 },
        { event: 'kale_copied_rask_stance', protection: +10, understanding: +15 }
      ]
    }
  },

  edda: {
    mara: {
      trust: 30,
      fear: 20,
      guilt: 25,
      respect: 35,
      protection: 15,
      resentment: 35,
      understanding: 55,
      
      perception: "Hard edges crack. She'll learn that.",
      tension: "Sees Mara's leadership as brittle, knows she's hiding something",
      hidden: "Feels pity and frustration in equal measure",
      
      dialogueColor: {
        neutral: "Hard edges crack. She'll learn that.",
        positive: "She bent today. Didn't break. There's hope.",
        negative: "She'll shatter before she softens. Pity."
      },
      
      shiftTriggers: [
        { event: 'mara_confessed_about_brother', understanding: +30, guilt: -15 },
        { event: 'mara_dismissed_edda_warning', resentment: +20, trust: -10 },
        { event: 'mara_asked_edda_for_help', trust: +25, respect: +15 }
      ]
    },

    jonas: {
      trust: 45,
      fear: 10,
      guilt: 20,
      respect: 50,
      protection: 40,
      resentment: 0,
      understanding: 40,
      
      perception: "He's haunted. Wants to help but fears triggering collapse.",
      tension: "Knows he's broken, doesn't want to break him further",
      hidden: "Carries guilt for not helping him sooner",
      
      dialogueColor: {
        neutral: "His hands remember healing. His heart forgot.",
        positive: "Jonas helped someone. The haunting lifted, just a little.",
        negative: "He's sinking. I should have caught him."
      },
      
      shiftTriggers: [
        { event: 'player_comforted_jonas', trust: +10, protection: -5 },
        { event: 'jonas_breakdown', guilt: +25, protection: +30 },
        { event: 'jonas_healed_someone', respect: +20, guilt: -10 }
      ]
    },

    rask: {
      trust: 45,
      fear: 15,
      guilt: 0,
      respect: 50,
      protection: 10,
      resentment: 0,
      understanding: 55,
      
      perception: "Misunderstood. Capable of great violence but not evil.",
      tension: "Sees what others don't—his exhaustion, his vigilance",
      hidden: "Knows he guards the shaft at night during tremors",
      
      dialogueColor: {
        neutral: "They fear the wrong things about him.",
        positive: "He stood watch again. No one asked him to.",
        negative: "Even guardians break. Watch for it."
      },
      
      shiftTriggers: [
        { event: 'rask_guarded_shaft', trust: +15, respect: +10 },
        { event: 'rask_violence_triggered', fear: +20, understanding: -10 },
        { event: 'rask_confided_in_edda', understanding: +25, trust: +20 }
      ]
    },

    kale: {
      trust: 25,
      fear: 40,
      guilt: 35,
      respect: 20,
      protection: 55,
      resentment: 0,
      understanding: 60,
      
      perception: "He hears things he shouldn't. Poor boy.",
      tension: "Sees a flicker of the Thing Below in him",
      hidden: "Both fears and wants to protect him",
      
      dialogueColor: {
        neutral: "He hears things he shouldn't. Poor boy.",
        positive: "He's finding himself. Away from the dip. Good.",
        negative: "He's drawn to it. Like calls to like."
      },
      
      shiftTriggers: [
        { event: 'kale_near_shaft', fear: +30, protection: +20, guilt: +15 },
        { event: 'kale_found_identity', fear: -25, protection: -10, trust: +20 },
        { event: 'kale_channeled_curie', fear: +50, understanding: +30 }
      ]
    }
  },

  kale: {
    mara: {
      trust: 20,
      fear: 65,
      guilt: 30,
      respect: 55,
      protection: 0,
      resentment: 25,
      understanding: 15,
      
      perception: "She looks at me like I'm wrong. She's probably right.",
      tension: "Terrified of her, mimics her tone when nervous",
      hidden: "Desperately wants her approval but never gets it",
      
      dialogueColor: {
        neutral: "She looks at me like I'm wrong. She's probably right.",
        positive: "She said I did okay. Okay is... okay is good.",
        negative: "I failed her again. I always fail her."
      },
      
      shiftTriggers: [
        { event: 'mara_praised_kale', fear: -20, trust: +25, respect: +15 },
        { event: 'mara_dismissed_kale', resentment: +15, fear: +10 },
        { event: 'kale_copied_mara_successfully', trust: +10, understanding: +10 }
      ]
    },

    jonas: {
      trust: 60,
      fear: 15,
      guilt: 10,
      respect: 45,
      protection: 0,
      resentment: 0,
      understanding: 25,
      
      perception: "He's gentle. I feel safe but embarrassed.",
      tension: "Adopts Jonas's tone easily, feels seen by him",
      hidden: "Afraid of losing his kindness",
      
      dialogueColor: {
        neutral: "Jonas talks soft. Like it matters what I say.",
        positive: "He smiled at me. A real one.",
        negative: "Even Jonas got angry. What did I do?"
      },
      
      shiftTriggers: [
        { event: 'jonas_snapped', fear: +40, trust: -25 },
        { event: 'jonas_mentored_kale', trust: +20, understanding: +15 },
        { event: 'kale_mirrored_jonas_kindness', respect: +10 }
      ]
    },

    rask: {
      trust: 50,
      fear: 30,
      guilt: 5,
      respect: 55,
      protection: 0,
      resentment: 0,
      understanding: 20,
      
      perception: "He doesn't talk much. I copy his stance when I'm scared.",
      tension: "Treats him like an older brother",
      hidden: "Copies Rask's stance unconsciously",
      
      dialogueColor: {
        neutral: "He watches. Doesn't judge. I like that.",
        positive: "Rask taught me something today. Without words.",
        negative: "He's angry. I think I made him angry."
      },
      
      shiftTriggers: [
        { event: 'rask_protected_kale', trust: +30, fear: -20 },
        { event: 'rask_taught_kale', understanding: +25, respect: +15 },
        { event: 'kale_disappointed_rask', guilt: +30, fear: +15 }
      ]
    },

    edda: {
      trust: 25,
      fear: 55,
      guilt: 20,
      respect: 40,
      protection: 0,
      resentment: 10,
      understanding: 15,
      
      perception: "She scares me. She looks at me like she sees something else.",
      tension: "Finds her frightening, sometimes mimics her metaphors accidentally",
      hidden: "Senses she knows something about him he doesn't",
      
      dialogueColor: {
        neutral: "Edda talks like the words hurt. Maybe they do.",
        positive: "She touched my shoulder today. Gentle. Strange.",
        negative: "She warned me away from something. I don't know what."
      },
      
      shiftTriggers: [
        { event: 'edda_warned_kale_about_shaft', fear: +20, trust: +10 },
        { event: 'edda_showed_kale_kindness', fear: -15, trust: +20 },
        { event: 'kale_channeled_curie', fear: +40, understanding: +25 }
      ]
    }
  }
};
```

---

## 2. Relationship Manager

System for tracking and shifting relationships.

```javascript
// src/systems/RelationshipManager.js

import { NPC_RELATIONSHIPS } from '../data/relationships.js';

export class RelationshipManager {
  constructor() {
    // Deep clone initial state
    this.relationships = JSON.parse(JSON.stringify(NPC_RELATIONSHIPS));
    this.eventLog = [];
  }

  // Get how NPC A perceives NPC B
  getPerception(npcA, npcB) {
    return this.relationships[npcA]?.[npcB] || null;
  }

  // Get dialogue color when NPC A talks about NPC B
  getDialogueColor(npcA, npcB, sentiment = 'neutral') {
    const rel = this.getPerception(npcA, npcB);
    if (!rel) return null;

    return rel.dialogueColor[sentiment] || rel.dialogueColor.neutral;
  }

  // Apply an event that shifts relationships
  applyEvent(eventName) {
    this.eventLog.push({ event: eventName, timestamp: Date.now() });

    // Find all triggers that match this event
    for (const [npcA, targets] of Object.entries(this.relationships)) {
      for (const [npcB, rel] of Object.entries(targets)) {
        const trigger = rel.shiftTriggers?.find(t => t.event === eventName);
        
        if (trigger) {
          this.applyShift(npcA, npcB, trigger);
        }
      }
    }
  }

  applyShift(npcA, npcB, trigger) {
    const rel = this.relationships[npcA][npcB];
    
    const dimensions = ['trust', 'fear', 'guilt', 'respect', 'protection', 'resentment', 'understanding'];
    
    for (const dim of dimensions) {
      if (trigger[dim]) {
        rel[dim] = Math.max(0, Math.min(100, rel[dim] + trigger[dim]));
      }
    }

    console.log(`Relationship shift: ${npcA} → ${npcB}`, trigger);
  }

  // Get the dominant feeling NPC A has toward NPC B
  getDominantFeeling(npcA, npcB) {
    const rel = this.getPerception(npcA, npcB);
    if (!rel) return 'neutral';

    const feelings = {
      trust: rel.trust,
      fear: rel.fear,
      guilt: rel.guilt,
      respect: rel.respect,
      protection: rel.protection,
      resentment: rel.resentment
    };

    const sorted = Object.entries(feelings).sort(([,a], [,b]) => b - a);
    return sorted[0][0];
  }

  // Get prompt injection for when NPC A might mention NPC B
  getCrossReferencePrompt(speakingNpc, mentionedNpc) {
    const rel = this.getPerception(speakingNpc, mentionedNpc);
    if (!rel) return '';

    const dominant = this.getDominantFeeling(speakingNpc, mentionedNpc);
    const sentiment = this.calculateSentiment(rel);

    return `
RELATIONSHIP WITH ${mentionedNpc.toUpperCase()}:
- Perception: "${rel.perception}"
- Dominant feeling: ${dominant} (${rel[dominant]}/100)
- Hidden: ${rel.hidden}
- Tension: ${rel.tension}

If asked about ${mentionedNpc}, your tone should reflect: ${rel.dialogueColor[sentiment]}
Current sentiment: ${sentiment}`;
  }

  calculateSentiment(rel) {
    const positive = rel.trust + rel.respect + rel.protection;
    const negative = rel.fear + rel.guilt + rel.resentment;

    if (positive > negative + 50) return 'positive';
    if (negative > positive + 50) return 'negative';
    return 'neutral';
  }

  // Get all NPCs that speakingNpc has strong feelings about
  getStrongRelationships(npcId) {
    const npcRels = this.relationships[npcId];
    if (!npcRels) return [];

    const strong = [];

    for (const [targetNpc, rel] of Object.entries(npcRels)) {
      const maxFeeling = Math.max(
        rel.trust, rel.fear, rel.guilt, 
        rel.respect, rel.protection, rel.resentment
      );

      if (maxFeeling > 50) {
        strong.push({
          target: targetNpc,
          dominant: this.getDominantFeeling(npcId, targetNpc),
          intensity: maxFeeling
        });
      }
    }

    return strong.sort((a, b) => b.intensity - a.intensity);
  }

  // Check if two NPCs have tension
  hasTension(npcA, npcB) {
    const relAB = this.getPerception(npcA, npcB);
    const relBA = this.getPerception(npcB, npcA);

    if (!relAB || !relBA) return false;

    // Tension exists if fear or resentment is high on either side
    return (relAB.fear > 40 || relAB.resentment > 40 ||
            relBA.fear > 40 || relBA.resentment > 40);
  }
}
```

---

## 3. Cross-Reference Dialogue System

Handles when player asks one NPC about another.

```javascript
// src/systems/CrossReferenceDialogue.js

import { RelationshipManager } from './RelationshipManager.js';

export class CrossReferenceDialogue {
  constructor(relationshipManager) {
    this.relationships = relationshipManager;
  }

  // Detect if player is asking about another NPC
  detectCrossReference(playerInput) {
    const npcNames = ['mara', 'jonas', 'rask', 'edda', 'kale'];
    const input = playerInput.toLowerCase();

    for (const name of npcNames) {
      if (input.includes(name)) {
        // Check for question patterns
        const questionPatterns = [
          `what do you think of ${name}`,
          `tell me about ${name}`,
          `how do you feel about ${name}`,
          `what's ${name} like`,
          `do you trust ${name}`,
          `what about ${name}`,
          name // Even just mentioning them
        ];

        for (const pattern of questionPatterns) {
          if (input.includes(pattern.replace(name, name))) {
            return name;
          }
        }
      }
    }

    return null;
  }

  // Generate prompt addition when cross-reference detected
  getCrossReferenceContext(speakingNpc, mentionedNpc) {
    const rel = this.relationships.getPerception(speakingNpc, mentionedNpc);
    if (!rel) return '';

    const sentiment = this.relationships.calculateSentiment(rel);
    const dominant = this.relationships.getDominantFeeling(speakingNpc, mentionedNpc);

    return `
═══════════════════════════════════════
CROSS-REFERENCE: Player asked about ${mentionedNpc.toUpperCase()}
═══════════════════════════════════════

YOUR PERCEPTION OF ${mentionedNpc.toUpperCase()}:
"${rel.perception}"

DOMINANT FEELING: ${dominant} (${rel[dominant]}/100)

WHAT YOU HIDE: ${rel.hidden}

TENSION BETWEEN YOU: ${rel.tension}

APPROPRIATE TONE FOR THIS TOPIC:
"${rel.dialogueColor[sentiment]}"

RULES:
- Speak about ${mentionedNpc} through the lens of your ${dominant}
- Your hidden feelings may leak through in subtext
- If trust is low, be guarded about what you reveal
- If fear is high, deflect or change subject
- If guilt is high, become defensive or evasive
- NPCs rarely agree on interpretations of each other
`;
  }

  // Get all the gossip/impressions one NPC has about others
  getAllImpressions(npcId) {
    const impressions = {};
    const npcNames = ['mara', 'jonas', 'rask', 'edda', 'kale'].filter(n => n !== npcId);

    for (const otherNpc of npcNames) {
      const rel = this.relationships.getPerception(npcId, otherNpc);
      if (rel) {
        impressions[otherNpc] = {
          summary: rel.perception,
          dominant: this.relationships.getDominantFeeling(npcId, otherNpc),
          sentiment: this.relationships.calculateSentiment(rel)
        };
      }
    }

    return impressions;
  }

  // Generate the "gossip" prompt - what this NPC thinks of everyone
  getGossipPrompt(npcId) {
    const impressions = this.getAllImpressions(npcId);
    
    let prompt = `
YOUR IMPRESSIONS OF OTHER SETTLEMENT MEMBERS:
(Use these when discussing or thinking about them)

`;

    for (const [name, imp] of Object.entries(impressions)) {
      prompt += `${name.toUpperCase()}: "${imp.summary}" [${imp.dominant}, ${imp.sentiment}]\n`;
    }

    prompt += `
GOSSIP RULES:
- Never fully agree with player's assessment of others
- Filter information through your own biases
- Gossip is subdued but weighted
- You may defend or attack based on your feelings
- What you say reveals as much about you as about them
`;

    return prompt;
  }
}
```

---

## 4. Relationship Shift Events

Complete list of events that trigger relationship changes.

```javascript
// src/data/relationshipEvents.js

export const RELATIONSHIP_EVENTS = {
  
  // Jonas events
  jonas_healed_someone: {
    description: "Jonas overcame his paralysis and saved someone",
    affectedRelationships: [
      { from: 'mara', to: 'jonas', changes: { trust: +15, respect: +20, resentment: -10 } },
      { from: 'rask', to: 'jonas', changes: { respect: +25, trust: +15 } },
      { from: 'edda', to: 'jonas', changes: { respect: +20, guilt: -10 } }
    ]
  },

  jonas_refused_to_help: {
    description: "Jonas refused to help when someone needed medical aid",
    affectedRelationships: [
      { from: 'mara', to: 'jonas', changes: { resentment: +15, trust: -10 } },
      { from: 'rask', to: 'jonas', changes: { resentment: +15 } }
    ]
  },

  jonas_snapped: {
    description: "Jonas lost his temper (rare event)",
    affectedRelationships: [
      { from: 'kale', to: 'jonas', changes: { fear: +40, trust: -25 } },
      { from: 'jonas', to: 'kale', changes: { guilt: +30 } }
    ]
  },

  jonas_breakdown: {
    description: "Jonas had an emotional breakdown",
    affectedRelationships: [
      { from: 'edda', to: 'jonas', changes: { guilt: +25, protection: +30 } }
    ]
  },

  // Rask events
  rask_protected_child: {
    description: "Rask protected a child from danger",
    affectedRelationships: [
      { from: 'mara', to: 'rask', changes: { trust: +20, fear: -15, respect: +15 } },
      { from: 'kale', to: 'rask', changes: { trust: +30, fear: -20 } }
    ]
  },

  rask_violence_triggered: {
    description: "Rask resorted to violence",
    affectedRelationships: [
      { from: 'mara', to: 'rask', changes: { fear: +30, trust: -25 } },
      { from: 'jonas', to: 'rask', changes: { fear: +40, trust: -20 } },
      { from: 'edda', to: 'rask', changes: { fear: +20, understanding: -10 } }
    ]
  },

  rask_guarded_shaft: {
    description: "Rask stood guard at the shaft during tremors",
    affectedRelationships: [
      { from: 'edda', to: 'rask', changes: { trust: +15, respect: +10 } }
    ]
  },

  // Mara events
  mara_confessed_about_brother: {
    description: "Mara revealed the truth about her brother's involvement",
    affectedRelationships: [
      { from: 'edda', to: 'mara', changes: { understanding: +30, guilt: -15 } }
    ]
  },

  mara_control_broken: {
    description: "Mara lost control of the settlement",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { fear: -20, protection: +15 } },
      { from: 'rask', to: 'mara', changes: { respect: -10, protection: +20 } }
    ]
  },

  mara_praised_kale: {
    description: "Mara gave Kale genuine praise",
    affectedRelationships: [
      { from: 'kale', to: 'mara', changes: { fear: -20, trust: +25, respect: +15 } }
    ]
  },

  // Edda events
  edda_hinted_shaft_to_mara: {
    description: "Edda hinted about the shaft to Mara",
    affectedRelationships: [
      { from: 'mara', to: 'edda', changes: { fear: +15, resentment: +10 } }
    ]
  },

  edda_proven_right: {
    description: "One of Edda's warnings proved accurate",
    affectedRelationships: [
      { from: 'mara', to: 'edda', changes: { respect: +20, understanding: +15 } }
    ]
  },

  edda_warned_kale_about_shaft: {
    description: "Edda warned Kale to stay away from the shaft",
    affectedRelationships: [
      { from: 'kale', to: 'edda', changes: { fear: +20, trust: +10 } }
    ]
  },

  // Kale events
  kale_found_identity: {
    description: "Kale began developing his own identity",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: -25, protection: -10, trust: +20 } },
      { from: 'rask', to: 'kale', changes: { guilt: -15, respect: +20 } },
      { from: 'jonas', to: 'kale', changes: { protection: -10, respect: +20 } }
    ]
  },

  kale_mirrored_cruelty: {
    description: "Kale mirrored cruel behavior from the player",
    affectedRelationships: [
      { from: 'mara', to: 'kale', changes: { resentment: +20, protection: -10 } },
      { from: 'rask', to: 'kale', changes: { guilt: +40, protection: +20 } }
    ]
  },

  kale_channeled_curie: {
    description: "Kale unknowingly channeled Curie-Δ",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: +50, understanding: +30 } },
      { from: 'kale', to: 'edda', changes: { fear: +40, understanding: +25 } }
    ]
  },

  kale_near_shaft: {
    description: "Kale was found near the shaft",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: +30, protection: +20, guilt: +15 } }
    ]
  },

  // Player-mediated events
  player_showed_mara_vulnerability: {
    description: "Player helped Mara show vulnerability",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { fear: -15, understanding: +20 } }
    ]
  },

  player_defended_rask: {
    description: "Player defended Rask to Mara",
    affectedRelationships: [
      { from: 'mara', to: 'player', changes: { trust: -10, resentment: +20 } }
    ]
  },

  player_comforted_jonas: {
    description: "Player comforted Jonas during distress",
    affectedRelationships: [
      { from: 'edda', to: 'jonas', changes: { trust: +15 } } // Edda approves
    ]
  },

  player_mentored_kale: {
    description: "Player took on a mentoring role with Kale",
    affectedRelationships: [
      { from: 'mara', to: 'player', changes: { resentment: +10 } } // suspicious
    ]
  }
};
```

---

## 5. Integration with Agent System

Adding relationship context to NPC prompts.

```javascript
// In AgentBase.js - add these methods

getRelationshipContext() {
  const manager = window.ASHFALL.relationshipManager;
  const crossRef = window.ASHFALL.crossReferenceDialogue;
  
  if (!manager || !crossRef) return '';
  
  // Get this NPC's impressions of others
  return crossRef.getGossipPrompt(this.codex.id);
}

// Modify buildFullPrompt to include relationships
buildFullPrompt(playerInput, flags) {
  // Check if player is asking about another NPC
  const mentionedNpc = this.detectMentionedNpc(playerInput);
  let crossRefContext = '';
  
  if (mentionedNpc && mentionedNpc !== this.codex.id) {
    const crossRef = window.ASHFALL.crossReferenceDialogue;
    crossRefContext = crossRef?.getCrossReferenceContext(this.codex.id, mentionedNpc) || '';
  }

  return `${this.getIdentityPrompt()}

${this.getTonePrimer()}

${this.getLocationContext()}

${this.getRelationshipContext()}

${crossRefContext}

${this.getKnowledgePrompt(flags)}
// ... rest of prompt
`;
}

detectMentionedNpc(playerInput) {
  const npcNames = ['mara', 'jonas', 'rask', 'edda', 'kale'];
  const input = playerInput.toLowerCase();
  
  for (const name of npcNames) {
    if (input.includes(name)) {
      return name;
    }
  }
  return null;
}
```

---

## 6. Sample Cross-Reference Dialogues

What happens when you ask one NPC about another:

```javascript
// Examples of relationship-colored dialogue

const SAMPLE_CROSS_REFERENCES = {
  
  // Asking Mara about Jonas
  mara_about_jonas: {
    neutral: "He could help—if he'd stop drowning in his own guilt.",
    after_jonas_healed: "Jonas stepped up today. I... didn't expect that. Maybe there's something left in those hands.",
    after_jonas_refused: "He let another one go. I can't afford passengers, and neither can this settlement."
  },

  // Asking Jonas about Mara
  jonas_about_mara: {
    neutral: "She carries too much alone. No one should carry that much.",
    after_mara_showed_vulnerability: "She let someone see the cracks today. That takes more strength than holding them together.",
    after_mara_blamed_jonas: "She's right to blame me. I had the skills. I just... couldn't."
  },

  // Asking Rask about Kale
  rask_about_kale: {
    neutral: "He'll break if no one teaches him how not to.",
    after_kale_violent: "*Long silence.* My fault. Showed him the wrong way to be strong.",
    after_kale_found_identity: "Kid found his feet. Good. Better than I did at his age."
  },

  // Asking Edda about Kale
  edda_about_kale: {
    neutral: "He hears things he shouldn't. Poor boy. *pause* Stay close to him. Or don't let him stay close to... certain places.",
    after_kale_near_shaft: "*Visible distress.* He went near the dip. The dip knows him now. It... recognizes something in him.",
    after_kale_found_identity: "He's becoming someone. His own someone. The thing below... it's less interested now. *relief*"
  },

  // Asking Kale about Edda
  kale_about_edda: {
    neutral: "Edda talks like the words hurt. Maybe they do. She... looks at me strange. Like she sees something else.",
    after_edda_warned_kale: "She told me to stay away from... somewhere. She looked scared. For me, I think. That's... that's nice?",
    after_channeling_curie: "Sometimes I say things and I don't know where they come from. Edda... Edda knows. She always knows."
  }
};
```

---

## Summary

The Relationship Matrix implementation includes:

| System | Purpose |
|--------|---------|
| **NPC_RELATIONSHIPS** | Complete data for all 20 NPC-to-NPC relationships |
| **RelationshipManager** | Tracks and shifts relationships based on events |
| **CrossReferenceDialogue** | Handles when player asks about other NPCs |
| **RELATIONSHIP_EVENTS** | All events that trigger relationship changes |
| **Agent Integration** | Injects relationship context into every prompt |

**Key relationship dimensions:**
- Trust, Fear, Guilt, Respect, Protection, Resentment, Understanding

**Key insight:** When you ask Edda about Kale, her answer carries the weight of fear (40), guilt (35), and protection (55). She sees "a flicker of the Thing Below in him." That colors everything she says.

---

*"He hears things he shouldn't. Poor boy."*

*— The web that holds Ashfall together, and pulls it apart*
