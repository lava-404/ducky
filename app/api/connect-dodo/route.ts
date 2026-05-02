// app/api/projects/connect-dodo/route.ts

import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
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
      // Automatically toggle environment based on the key prefix
      environment: 'test_mode',
    });

    let businessName = "Verified Business";


    try {
      // 3. The SDK Handshake (Validation)
      // Access the .items array from the response
      const brands = await client.brands.list();
      
      if (brands.items && brands.items.length > 0) {
        // Grab the name from the first item in the list
        businessName = brands.items[0].name ?? "Verified Business"
      }
    } catch (sdkError: any) {
      console.error("Dodo SDK Validation Failed:", sdkError.message);
      return NextResponse.json(
        { error: 'Invalid Dodo API Key. Please check your key and try again.' },
        { status: 401 }
      );
    }

    // 4. Encrypt API Key for Security
    const encryptedKey = encrypt(apiKey);

    // 5. Save to DB via Prisma
    // This creates the "Project" which ties the Dodo account to your yield engine
    const project = await prisma.project.create({
      data: {
        projectName,
        encryptedApiKey: encryptedKey,
        yieldPercentage: yieldPercentage || 20, // Defaults to 20% if not provided
      },
    });

    console.log(`✅ Project created: ${project.id} for business: ${businessName}`);

    // 6. Return success to the Dashboard
    return NextResponse.json({
      success: true,
      businessName: businessName,
      projectId: project.id,
      // You can now use this projectId in your frontend to navigate to the next step
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