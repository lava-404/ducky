// app/api/projects/connect-dodo/route.ts

import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import crypto from 'crypto'; // Required for hashing

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { apiKey, projectName, yieldPercentage } = await request.json();

    // 1. Basic Validation
    if (!apiKey || !projectName) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey and projectName are required.' },
        { status: 400 }
      );
    }

    // 2. Initialize Dodo SDK for Validation
    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: 'test_mode',
    });

    let businessName = "Verified Business";

    try {
      // 3. The SDK Handshake (Validation)
      const brands = await client.brands.list();
      
      if (brands.items && brands.items.length > 0) {
        businessName = brands.items[0].name ?? "Verified Business"
      }
    } catch (sdkError: any) {
      console.error("Dodo SDK Validation Failed:", sdkError.message);
      return NextResponse.json(
        { error: 'Invalid Dodo API Key. Please check your key and try again.' },
        { status: 401 }
      );
    }

    // 4. Create a stable hash of the API key to check for duplicates
    // This will always produce the same string for the same key
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // 5. NEW LOGIC: Prevent Duplicate API Keys using the stable hash
    const existingProject = await prisma.project.findUnique({
      where: {
        keyHash: keyHash,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'This Dodo account is already linked to an existing project.' },
        { status: 400 }
      );
    }

    // 6. Encrypt API Key for Storage
    // (Note: This output varies each time, which is why we don't use it for the lookup)
    const encryptedKey = encrypt(apiKey);

    // 7. Save to DB via Prisma
    const project = await prisma.project.create({
      data: {
        projectName,
        encryptedApiKey: encryptedKey,
        keyHash: keyHash, // Storing the hash so we can find it next time
        yieldPercentage: yieldPercentage || 20,
      },
    });

    console.log(`✅ Project created: ${project.id} for business: ${businessName}`);

    // 8. Return success to the Dashboard
    return NextResponse.json({
      success: true,
      businessName: businessName,
      projectId: project.id,
    });

  } catch (error) {
    console.error('Final Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during project creation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("DB URL:", process.env.DATABASE_URL);
  return new Response("Check your terminal");
}