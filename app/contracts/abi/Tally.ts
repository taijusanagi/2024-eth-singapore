export const TallyAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifier",
        type: "address",
      },
      {
        internalType: "address",
        name: "_vkRegistry",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poll",
        type: "address",
      },
      {
        internalType: "address",
        name: "_mp",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tallyOwner",
        type: "address",
      },
      {
        internalType: "enum DomainObjs.Mode",
        name: "_mode",
        type: "uint8",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AllBallotsTallied",
    type: "error",
  },
  {
    inputs: [],
    name: "BatchStartIndexTooLarge",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTallyVotesProof",
    type: "error",
  },
  {
    inputs: [],
    name: "NotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "NumSignUpsTooLarge",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ProcessingNotComplete",
    type: "error",
  },
  {
    inputs: [],
    name: "TallyBatchSizeTooLarge",
    type: "error",
  },
  {
    inputs: [],
    name: "VotingPeriodNotPassed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "MESSAGE_DATA_LENGTH",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_batchStartIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_newTallyCommitment",
        type: "uint256",
      },
    ],
    name: "getPublicCircuitInputs",
    outputs: [
      {
        internalType: "uint256[]",
        name: "publicInputs",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "array",
        type: "uint256[2]",
      },
    ],
    name: "hash2",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[3]",
        name: "array",
        type: "uint256[3]",
      },
    ],
    name: "hash3",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[4]",
        name: "array",
        type: "uint256[4]",
      },
    ],
    name: "hash4",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[5]",
        name: "array",
        type: "uint256[5]",
      },
    ],
    name: "hash5",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "left",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "right",
        type: "uint256",
      },
    ],
    name: "hashLeftRight",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "isTallied",
    outputs: [
      {
        internalType: "bool",
        name: "tallied",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "messageProcessor",
    outputs: [
      {
        internalType: "contract IMessageProcessor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mode",
    outputs: [
      {
        internalType: "enum DomainObjs.Mode",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poll",
    outputs: [
      {
        internalType: "contract IPoll",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sbCommitment",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "array",
        type: "uint256[]",
      },
    ],
    name: "sha256Hash",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "tallyBatchNum",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tallyCommitment",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newTallyCommitment",
        type: "uint256",
      },
      {
        internalType: "uint256[8]",
        name: "_proof",
        type: "uint256[8]",
      },
    ],
    name: "tallyVotes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateSbCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier",
    outputs: [
      {
        internalType: "contract IVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_voteOptionIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_spent",
        type: "uint256",
      },
      {
        internalType: "uint256[][]",
        name: "_spentProof",
        type: "uint256[][]",
      },
      {
        internalType: "uint256",
        name: "_spentSalt",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_voteOptionTreeDepth",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_spentVoiceCreditsHash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_resultCommitment",
        type: "uint256",
      },
    ],
    name: "verifyPerVOSpentVoiceCredits",
    outputs: [
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_totalSpent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_totalSpentSalt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_resultCommitment",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_perVOSpentVoiceCreditsHash",
        type: "uint256",
      },
    ],
    name: "verifySpentVoiceCredits",
    outputs: [
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_batchStartIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_newTallyCommitment",
        type: "uint256",
      },
      {
        internalType: "uint256[8]",
        name: "_proof",
        type: "uint256[8]",
      },
    ],
    name: "verifyTallyProof",
    outputs: [
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_voteOptionIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tallyResult",
        type: "uint256",
      },
      {
        internalType: "uint256[][]",
        name: "_tallyResultProof",
        type: "uint256[][]",
      },
      {
        internalType: "uint256",
        name: "_tallyResultSalt",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_voteOptionTreeDepth",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_spentVoiceCreditsHash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_perVOSpentVoiceCreditsHash",
        type: "uint256",
      },
    ],
    name: "verifyTallyResult",
    outputs: [
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vkRegistry",
    outputs: [
      {
        internalType: "contract IVkRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
