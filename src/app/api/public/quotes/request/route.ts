import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSalesPackageBySlug } from "@/features/catalog/server/catalog-service";

const quoteRequestSchema = z.object({
  firstName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  packageSlug: z.string().optional(),
  originCity: z.string().optional(),
  tentativeDate: z.string().optional(),
  adults: z.number().int().min(1).default(2),
  minors: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const data = quoteRequestSchema.parse(json);
  const matchedPackage = data.packageSlug
    ? await getSalesPackageBySlug(data.packageSlug)
    : null;

  try {
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        source: "quote-form",
        interestSummary: data.notes,
      },
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        leadId: lead.id,
        type: "QUOTE_REQUEST",
        channel: "website",
        packageId: matchedPackage?.id,
        originCity: data.originCity,
        tentativeDate: data.tentativeDate ? new Date(data.tentativeDate) : undefined,
        adults: data.adults,
        minors: data.minors,
        notes: matchedPackage
          ? `${data.notes ?? ""}\nPaquete base: ${matchedPackage.name}`.trim()
          : data.notes,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Solicitud registrada. El equipo puede convertirla a quote desde el admin.",
      inquiryId: inquiry.id,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No fue posible registrar la solicitud." },
      { status: 500 },
    );
  }
}
