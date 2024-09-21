"use client";

import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";
import Spinner from "./Spinner";

const Screen = {
  WELCOME: "welcome",
  ACCESS_WALLET: "accessWallet",
  CHOOSE_BRIEF: "chooseBrief",
  STAKE: "stake",
  GAME_EXPLANATION: "gameExplanation",
  GAME: "game",
};

export default function Component() {
  const { sdkHasLoaded, user } = useDynamicContext();
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
  }, [sdkHasLoaded, user, telegramSignIn, currentScreen]);

  const handleNextScreen = () => {
    const screenOrder = [
      Screen.WELCOME,
      Screen.ACCESS_WALLET,
      Screen.CHOOSE_BRIEF,
      Screen.STAKE,
      Screen.GAME_EXPLANATION,
      Screen.GAME,
    ];
    const currentScreenIndex = screenOrder.indexOf(currentScreen);
    const nextScreen = screenOrder[currentScreenIndex + 1];
    setCurrentScreen(nextScreen);
  };

  const handleConnect = async () => {
    console.log("handle connect", user);
    if (!user) {
      await telegramSignIn({ forceCreateUser: true });
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    setCurrentScreen(Screen.CHOOSE_BRIEF);
  }, [user]);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="w-full p-4 flex justify-between items-center">
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
        {currentScreen === Screen.WELCOME && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">Welcome to Silence Wars</h1>
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs"
            >
              Play
            </button>
          </div>
        )}

        {currentScreen === Screen.ACCESS_WALLET && (
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
            {["Cyberpunk", "Cyberpunk", "Cyberpunk"].map((faction, index) => (
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
                  <div className="w-8 h-8 bg-white rounded-md mr-4"></div>
                  <div>
                    <div className="font-bold">{faction}</div>
                    <div className="text-sm opacity-80">
                      "Freedom for all humans"
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
          </div>
        )}
      </main>
    </div>
  );
}
