import React, { useEffect, useRef } from 'react';

const PhaserGame = () => {
    const gameRef = useRef(null); // To keep reference to the game DOM element
    const gameInstanceRef: any = useRef(null); // To store the Phaser game instance

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
    };

    function create(this: Phaser.Scene) {
        // Use 'this' which now refers to Phaser.Scene, so TypeScript understands it's not undefined
        this.add.text(100, 100, 'Hello Phaser in React', { color: '#fff' });

        var bg_layer = this.add.container();
        bg_layer.add(this.add.image(0, 0, 'bg_main').setOrigin(0, 0));
    }

    const update = () => {
        // Game loop logic
    };

    return (
        <div
            ref={gameRef}
            style={{ width: '100%', height: '100vh' }} // Adjust based on your game size
        />
    );
};

export default PhaserGame;
