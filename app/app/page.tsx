"use client";
import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";

import Spinner from "./Spinner";

export default function Main() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded]);

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white">
      <header className="absolute top-0 left-0 w-full p-4 text-white flex justify-between items-center z-10">
        <div className="text-xl font-bold">GAME</div>
        <div>{isLoading ? <Spinner /> : <DynamicWidget />}</div>
      </header>
      <iframe
        className="w-full max-w-sm h-full"
        src="/Builds/index.html"
        frameBorder="0"
      ></iframe>
    </div>
  );
}
