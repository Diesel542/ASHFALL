// ASHFALL - UI Scene
// Persistent UI overlay

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Skills display (bottom left)
        this.createSkillsPanel();
        
        // Flags/quest hints (top right)
        this.createHintsPanel();
    }

    createSkillsPanel() {
        const skills = window.ASHFALL.player.skills;
        const voiceColors = {
            logic: '#88ccff',
            instinct: '#ff8844',
            empathy: '#88ff88',
            ghost: '#cc88ff'
        };
        
        const panel = this.add.container(16, this.cameras.main.height - 100);
        
        // Background
        const bg = this.add.rectangle(0, 0, 150, 90, 0x1a1a1a, 0.8)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x333333);
        panel.add(bg);
        
        // Title
        const title = this.add.text(10, 8, 'VOICES', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#666666'
        });
        panel.add(title);
        
        // Skills
        let yOffset = 25;
        Object.entries(skills).forEach(([skill, level]) => {
            const text = this.add.text(10, yOffset, `${skill.toUpperCase()}: ${level}`, {
                fontFamily: 'Courier New',
                fontSize: '12px',
                color: voiceColors[skill]
            });
            panel.add(text);
            yOffset += 15;
        });
    }

    createHintsPanel() {
        const panel = this.add.container(this.cameras.main.width - 16, 70);
        
        // This will update dynamically as the player discovers things
        this.hintsText = this.add.text(0, 0, '', {
            fontFamily: 'Courier New',
            fontSize: '11px',
            color: '#666666',
            align: 'right'
        }).setOrigin(1, 0);
        
        panel.add(this.hintsText);
        
        // Update hints periodically
        this.time.addEvent({
            delay: 1000,
            callback: this.updateHints,
            callbackScope: this,
            loop: true
        });
    }

    updateHints() {
        const flags = window.ASHFALL.flags;
        const hints = [];
        
        if (flags.get('learned_about_shaft')) {
            hints.push('• The old shaft hides something');
        }
        if (flags.get('knows_keeper_has_key')) {
            hints.push('• Mira has the only key');
        }
        if (flags.get('learned_about_singing')) {
            hints.push('• Singing from below...');
        }
        if (flags.get('learned_about_doors')) {
            hints.push('• Doors that weren\'t there before');
        }
        if (flags.get('has_shaft_key')) {
            hints.push('★ You have the key');
        }
        
        this.hintsText.setText(hints.join('\n'));
    }
}
