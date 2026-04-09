import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
          title="Captura el contexto comercial desde el sitio publico"
          description="Base del formulario para transformar visitas en inquiries, leads y cotizaciones."
        />
        <Card className="surface border-0">
          <CardContent className="grid gap-4 p-7 md:grid-cols-2">
            <Input placeholder="Nombre completo" className="md:col-span-2" />
            <Input placeholder="Correo electronico" type="email" />
            <Input placeholder="Telefono / WhatsApp" />
            <Input placeholder="Ciudad de origen" />
            <Input placeholder="Fecha tentativa" type="date" />
            <Input defaultValue={selectedPackage} placeholder="Paquete seleccionado" className="md:col-span-2" />
            <Input placeholder="Numero de adultos" type="number" />
            <Input placeholder="Numero de menores" type="number" />
            <Textarea className="md:col-span-2" placeholder="Detalles adicionales, presupuesto o preferencias" rows={5} />
            <Button className="md:col-span-2">Solicitar cotizacion</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
