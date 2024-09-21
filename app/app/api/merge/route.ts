import { NextRequest, NextResponse } from "next/server";

import { readContract } from "viem/actions";
import { createPublicClient, Hex, http } from "viem";
import { addresses } from "@/contracts/addresses";
import { MACIAbi } from "@/contracts/abi/MACI";
import { PollAbi } from "@/contracts/abi/Poll";
import { ethers } from "ethers";
import { AccQueueAbi } from "@/contracts/abi/AccQueue";
import { TreeMerger } from "@/lib/maci/TreeMerger";

const DEFAULT_SR_QUEUE_OPS = 4;

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const ownerEvmPrivateKey = process.env.OWNER_EVM_PRIVATE_KEY as Hex;
    const jsonRpcUrl = process.env.JSON_RPC_URL;

    if (!ownerEvmPrivateKey || !jsonRpcUrl) {
      throw new Error("Required environment variables are not set");
    }

    if (!id) {
      return NextResponse.json(
        { error: "Id is required in query parameters" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      transport: http(jsonRpcUrl),
    });

    const { poll } = await readContract(publicClient, {
      address: addresses.MACI,
      abi: MACIAbi,
      functionName: "getPoll",
      args: [id],
    });

    const [, messageAccQueueContractAddress] = await readContract(
      publicClient,
      {
        address: poll,
        abi: PollAbi,
        functionName: "extContracts",
      }
    );

    const jsonRPCProvider = new ethers.JsonRpcProvider(jsonRpcUrl);
    const signer = new ethers.Wallet(ownerEvmPrivateKey, jsonRPCProvider);
    const pollContract = new ethers.Contract(poll, PollAbi, signer);
    const accQueueContract = new ethers.Contract(
      messageAccQueueContractAddress,
      AccQueueAbi,
      signer
    );

    const treeMerger = new TreeMerger({
      deployer: signer,
      pollContract,
      messageAccQueueContract: accQueueContract,
    });

    await treeMerger.checkPollDuration();
    await treeMerger.mergeSignups();
    await treeMerger.mergeMessageSubtrees(DEFAULT_SR_QUEUE_OPS);
    await treeMerger.mergeMessages();

    return NextResponse.json({ message: "Data processed successfully" });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
