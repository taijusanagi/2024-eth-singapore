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
    <>
      <button onClick={initiateVote}>Open</button>
      <Voting id={id} isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
}
