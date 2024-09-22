"use client";

import { Voting } from "@/components/Voting";
import { useState } from "react";

export default function SandboxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState("");

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const initiateVote = async () => {
    const createElectionRes = await fetch("/api/create-election", {
      method: "POST",
      body: JSON.stringify({
        content: "This is content",
        options: ["No", "Yes"],
      }),
    });
    const { createdPollId } = await createElectionRes.json();
    setId(createdPollId);
    handleOpen();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          MACI Voting Demo
        </h1>
        <p className="mb-6 text-center text-gray-600">
          This is a demonstration of game decision-making voting using MACI.
          Currently, it uses localhost for the voting process.
        </p>
        <button
          onClick={initiateVote}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Initiate Voting
        </button>
      </div>
      <Voting id={id} isOpen={isModalOpen} onClose={handleClose} />
      <footer className="mt-8 text-center text-gray-500 text-sm">
        Note: This demo is using localhost for the voting process.
      </footer>
    </div>
  );
}
