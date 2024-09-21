import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "maci-domainobjs";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
		tls: true,
	},
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Id is required in query parameters" },
        { status: 400 }
      );
    }
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const redisKey = `poll:${id}`;
    let poll = await redisClient.get(redisKey);
    if (!poll) {
      throw new Error("Poll not found");
    }
    return NextResponse.json(JSON.parse(poll));
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
