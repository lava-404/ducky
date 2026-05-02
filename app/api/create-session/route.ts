// app/api/create-session/route.ts
import { NextResponse } from "next/server";
import DodoPayments from "dodopayments"; // Use the official SDK!
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const { projectId, productId } = await req.json(); // Use productId

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Invalid project" }, { status: 404 });

    const dodoApiKey = decrypt(project.encryptedApiKey);

    // ✅ USE THE SDK INSTEAD OF FETCH
    const client = new DodoPayments({
      bearerToken: dodoApiKey,
      environment: dodoApiKey.startsWith('live_') ? 'live_mode' : 'test_mode',
    });

    const session = await client.checkoutSessions.create({
      product_cart: [{ 
        product_id: productId, 
        quantity: 1 
      }],
      metadata: {
        projectId: project.id, // Very important for your Helius webhook later!
        vaultAddress: project.vaultAddress ?? " "
      },
      // Ensure these point to your actual domain in production
      return_url: "http://localhost:3000/dashboard", 
    });

    return NextResponse.json({
      url: session.checkout_url, // Dodo returns checkout_url
    });

  } catch (error: any) {
    console.error("Dodo SDK Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}