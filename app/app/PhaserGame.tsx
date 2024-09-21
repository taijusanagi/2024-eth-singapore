import { GameAbi } from "@/contracts/abi/Game";
import { addresses } from "@/contracts/addresses";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { useDynamicContext } from "../lib/dynamic";

import SpawnModal from "../app/components/SpawnModal";
import { RPC } from "@/contracts/rpc";

enum GAME_STATES {
    NONE = "none",
    IDLE = "idle",
    COMBAT = "combat",
    HARVESTING = "harvesting",
}

const PhaserGame = forwardRef((props, ref) => {
    const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);

    const gameRef: any = useRef(null); // To keep reference to the game DOM element
    const gameInstanceRef: any = useRef(null); // To store the Phaser game instance
    let bg_foreground: any;
    let bg_mid: any;
    let bg_far: any;
    let bg_container: any;

    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Dynamically import Phaser to avoid "navigator is not defined" errors during SSR
            import("phaser").then((Phaser) => {
                const config = {
                    type: Phaser.AUTO,
                    scale: {
                        mode: Phaser.Scale.RESIZE, // Automatically resize the game to fit the window
                        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in both directions
                        width: window.innerWidth,
                        height: "100%",
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

    useImperativeHandle(ref, () => ({
        PlayerFight: () => {
            PlayAttack();
        },

        Harvest: () => {
            Harvest();  // Expose the Harvest function
        }
    }));

    useEffect(() => {
        const process = async () => {
            if (!primaryWallet) {
                throw new Error("Wallet not connected");
            }
            const address = primaryWallet.address as Address;

            const publicClient = createPublicClient({
                transport: http(RPC),
            });

            const worldIndex = await readContract(publicClient, {
                address: addresses.GAME,
                abi: GameAbi,
                functionName: "worldIndex",
            });

            const checkPlayerIndex = async () => {
                const playerIndex = await readContract(publicClient, {
                    address: addresses.GAME,
                    abi: GameAbi,
                    functionName: "senderToPlayerIndexes",
                    args: [worldIndex, address],
                });

                // Check if playerIndex is greater than 0
                if (playerIndex > BigInt(0)) {
                    if (!gameInstanceRef.current || !gameInstanceRef.current.player) {
                        setTimeout(checkPlayerIndex, 3000); // Retry every 3 seconds
                    } else {
                        gameInstanceRef.current.gameState = GAME_STATES.IDLE;
                        gameInstanceRef.current.player.visible = true;
                    }
                    setIsSpawnModalOpen(false);
                } else {
                    setIsSpawnModalOpen(true);
                    // Retry after a delay if playerIndex is still 0
                    setTimeout(checkPlayerIndex, 3000); // Retry every 3 seconds
                }
            };

            // Start checking playerIndex
            checkPlayerIndex();
        };

        process();
    }, []);

    function preload_fx() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.load.spritesheet("hitEffect", "phaser/fx/hit.png", {
            frameWidth: 133, // Width of each frame
            frameHeight: 133, // Height of each frame
        });
    }

    function preload(this: Phaser.Scene) {
        gameInstanceRef.current.gameState = GAME_STATES.NONE;
        // Load assets here
        this.load.image("bg_mid", "phaser/bg/city/1.png");
        this.load.image("bg_foreground", "phaser/bg/city/foreground.png");
        this.load.image("bg_far", "phaser/bg/city/far-buildings.png");
        this.load.image("bg_wall", "phaser/bg/wall.png");

        this.load.image("pickaxe", "phaser/pickaxe/1.png");
        this.load.image("coin", "phaser/resources/coin.png");
        this.load.image("node", "phaser/resources/node.png");

        preload_fx();

        this.load.image("noun1", "phaser/chars/nouns/1.png");
        this.load.image("noun2", "phaser/chars/nouns/2.png");
        this.load.image("noun3", "phaser/chars/nouns/3.png");
        this.load.image("noun4", "phaser/chars/nouns/4.png");
        this.load.image("noun5", "phaser/chars/nouns/5.png");
    }

    function create(this: Phaser.Scene) {
        bg_container = this.add.container();

        bg_far = this.add
            .tileSprite(
                0,
                0,
                this.scale.width,
                this.textures.get("bg_far").getSourceImage().height,
                "bg_far"
            )
            .setOrigin(0, 0);
        bg_far.setScale(2);

        bg_mid = this.add
            .tileSprite(
                0,
                this.textures.get("bg_mid").getSourceImage().height - 140,
                this.scale.width,
                this.textures.get("bg_mid").getSourceImage().height,
                "bg_mid"
            )
            .setOrigin(0, 0);
        bg_foreground = this.add
            .tileSprite(
                0,
                this.textures.get("bg_foreground").getSourceImage().height - 140,
                this.scale.width,
                this.textures.get("bg_foreground").getSourceImage().height,
                "bg_foreground"
            )
            .setOrigin(0, 0);

        bg_container.add(bg_far);
        bg_container.add(bg_mid);
        bg_container.add(bg_foreground);
        bg_container.setScale(2);

        const bg_wall = this.add
            .tileSprite(0, 480, this.scale.width * 2, 1000, "bg_wall")
            .setOrigin(0, 0);
        bg_wall.setScale(0.5);

        create_fx();

        const resourceNode = this.add.sprite(360, 420, "node");
        resourceNode.setScale(0.5);
        resourceNode.visible = false;
        gameInstanceRef.current.resourceNode = resourceNode;

        const canvasWidth = this.cameras.main.width;
        const player_X = canvasWidth / 2;
        const player_Y = 400;
        const player = this.add.sprite(player_X, player_Y, "noun1");
        player.setScale(1);
        player.visible = false;
        gameInstanceRef.current.player = player;
        gameInstanceRef.current.player_X = player_X;
        gameInstanceRef.current.player_Y = player_Y;

        const opponent = this.add.sprite(
            canvasWidth / 2 + 150,
            player_Y + 30,
            "noun2"
        );
        opponent.setOrigin(0.7, 0.7);
        opponent.flipX = true;
        opponent.visible = false;
        gameInstanceRef.current.opponent = opponent;
        gameInstanceRef.current.opponent_X = canvasWidth / 2 + 150;
        gameInstanceRef.current.opponent_Y = player_Y + 30;

        const pickaxe = this.add.sprite(player_X + 30, player_Y, "pickaxe");
        pickaxe.setScale(1.5);
        pickaxe.visible = false;
        pickaxe.setOrigin(0, 1);
        gameInstanceRef.current.pickaxe = pickaxe;

        gameInstanceRef.current.harvest_tween = this.tweens.add({
            targets: pickaxe, // The sprite to animate
            angle: 360, // Target y position to "bounce" up to
            duration: 700, // Time to reach the target (in ms)
            ease: "Sine.easeIn", // Easing function for smooth motion
            yoyo: false, // Return to the original y position
            repeat: -1, // Repeat forever
            onYoyo: () => { },
            onComplete: () => {
                console.log("Spin complete"); // Optional: callback when the tween completes
            },
        });

        // Tween to simulate bouncing or walking up and down
        gameInstanceRef.current.player_idle_tween = this.tweens.add({
            targets: player, // The sprite to animate
            y: player_Y - 10, // Target y position to "bounce" up to
            duration: 300, // Time to reach the target (in ms)
            ease: "Sine.easeInOut", // Easing function for smooth motion
            yoyo: true, // Return to the original y position
            repeat: -1, // Repeat forever
        });

        // Tween to simulate bouncing or walking up and down
        gameInstanceRef.current.opponent_idle_tween = this.tweens.add({
            targets: opponent, // The sprite to animate
            y: player_Y - 10, // Target y position to "bounce" up to
            duration: 280, // Time to reach the target (in ms)
            ease: "Sine.easeInOut", // Easing function for smooth motion
            yoyo: true, // Return to the original y position
            repeat: -1, // Repeat forever
        });
    }

    function create_fx() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.anims.create({
            key: "hitFX", // Name of the animation
            frames: activeScene.anims.generateFrameNumbers("hitEffect", {
                start: 0,
                end: 9,
            }), // Use frames 0 to 9
            frameRate: 30, // Speed of the animation
            repeat: 0, // Play once and stop
        });
    }

    // Function to create and animate a stream of coins flying to a target
    function launchCoinStream(
        startX: any,
        startY: any,
        targetX: any,
        targetY: any
    ) {
        const scene = gameInstanceRef.current.scene.scenes[0];

        const numberOfCoins = 30; // Number of coins to animate
        const delayBetweenCoins = 150; // Delay between each coin animation
        const coinSprites = [];

        for (let i = 0; i < numberOfCoins; i++) {
            // Create coin sprite at the start position
            const coin = scene.add.sprite(startX, startY, "coin");
            coin.setScale(0); // Optional: scale the coin down
            coinSprites.push(coin);

            // Create a tween for each coin with a delay for each
            scene.tweens.add({
                targets: coin,
                scale: 1,
                x: targetX, // Target X position
                y: targetY, // Target Y position
                ease: "Sine.easeInOut", // Easing function for smooth flying
                duration: 1000, // Time in milliseconds to reach the target
                delay: i * delayBetweenCoins, // Delay between each coin
                onComplete: () => {
                    // Optional: Destroy the coin after it reaches the target
                    coin.destroy();
                },
            });
        }

        // Set a timeout to change the game state after the coin stream is complete
        setTimeout(() => {
            PlayerWalk();
        }, numberOfCoins * delayBetweenCoins);
    }

    function PlayHitFX(x: number, y: number) {
        const activeScene = gameInstanceRef.current.scene.scenes[0];

        // Create a sprite for the hit effect at the given (x, y) coordinates
        const hitFXSprite = activeScene.add.sprite(x + 50, y, "hitEffect");
        hitFXSprite.setScale(3);

        // Play the 'hitFX' animation on this sprite
        hitFXSprite.play("hitFX");

        // Once the animation is completed, destroy the sprite
        hitFXSprite.on("animationcomplete", () => {
            hitFXSprite.destroy();

            Faint(gameInstanceRef.current.opponent);
        });
    }

    function Harvest() {
        gameInstanceRef.current.gameState = GAME_STATES.HARVESTING;
        gameInstanceRef.current.opponent.visible = false;
        gameInstanceRef.current.player_idle_tween.pause();
        gameInstanceRef.current.pickaxe.visible = true;
        gameInstanceRef.current.resourceNode.visible = true;

        launchCoinStream(
            gameInstanceRef.current.player_X + 100,
            gameInstanceRef.current.player_Y + 80,
            gameInstanceRef.current.player_X + 200,
            100
        );
    }

    function Faint(target: any) {
        const activeScene = gameInstanceRef.current.scene.scenes[0];
        activeScene.tweens.add({
            targets: target,
            angle: 90, // Rotate the player 90 degrees backward (lying horizontally)
            y: target.y + 50, // Move the player down by 50 pixels
            duration: 1000, // Duration of the tween (1 second)
            ease: "Power2", // Easing for a smooth effect
            onStart: () => {
                console.log("Player is falling backward");
            },
            onComplete: () => {
                console.log("Player is now lying down");
                gameInstanceRef.current.opponent_idle_tween.pause();
            },
        });
    }

    function update() {
        if (gameInstanceRef.current.gameState !== GAME_STATES.IDLE) {
            return;
        }

        // Scroll the background by updating the tile position
        if (bg_mid) {
            bg_mid.tilePositionX += 0.2; // Move background to the left for scrolling effect
        }

        if (bg_foreground) {
            bg_foreground.tilePositionX += 0.5; // Move background to the left for scrolling effect
        }
    }

    function PlayAttack() {
        const activeScene = gameInstanceRef.current.scene.scenes[0];

        const player = gameInstanceRef.current.player;

        gameInstanceRef.current.opponent.visible = true;
        gameInstanceRef.current.gameState = GAME_STATES.COMBAT;
        gameInstanceRef.current.player_idle_tween.pause();
        gameInstanceRef.current.pickaxe.visible = false;
        gameInstanceRef.current.resourceNode.visible = false;
        gameInstanceRef.current.opponent.x = gameInstanceRef.current.opponent_X;
        gameInstanceRef.current.opponent.y = gameInstanceRef.current.opponent_Y;
        gameInstanceRef.current.opponent.angle = 0;

        PlayHitFX(player.x, player.y);

        // Set the range for left and right movement (adjust the values as needed)
        const leftMove = gameInstanceRef.current.player_X - 20; // Move 50 pixels to the left
        const rightMove = gameInstanceRef.current.player_X + 50; // Move 50 pixels to the right

        activeScene.tweens.add({
            targets: player, // The sprite to animate
            angle: 15, // Tilt forward (rotate by 15 degrees)
            x: rightMove, // Move right first
            duration: 100, // Time to tilt forward and move right (in ms)
            ease: "Sine.easeInOut", // Easing function for smooth motion
            yoyo: true, // Return to the original angle and position
            repeat: 1, // Play the forward and backward motion once
            onYoyo: () => {
                console.log("Returning to original angle");
            },
            onComplete: () => {
                // After the first attack (right movement), create another tween to move left
                activeScene.tweens.add({
                    targets: player,
                    x: leftMove, // Move to the left
                    angle: 0,
                    duration: 100,
                    ease: "Sine.easeInOut",
                    yoyo: true, // Return to the original position
                    onStart: () => {
                    },
                    onComplete: () => {
                        console.log("Left move completed");
                        PlayerWalk();
                    },
                });
            },
        });
    }

    function PlayerWalk() {
        gameInstanceRef.current.gameState = GAME_STATES.IDLE;
        gameInstanceRef.current.player_idle_tween.resume();
        gameInstanceRef.current.pickaxe.visible = false;
        gameInstanceRef.current.resourceNode.visible = false;
        gameInstanceRef.current.opponent.visible = false;
    }

    function PlayerFight() {
        PlayAttack();
    }

    // Add an event listener for the 'keydown' event
    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            console.log('The "Up Arrow" key was pressed');
            gameInstanceRef.current.player.setTexture(
                "noun" + (Math.floor(Math.random() * 5) + 1)
            );
        }

        if (event.key === "A") {
            PlayerFight();
        }
        if (event.key === "H") {
            Harvest();
        }
        if (event.key === "W") {
            PlayerWalk();
        }
    });

    return (
        <>
            {/* <button id="equipButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={Harvest}>Harvest</button>
            <button id="runButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerWalk}>Walk</button>
            <button id="fightButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full w-40"
                onClick={PlayerFight}>Fight</button> */}
            <div
                ref={gameRef}
                style={{
                    width: "100%",
                    height: "100vh",
                    maxWidth: "640px",
                    margin: "auto",
                }} // Adjust based on your game size
            />
            {isSpawnModalOpen && <SpawnModal />}
        </>
    );
});

export default PhaserGame;
