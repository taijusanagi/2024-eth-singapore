import { verifyCloudProof } from "@worldcoin/idkit-core/backend";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_URL,
	socket: {
		tls: true,
	},
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { proof, signal } = body;
		if (!proof) {
			return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
		}
		const response = (await verifyCloudProof(proof, "app_d3efa40cc232633d00a3c271facefa90", "silent-wars", signal));
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}
		// store the veirifed signal = address in redis
		// for better demo, it can be verified multiple times
		await redisClient.set(`verified:${signal}`, "true");
		return NextResponse.json(response, { status: response.success ? 200 : 400 });
	} catch (error) {
		console.log("error", error);
		return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
	}
}
