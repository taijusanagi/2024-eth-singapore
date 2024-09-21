"use client";

import { Voting } from "@/components/Voting";
import { useState } from "react";

export default function SandboxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={handleOpen}>Open</button>
      <Voting isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
}
