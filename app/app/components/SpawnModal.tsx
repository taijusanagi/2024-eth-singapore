import React, { useState, useRef, useEffect } from "react";
import { useDynamicContext } from "../../lib/dynamic";
import { writeContract } from "viem/actions";
import { addresses } from "@/contracts/addresses";
import { GameAbi } from "@/contracts/abi/Game";
import { flowTestnet } from "viem/chains";
const SpawnModal = () => {
  const { primaryWallet } = useDynamicContext() as any;

  const modalRef = useRef<HTMLDivElement>(null);

  const handleSpawn = async (vote: string) => {
    const walletClient = await primaryWallet.getWalletClient();
    const [address] = await walletClient.getAddresses();
    await writeContract(walletClient, {
      address: addresses.GAME,
      abi: GameAbi,
      functionName: "spawn",
      chain: flowTestnet,
      account: address,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Spawn</h2>
        </div>

        <p className="text-black text-lg mb-6 text-center">Let's start game!</p>

        <button
          onClick={() => handleSpawn("For")}
          className={`w-full py-2 rounded-lg bg-blue-500 text-white`}
        >
          Spawn
        </button>
      </div>
    </div>
  );
};

export default SpawnModal;
