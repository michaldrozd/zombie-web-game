// src/objects/Building.js
export default class Building {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create the building sprite
        this.sprite = scene.physics.add.staticSprite(x, y, 'building');
        this.sprite.setOrigin(0.5, 0.5);
    }
}

