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
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { error: "Address is required in query parameters" },
        { status: 400 }
      );
    }
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const redisKey = `user:${address}`;
    let keyStr = await redisClient.get(redisKey);
    if (!keyStr) {
      const user = new Keypair();
      keyStr = JSON.stringify({
        pubKey: user.pubKey.serialize(),
        privKey: user.privKey.serialize(),
      });
      await redisClient.set(redisKey, keyStr);
    }
    const key = JSON.parse(keyStr);
    return NextResponse.json({ key });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
