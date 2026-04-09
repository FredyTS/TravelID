import Link from "next/link";
import { getPromotions } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PromotionsPage() {
  const currentPromotions = await getPromotions();

  return (
    <div className="container-shell py-14">
      <SectionHeading
        eyebrow="Promociones"
        title="Promociones vigentes para apartar mejor tu viaje"
        description="Revisa campañas activas, descuentos por temporada y condiciones comerciales para reservar con mejores términos."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {currentPromotions.map((promotion) => (
          <Card key={promotion.id} className="surface border-0">
            <CardHeader className="space-y-3">
              <Badge className="w-fit bg-amber-300 text-slate-950 hover:bg-amber-300">
                {promotion.discountLabel}
              </Badge>
              <CardTitle>{promotion.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>{promotion.description}</p>
              <p>Vigencia: {promotion.validUntil}</p>
              <Link href={`/promociones/${promotion.slug}`} className="font-medium text-primary">
                Ver promo
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
