import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { createAdminQuote } from "@/features/orders/server/sales-service";

const adminQuoteSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  title: z.string().min(3),
  packageSlug: z.string().optional(),
  originCity: z.string().optional(),
  departureDateTentative: z.string().optional(),
  adults: z.number().int().min(1),
  minors: z.number().int().min(0),
  subtotal: z.number().nonnegative(),
  discountTotal: z.number().nonnegative().optional(),
  depositRequired: z.number().nonnegative().optional(),
  validUntil: z.string().optional(),
  customerNotes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const json = await request.json();
  const data = adminQuoteSchema.parse(json);

  const quote = await createAdminQuote({
    ...data,
    adminUserId: session.user.id,
  });

  return NextResponse.json({ ok: true, quote });
}
