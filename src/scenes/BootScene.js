// src/scenes/BootScene.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the loading screen here
    }

    create() {
        // Start PreloadScene
        this.scene.start('PreloadScene');
    }
}

