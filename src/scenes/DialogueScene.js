// ASHFALL - Dialogue Scene
// Conversations with memory, consequences, and voices that speak

export class DialogueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DialogueScene' });
        
        this.npcId = null;
        this.npcName = null;
        this.currentNode = null;
        this.dialogueData = null;
        
        // Voice colors
        this.voiceColors = {
            logic: '#88ccff',
            instinct: '#ff8844',
            empathy: '#88ff88',
            ghost: '#cc88ff'
        };
        
        this.voiceNames = {
            logic: 'LOGIC',
            instinct: 'INSTINCT',
            empathy: 'EMPATHY',
            ghost: 'GHOST'
        };
    }

    init(data) {
        this.npcId = data.npcId;
        this.npcName = data.npcName;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Semi-transparent background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // Dialogue box
        this.dialogueBox = this.add.rectangle(
            width / 2,
            height - 150,
            width - 100,
            250,
            0x1a1a1a,
            0.95
        ).setStrokeStyle(2, 0xc4a77d);
        
        // NPC name
        this.nameText = this.add.text(70, height - 260, this.npcName, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#c4a77d'
        });
        
        // Dialogue text
        this.dialogueText = this.add.text(70, height - 220, '', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: width - 150 }
        });
        
        // Choices container
        this.choicesContainer = this.add.container(70, height - 150);
        
        // Voice interruption area (above dialogue box)
        this.voiceContainer = this.add.container(width / 2, height - 300);
        
        // Load dialogue for this NPC
        this.loadDialogue();
    }

    loadDialogue() {
        // For now, use placeholder dialogue
        // Aria will fill these with real content
        this.dialogueData = this.getPlaceholderDialogue(this.npcId);
        
        // Start at the beginning
        this.showNode('start');
    }

    getPlaceholderDialogue(npcId) {
        // Placeholder dialogues - Aria will replace these
        const dialogues = {
            leader: {
                start: {
                    text: "You shouldn't be here. No one comes to Ashfall unless they're lost or lying.",
                    interruptions: [
                        { skill: 'logic', threshold: 6, text: "She's testing you. That sentence was rehearsed." },
                        { skill: 'instinct', threshold: 4, text: "Her hand hasn't moved from her belt." }
                    ],
                    choices: [
                        { text: "I'm looking for answers.", next: 'answers', weights: { truth: 1 } },
                        { text: "[LIE] Just passing through.", next: 'lie', check: { skill: 'logic', difficulty: 8 }, weights: { deception: 1 } },
                        { text: "[EMPATHY] You look exhausted. What's happening here?", requires: { skill: 'empathy', threshold: 6 }, next: 'empathy_path', weights: { kindness: 1 } },
                        { text: "...", next: 'silence' }
                    ]
                },
                answers: {
                    text: "Answers. Everyone wants answers. But the only thing Ashfall has is questions and dust.",
                    choices: [
                        { text: "Then I'll find my own answers.", next: 'end' },
                        { text: "What questions?", next: 'questions' }
                    ]
                },
                questions: {
                    text: "Questions like: why does the ground shake at night? Why won't the healer look anyone in the eye anymore? Why do I keep finding footprints leading to the old shaft, but never away from it?",
                    interruptions: [
                        { skill: 'ghost', threshold: 5, text: "You've heard something like this before. You can't remember where." }
                    ],
                    choices: [
                        { text: "Tell me about the shaft.", next: 'shaft', flags_set: ['learned_about_shaft'] },
                        { text: "I'll look into it.", next: 'end' }
                    ]
                },
                shaft: {
                    text: "The old mine shaft. Sealed twenty years ago after the collapse. Supposed to be sealed, anyway. But Mira—the keeper—she has the only key. And she's not talking.",
                    flags_set: ['knows_keeper_has_key'],
                    choices: [
                        { text: "I'll speak with her.", next: 'end' },
                        { text: "Why was it sealed?", next: 'sealed_reason' }
                    ]
                },
                sealed_reason: {
                    text: "Twenty-three people went down. None came back up. The official story is a cave-in. But my mother was there. She said they sealed it from the inside.",
                    interruptions: [
                        { skill: 'logic', threshold: 7, text: "That's structurally impossible unless someone survived." },
                        { skill: 'ghost', threshold: 6, text: "Twenty-three. The number means something to you. Why?" }
                    ],
                    flags_set: ['learned_sealed_from_inside'],
                    choices: [
                        { text: "I need to see that shaft.", next: 'end' },
                        { text: "I'm sorry about your mother.", next: 'mother', weights: { kindness: 1 } }
                    ]
                },
                mother: {
                    text: "...She never recovered. Died three winters later, still listening for knocking from below.",
                    relationship: { npc: 'leader', delta: 10 },
                    choices: [
                        { text: "I'll find out what happened. I promise.", next: 'end', weights: { courage: 1 } }
                    ]
                },
                lie: {
                    text: "Passing through. To where, exactly? There's nothing past Ashfall but the Scour.",
                    choices: [
                        { text: "I have my reasons.", next: 'end' },
                        { text: "[TRUTH] Fine. I'm looking for something.", next: 'answers', weights: { truth: 1 } }
                    ]
                },
                empathy_path: {
                    text: "...*She pauses, and for a moment you see past the hardness.* We lost two more last week. Not to the Scour. To something else. Something under us.",
                    relationship: { npc: 'leader', delta: 15 },
                    flags_set: ['leader_opened_up'],
                    choices: [
                        { text: "Tell me everything.", next: 'questions' }
                    ]
                },
                silence: {
                    text: "*She studies you for a long moment.* Smart. Words are dangerous here. Fine. You can stay. But you watch, you listen, and you don't ask questions you're not ready to have answered.",
                    flags_set: ['entered_silently'],
                    choices: [
                        { text: "*Nod and move on*", next: 'end' }
                    ]
                },
                end: {
                    text: "*She turns back to her work, dismissing you.*",
                    choices: [
                        { text: "[Leave]", next: 'close' }
                    ]
                }
            },
            
            healer: {
                start: {
                    text: "*She doesn't look up from her work.* If you're hurt, sit. If you're not, go away.",
                    interruptions: [
                        { skill: 'empathy', threshold: 5, text: "Her hands are shaking. She's afraid of something." }
                    ],
                    choices: [
                        { text: "I'm not hurt. I want to talk.", next: 'talk' },
                        { text: "What are you afraid of?", requires: { skill: 'empathy', threshold: 5 }, next: 'afraid', weights: { kindness: 1 } },
                        { text: "[Leave]", next: 'close' }
                    ]
                },
                talk: {
                    text: "Talk is a luxury. I have seventeen people depending on me and supplies for maybe ten. So unless you're offering help, I don't have time for talk.",
                    choices: [
                        { text: "What kind of help do you need?", next: 'help', weights: { kindness: 1 } },
                        { text: "I heard people have been disappearing.", next: 'disappearing' },
                        { text: "[Leave]", next: 'close' }
                    ]
                },
                afraid: {
                    text: "*Her hands freeze. She finally looks at you.* ...Who sent you? Was it Mira?",
                    interruptions: [
                        { skill: 'logic', threshold: 6, text: "She connected fear to the secret-keeper immediately. They have history." }
                    ],
                    choices: [
                        { text: "No one sent me. I just noticed.", next: 'noticed', weights: { truth: 1 } },
                        { text: "What does Mira have to do with your fear?", next: 'mira_connection' }
                    ]
                },
                noticed: {
                    text: "*She exhales slowly.* You're either very observant or very dangerous. I haven't decided which.",
                    relationship: { npc: 'healer', delta: 5 },
                    choices: [
                        { text: "I'm just someone who pays attention.", next: 'end' },
                        { text: "I could be both.", next: 'both', weights: { courage: 1 } }
                    ]
                },
                both: {
                    text: "*A ghost of a smile.* Finally. Someone honest. Fine. You want to know what I'm afraid of? I'm afraid I know what's in that shaft. And I'm afraid Mira is going to open it.",
                    flags_set: ['healer_fears_shaft', 'healer_trusts_player'],
                    relationship: { npc: 'healer', delta: 20 },
                    choices: [
                        { text: "What's in the shaft?", next: 'shaft_truth' },
                        { text: "Why would she open it?", next: 'why_open' }
                    ]
                },
                shaft_truth: {
                    text: "I don't know exactly. But I was young when they sealed it. I remember the sounds. The... singing. From below. Beautiful and wrong. And I remember the look on my grandmother's face when she heard it.",
                    interruptions: [
                        { skill: 'ghost', threshold: 4, text: "Singing. You've heard singing like that. In dreams you don't remember waking from." }
                    ],
                    flags_set: ['learned_about_singing'],
                    choices: [
                        { text: "I'll be careful.", next: 'end' },
                        { text: "Thank you for telling me.", next: 'end', weights: { kindness: 1 }, relationship: { npc: 'healer', delta: 5 } }
                    ]
                },
                disappearing: {
                    text: "*Her jaw tightens.* People die. That's what happens here. If you're looking for conspiracy, look elsewhere.",
                    choices: [
                        { text: "That's not what I've heard.", next: 'heard' },
                        { text: "[Leave]", next: 'close' }
                    ]
                },
                end: {
                    text: "*She returns to her work, but something in her posture has shifted.*",
                    choices: [
                        { text: "[Leave]", next: 'close' }
                    ]
                }
            },
            
            threat: {
                start: {
                    text: "*He sees you approaching and laughs—a sound like breaking glass.* Another one. Come to see the monster?",
                    interruptions: [
                        { skill: 'instinct', threshold: 3, text: "He's not armed. He's not even tense. He doesn't see you as a threat." },
                        { skill: 'empathy', threshold: 7, text: "That laugh. It's not cruel. It's exhausted." }
                    ],
                    choices: [
                        { text: "They call you a threat. Are you?", next: 'threat_question' },
                        { text: "I'm not here to judge you.", next: 'no_judge', weights: { kindness: 1 } },
                        { text: "What did you do?", next: 'what_did' }
                    ]
                },
                threat_question: {
                    text: "Depends who you ask. To the Leader, I'm the one who saw too much. To the Healer, I'm the one who survived when I shouldn't have. To Mira... I'm the one who remembers.",
                    interruptions: [
                        { skill: 'logic', threshold: 6, text: "Survived. He went into the shaft." }
                    ],
                    flags_set: ['threat_was_survivor'],
                    choices: [
                        { text: "You went into the shaft.", next: 'went_in' },
                        { text: "What do you remember?", next: 'remember' }
                    ]
                },
                went_in: {
                    text: "I was twelve. My father was one of the twenty-three. I snuck in behind the rescue party. They pulled me out three days later. I was the only one they found.",
                    interruptions: [
                        { skill: 'ghost', threshold: 5, text: "Three days. You know what three days in the dark does to a child." }
                    ],
                    flags_set: ['threat_survived_shaft'],
                    choices: [
                        { text: "What did you see down there?", next: 'saw' },
                        { text: "I'm sorry.", next: 'sorry', weights: { kindness: 1 } }
                    ]
                },
                saw: {
                    text: "*His eyes go distant.* Light. Where there shouldn't be any light. And doors. Doors that weren't there before the collapse. Doors that were already open.",
                    flags_set: ['learned_about_doors'],
                    choices: [
                        { text: "I need to see for myself.", next: 'end' },
                        { text: "Thank you for telling me.", next: 'end', relationship: { npc: 'threat', delta: 10 } }
                    ]
                },
                sorry: {
                    text: "*He looks at you—really looks.* ...Nobody says that. Not anymore. They just cross to the other side when they see me coming.",
                    relationship: { npc: 'threat', delta: 20 },
                    choices: [
                        { text: "What happened wasn't your fault.", next: 'not_fault', weights: { kindness: 1 } }
                    ]
                },
                not_fault: {
                    text: "*Something breaks behind his eyes.* No. It wasn't. But something came back with me. And I think—I think it's been waiting. For someone to open those doors again.",
                    interruptions: [
                        { skill: 'instinct', threshold: 5, text: "He's not talking metaphorically. He means something literal." }
                    ],
                    flags_set: ['threat_warning', 'something_came_back'],
                    choices: [
                        { text: "I'll stop it.", next: 'end', weights: { courage: 1 } },
                        { text: "Come with me when I go down.", next: 'come_with' }
                    ]
                },
                come_with: {
                    text: "*He shudders.* I... I can't. But I'll tell you this: don't trust the light. In the dark, you can at least trust your hands.",
                    flags_set: ['threat_advice'],
                    relationship: { npc: 'threat', delta: 10 },
                    choices: [
                        { text: "Thank you.", next: 'end' }
                    ]
                },
                end: {
                    text: "*He turns away, watching the horizon.*",
                    choices: [
                        { text: "[Leave]", next: 'close' }
                    ]
                }
            },
            
            keeper: {
                start: {
                    text: "*She smiles warmly, but the smile doesn't reach her eyes.* A new face. How lovely. What brings you to our little corner of nowhere?",
                    interruptions: [
                        { skill: 'logic', threshold: 5, text: "That warmth is performed. She's assessing you." },
                        { skill: 'instinct', threshold: 6, text: "Danger. This one is dangerous." }
                    ],
                    choices: [
                        { text: "I'm looking for answers about the shaft.", next: 'shaft_direct', requires: { flag: 'learned_about_shaft' } },
                        { text: "Just exploring.", next: 'exploring', weights: { deception: 1 } },
                        { text: "People speak highly of you.", next: 'flattery' }
                    ]
                },
                shaft_direct: {
                    text: "*The warmth vanishes instantly.* Who told you about the shaft?",
                    choices: [
                        { text: "Does it matter?", next: 'doesnt_matter' },
                        { text: "The Leader mentioned you have the key.", next: 'key_mentioned', requires: { flag: 'knows_keeper_has_key' } }
                    ]
                },
                key_mentioned: {
                    text: "*Her hand moves to something under her shirt—a key on a chain.* The Leader talks too much. Always has. That key stays with me. It's not about keeping people out. It's about keeping something in.",
                    interruptions: [
                        { skill: 'logic', threshold: 7, text: "She's not lying. Whatever is down there, she genuinely believes it needs to stay there." }
                    ],
                    choices: [
                        { text: "What's down there?", next: 'what_below' },
                        { text: "Then why do people keep disappearing?", next: 'disappearing' }
                    ]
                },
                what_below: {
                    text: "Something old. Something that was here before we were. Something that's been sleeping for a very long time. And it's starting to wake up.",
                    flags_set: ['learned_something_old'],
                    interruptions: [
                        { skill: 'ghost', threshold: 6, text: "You've dreamed of this. Something vast. Something patient. Something that knows your name." }
                    ],
                    choices: [
                        { text: "Then help me stop it.", next: 'help_stop' },
                        { text: "You're lying.", next: 'lying' }
                    ]
                },
                help_stop: {
                    text: "*She studies you for a long moment.* ...Maybe. Maybe you're the one. The dreamers said someone would come. Someone who could hear the singing and not go mad.",
                    choices: [
                        { text: "Give me the key.", next: 'give_key' },
                        { text: "What dreamers?", next: 'dreamers' }
                    ]
                },
                give_key: {
                    text: "*She pulls the chain over her head, holds the key out.* If you go down there... don't close your eyes. Whatever you see, don't close your eyes. The darkness behind your eyelids is where it lives.",
                    flags_set: ['has_shaft_key', 'keeper_warning'],
                    choices: [
                        { text: "*Take the key*", next: 'end' }
                    ]
                },
                end: {
                    text: "*She watches you go with something like hope—or fear.*",
                    choices: [
                        { text: "[Leave]", next: 'close' }
                    ]
                }
            },
            
            mirror: {
                start: {
                    text: "*They're sitting alone, drawing in the dust.* You're the new one. The one asking questions. The one who doesn't run from shadows.",
                    interruptions: [
                        { skill: 'empathy', threshold: 4, text: "They're young. Too young to sound this tired." },
                        { skill: 'logic', threshold: 5, text: "They knew you were coming. They were waiting." }
                    ],
                    choices: [
                        { text: "You were expecting me?", next: 'expecting' },
                        { text: "What are you drawing?", next: 'drawing' },
                        { text: "Who are you?", next: 'who' }
                    ]
                },
                drawing: {
                    text: "*They hold up the pattern in the dust. It's a spiral, descending.* I draw what I see when I sleep. The same thing, every night. Getting closer.",
                    interruptions: [
                        { skill: 'ghost', threshold: 5, text: "You know this spiral. You've traced it in your sleep." }
                    ],
                    flags_set: ['saw_spiral'],
                    choices: [
                        { text: "What's at the center?", next: 'center' },
                        { text: "Have you told anyone?", next: 'told_anyone' }
                    ]
                },
                center: {
                    text: "A door. The same door everyone sees, eventually. The door that's always been there, under everything. Under Ashfall. Under everywhere.",
                    flags_set: ['learned_about_door'],
                    choices: [
                        { text: "I need to find that door.", next: 'find_door' },
                        { text: "Why are you telling me this?", next: 'why_telling' }
                    ]
                },
                why_telling: {
                    text: "*They look at you with eyes too old for their face.* Because you're the first person who might be able to close it.",
                    choices: [
                        { text: "How do I close it?", next: 'how_close' },
                        { text: "Why me?", next: 'why_me' }
                    ]
                },
                why_me: {
                    text: "Because you're not from here. You don't have roots going down into the dark. You can still choose which direction to walk.",
                    interruptions: [
                        { skill: 'logic', threshold: 6, text: "They're saying the others are compromised somehow. Connected to whatever is below." }
                    ],
                    choices: [
                        { text: "Then I'll close it.", next: 'end', weights: { courage: 1 } },
                        { text: "What happens if I fail?", next: 'if_fail' }
                    ]
                },
                if_fail: {
                    text: "Then the singing gets louder. And one by one, we all walk down the spiral. And the door opens the other way.",
                    flags_set: ['mirror_warning'],
                    choices: [
                        { text: "I won't fail.", next: 'end', weights: { courage: 1 } },
                        { text: "*Say nothing*", next: 'end' }
                    ]
                },
                end: {
                    text: "*They go back to drawing spirals in the dust.*",
                    choices: [
                        { text: "[Leave]", next: 'close' }
                    ]
                }
            }
        };
        
        return dialogues[npcId] || dialogues.leader;
    }

    showNode(nodeId) {
        if (nodeId === 'close') {
            this.closeDialogue();
            return;
        }
        
        const node = this.dialogueData[nodeId];
        if (!node) {
            console.error(`Dialogue node not found: ${nodeId}`);
            this.closeDialogue();
            return;
        }
        
        this.currentNode = node;
        
        // Process flags
        if (node.flags_set) {
            node.flags_set.forEach(flag => window.ASHFALL.setFlag(flag));
        }
        
        // Process relationship changes
        if (node.relationship) {
            window.ASHFALL.adjustRelationship(node.relationship.npc, node.relationship.delta);
        }
        
        // Process memories
        if (node.memory) {
            window.ASHFALL.remember(node.memory.npc, node.memory.content);
        }
        
        // Clear previous content
        this.voiceContainer.removeAll(true);
        this.choicesContainer.removeAll(true);
        
        // Show voice interruptions first
        this.showInterruptions(node.interruptions || []);
        
        // Show dialogue text
        this.dialogueText.setText(node.text);
        
        // Show choices after a delay
        this.time.delayedCall(500, () => {
            this.showChoices(node.choices || []);
        });
    }

    showInterruptions(interruptions) {
        const skills = window.ASHFALL.player.skills;
        let yOffset = 0;
        
        interruptions.forEach(interrupt => {
            if (skills[interrupt.skill] >= interrupt.threshold) {
                const voiceName = this.voiceNames[interrupt.skill];
                const voiceColor = this.voiceColors[interrupt.skill];
                
                const text = this.add.text(0, yOffset, `[${voiceName}] ${interrupt.text}`, {
                    fontFamily: 'Courier New',
                    fontSize: '14px',
                    color: voiceColor,
                    fontStyle: 'italic',
                    wordWrap: { width: this.cameras.main.width - 200 }
                }).setOrigin(0.5, 0);
                
                this.voiceContainer.add(text);
                yOffset += text.height + 10;
            }
        });
    }

    showChoices(choices) {
        const skills = window.ASHFALL.player.skills;
        const flags = window.ASHFALL.flags;
        let yOffset = 0;
        
        choices.forEach((choice, index) => {
            // Check requirements
            if (choice.requires) {
                if (choice.requires.skill && skills[choice.requires.skill] < choice.requires.threshold) {
                    return; // Skip this choice
                }
                if (choice.requires.flag && !flags.get(choice.requires.flag)) {
                    return; // Skip this choice
                }
            }
            
            const choiceText = this.add.text(0, yOffset, `> ${choice.text}`, {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#888888'
            }).setInteractive();
            
            choiceText.on('pointerover', () => {
                choiceText.setColor('#c4a77d');
            });
            
            choiceText.on('pointerout', () => {
                choiceText.setColor('#888888');
            });
            
            choiceText.on('pointerdown', () => {
                this.selectChoice(choice);
            });
            
            this.choicesContainer.add(choiceText);
            yOffset += 25;
        });
    }

    selectChoice(choice) {
        // Record the action
        window.ASHFALL.recordAction({
            type: 'dialogue_choice',
            npc: this.npcId,
            choice: choice.text,
            weights: choice.weights || {}
        });
        
        // Process relationship changes
        if (choice.relationship) {
            window.ASHFALL.adjustRelationship(choice.relationship.npc, choice.relationship.delta);
        }
        
        // Handle skill checks
        if (choice.check) {
            const skill = choice.check.skill;
            const difficulty = choice.check.difficulty;
            const skillLevel = window.ASHFALL.player.skills[skill];
            const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
            const total = roll + skillLevel;
            
            if (total >= difficulty) {
                this.showNode(choice.next);
            } else {
                this.showNode(choice.next + '_failure') || this.showNode(choice.next);
            }
            return;
        }
        
        // Go to next node
        this.showNode(choice.next);
    }

    closeDialogue() {
        // Resume game scene
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
