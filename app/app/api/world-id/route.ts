import { verifyCloudProof } from "@worldcoin/idkit-core/backend";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {



	try {
		const body = await req.json();
		const { proof, signal } = body;
		if (!proof) {
			return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
		}
		const response = (await verifyCloudProof(proof, "app_d3efa40cc232633d00a3c271facefa90", "silent-wars", signal));
        console.log("response", response);
		return NextResponse.json(response, { status: response.success ? 200 : 400 });
	} catch (error) {
		return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
	}
}
