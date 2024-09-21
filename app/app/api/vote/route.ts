import { NextRequest, NextResponse } from "next/server";

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
    const keyResponse = await fetch(
      `${process.env.APP_URL}/api/key?address=ok`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const userKey = await keyResponse.json();
    console.log("userKey", userKey);
    return NextResponse.json({ message: "Data processed successfully" });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
