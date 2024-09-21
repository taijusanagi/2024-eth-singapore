"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MinusCircle, X } from "lucide-react";

export const Voting = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [voteResult, setVoteResult] = useState("");
  const votingPower = 1234567;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const castVote = (voteType: string) => {
    // Implement vote handling logic or API call here
    setVoteResult(
      `You casted ${votingPower.toLocaleString()} voting power for: ${voteType}`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Voting Global State</h2>
          <p className="text-gray-600 mb-4">
            The regulation is about to tighten its control over memecoin, which
            would make memecoin resources less valuable.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Your voting power
            </p>
            <p className="text-2xl font-bold">{votingPower.toLocaleString()}</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: "33%" }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { type: "For", icon: ThumbsUp, color: "text-green-500" },
              { type: "Against", icon: ThumbsDown, color: "text-red-500" },
              { type: "Abstain", icon: MinusCircle, color: "text-gray-500" },
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => castVote(option.type)}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <option.icon className={`h-8 w-8 mb-2 ${option.color}`} />
                <span className="font-medium">{option.type}</span>
              </button>
            ))}
          </div>
          {voteResult && (
            <div
              className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">Vote Cast</p>
              <p>{voteResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
