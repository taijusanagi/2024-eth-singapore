import React, { useState, useRef, useEffect } from 'react';

interface GlobalStateModalProps {
  onClose: () => void;
}

const GlobalStateModal: React.FC<GlobalStateModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [votingPower, setVotingPower] = useState('1,234,5678');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleVote = (vote: string) => {
    setSelectedVote(vote);
    // 这里可以添加投票逻辑
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Voting Global State</h2>
          <button onClick={onClose} className="text-blue-500 text-3xl">⬇️</button>
        </div>
        <p className="text-gray-500 mb-4">Closes in 1h30m</p>
        <p className="text-black text-lg mb-6 text-center">
          The regulation is about to tighten the its control over memecoin, which would make memecoin resources to be less valuable
        </p>
        <p className="text-gray-500 mb-4">Your voting power: {votingPower}</p>
        <div className="space-y-2">
          <button
            onClick={() => handleVote('For')}
            className={`w-full py-2 rounded-lg ${
              selectedVote === 'For' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
            }`}
          >
            ✓ For
          </button>
          <button
            onClick={() => handleVote('Against')}
            className={`w-full py-2 rounded-lg ${
              selectedVote === 'Against' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
            }`}
          >
            ✗ Against
          </button>
          <button
            onClick={() => handleVote('Abstain')}
            className={`w-full py-2 rounded-lg ${
              selectedVote === 'Abstain' ? 'bg-gray-300 text-black' : 'bg-gray-100 text-gray-500'
            }`}
          >
            Abstain
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalStateModal;