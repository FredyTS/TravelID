import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getPackageOptions } from "@/features/catalog/server/catalog-service";
import { PublicQuoteRequestForm } from "@/features/quotes/components/public-quote-request-form";

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedPackage = typeof params.package === "string" ? params.package : "";
  const packageOptions = await getPackageOptions();

  return (
    <div className="container-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
        <SectionHeading
          eyebrow="Solicitud de cotizacion"
          title="Solicita una cotizacion personalizada"
          description="Usa este flujo cuando necesitas otra ciudad de salida, fechas distintas, diferente ocupación o una combinación especial de servicios."
        />
        <Card className="surface border-0">
          <CardContent className="p-7">
            <PublicQuoteRequestForm
              selectedPackage={selectedPackage}
              packageOptions={packageOptions.map((pkg) => ({
                slug: pkg.slug,
                name: pkg.name,
                destination: pkg.destination.name,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
