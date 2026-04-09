import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "Que resuelve este MVP desde el dia 1?",
    answer: "Website publico, catalogo, formularios, CRM base, cotizaciones, pedidos, pagos y portal del cliente.",
  },
  {
    question: "Puedo vender viajes fuera de catalogo?",
    answer: "Si. La base incluye cotizacion manual y conversion a pedido sin depender de un paquete publico.",
  },
  {
    question: "Los clientes pueden consultar documentos y pagos?",
    answer: "Si. El portal del cliente muestra saldo, pagos, documentos y actualizaciones del viaje.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-shell py-14">
      <SectionHeading
        eyebrow="FAQ"
        title="Preguntas frecuentes del producto"
        description="Contenido placeholder para el sitio publico y base para SEO tecnico."
      />
      <div className="mt-8 grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.question} className="surface border-0">
            <CardHeader>
              <CardTitle className="text-xl">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{faq.answer}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
