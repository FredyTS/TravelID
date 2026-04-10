"use client";

import { useMemo, useState } from "react";
import { PackageComponentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type EditablePackageComponent = {
  type: PackageComponentType;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  isIncluded: boolean;
  supplierId: string;
  hotelId: string;
  roomTypeId: string;
  mealPlanId: string;
  originCity: string;
  destinationCity: string;
  pricingReference: string;
  notes: string;
};

const componentTypeOptions: { value: PackageComponentType; label: string }[] = [
  { value: PackageComponentType.HOTEL, label: "Hotel" },
  { value: PackageComponentType.FLIGHT, label: "Vuelo" },
  { value: PackageComponentType.TRANSFER, label: "Traslado" },
  { value: PackageComponentType.TOUR, label: "Tour" },
  { value: PackageComponentType.INSURANCE, label: "Seguro" },
  { value: PackageComponentType.FEE, label: "Cargo" },
  { value: PackageComponentType.OTHER, label: "Otro" },
];

function createEmptyComponent(): EditablePackageComponent {
  return {
    type: PackageComponentType.OTHER,
    title: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    currency: "MXN",
    isIncluded: true,
    supplierId: "",
    hotelId: "",
    roomTypeId: "",
    mealPlanId: "",
    originCity: "",
    destinationCity: "",
    pricingReference: "",
    notes: "",
  };
}

function normalizeInitialValue(
  initialValue: EditablePackageComponent[] | null | undefined,
): EditablePackageComponent[] {
  if (!initialValue || initialValue.length === 0) {
    return [];
  }

  return initialValue.map((component) => ({
    ...createEmptyComponent(),
    ...component,
    quantity: Number(component.quantity ?? 1) || 1,
    unitPrice: Number(component.unitPrice ?? 0) || 0,
    currency: component.currency || "MXN",
    isIncluded: component.isIncluded ?? true,
  }));
}

export function PackagePricingEditor({
  name = "componentsJson",
  initialValue,
}: {
  name?: string;
  initialValue?: EditablePackageComponent[] | null;
}) {
  const [components, setComponents] = useState<EditablePackageComponent[]>(() =>
    normalizeInitialValue(initialValue),
  );

  const serializedValue = useMemo(() => JSON.stringify(components), [components]);
  const includedTotal = useMemo(
    () =>
      components.reduce((sum, component) => {
        if (!component.isIncluded) {
          return sum;
        }

        return sum + Math.max(0, Number(component.quantity) || 0) * Math.max(0, Number(component.unitPrice) || 0);
      }, 0),
    [components],
  );

  function updateComponent(
    index: number,
    key: keyof EditablePackageComponent,
    value: string | number | boolean,
  ) {
    setComponents((current) =>
      current.map((component, currentIndex) =>
        currentIndex === index ? { ...component, [key]: value } : component,
      ),
    );
  }

  function addComponent() {
    setComponents((current) => [...current, createEmptyComponent()]);
  }

  function removeComponent(index: number) {
    setComponents((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
      <input type="hidden" name={name} value={serializedValue} readOnly />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Composicion comercial</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Agrega las partidas del paquete como si fuera una cotizacion lista para compra. El precio
            publicado y la reserva inmediata usarán este desglose cuando exista.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total incluido</p>
          <p className="text-lg font-semibold text-slate-950">{formatCurrency(includedTotal)}</p>
        </div>
      </div>

      {components.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600">
          Aun no hay cargos cargados. Si el paquete se vendera directo, conviene agregar aqui hotel, vuelos,
          cargos y cualquier concepto incluido para que el total final quede listo para compra.
        </div>
      ) : null}

      <div className="space-y-4">
        {components.map((component, index) => {
          const lineTotal = Math.max(0, Number(component.quantity) || 0) * Math.max(0, Number(component.unitPrice) || 0);

          return (
            <div key={`component-${index}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">Partida {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeComponent(index)}>
                  Quitar
                </Button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    value={component.type}
                    onChange={(event) => updateComponent(index, "type", event.target.value as PackageComponentType)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    {componentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Titulo comercial</label>
                  <Input
                    value={component.title}
                    onChange={(event) => updateComponent(index, "title", event.target.value)}
                    placeholder="Hotel 4 noches, vuelo redondo, traslado..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Descripcion</label>
                  <Textarea
                    rows={2}
                    value={component.description}
                    onChange={(event) => updateComponent(index, "description", event.target.value)}
                    placeholder="Habitacion Junior Suite, salida desde CDMX, equipaje incluido, etc."
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cantidad</label>
                  <Input
                    type="number"
                    min={1}
                    value={component.quantity}
                    onChange={(event) => updateComponent(index, "quantity", Number(event.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Precio unitario</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={component.unitPrice}
                    onChange={(event) => updateComponent(index, "unitPrice", Number(event.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Moneda</label>
                  <Input
                    value={component.currency}
                    onChange={(event) => updateComponent(index, "currency", event.target.value.toUpperCase())}
                    placeholder="MXN"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Importe</p>
                  <p className="text-sm font-semibold text-slate-950">{formatCurrency(lineTotal)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ciudad origen</label>
                  <Input
                    value={component.originCity}
                    onChange={(event) => updateComponent(index, "originCity", event.target.value)}
                    placeholder="Ciudad de Mexico"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ciudad destino</label>
                  <Input
                    value={component.destinationCity}
                    onChange={(event) => updateComponent(index, "destinationCity", event.target.value)}
                    placeholder="Cancun"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Referencia comercial</label>
                  <Input
                    value={component.pricingReference}
                    onChange={(event) => updateComponent(index, "pricingReference", event.target.value)}
                    placeholder="Tarifa AI abril 2026"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Notas internas</label>
                  <Input
                    value={component.notes}
                    onChange={(event) => updateComponent(index, "notes", event.target.value)}
                    placeholder="Impuesto ambiental pagadero en destino"
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={component.isIncluded}
                  onChange={(event) => updateComponent(index, "isIncluded", event.target.checked)}
                />
                Incluir este cargo en el precio final publicado
              </label>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={addComponent}>
        Agregar partida
      </Button>
    </div>
  );
}
