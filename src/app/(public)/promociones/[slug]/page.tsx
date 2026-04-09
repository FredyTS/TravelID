import { notFound } from "next/navigation";
import { getPromotionBySlug } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);

  if (!promotion) {
    notFound();
  }

  return (
    <div className="container-shell py-14">
      <div className="surface p-8">
        <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">{promotion.discountLabel}</Badge>
        <SectionHeading
          className="mt-6"
          eyebrow="Detalle comercial"
          title={promotion.title}
          description={promotion.description}
        />
        <p className="mt-6 text-sm text-slate-600">Vigencia: {promotion.validUntil}</p>
      </div>
    </div>
  );
}
