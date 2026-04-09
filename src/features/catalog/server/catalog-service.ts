import { marketingPackages, promotions } from "@/lib/constants/mock-data";

export async function getFeaturedPackages() {
  return marketingPackages.filter((item) => item.featured);
}

export async function getCatalogPackages(filters?: {
  destination?: string;
  travelType?: string;
  q?: string;
}) {
  return marketingPackages.filter((item) => {
    if (filters?.destination && item.destination !== filters.destination) {
      return false;
    }

    if (filters?.travelType && item.travelType !== filters.travelType) {
      return false;
    }

    if (filters?.q) {
      const needle = filters.q.toLowerCase();
      return [item.name, item.destination, item.summary].some((part) =>
        part.toLowerCase().includes(needle),
      );
    }

    return true;
  });
}

export async function getPackageBySlug(slug: string) {
  return marketingPackages.find((item) => item.slug === slug) ?? null;
}

export async function getPromotions() {
  return promotions;
}

export async function getPromotionBySlug(slug: string) {
  return promotions.find((item) => item.slug === slug) ?? null;
}
