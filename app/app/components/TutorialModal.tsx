import React, { useState } from 'react';

interface TutorialStep {
  title: string;
  content: string;
  buttonText: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "About the war",
    content: "The war is raging on every chain affecting every degen, and you could be next.",
    buttonText: "Ready to serve!"
  },
  {
    title: "War sustainment",
    content: "We need 2 things to get the war going: 🔋 Energy, 👾 🪙 👻 Resources. They are displayed on the bottom side of your screen.",
    buttonText: "Roger roger"
  },
  {
    title: "Serve the cause",
    content: "Collect 👾 🪙 👻 resources, slain the 👾 monsters or 🤖 players with different faction tags, and Win the holy war.",
    buttonText: "I will serve"
  },
  {
    title: "Charter the path",
    content: "Our world is filled with decisions. Make up our decisions and be benefited from it!",
    buttonText: "Jump in"
  }
];

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white p-6 rounded-t-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-black">{currentTutorial.title}</h2>
        <p className="mb-6 text-black">{currentTutorial.content}</p>
        <button
          onClick={handleNext}
          className="w-full bg-blue-500 text-white py-2 rounded-lg"
        >
          {currentTutorial.buttonText}
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;