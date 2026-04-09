"use server";

import {
  DiscountType,
  PromotionAppliesTo,
  TravelType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { toSlug } from "@/lib/utils";

function valueOrNull(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return String(value ?? "") === "on";
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseJsonStringArray(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized;
}

export async function saveDestinationAction(formData: FormData) {
  const id = valueOrNull(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = valueOrNull(formData.get("slug"));

  if (!name) {
    throw new Error("El destino necesita nombre.");
  }

  const data = {
    name,
    slug: toSlug(slugInput ?? name),
    country: String(formData.get("country") ?? "Mexico").trim(),
    region: valueOrNull(formData.get("region")),
    description: valueOrNull(formData.get("description")),
    heroImageUrl: valueOrNull(formData.get("heroImageUrl")),
    seoTitle: valueOrNull(formData.get("seoTitle")),
    seoDescription: valueOrNull(formData.get("seoDescription")),
    isActive: parseBoolean(formData.get("isActive")),
  };

  if (id) {
    await prisma.destination.update({
      where: { id },
      data,
    });
  } else {
    await prisma.destination.create({ data });
  }

  revalidatePath("/admin/destinations");
  revalidatePath("/admin/packages");
  revalidatePath("/paquetes");
  revalidatePath("/");
}

export async function toggleDestinationActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const current = String(formData.get("current") ?? "") === "true";

  await prisma.destination.update({
    where: { id },
    data: {
      isActive: !current,
    },
  });

  revalidatePath("/admin/destinations");
  revalidatePath("/paquetes");
}

export async function saveHotelAction(formData: FormData) {
  const id = valueOrNull(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const destinationId = String(formData.get("destinationId") ?? "");

  if (!name || !destinationId) {
    throw new Error("El hotel necesita nombre y destino.");
  }

  const data = {
    name,
    slug: toSlug(valueOrNull(formData.get("slug")) ?? name),
    destinationId,
    category: valueOrNull(formData.get("category")),
    address: valueOrNull(formData.get("address")),
    description: valueOrNull(formData.get("description")),
    isActive: parseBoolean(formData.get("isActive")),
    amenities: parseJsonStringArray(formData.get("amenities")),
  };

  if (id) {
    await prisma.hotel.update({
      where: { id },
      data,
    });
  } else {
    await prisma.hotel.create({ data });
  }

  revalidatePath("/admin/hotels");
  revalidatePath("/admin/packages");
}

export async function toggleHotelActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const current = String(formData.get("current") ?? "") === "true";

  await prisma.hotel.update({
    where: { id },
    data: {
      isActive: !current,
    },
  });

  revalidatePath("/admin/hotels");
  revalidatePath("/admin/packages");
}

export async function savePackageAction(formData: FormData) {
  const id = valueOrNull(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const destinationId = String(formData.get("destinationId") ?? "");

  if (!name || !destinationId) {
    throw new Error("El paquete necesita nombre y destino.");
  }

  const data = {
    name,
    slug: toSlug(valueOrNull(formData.get("slug")) ?? name),
    destinationId,
    hotelId: valueOrNull(formData.get("hotelId")),
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    locationLabel: valueOrNull(formData.get("locationLabel")),
    heroImageUrl: valueOrNull(formData.get("heroImageUrl")),
    galleryUrls: parseJsonStringArray(formData.get("galleryUrls")),
    marketingTags: parseJsonStringArray(formData.get("marketingTags")),
    highlight: valueOrNull(formData.get("highlight")),
    durationDays: parseNumber(formData.get("durationDays"), 5),
    durationNights: parseNumber(formData.get("durationNights"), 4),
    travelType: String(formData.get("travelType") ?? "BEACH") as TravelType,
    basePriceFrom: parseNumber(formData.get("basePriceFrom"), 0),
    minTravelers: parseNumber(formData.get("minTravelers"), 1),
    maxTravelers: valueOrNull(formData.get("maxTravelers"))
      ? parseNumber(formData.get("maxTravelers"), 1)
      : null,
    includedAdults: parseNumber(formData.get("includedAdults"), 2),
    includedMinors: parseNumber(formData.get("includedMinors"), 0),
    directBookable: parseBoolean(formData.get("directBookable")),
    reservationNote: valueOrNull(formData.get("reservationNote")),
    isActive: parseBoolean(formData.get("isActive")),
    featured: parseBoolean(formData.get("featured")),
    publishedAt: parseBoolean(formData.get("isActive")) ? new Date() : null,
  };

  if (id) {
    await prisma.package.update({
      where: { id },
      data,
    });
  } else {
    await prisma.package.create({
      data: {
        ...data,
      },
    });
  }

  revalidatePath("/admin/packages");
  revalidatePath("/paquetes");
  revalidatePath("/");
  revalidatePath("/promociones");
}

export async function togglePackageFlagAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const current = String(formData.get("current") ?? "") === "true";

  if (field !== "isActive" && field !== "featured") {
    throw new Error("Flag invalido.");
  }

  await prisma.package.update({
    where: { id },
    data: {
      [field]: !current,
    },
  });

  revalidatePath("/admin/packages");
  revalidatePath("/paquetes");
  revalidatePath("/");
}

export async function savePromotionAction(formData: FormData) {
  const id = valueOrNull(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("La promocion necesita nombre.");
  }

  const data = {
    name,
    slug: toSlug(valueOrNull(formData.get("slug")) ?? name),
    description: valueOrNull(formData.get("description")),
    discountType: String(formData.get("discountType") ?? "PERCENT") as DiscountType,
    discountValue: parseNumber(formData.get("discountValue"), 0),
    appliesTo: String(formData.get("appliesTo") ?? "PACKAGE") as PromotionAppliesTo,
    packageId: valueOrNull(formData.get("packageId")),
    destinationId: valueOrNull(formData.get("destinationId")),
    code: valueOrNull(formData.get("code")),
    startsAt: new Date(String(formData.get("startsAt") ?? new Date().toISOString().slice(0, 10))),
    endsAt: new Date(String(formData.get("endsAt") ?? new Date().toISOString().slice(0, 10))),
    isPublic: parseBoolean(formData.get("isPublic")),
    isActive: parseBoolean(formData.get("isActive")),
  };

  if (id) {
    await prisma.promotion.update({
      where: { id },
      data,
    });
  } else {
    await prisma.promotion.create({ data });
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/promociones");
  revalidatePath("/");
}

export async function togglePromotionActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const current = String(formData.get("current") ?? "") === "true";

  await prisma.promotion.update({
    where: { id },
    data: {
      isActive: !current,
    },
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/promociones");
  revalidatePath("/");
}
