import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="container-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos del viaje ideal o de la operacion del cliente"
          description="Formulario publico base. En la siguiente iteracion se conecta al endpoint de inquiries y a activity log."
        />
        <Card className="surface border-0">
          <CardContent className="space-y-4 p-7">
            <Input placeholder="Nombre completo" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="Telefono o WhatsApp" />
            <Textarea placeholder="Cuentanos que destino o experiencia buscas" rows={6} />
            <Button className="w-full">Enviar solicitud</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
