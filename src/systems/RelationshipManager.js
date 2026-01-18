// src/systems/RelationshipManager.js
// Tracks and shifts NPC-to-NPC relationships based on events

import { NPC_RELATIONSHIPS } from '../data/relationships.js';
import { RELATIONSHIP_EVENTS } from '../data/relationshipEvents.js';

export class RelationshipManager {
  constructor() {
    // Deep clone initial state
    this.relationships = JSON.parse(JSON.stringify(NPC_RELATIONSHIPS));
    this.eventLog = [];
  }

  // Get how NPC A perceives NPC B
  getPerception(npcA, npcB) {
    // Handle role-based IDs
    const sourceNpc = this.normalizeNpcId(npcA);
    const targetNpc = this.normalizeNpcId(npcB);

    return this.relationships[sourceNpc]?.[targetNpc] || null;
  }

  // Normalize NPC ID (handle role vs name)
  normalizeNpcId(npcId) {
    const roleMap = {
      leader: 'mara',
      healer: 'jonas',
      threat: 'rask',
      keeper: 'edda',
      mirror: 'kale'
    };

    return roleMap[npcId] || npcId;
  }

  // Get dialogue color when NPC A talks about NPC B
  getDialogueColor(npcA, npcB, sentiment = 'neutral') {
    const rel = this.getPerception(npcA, npcB);
    if (!rel) return null;

    return rel.dialogueColor[sentiment] || rel.dialogueColor.neutral;
  }

  // Apply an event that shifts relationships
  applyEvent(eventName) {
    const eventData = RELATIONSHIP_EVENTS[eventName];
    if (!eventData) {
      console.warn(`Unknown relationship event: ${eventName}`);
      return;
    }

    this.eventLog.push({ event: eventName, timestamp: Date.now() });

    // Apply all relationship changes for this event
    for (const change of eventData.affectedRelationships) {
      this.applyShift(change.from, change.to, change.changes);
    }

    // Also check embedded shift triggers in relationships
    for (const [npcA, targets] of Object.entries(this.relationships)) {
      for (const [npcB, rel] of Object.entries(targets)) {
        const trigger = rel.shiftTriggers?.find(t => t.event === eventName);

        if (trigger) {
          this.applyShiftFromTrigger(npcA, npcB, trigger);
        }
      }
    }

    console.log(`Applied relationship event: ${eventName}`);
  }

  applyShift(npcA, npcB, changes) {
    const sourceNpc = this.normalizeNpcId(npcA);
    const targetNpc = this.normalizeNpcId(npcB);

    const rel = this.relationships[sourceNpc]?.[targetNpc];
    if (!rel) return;

    const dimensions = ['trust', 'fear', 'guilt', 'respect', 'protection', 'resentment', 'understanding'];

    for (const dim of dimensions) {
      if (changes[dim]) {
        rel[dim] = Math.max(0, Math.min(100, rel[dim] + changes[dim]));
      }
    }

    console.log(`Relationship shift: ${sourceNpc} → ${targetNpc}`, changes);
  }

  applyShiftFromTrigger(npcA, npcB, trigger) {
    const changes = {};
    const dimensions = ['trust', 'fear', 'guilt', 'respect', 'protection', 'resentment', 'understanding'];

    for (const dim of dimensions) {
      if (trigger[dim]) {
        changes[dim] = trigger[dim];
      }
    }

    if (Object.keys(changes).length > 0) {
      this.applyShift(npcA, npcB, changes);
    }
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

    const sorted = Object.entries(feelings).sort(([, a], [, b]) => b - a);
    return sorted[0][0];
  }

  // Get prompt injection for when NPC A might mention NPC B
  getCrossReferencePrompt(speakingNpc, mentionedNpc) {
    const rel = this.getPerception(speakingNpc, mentionedNpc);
    if (!rel) return '';

    const dominant = this.getDominantFeeling(speakingNpc, mentionedNpc);
    const sentiment = this.calculateSentiment(rel);

    return `
RELATIONSHIP WITH ${this.normalizeNpcId(mentionedNpc).toUpperCase()}:
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
    const sourceNpc = this.normalizeNpcId(npcId);
    const npcRels = this.relationships[sourceNpc];
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
          dominant: this.getDominantFeeling(sourceNpc, targetNpc),
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

  // Get relationship summary for an NPC
  getRelationshipSummary(npcId) {
    const sourceNpc = this.normalizeNpcId(npcId);
    const npcRels = this.relationships[sourceNpc];
    if (!npcRels) return {};

    const summary = {};

    for (const [targetNpc, rel] of Object.entries(npcRels)) {
      summary[targetNpc] = {
        dominant: this.getDominantFeeling(sourceNpc, targetNpc),
        sentiment: this.calculateSentiment(rel),
        perception: rel.perception,
        trust: rel.trust,
        fear: rel.fear,
        respect: rel.respect
      };
    }

    return summary;
  }

  // Get event log
  getEventLog() {
    return this.eventLog;
  }

  // Check if an event has occurred
  hasEventOccurred(eventName) {
    return this.eventLog.some(e => e.event === eventName);
  }

  // Reset to initial state
  reset() {
    this.relationships = JSON.parse(JSON.stringify(NPC_RELATIONSHIPS));
    this.eventLog = [];
  }

  // Serialize for save
  serialize() {
    return {
      relationships: this.relationships,
      eventLog: this.eventLog
    };
  }

  // Deserialize from save
  deserialize(data) {
    if (data.relationships) {
      this.relationships = data.relationships;
    }
    if (data.eventLog) {
      this.eventLog = data.eventLog;
    }
  }
}
