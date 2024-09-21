"use client";

import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";
import Spinner from "./Spinner";
import PhaserGame from "./PhaserGame";
import GlobalStateModal from "./components/GlobalStateModal";
import AroundYouDrawer from "./components/AroundYouDrawer";

import { Address, createPublicClient, http } from "viem";
import { RPC } from "@/contracts/rpc";
import { readContract } from "viem/actions";
import { addresses } from "@/contracts/addresses";
import { GameAbi } from "@/contracts/abi/Game";

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

const ProgressBar = ({ currentScreen }: { currentScreen: string }) => {
  const currentIndex = progressScreens.indexOf(currentScreen);

  return (
    <div className="w-full flex justify-center mb-8">
      {progressScreens.map((screen, index) => (
        <div
          key={index}
          className={`h-1 w-16 mx-1 rounded-full ${
            index <= currentIndex ? "bg-blue-500" : "bg-gray-300"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default function HomePage() {
  const { sdkHasLoaded, user, setShowAuthFlow, primaryWallet } =
    useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(Screen.WELCOME);
  const [isGlobalStateModalOpen, setIsGlobalStateModalOpen] = useState(false);
  const [isAroundYouDrawerOpen, setIsAroundYouDrawerOpen] = useState(false);

  const [enegey, setEnergy] = useState("0");
  const [resource, setResource] = useState("0");

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
  }, [sdkHasLoaded, user]);

  useEffect(() => {
    if (!primaryWallet) {
      return;
    }
    const process = async () => {
      const address = primaryWallet.address as Address;

      const publicClient = createPublicClient({
        transport: http(RPC),
      });

      const checkPlayer = async () => {
        const player = await readContract(publicClient, {
          address: addresses.GAME,
          abi: GameAbi,
          functionName: "getPlayerByAddress",
          args: [address],
        });

        console.log("player", player);
        setEnergy(player.energy.toString());
        setResource(player.resources.toString());
        setTimeout(checkPlayer, 5000); // Retry every 3 seconds
      };

      // Start checking player
      checkPlayer();
    };

    process();
  }, [primaryWallet]);

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
    <div className="h-screen bg-white-900 text-black flex flex-col font-sans">
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

      <main className="flex-grow flex flex-col items-center justify-center">
        {progressScreens.includes(currentScreen) && (
          <ProgressBar currentScreen={currentScreen} />
        )}

        {currentScreen === Screen.WELCOME && (
          <div className="text-center p-4">
            <h1 className="text-4xl font-bold mb-8 tracking-wider">
              Welcome to
            </h1>
            <img
              src="/game-logo.png"
              alt="Silent Wars Logo"
              className="w-[300px] h-[300px] mx-auto mb-12"
            />
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs text-lg tracking-wider"
            >
              Play
            </button>
          </div>
        )}

        {currentScreen === Screen.CONNECT_WALLET && (
          <div className="text-center p-4">
            <h1 className="text-3xl font-bold mb-6 tracking-wider">
              Access Dynamic Wallet
            </h1>
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs text-lg tracking-wider"
            >
              Connect
            </button>
          </div>
        )}

        {currentScreen === Screen.CHOOSE_BRIEF && (
          <div className="text-center w-full max-w-md p-4">
            <h1 className="text-3xl font-bold mb-4 tracking-wider">
              Let's skin into the game
            </h1>
            <p className="mb-8 text-lg tracking-wider">
              Choose your faction, Choose your beliefs
            </p>
            {["Cyberpunk", "Moloch", "Memecoin"].map((faction, index) => (
              <button
                key={index}
                onClick={handleNextScreen}
                className={`w-full py-4 px-6 mb-4 rounded-xl text-left text-lg tracking-wider ${
                  index === 0
                    ? "bg-blue-600"
                    : index === 1
                    ? "bg-purple-600"
                    : "bg-red-600"
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={`/icons/${faction.toLowerCase()}-icon.png`}
                    alt={`${faction} icon`}
                    className="w-8 h-8 mr-4"
                  />
                  <div>
                    <div className="font-bold text-white">{faction}</div>
                    <div className="text-base opacity-80 text-white">
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
          <div className="text-center w-full max-w-md p-4">
            <h1 className="text-3xl font-bold mb-4 tracking-wider">
              Stake ETH
            </h1>
            <p className="mb-8 text-lg tracking-wider">
              For that's what your belief
            </p>
            <div className="p-4 rounded-xl mb-4 flex items-center justify-between border">
              <input
                type="number"
                placeholder="0.01"
                className="bg-transparent text-2xl w-full outline-none"
              />
              <div className="flex items-center">
                <span>ETH</span>
              </div>
            </div>
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full w-full text-lg tracking-wider"
            >
              Stake
            </button>
          </div>
        )}

        {currentScreen === Screen.GAME_EXPLANATION && (
          <div className="text-center w-full max-w-md p-4">
            <h1 className="text-3xl font-bold mb-4 tracking-wider">Game</h1>
            <p className="mb-8 tracking-wider text-lg">Farm, Battle, Govern</p>
            <div className="mb-4 text-left text-lg tracking-wider">
              <h2 className="font-bold flex items-center mb-2">
                <span className="mr-2">🧺</span> Farm
              </h2>
              <p className="text-sm opacity-80">
                Collect resources for your guild
              </p>
            </div>
            <div className="mb-4 text-left text-lg tracking-wider">
              <h2 className="font-bold flex items-center mb-2">
                <span className="mr-2">⚔️</span> Battle
              </h2>
              <p className="text-sm opacity-80">
                "Interact" with opponents to collect their resources
              </p>
            </div>
            <div className="mb-4 text-left text-lg tracking-wider">
              <h2 className="font-bold flex items-center mb-2">
                <span className="mr-2">🧠</span> Govern
              </h2>
              <p className="text-sm opacity-80">
                Charter the world's path with your guild members, or alone.
              </p>
            </div>
            <button
              onClick={handleNextScreen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4 text-lg tracking-wider"
            >
              Start
            </button>
          </div>
        )}

        {currentScreen === Screen.GAME && (
          <div className="relative w-full h-full max-w-md mx-auto">
            {/* Global State 组件 */}
            <div
              className="absolute top-2 left-2 right-2 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer z-10"
              onClick={() => setIsGlobalStateModalOpen(true)}
            >
              <div className="text-xl font-bold mb-2 text-black">
                Global State
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">👾</span>
                <span className="text-lg text-gray-600">+10 Res</span>
              </div>
            </div>

            {/* 游戏主屏幕 */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-200 rounded-lg overflow-hidden">
              <PhaserGame />
            </div>

            {/* 全局数字屏幕 */}
            <div className="absolute right-2 top-52 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-lg shadow-md border border-gray-200 p-2">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-end space-x-1">
                  <span className="text-xl font-bold text-black">789</span>
                  <span className="text-3xl">👾</span>
                </div>
                <div className="flex items-center justify-end space-x-1">
                  <span className="text-xl font-bold text-black">789</span>
                  <span className="text-3xl">🪙</span>
                </div>
                <div className="flex items-center justify-end space-x-1">
                  <span className="text-xl font-bold text-black">789</span>
                  <span className="text-3xl">👻</span>
                </div>
                <div className="flex items-center justify-end space-x-1">
                  <span className="text-xl font-bold text-black">789</span>
                  <span className="text-3xl">😂</span>
                </div>
              </div>
            </div>

            {/* 底部状态栏 */}
            <div className="absolute bottom-24 left-2 right-2 flex justify-between">
              <div className="bg-white bg-opacity-70 rounded-full px-4 py-1.5 flex items-center space-x-2 border border-gray-300">
                <span className="text-3xl">🔋</span>
                <span className="text-2xl text-gray-600">{enegey}/100</span>
              </div>
              <div className="bg-white bg-opacity-70 rounded-full px-4 py-1.5 flex items-center space-x-2 border border-gray-300">
                <span className="text-3xl">💰</span>
                <span className="text-2xl text-gray-600">{resource}</span>
              </div>
            </div>

            {/* 周围状态栏 */}
            <div
              className="absolute bottom-2 left-2 right-2 bg-white rounded-lg shadow-md border border-gray-200 p-2 cursor-pointer"
              onClick={() => setIsAroundYouDrawerOpen(true)}
            >
              <div className="text-2xl font-bold mb-1 text-black">
                Around you
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-xl">👾</span>
                  <span className="text-xl text-gray-600">10</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl">🪙</span>
                  <span className="text-xl text-gray-600">8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl">👻</span>
                  <span className="text-xl text-gray-600">9</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl">😂</span>
                  <span className="text-xl text-gray-600">11</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isGlobalStateModalOpen && (
          <GlobalStateModal onClose={() => setIsGlobalStateModalOpen(false)} />
        )}

        {isAroundYouDrawerOpen && (
          <AroundYouDrawer onClose={() => setIsAroundYouDrawerOpen(false)} />
        )}
      </main>
    </div>
  );
}
