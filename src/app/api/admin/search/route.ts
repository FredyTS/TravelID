import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  return NextResponse.json({
    ok: true,
    query: q,
    results: [
      { type: "customer", id: "demo-customer", label: "Maria Rojas" },
      { type: "quote", id: "Q-2026-001", label: "Cotizacion Cancun" },
      { type: "order", id: "ORD-2026-001", label: "Pedido Riviera Maya" },
    ],
  });
}
