// app/api/products/create/route.ts
import DodoPayments from "dodopayments";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { projectId, name, amount, currency, interval } = await req.json();

  // 1. Get founder's key
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const dodo = new DodoPayments({ bearerToken: decrypt(project.encryptedApiKey) });

  try {
    // 2. Create the product on Dodo
    const product = await dodo.products.create({
      name: name,
      description: `Managed by YourTool for ${project.name}`,
      price_model: interval === 'one_time' ? 'one_time' : 'subscription',
      // Dodo expects amounts in cents (e.g., $10 = 1000)
      price: amount * 100, 
      currency: currency,
      recurring: interval !== 'one_time' ? { interval: interval } : undefined,
    });

    // 3. Save the NEW Dodo Product ID to YOUR database
    await prisma.product.create({
      data: {
        projectId: projectId,
        dodoProductId: product.id, // This is the ID the SDK will use!
        name: name,
      }
    });

    return Response.json({ success: true, productId: product.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}