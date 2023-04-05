export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load player images
        this.load.image('player_idle', 'assets/images/player_idle.png');
        this.load.image('player_walk1', 'assets/images/player_walk1.png');
        this.load.image('player_walk2', 'assets/images/player_walk2.png');

        // Load NPC images
        this.load.image('npc_walk1', 'assets/images/npc_walk1.png');
        this.load.image('npc_walk2', 'assets/images/npc_walk2.png');

        // Load building image
        this.load.image('building', 'assets/images/building.png');
    }

    create() {
        // Create animations
        this.createAnimations();

        // Start GameScene
        this.scene.start('GameScene');
    }

    createAnimations() {
        // Player animations
        if (!this.anims.exists('player_idle')) {
            this.anims.create({
                key: 'player_idle',
                frames: [{ key: 'player_idle' }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('player_walk')) {
            this.anims.create({
                key: 'player_walk',
                frames: [
                    { key: 'player_walk1' },
                    { key: 'player_walk2' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        // NPC animations
        if (!this.anims.exists('npc_walk')) {
            this.anims.create({
                key: 'npc_walk',
                frames: [
                    { key: 'npc_walk1' },
                    { key: 'npc_walk2' }
                ],
                frameRate: 4,
                repeat: -1
            });
        }
    }
}
