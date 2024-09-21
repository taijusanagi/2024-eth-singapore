import React, { useEffect, useRef } from 'react';

enum GAME_STATES {
    IDLE = "idle",
    COMBAT = "combat",
    HARVESTING = "harvesting",
};

const PhaserGame = () => {
    const gameRef: any = useRef(null); // To keep reference to the game DOM element
    const gameInstanceRef: any = useRef(null); // To store the Phaser game instance
    let bg_foreground: any;
    let bg_mid: any;
    let bg_far: any;
    let bg_container: any;
    let player_Y: any;
    let player_X: any;

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

    function preload_fx() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.load.spritesheet('hitEffect', 'phaser/fx/hit.png', {
            frameWidth: 133,  // Width of each frame
            frameHeight: 133  // Height of each frame
        });
    }

    function preload(this: Phaser.Scene) {
        gameInstanceRef.current.gameState = GAME_STATES.IDLE;
        // Load assets here
        this.load.image('bg_mid', 'phaser/bg/city/1.png');
        this.load.image('bg_foreground', 'phaser/bg/city/foreground.png');
        this.load.image('bg_far', 'phaser/bg/city/far-buildings.png');
        this.load.image('bg_wall', 'phaser/bg/wall.png');

        this.load.image('pickaxe', 'phaser/pickaxe/1.png');

        preload_fx();

        this.load.spritesheet('noun1', 'phaser/chars/nouns/1.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });

        this.load.spritesheet('noun2', 'phaser/chars/nouns/2.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });
    };

    function create(this: Phaser.Scene) {
        bg_container = this.add.container();

        bg_far = this.add.tileSprite(0, 0, this.scale.width, this.textures.get('bg_far').getSourceImage().height, 'bg_far').setOrigin(0, 0);
        bg_far.setScale(2);

        bg_mid = this.add.tileSprite(0, this.textures.get('bg_mid').getSourceImage().height - 100, this.scale.width, this.textures.get('bg_mid').getSourceImage().height, 'bg_mid').setOrigin(0, 0);
        bg_foreground = this.add.tileSprite(0, this.textures.get('bg_foreground').getSourceImage().height - 100, this.scale.width, this.textures.get('bg_foreground').getSourceImage().height, 'bg_foreground').setOrigin(0, 0);

        bg_container.add(bg_far);
        bg_container.add(bg_mid);
        bg_container.add(bg_foreground);
        bg_container.setScale(2);

        const bg_wall = this.add.tileSprite(0, 560,
            this.scale.width * 2, 1000, 'bg_wall').setOrigin(0, 0);
        bg_wall.setScale(0.5);

        create_fx();

        const canvasWidth = this.cameras.main.width;
        player_X = canvasWidth / 2;
        player_Y = 480;
        const player = this.add.sprite(player_X, player_Y, 'noun1');
        player.setScale(1);
        gameInstanceRef.current.player = player;

        const opponent = this.add.sprite(canvasWidth / 2 + 150, player_Y, 'noun2');
        opponent.flipX = true;
        gameInstanceRef.current.opponent = opponent;

        const pickaxe = this.add.sprite(player_X + 30, player_Y, 'pickaxe');
        pickaxe.setScale(1.5);
        pickaxe.visible = false;
        pickaxe.setOrigin(0, 1);
        gameInstanceRef.current.pickaxe = pickaxe;

        gameInstanceRef.current.harvest_tween = this.tweens.add({
            targets: pickaxe,  // The sprite to animate
            angle: 360,  // Target y position to "bounce" up to
            duration: 700,  // Time to reach the target (in ms)
            ease: 'Sine.easeIn',  // Easing function for smooth motion
            yoyo: false,  // Return to the original y position
            repeat: -1,  // Repeat forever
            onYoyo: () => {
            },
            onComplete: () => {
                console.log('Spin complete');  // Optional: callback when the tween completes
            }
        });


        // Tween to simulate bouncing or walking up and down
        gameInstanceRef.current.player_idle_tween = this.tweens.add({
            targets: player,  // The sprite to animate
            y: player_Y - 10,  // Target y position to "bounce" up to
            duration: 300,  // Time to reach the target (in ms)
            ease: 'Sine.easeInOut',  // Easing function for smooth motion
            yoyo: true,  // Return to the original y position
            repeat: -1,  // Repeat forever
            onYoyo: () => {
                console.log('Going back down');  // Optional: callback when returning to original position
            },
            onComplete: () => {
                console.log('Bounce complete');  // Optional: callback when the tween completes
            }
        });

        // Tween to simulate bouncing or walking up and down
        gameInstanceRef.current.opponent_idle_tween = this.tweens.add({
            targets: opponent,  // The sprite to animate
            y: player_Y - 10,  // Target y position to "bounce" up to
            duration: 280,  // Time to reach the target (in ms)
            ease: 'Sine.easeInOut',  // Easing function for smooth motion
            yoyo: true,  // Return to the original y position
            repeat: -1,  // Repeat forever
            onYoyo: () => {
                console.log('Going back down');  // Optional: callback when returning to original position
            },
            onComplete: () => {
                console.log('Bounce complete');  // Optional: callback when the tween completes
            }
        });
    }

    function create_fx() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.anims.create({
            key: 'hitFX',  // Name of the animation
            frames: activeScene.anims.generateFrameNumbers('hitEffect', { start: 0, end: 9 }),  // Use frames 0 to 9
            frameRate: 30,  // Speed of the animation
            repeat: 0  // Play once and stop
        });

    }

    function PlayHitFX(x: number, y: number) {
        const activeScene = gameInstanceRef.current.scene.scenes[0];

        // Create a sprite for the hit effect at the given (x, y) coordinates
        const hitFXSprite = activeScene.add.sprite(x + 50, y, 'hitEffect');
        hitFXSprite.setScale(3);

        // Play the 'hitFX' animation on this sprite
        hitFXSprite.play('hitFX');

        // Once the animation is completed, destroy the sprite
        hitFXSprite.on('animationcomplete', () => {
            hitFXSprite.destroy();

            Faint(gameInstanceRef.current.opponent);
        });
    }

    function Harvest() {
        gameInstanceRef.current.gameState = GAME_STATES.HARVESTING;
        gameInstanceRef.current.opponent.visible = false;
        gameInstanceRef.current.player_idle_tween.pause();
        gameInstanceRef.current.pickaxe.visible = true;
    }

    function Faint(target: any) {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.tweens.add({
            targets: target,
            angle: 90, // Rotate the player 90 degrees backward (lying horizontally)
            y: target.y + 50, // Move the player down by 50 pixels
            duration: 1000, // Duration of the tween (1 second)
            ease: 'Power2', // Easing for a smooth effect
            onStart: () => {
                console.log('Player is falling backward');
            },
            onComplete: () => {
                console.log('Player is now lying down');
                gameInstanceRef.current.opponent_idle_tween.pause();
            }
        });
    }

    function update() {
        if (gameInstanceRef.current.gameState !== GAME_STATES.IDLE) {
            return;
        }

        // Scroll the background by updating the tile position
        if (bg_mid) {
            bg_mid.tilePositionX += 0.2;  // Move background to the left for scrolling effect
        }

        if (bg_foreground) {
            bg_foreground.tilePositionX += 0.5;  // Move background to the left for scrolling effect
        }
    }

    function PlayAttack() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];

        const player = gameInstanceRef.current.player;

        gameInstanceRef.current.opponent.visible = true;
        gameInstanceRef.current.gameState = GAME_STATES.COMBAT;
        gameInstanceRef.current.player_idle_tween.pause();
        gameInstanceRef.current.pickaxe.visible = false;

        PlayHitFX(player.x, player.y);

        // Set the range for left and right movement (adjust the values as needed)
        const leftMove = player_X - 20;  // Move 50 pixels to the left
        const rightMove = player_X + 50;  // Move 50 pixels to the right

        activeScene.tweens.add({
            targets: player,  // The sprite to animate
            angle: 15,  // Tilt forward (rotate by 15 degrees)
            x: rightMove,  // Move right first
            duration: 100,  // Time to tilt forward and move right (in ms)
            ease: 'Sine.easeInOut',  // Easing function for smooth motion
            yoyo: true,  // Return to the original angle and position
            repeat: 1,  // Play the forward and backward motion once
            onYoyo: () => {
                console.log('Returning to original angle');
            },
            onComplete: () => {
                console.log('Attack finished');
                // After the first attack (right movement), create another tween to move left
                activeScene.tweens.add({
                    targets: player,
                    x: leftMove,  // Move to the left
                    angle: 0,
                    duration: 100,
                    ease: 'Sine.easeInOut',
                    yoyo: true,  // Return to the original position
                    onStart: () => {
                        console.log('Left move started');
                    },
                    onComplete: () => {
                        console.log('Left move completed');
                    }
                });
            }
        });
    }

    function PlayerWalk() {
        gameInstanceRef.current.gameState = GAME_STATES.IDLE;
        gameInstanceRef.current.player_idle_tween.resume();
        gameInstanceRef.current.pickaxe.visible = false;
    }

    function PlayerFight() {
        PlayAttack();
    }

    return (
        <>
            <button id="equipButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={Harvest}>Harvest</button>
            <button id="runButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerWalk}>Walk</button>
            <button id="fightButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerFight}>Fight</button>
            <div
                ref={gameRef}
                style={{ width: '100%', height: '100vh', maxWidth: '640px', margin: 'auto' }} // Adjust based on your game size
            />
        </>
    );
};

export default PhaserGame;
