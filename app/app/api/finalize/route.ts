import { NextRequest, NextResponse } from "next/server";

import { Keypair } from "maci-domainobjs";

import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export async function POST(req: NextRequest) {
  try {
    const {} = await req.json();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    return NextResponse.json({ message: "Data processed successfully" });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
