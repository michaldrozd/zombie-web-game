// src/objects/Player.js
export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create the player sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player_idle');
        this.sprite.setCollideWorldBounds(true);

        // Play idle animation
        this.sprite.anims.play('player_idle');
    }

    update(cursors) {
        const speed = 200;
        const prevVelocity = this.sprite.body.velocity.clone();

        // Stop any previous movement from the last frame
        this.sprite.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            this.sprite.body.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            this.sprite.body.setVelocityX(speed);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            this.sprite.body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            this.sprite.body.setVelocityY(speed);
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.sprite.body.velocity.normalize().scale(speed);

        // Update animation
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            this.sprite.anims.play('player_walk', true);
        } else {
            this.sprite.anims.play('player_idle', true);
        }
    }

    stop() {
        this.sprite.body.setVelocity(0);
        this.sprite.anims.play('player_idle', true);
    }
}

