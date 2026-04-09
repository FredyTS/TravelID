import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { PublicQuoteRequestForm } from "@/features/quotes/components/public-quote-request-form";

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedPackage = typeof params.package === "string" ? params.package : "";

  return (
    <div className="container-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
        <SectionHeading
          eyebrow="Solicitud de cotizacion"
          title="Solicita una cotizacion personalizada"
          description="Usa este flujo cuando el paquete publicado no encaja exactamente con tus viajeros, fechas o condiciones deseadas."
        />
        <Card className="surface border-0">
          <CardContent className="p-7">
            <PublicQuoteRequestForm selectedPackage={selectedPackage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
