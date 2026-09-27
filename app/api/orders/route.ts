import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_name, phone, address, items } = body as {
    customer_name: string;
    phone: string;
    address: string;
    items: { product_id: string; quantity: number }[];
  };

  if (!customer_name || !phone || !address || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (fetchError || !products) {
    return NextResponse.json({ error: "Could not verify products" }, { status: 500 });
  }

  let total = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) throw new Error(`Unknown product ${item.product_id}`);
    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for ${product.name}`);
    }
    total += product.price * item.quantity;
    return {
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ customer_name, phone, address, total })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  await supabase
    .from("order_items")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id)!;
    await supabase
      .from("products")
      .update({ stock: product.stock - item.quantity })
      .eq("id", item.product_id);
  }

  return NextResponse.json({ order_id: order.id, total });
}
