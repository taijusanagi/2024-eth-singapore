"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export const Voting = ({
  id,
  isOpen,
  onClose,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [voteResult, setVoteResult] = useState("");
  const votingPower = 1234567;

  const [content, setContent] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const close = () => {
    setVoteResult("");
    onClose();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!id) return;

    async function process() {
      const pollRes = await fetch(`/api/poll?id=${id}`, {
        method: "GET",
      });
      const poll = await pollRes.json();
      setContent(poll.content);
      setOptions(poll.options);
    }
    process();
  }, [id]);

  const castVote = (voteType: number) => {
    // Implement vote handling logic or API call here
    setVoteResult(
      `You casted ${votingPower.toLocaleString()} voting power for: ${voteType}`
    );
  };

  const handleViewResult = async () => {
    await fetch("/api/merge", {
      method: "POST",
      body: JSON.stringify({
        id,
      }),
    });
    const proveRes = await fetch("/api/prove", {
      method: "POST",
      body: JSON.stringify({
        id,
      }),
    });
    const proveData = await proveRes.json();
    console.log("proveData", proveData);

    setVoteResult("Result: Yes: 50%, No: 50%");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Voting Global State</h2>
          <p className="text-gray-600 mb-4">{content}</p>

          {!voteResult && (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Your voting power
                </p>
                <p className="text-2xl font-bold">
                  {votingPower.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                {options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => castVote(i)}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <button
                  className="w-full items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleViewResult}
                >
                  View Result
                </button>
              </div>
            </>
          )}
          {voteResult && (
            <div
              className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded"
              role="alert"
            >
              <p>{voteResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
