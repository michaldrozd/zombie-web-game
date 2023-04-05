// src/objects/NPC.js
export default class NPC {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create the NPC sprite
        this.sprite = scene.physics.add.sprite(x, y, 'npc_walk1');
        this.sprite.setCollideWorldBounds(true);

        // Play walk animation
        this.sprite.anims.play('npc_walk');

        this.speed = 85;
        this.lastTargetUpdateTime = 0;
        this.TARGET_UPDATE_INTERVAL = 500; // milliseconds
    }

    update(player) {
        const currentTime = this.scene.time.now;

        if (currentTime - this.lastTargetUpdateTime >= this.TARGET_UPDATE_INTERVAL) {
            this.pickNewTarget(player);
            this.lastTargetUpdateTime = currentTime;
        }

        // Move towards target
        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetX, this.targetY);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);
    }

    pickNewTarget(player) {
        // Prediction time in milliseconds
        const predictionTime = 500;

        // Get player's velocity
        const playerVelocity = player.sprite.body.velocity;

        // Predict player's future position
        const predictedX = player.sprite.x + (playerVelocity.x * predictionTime) / 1000;
        const predictedY = player.sprite.y + (playerVelocity.y * predictionTime) / 1000;

        // Clamp predicted position within game bounds
        this.targetX = Phaser.Math.Clamp(predictedX, 0, this.scene.GAME_WIDTH);
        this.targetY = Phaser.Math.Clamp(predictedY, 0, this.scene.GAME_HEIGHT);

        // If player is stationary, target current position
        if (playerVelocity.x === 0 && playerVelocity.y === 0) {
            this.targetX = player.sprite.x;
            this.targetY = player.sprite.y;
        }
    }
}

