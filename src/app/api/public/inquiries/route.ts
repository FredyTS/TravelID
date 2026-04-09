import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const inquirySchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().default("website"),
  channel: z.string().default("website"),
  notes: z.string().optional(),
  packageSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const data = inquirySchema.parse(json);

  try {
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        source: data.source,
        interestSummary: data.notes,
      },
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        type: "CONTACT",
        channel: data.channel,
        notes: data.notes,
        leadId: lead.id,
      },
    });

    return NextResponse.json({ ok: true, leadId: lead.id, inquiryId: inquiry.id });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No fue posible guardar la solicitud en este momento." },
      { status: 500 },
    );
  }
}
