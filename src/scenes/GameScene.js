import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import Building from '../objects/Building.js';

// Constants
const PLAYER_SIZE = 40; // Player size in pixels
const MIN_BUILDING_SPACING = 2 * PLAYER_SIZE; // Minimum spacing between buildings

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        this.GAME_WIDTH = this.sys.game.config.width;
        this.GAME_HEIGHT = this.sys.game.config.height;
        this.NPC_SPAWN_INTERVAL = 2500; // in milliseconds
        this.PEACE_TIME_DURATION = 3000; // in milliseconds
        this.SPAWN_INCREASE_INTERVAL = 30000; // in milliseconds
        this.lastNPCSpawnTime = 0;
        this.peaceStartTime = 0;
        this.peaceTime = true;
        this.npcsToSpawn = 1;
        this.nextSpawnIncreaseTime = 0;
        this.npcs = [];
    }

    create() {
        // Initialize variables
        this.startTime = this.time.now;
        this.lastNPCSpawnTime = this.startTime;
        this.peaceStartTime = this.startTime;
        this.peaceTime = true;
        this.nextSpawnIncreaseTime = this.startTime + this.SPAWN_INCREASE_INTERVAL;
        this.npcsToSpawn = 1;

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

        // Create buildings
        this.buildings = this.physics.add.staticGroup();
        this.generateBuildings();

        // Create borders
        this.createBorders();

        // Now find a valid player spawn
        const playerSpawnPoint = this.findValidPlayerSpawn();
        this.player = new Player(this, playerSpawnPoint.x, playerSpawnPoint.y);

        // Reset gameOver flag
        this.gameOver = false;

        // Create NPCs
        this.npcsGroup = this.physics.add.group();
        this.generateNPCs();

        // Set up collisions
        this.physics.add.collider(this.player.sprite, this.buildings);
        this.physics.add.collider(this.npcsGroup, this.buildings);
        this.physics.add.collider(this.npcsGroup, this.npcsGroup);

        // Set up overlap between player and NPCs
        this.physics.add.overlap(this.player.sprite, this.npcsGroup, this.onPlayerCaught, null, this);

        // Set up camera
        this.cameras.main.setBounds(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        this.cameras.main.startFollow(this.player.sprite);

        // Set up HUD
        this.createHUD();

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }

        // Update player
        this.player.update(this.cursors);

        // Update NPCs
        if (!this.peaceTime) {
            this.npcs.forEach(npc => npc.update(this.player));
            this.checkAndAddNPCs(time);
        } else {
            this.checkPeaceTime(time);
        }

        // Update HUD
        this.updateTimer(time);
        this.updateNpcCount();
    }

    createHUD() {
        // Timer text
        this.timerText = this.add.text(20, 20, 'Time: 00:00', { fontSize: '32px', fill: '#fff' });
        this.timerText.setScrollFactor(0);

        // NPC count text
        this.npcCountText = this.add.text(20, 60, 'NPCs: 0', { fontSize: '32px', fill: '#fff' });
        this.npcCountText.setScrollFactor(0);
    }

    updateTimer(currentTime) {
        const elapsedSeconds = Math.floor((currentTime - this.startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        this.timerText.setText(`Time: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    }

    updateNpcCount() {
        this.npcCountText.setText(`NPCs: ${this.npcsGroup.getChildren().length}`);
    }

    checkPeaceTime(currentTime) {
        if (currentTime - this.peaceStartTime >= this.PEACE_TIME_DURATION) {
            this.peaceTime = false;
        }
    }

    checkAndAddNPCs(currentTime) {
        if (currentTime - this.lastNPCSpawnTime >= this.NPC_SPAWN_INTERVAL) {
            for (let i = 0; i < this.npcsToSpawn; i++) {
                this.addNewNPC();
            }
            this.lastNPCSpawnTime = currentTime;
        }

        if (currentTime >= this.nextSpawnIncreaseTime) {
            this.npcsToSpawn++;
            this.nextSpawnIncreaseTime += this.SPAWN_INCREASE_INTERVAL;
        }
    }

    onPlayerCaught(playerSprite, npcSprite) {
        this.gameOver = true;
        this.physics.pause();
        this.player.stop();

        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER\nPress SPACE or ENTER to restart',
            { fontSize: '64px', fill: '#ff0000', align: 'center' }
        ).setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.restart();
        });
    }

    generateBuildings() {
        const numBuildings = Math.floor((this.GAME_WIDTH * this.GAME_HEIGHT) / 80000);
        const buildingWidth = 100;
        const buildingHeight = 100;
        const minX = buildingWidth / 2;
        const maxX = this.GAME_WIDTH - buildingWidth / 2;
        const minY = buildingHeight / 2;
        const maxY = this.GAME_HEIGHT - buildingHeight / 2;

        for (let i = 0; i < numBuildings; i++) {
            let x, y, attempts = 0;
            let validPosition = false;
            const maxAttempts = 100;

            while (!validPosition && attempts < maxAttempts) {
                x = Phaser.Math.Between(minX, maxX);
                y = Phaser.Math.Between(minY, maxY);

                const newBuildingRect = new Phaser.Geom.Rectangle(
                    x - buildingWidth / 2 - MIN_BUILDING_SPACING / 2,
                    y - buildingHeight / 2 - MIN_BUILDING_SPACING / 2,
                    buildingWidth + MIN_BUILDING_SPACING,
                    buildingHeight + MIN_BUILDING_SPACING
                );

                const overlap = this.buildings.getChildren().some(existingBuilding => {
                    const existingBounds = existingBuilding.getBounds();
                    const existingBuildingRect = new Phaser.Geom.Rectangle(
                        existingBounds.x - MIN_BUILDING_SPACING / 2,
                        existingBounds.y - MIN_BUILDING_SPACING / 2,
                        existingBounds.width + MIN_BUILDING_SPACING,
                        existingBounds.height + MIN_BUILDING_SPACING
                    );

                    return Phaser.Geom.Intersects.RectangleToRectangle(newBuildingRect, existingBuildingRect);
                });

                if (!overlap) {
                    validPosition = true;
                } else {
                    attempts++;
                }
            }

            if (validPosition) {
                const building = new Building(this, x, y);
                this.buildings.add(building.sprite);
            } else {
                console.warn('Could not place a building after maximum attempts.');
            }
        }
    }


    checkOverlapWithBuildings(x, y, width, height) {
        const tempRect = new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height);
        return this.buildings.getChildren().some(building => {
            return Phaser.Geom.Intersects.RectangleToRectangle(tempRect, building.getBounds());
        });
    }

    createBorders() {
        // Top border
        const topBorder = this.add.rectangle(this.GAME_WIDTH / 2, 5, this.GAME_WIDTH, 10, 0x444444);
        this.physics.add.existing(topBorder, true);
        this.buildings.add(topBorder);

        // Bottom border
        const bottomBorder = this.add.rectangle(this.GAME_WIDTH / 2, this.GAME_HEIGHT - 5, this.GAME_WIDTH, 10, 0x444444);
        this.physics.add.existing(bottomBorder, true);
        this.buildings.add(bottomBorder);

        // Left border
        const leftBorder = this.add.rectangle(5, this.GAME_HEIGHT / 2, 10, this.GAME_HEIGHT, 0x444444);
        this.physics.add.existing(leftBorder, true);
        this.buildings.add(leftBorder);

        // Right border
        const rightBorder = this.add.rectangle(this.GAME_WIDTH - 5, this.GAME_HEIGHT / 2, 10, this.GAME_HEIGHT, 0x444444);
        this.physics.add.existing(rightBorder, true);
        this.buildings.add(rightBorder);
    }

    generateNPCs() {
        const numNPCs = Math.floor((this.GAME_WIDTH * this.GAME_HEIGHT) / 100000);
        for (let i = 0; i < numNPCs; i++) {
            this.addNewNPC(true);
        }
    }

    addNewNPC(initial = false) {
        let x, y, attempts = 0;
        const minDistance = 200;
        const maxDistance = 400;
        const angle = Phaser.Math.Angle.Random();

        do {
            const distance = Phaser.Math.Between(minDistance, maxDistance);
            x = this.player.sprite.x + distance * Math.cos(angle);
            y = this.player.sprite.y + distance * Math.sin(angle);

            x = Phaser.Math.Clamp(x, 0, this.GAME_WIDTH);
            y = Phaser.Math.Clamp(y, 0, this.GAME_HEIGHT);

            attempts++;
        } while (this.checkOverlapWithBuildings(x, y, 40, 40) && attempts < 100);

        if (attempts < 100) {
            const npc = new NPC(this, x, y);
            this.npcsGroup.add(npc.sprite);
            this.npcs.push(npc);
        }
    }

    /**
     * Finds a valid spawn point for the player that is not overlapping buildings.
     * @returns {Phaser.Math.Vector2} A vector containing the x and y coordinates.
     */
    findValidPlayerSpawn() {
        const maxAttempts = 100;
        const playerSize = 40; // Assuming the player size is 40x40 pixels
        let attempts = 0;
        let x, y;
        let validPosition = false;

        while (!validPosition && attempts < maxAttempts) {
            // Generate a random position near the center of the map
            x = Phaser.Math.Between(this.GAME_WIDTH / 4, (this.GAME_WIDTH * 3) / 4);
            y = Phaser.Math.Between(this.GAME_HEIGHT / 4, (this.GAME_HEIGHT * 3) / 4);

            const playerRect = new Phaser.Geom.Rectangle(
                x - playerSize / 2,
                y - playerSize / 2,
                playerSize,
                playerSize
            );

            // Check for overlap with buildings
            const overlap = this.buildings.getChildren().some(building => {
                return Phaser.Geom.Intersects.RectangleToRectangle(playerRect, building.getBounds());
            });

            if (!overlap) {
                validPosition = true;
            } else {
                attempts++;
            }
        }

        if (!validPosition) {
            console.warn('Could not find a valid spawn position for the player after 100 attempts. Using default position.');
            x = this.GAME_WIDTH / 2;
            y = this.GAME_HEIGHT / 2;
        }

        return new Phaser.Math.Vector2(x, y);
    }
}

