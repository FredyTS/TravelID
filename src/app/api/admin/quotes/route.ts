import { PackageComponentType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { createAdminQuote } from "@/features/orders/server/sales-service";

const hotelProposalSchema = z.object({
  supplierCode: z.string().optional(),
  supplierName: z.string().optional(),
  name: z.string().min(2),
  code: z.string().optional(),
  image: z.string().url().optional(),
  mealPlan: z.string().min(2),
  roomType: z.string().min(2),
  depositDueDate: z.string().optional(),
  depositAmount: z.string().optional(),
  balanceDueDate: z.string().optional(),
  balanceAmount: z.string().optional(),
  pricePerNight: z.string().optional(),
  total: z.string().min(1),
  legend: z.string().optional(),
  note: z.string().optional(),
});

const flightSegmentSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureDate: z.string().min(2),
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
  type: z.string().min(1),
});

const flightProposalSchema = z.object({
  baggageLabel: z.string().min(1),
  personalItemLabel: z.string().optional(),
  carryOnLabel: z.string().optional(),
  segments: z.array(flightSegmentSchema).default([]),
});

const transferProposalSchema = z.object({
  airport: z.string().min(2),
  adults: z.number().int().min(0),
  minors: z.number().int().min(0),
  service: z.string().min(2),
  hotels: z
    .array(
      z.object({
        name: z.string().min(2),
        price: z.string().min(1),
      }),
    )
    .default([]),
});

const quoteProposalSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().optional(),
  destination: z.string().min(2),
  checkIn: z.string().min(2),
  checkOut: z.string().min(2),
  nights: z.number().int().min(1),
  adults: z.number().int().min(1),
  minors: z.number().int().min(0),
  minorAges: z.string().optional(),
  generatedAt: z.string().min(2),
  footerNote: z.string().optional(),
  hotels: z.array(hotelProposalSchema).default([]),
  flights: flightProposalSchema.nullable().optional(),
  transfer: transferProposalSchema.nullable().optional(),
});

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
  proposalData: quoteProposalSchema.optional(),
  quoteItems: z
    .array(
      z.object({
        itemType: z.nativeEnum(PackageComponentType),
        title: z.string().min(2),
        description: z.string().optional(),
        unitPrice: z.number().nonnegative(),
        quantity: z.number().int().min(1),
        lineTotal: z.number().nonnegative(),
        currency: z.string().min(3).optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    )
    .optional(),
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
