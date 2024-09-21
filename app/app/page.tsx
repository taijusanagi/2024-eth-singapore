"use client";

import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
  DynamicContextProvider
} from "../lib/dynamic";
import Spinner from "./Spinner";
import PhaserGame from "./PhaserGame";

const Screen = {
  WELCOME: "welcome",
  CONNECT_WALLET: "connectWallet",
  CHOOSE_BRIEF: "chooseBrief",
  STAKE: "stake",
  GAME_EXPLANATION: "gameExplanation",
  GAME: "game",
};

const progressScreens = [
  Screen.CHOOSE_BRIEF,
  Screen.STAKE,
  Screen.GAME_EXPLANATION,
];

const ProgressBar = ({ currentScreen }) => {
  const currentIndex = progressScreens.indexOf(currentScreen);

  return (
    <div className="w-full flex justify-center mb-8">
      {progressScreens.map((screen, index) => (
        <div
          key={index}
          className={`h-1 w-16 mx-1 rounded-full ${
            index <= currentIndex ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        ></div>
      ))}
    </div>
  );
};

function AppContent() {
  const { sdkHasLoaded, user, setShowAuthFlow } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(Screen.WELCOME);

  useEffect(() => {
    if (!sdkHasLoaded) {
      return;
    }

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded, user, telegramSignIn]);

  useEffect(() => {
    if (!user && currentScreen !== Screen.WELCOME) {
      setCurrentScreen(Screen.WELCOME);
    }
    if (user && currentScreen === Screen.CONNECT_WALLET) {
      setCurrentScreen(Screen.CHOOSE_BRIEF);
    }
  }, [user]);

  const handleNextScreen = () => {
    const screenOrder = [
      Screen.WELCOME,
      Screen.CONNECT_WALLET,
      Screen.CHOOSE_BRIEF,
      Screen.STAKE,
      Screen.GAME_EXPLANATION,
      Screen.GAME,
    ];
    const currentScreenIndex = screenOrder.indexOf(currentScreen);
    let nextScreen = screenOrder[currentScreenIndex + 1];
    if (nextScreen === Screen.CONNECT_WALLET && user) {
      nextScreen = Screen.CHOOSE_BRIEF;
    }
    setCurrentScreen(nextScreen);
  };

  const handleConnect = async () => {
    setShowAuthFlow(true);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => {
            setCurrentScreen(Screen.WELCOME);
          }}
        >
          <img
            src="/logo.png"
            alt="logo"
            className="w-8 h-8 inline-block mr-2"
          />
        </div>
        <div>{isLoading ? <Spinner /> : <DynamicWidget />}</div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {progressScreens.includes(currentScreen) && (
          <ProgressBar currentScreen={currentScreen} />
        )}

        {currentScreen === Screen.WELCOME && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">Welcome to Silent Wars</h1>
            <img
              src="/game-logo.png"
              alt="Silent Wars Logo"
              className="w-[300px] h-[300px] mx-auto mb-8"
            />
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs"
            >
              Play
            </button>
          </div>
        )}

        {currentScreen === Screen.CONNECT_WALLET && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Access Dynamic Wallet</h1>
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs"
            >
              Connect
            </button>
          </div>
        )}

        {currentScreen === Screen.CHOOSE_BRIEF && (
          <div className="text-center w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6">
              Let's skin into the game
            </h1>
            <p className="mb-4">Choose your faction, Choose your beliefs</p>
            {["Cyberpunk", "Moloch", "Memecoin"].map((faction, index) => (
              <button
                key={index}
                onClick={handleNextScreen}
                className={`w-full py-4 px-6 mb-4 rounded-xl text-left ${
                  index === 0
                    ? "bg-blue-600"
                    : index === 1
                      ? "bg-purple-600"
                      : "bg-red-600"
                  }`}
              >
                <div className="flex items-center">
                  <img
                    src={`/${faction.toLowerCase()}-icon.png`}
                    alt={`${faction} icon`}
                    className="w-8 h-8 mr-4"
                  />
                  <div>
                    <div className="font-bold">{faction}</div>
                    <div className="text-sm opacity-80">
                      {index === 0
                        ? "Freedom for all humans"
                        : index === 1
                        ? "Join the allmighty"
                        : "Huh?"}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentScreen === Screen.STAKE && (
          <div className="text-center w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6">Stake ETH</h1>
            <p className="mb-4">For that's what your belief</p>
            <div className="bg-gray-800 p-4 rounded-xl mb-4 flex items-center justify-between">
              <input
                type="number"
                placeholder="0.01"
                className="bg-transparent text-2xl w-full outline-none"
              />
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                <span>ETH</span>
              </div>
            </div>
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full"
            >
              Stake
            </button>
          </div>
        )}

        {currentScreen === Screen.GAME_EXPLANATION && (
          <div className="text-center w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6">Game</h1>
            <p className="mb-4">Farm, Battle, Govern</p>
            {["Farm", "Battle", "Govern"].map((action, index) => (
              <div key={index} className="mb-4 text-left">
                <h2 className="font-bold flex items-center mb-2">
                  <span className="w-6 h-6 bg-gray-700 rounded-full mr-2"></span>
                  {action}
                </h2>
                <p className="text-sm opacity-80">
                  Game rules description goes here
                </p>
              </div>
            ))}
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4"
            >
              Start
            </button>
          </div>
        )}

        {currentScreen === Screen.GAME && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Game Screen</h1>
            <p>Game interaction components go here</p>
            <PhaserGame />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Component() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
      }}
    >
      <AppContent />
    </DynamicContextProvider>
  );
}
