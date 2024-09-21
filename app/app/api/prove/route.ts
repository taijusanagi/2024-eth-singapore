import { NextRequest, NextResponse } from "next/server";

import { readContract } from "viem/actions";
import { createPublicClient, Hex, http } from "viem";
import { addresses } from "@/contracts/addresses";
import { MACIAbi } from "@/contracts/abi/MACI";
import { PollAbi } from "@/contracts/abi/Poll";
import { ethers } from "ethers";
import { AccQueueAbi } from "@/contracts/abi/AccQueue";
import { TreeMerger } from "@/lib/maci/TreeMerger";
import { Keypair, PrivKey } from "maci-domainobjs";
import { VerifierAbi } from "@/contracts/abi/Verifier";
import { VkRegistryAbi } from "@/contracts/abi/VkRegistry";
import { ProofGenerator } from "@/lib/maci/ProofGenerator";
import { MessageProcessorAbi } from "@/contracts/abi/MessageProcessor";
import { TallyAbi } from "@/contracts/abi/Tally";
import { Prover } from "@/lib/maci/Prover";

const DEFAULT_SR_QUEUE_OPS = 4;

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const ownerEvmPrivateKey = process.env.OWNER_EVM_PRIVATE_KEY as Hex;
    const ownerMaciPrivateKey = process.env.OWNER_MACI_PRIVATE_KEY;

    const jsonRpcUrl = process.env.JSON_RPC_URL;

    if (!ownerEvmPrivateKey || !ownerMaciPrivateKey || !jsonRpcUrl) {
      throw new Error("Required environment variables are not set");
    }

    if (!id) {
      return NextResponse.json(
        { error: "Id is required in query parameters" },
        { status: 400 }
      );
    }

    const maciPrivateKey = PrivKey.deserialize(ownerMaciPrivateKey);
    const coordinatorKeypair = new Keypair(maciPrivateKey);

    const jsonRPCProvider = new ethers.JsonRpcProvider(jsonRpcUrl);
    const signer = new ethers.Wallet(ownerEvmPrivateKey, jsonRPCProvider);

    const maciContract = new ethers.Contract(addresses.MACI, MACIAbi, signer);

    const [poll, messageProcessor, tally] = await maciContract.polls(id);

    const pollContract = new ethers.Contract(poll, PollAbi, signer);
    const vkRegistryContract = new ethers.Contract(
      addresses.VkRegistry,
      VkRegistryAbi,
      signer
    );
    const verifierContract = new ethers.Contract(
      addresses.Verifier,
      VerifierAbi,
      signer
    );
    const messageProcessorContract = new ethers.Contract(
      messageProcessor,
      MessageProcessorAbi,
      signer
    );
    const tallyContract = new ethers.Contract(tally, TallyAbi, signer);
    const [messageAqAddress, messageAccQueueContractAddress] =
      await pollContract.extContracts();
    const messageAqContract = new ethers.Contract(
      messageAccQueueContractAddress,
      AccQueueAbi,
      signer
    );

    const isStateAqMerged = await pollContract.stateMerged();

    // Check that the state and message trees have been merged for at least the first poll
    if (!isStateAqMerged && poll.toString() === "0") {
      throw new Error(
        "The state tree has not been merged yet. Please use the mergeSignups subcommand to do so."
      );
    }

    const messageTreeDepth = await pollContract
      .treeDepths()
      .then((depths) => Number(depths[2]));

    // check that the main root is set
    const mainRoot = await messageAqContract.getMainRoot(
      messageTreeDepth.toString()
    );

    if (mainRoot.toString() === "0") {
      throw new Error(
        "The message tree has not been merged yet. Please use the mergeMessages subcommand to do so."
      );
    }

    const maciState = await ProofGenerator.prepareState({
      maciContract,
      pollContract,
      messageAq: messageAqContract,
      maciPrivateKey,
      coordinatorKeypair,
      pollId: id,
      signer,
      outputDir: "",
      options: {},
    });

    const foundPoll = maciState.polls.get(BigInt(id));

    if (!foundPoll) {
      throw new Error(`Poll ${poll} not found`);
    }

    const tallyZkey = "./TallyVotesNonQv_10-1-2_test.0.zkey";
    const tallyWasm = "./TallyVotesNonQv_10-1-2_test.wasm";
    const processZkey = "./ProcessMessagesNonQv_10-2-1-2_test.0.zkey";
    const processWasm = "./ProcessMessagesNonQv_10-2-1-2_test.wasm";

    const prover = new Prover({
      maciContract,
      messageAqContract,
      mpContract: messageProcessorContract,
      pollContract,
      vkRegistryContract,
      verifierContract,
      tallyContract,
    });

    const proofGenerator = new ProofGenerator({
      poll: foundPoll,
      maciContractAddress: addresses.MACI,
      tallyContractAddress: tally,
      rapidsnark: undefined,
      tally: {
        zkey: tallyZkey,
        witgen: undefined,
        wasm: tallyWasm,
      },
      mp: {
        zkey: processZkey,
        witgen: undefined,
        wasm: processWasm,
      },
      outputDir: "",
      tallyOutputFile: "",
      useQuadraticVoting: false,
    });
    const pricessProofs = await proofGenerator.generateMpProofs();
    await prover.proveMessageProcessing(pricessProofs);

    const takllyResult = await proofGenerator.generateTallyProofs({
      name: "hardhat",
      config: { chainId: 31337 },
    });

    await prover.proveTally(takllyResult.proofs);

    return NextResponse.json({ tallyData: takllyResult.tallyData });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
