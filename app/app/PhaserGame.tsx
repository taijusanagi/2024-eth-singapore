import React, { useEffect, useRef } from 'react';

const PhaserGame = () => {
    const gameRef = useRef(null); // To keep reference to the game DOM element
    const gameInstanceRef: any = useRef(null); // To store the Phaser game instance
    let player: any;
    let glasses: any;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Dynamically import Phaser to avoid "navigator is not defined" errors during SSR
            import('phaser').then(Phaser => {
                const config = {
                    type: Phaser.AUTO,
                    scale: {
                        mode: Phaser.Scale.RESIZE, // Automatically resize the game to fit the window
                        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in both directions
                        width: window.innerWidth,
                        height: '100%',
                    },
                    parent: gameRef.current,
                    scene: {
                        preload: preload,
                        create: create,
                        update: update,
                    },
                };

                // Initialize Phaser game
                gameInstanceRef.current = new Phaser.Game(config);
            });
        }

        // Cleanup on component unmount
        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    function preload(this: Phaser.Scene) {
        // Load assets here
        this.load.image('bg_main', 'phaser/bg1.png');

        this.load.image('glasses1', 'phaser/nouns/1.png');
        this.load.image('glasses2', 'phaser/nouns/2.png');
        this.load.image('glasses3', 'phaser/nouns/3.png');
        this.load.image('glasses4', 'phaser/nouns/4.png');
        this.load.image('glasses5', 'phaser/nouns/5.png');
        this.load.image('glasses6', 'phaser/nouns/6.png');
        this.load.image('glasses7', 'phaser/nouns/7.png');
        this.load.image('glasses8', 'phaser/nouns/8.png');
        this.load.image('glasses9', 'phaser/nouns/9.png');
        this.load.image('glasses10', 'phaser/nouns/10.png');
        this.load.image('glasses11', 'phaser/nouns/11.png');

        this.load.spritesheet('playerWalk', 'phaser/chars/1/Walk.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });
        this.load.spritesheet('playerRun', 'phaser/chars/1/Run.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });
        this.load.spritesheet('playerFight', 'phaser/chars/1/Attack_2.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });
        this.load.spritesheet('playerFight2', 'phaser/chars/1/Attack_3.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });
    };

    function create(this: Phaser.Scene) {
        // Use 'this' which now refers to Phaser.Scene, so TypeScript understands it's not undefined
        this.add.text(100, 100, 'Hello Phaser in React', { color: '#fff' });

        var bg_layer = this.add.container();
        bg_layer.add(this.add.image(0, 0, 'bg_main').setOrigin(0, 0));

        const canvasWidth = this.cameras.main.width;
        const canvasHeight = this.cameras.main.height;
        player = this.add.sprite(canvasWidth / 2, canvasHeight / 4, 'player');
        player.setScale(4);

        // Create the nouns sprite
        glasses = this.add.sprite(canvasWidth / 2 - 8, canvasHeight / 4 + 5, 'glasses2');  // Position hat above player's head (adjust -30 based on your character size)
        glasses.setScale(0.4);

        // Create the walk animation
        // Parameters: {key: 'animationName', frames: 'key', frameRate, repeat}
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('playerWalk', { start: 0, end: 7 }), // Adjust based on your sheet
            frameRate: 10,  // Speed of the animation
            repeat: -1      // Loop indefinitely
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 7 }), // Adjust based on your sheet
            frameRate: 10,  // Speed of the animation
            repeat: -1      // Loop indefinitely
        });

        // Create fight animation
        this.anims.create({
            key: 'fight',
            frames: this.anims.generateFrameNumbers('playerFight', { start: 0, end: 5 }), // Adjust based on fight animation frames
            frameRate: 8,
            repeat: 0
        });
        this.anims.create({
            key: 'fight2',
            frames: this.anims.generateFrameNumbers('playerFight2', { start: 0, end: 11 }), // Adjust based on fight animation frames
            frameRate: 8,
            repeat: 0
        });

        // Play the walk animation
        player.anims.play('walk');

        // Listen for the 'animationcomplete' event to switch back to walk after fight animation ends
        player.on('animationcomplete', (animation: { key: string; }) => {
            if (animation.key === 'fight' || animation.key === 'fight2') {
                player.anims.play('walk'); // Switch back to walk animation
                glasses.setVisible(true);
            }
        });
    }

    const update = () => {
        // Game loop logic
    };

    function PlayerRun() {
        player.anims.play('run');
    }

    function PlayerFight() {
        player.anims.play('fight');
        glasses.setVisible(false);
    }
    function PlayerFight2() {
        player.anims.play('fight2');
        glasses.setVisible(false);
    }

    function PlayerEquip() {
        glasses.setTexture("glasses" + Math.floor(Math.random() * 11 + 1));
    }

    return (
        <>
            <button id="equipButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerEquip}>Equip</button>
            <button id="runButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerRun}>Run</button>
            <button id="fightButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerFight}>Fight</button>
            <button id="fightButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerFight2}>Shoot</button>
            <div
                ref={gameRef}
                style={{ width: '100%', height: '100vh' }} // Adjust based on your game size
            />
        </>
    );
};

export default PhaserGame;
