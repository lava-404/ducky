// app/api/products/create/route.ts

import DodoPayments from "dodopayments";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_");
}

export async function POST(req: Request) {
  console.log("\n🟡 ===== CREATE PRODUCT START =====");

  try {
    // 🧠 0. Parse request
    const body = await req.json();
    console.log("📥 Incoming body:", body);

    const { projectId, name, slug, amount, currency, interval } = body;

    // 🧠 1. Validation
    console.log("🔍 Step 1: Validation");

    if (!projectId || !name || !amount || !currency || !interval) {
      console.log("❌ Missing required fields");
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return Response.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // 🧠 2. Fetch project
    console.log("🔍 Step 2: Fetch project");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.log("❌ Project not found:", projectId);
      return Response.json(
        { error: "Invalid projectId" },
        { status: 404 }
      );
    }

    console.log("✅ Project found:", {
      id: project.id,
      name: project.projectName,
    });

    // 🧠 3. Slug handling
    console.log("🔍 Step 3: Slug generation");

    let finalSlug = slug ? slug : generateSlug(name);
    finalSlug = finalSlug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    console.log("📌 Final slug:", finalSlug);

    const existing = await prisma.product.findFirst({
      where: {
        projectId,
        slug: finalSlug,
      },
    });

    if (existing) {
      console.log("❌ Slug already exists:", finalSlug);
      return Response.json(
        { error: "Slug already exists for this project" },
        { status: 400 }
      );
    }

    console.log("✅ Slug is unique");

    // 🧠 4. Decrypt API key
    console.log("🔍 Step 4: Decrypt API key");

    const decryptedKey = decrypt(project.encryptedApiKey)?.trim();

    console.log("🔑 Decrypted key preview:", decryptedKey?.slice(0, 10) + "...");

    if (!decryptedKey) {
      console.log("❌ Decryption failed");
      throw new Error("Failed to decrypt API key");
    }

    const environment = decryptedKey.startsWith("live_")
      ? "live_mode"
      : "test_mode";

    console.log("🌍 Environment:", environment);

    // 🧠 5. Initialize Dodo
    console.log("🔍 Step 5: Initialize Dodo client");

    const dodo = new DodoPayments({
      bearerToken: decryptedKey,
      environment,
    });

    console.log("✅ Dodo client initialized");

    // 🧠 6. Build price object
   // 🧠 6. Build price object (FINAL FIX)
console.log("🔍 Step 6: Build price object");

type DodoInterval = "Day" | "Week" | "Month" | "Year";

function mapInterval(interval: string): DodoInterval {
  switch (interval) {
    case "day": return "Day";
    case "week": return "Week";
    case "month": return "Month";
    case "year": return "Year";
    default: throw new Error(`Invalid interval: ${interval}`);
  }
}

const isOneTime = interval === "one_time";

const price = isOneTime
  ? {
      currency,
      price: amount * 100,
      type: "one_time_price" as const,

      // ✅ REQUIRED by Dodo types
      discount: 0,
      purchasing_power_parity: false,
    }
  : {
      currency,
      price: amount * 100,
      type: "recurring_price" as const,

      // ✅ REQUIRED by Dodo types
      discount: 0,
      purchasing_power_parity: false,

      payment_frequency_count: 1,
      payment_frequency_interval: mapInterval(interval), // ✅ FIXED

      subscription_period_count: 1,
      subscription_period_interval: mapInterval(interval), // ✅ FIXED
    };

console.log("💰 Price object:", price);

    // 🧠 7. Create product in Dodo
    console.log("🔍 Step 7: Creating product in Dodo...");

    const product = await dodo.products.create({
      name,
      description: `Managed by YourTool for ${project.projectName}`,
      price,
      tax_category: "digital_products",
    });

    console.log("✅ Dodo product created:", product);

    // 🧠 8. Store in DB
    console.log("🔍 Step 8: Saving to DB");

    const newProduct = await prisma.product.create({
      data: {
        projectId,
        dodoProductId: product.product_id,
        name,
        slug: finalSlug,
      },
    });

    console.log("✅ Saved in DB:", newProduct);

    // 🧠 9. Return response
    console.log("🟢 SUCCESS: Product created end-to-end");
    console.log("🟡 ===== CREATE PRODUCT END =====\n");

    return Response.json({
      success: true,
      productId: newProduct.id,
    });

  } catch (e: any) {
    console.log("🔴 ERROR OCCURRED");
    console.error("❌ FULL ERROR:", e);
    console.log("🟡 ===== CREATE PRODUCT FAILED =====\n");

    return Response.json(
      { error: e?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}