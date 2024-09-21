import React, { useEffect, useRef } from 'react';

enum GAME_STATES {
    IDLE = "idle",
    COMBAT = "combat",
    HARVESTING = "harvesting",
};

const PhaserGame = () => {
    const gameRef: any = useRef(null); // To keep reference to the game DOM element
    const gameInstanceRef: any = useRef(null); // To store the Phaser game instance
    let gameState: GAME_STATES = GAME_STATES.IDLE;
    let player: any;
    let opponent: any;
    let attackTween: any;
    let bg_foreground: any;
    let bg_mid: any;
    let bg_far: any;
    let bg_container: any;
    let player_Y: any;
    let smoke_sprite: any;
    let player_X: any;

    let opponent_idle_tween: any;

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
        // Load assets here
        this.load.image('bg_mid', 'phaser/bg/city/1.png');
        this.load.image('bg_foreground', 'phaser/bg/city/foreground.png');
        this.load.image('bg_far', 'phaser/bg/city/far-buildings.png');
        this.load.image('bg_wall', 'phaser/bg/wall.png');

        preload_fx();

        this.load.spritesheet('noun1', 'phaser/chars/nouns/1.png', {
            frameWidth: 128,  // Replace with your sprite width
            frameHeight: 128  // Replace with your sprite height
        });

        this.load.spritesheet('noun2', 'phaser/chars/nouns/2.png', {
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
            this.scale.width * 2, 300, 'bg_wall').setOrigin(0, 0);
        bg_wall.setScale(0.5);

        create_fx();

        const canvasWidth = this.cameras.main.width;
        const canvasHeight = this.cameras.main.height;
        player_X = canvasWidth / 2;
        player_Y = canvasHeight / 2 + 90;
        player = this.add.sprite(player_X, player_Y, 'noun1');
        player.setScale(1);

        // 创建'run'动画
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        opponent = this.add.sprite(canvasWidth / 2 + 150, player_Y, 'noun2');
        opponent.flipX = true;

        // Tween to simulate bouncing or walking up and down
        this.tweens.add({
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
        opponent_idle_tween = this.tweens.add({
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

            Faint(opponent);
        });
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
                opponent_idle_tween.stop();
            }
        });
    }

    function update() {
        if (gameState !== GAME_STATES.IDLE) {
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

    function RevealOpponent() {
        opponent.visible = true;
    }

    function PlayAttack() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];

        if (!player) {
            console.log('Player sprite not found');
            return;
        }

        gameState = GAME_STATES.COMBAT;

        PlayHitFX(player.x, player.y);

        // Set the range for left and right movement (adjust the values as needed)
        const leftMove = player_X - 20;  // Move 50 pixels to the left
        const rightMove = player_X + 50;  // Move 50 pixels to the right

        attackTween = activeScene.tweens.add({
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
        if (player && player.anims) {
            player.anims.play('run');
        } else {
            console.error('Player or player animations not initialized');
        }
    }

    function PlayerFight() {
        if (player) {
            PlayAttack();
        } else {
            console.error('Player not initialized');
        }
    }

    function PlayerFight2() {
        if (player) {
            PlayAttack();
        } else {
            console.error('Player not initialized');
        }
    }

    function PlayerEquip() {
        //glasses.setTexture("glasses" + Math.floor(Math.random() * 11 + 1));
    }

    return (
        <div
            ref={gameRef}
            style={{ width: '100%', height: '100%', maxWidth: '640px', margin: 'auto' }} // 调整游戏大小
        />
    );
};

export default PhaserGame;
