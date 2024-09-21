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
                    width: 800,
                    height: 600,
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

    const preload = () => {
        // Load assets here
    };

    function create(this: Phaser.Scene) {
        // Use 'this' which now refers to Phaser.Scene, so TypeScript understands it's not undefined
        this.add.text(100, 100, 'Hello Phaser in React', { color: '#fff' });
    }

    const update = () => {
        // Game loop logic
    };

    return (
        <div
            ref={gameRef}
            style={{ width: '800px', height: '600px' }} // Adjust based on your game size
        />
    );
};

export default PhaserGame;
