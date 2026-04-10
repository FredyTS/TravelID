"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PackageComponentType, TravelType } from "@prisma/client";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  savePackageFormAction,
  type SavePackageFormState,
} from "@/features/catalog/server/admin-catalog-actions";
import { PackagePricingEditor } from "@/features/catalog/components/package-pricing-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const travelTypeOptions: { value: TravelType; label: string }[] = [
  { value: "BEACH", label: "Playa" },
  { value: "CITY", label: "Ciudad" },
  { value: "ADVENTURE", label: "Aventura" },
  { value: "HONEYMOON", label: "Luna de miel" },
  { value: "FAMILY", label: "Familiar" },
  { value: "CRUISE", label: "Crucero" },
  { value: "CUSTOM", label: "Personalizado" },
];

const initialSavePackageFormState: SavePackageFormState = {
  status: "idle",
  message: "",
};

type PackageFormOption = {
  id: string;
  label: string;
};

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

type PackageFormValues = {
  id: string;
  name: string;
  slug: string;
  travelType: TravelType;
  destinationId: string;
  hotelId: string;
  supplierId: string;
  locationLabel: string;
  departureCity: string;
  mealPlanId: string;
  defaultRoomTypeId: string;
  summary: string;
  description: string;
  priceBasis: string;
  bookingConditionsSummary: string;
  heroImageUrl: string;
  highlight: string;
  galleryUrls: string;
  marketingTags: string;
  durationDays: number;
  durationNights: number;
  basePriceFrom: number;
  includedAdults: number;
  includedMinors: number;
  minTravelers: number;
  reservationNote: string;
  directBookable: boolean;
  featured: boolean;
  isActive: boolean;
  components: EditablePackageComponent[];
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando paquete..." : isEditing ? "Guardar paquete" : "Crear paquete"}
    </Button>
  );
}

export function AdminPackageForm({
  currentPackageId,
  values,
  destinations,
  hotels,
  suppliers,
  mealPlans,
  roomTypes,
}: {
  currentPackageId?: string;
  values: PackageFormValues;
  destinations: PackageFormOption[];
  hotels: PackageFormOption[];
  suppliers: PackageFormOption[];
  mealPlans: PackageFormOption[];
  roomTypes: PackageFormOption[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(savePackageFormAction, initialSavePackageFormState);
  const lastHandledAt = useRef<number>(0);
  const formKey = values.id || "new-package";

  useEffect(() => {
    if (!state.submittedAt || state.submittedAt <= lastHandledAt.current) {
      return;
    }

    lastHandledAt.current = state.submittedAt;

    if (state.status === "error") {
      toast.error(state.message);
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);

      if (state.packageId && state.packageId !== currentPackageId) {
        router.replace(`/admin/packages?edit=${state.packageId}`);
        return;
      }

      router.refresh();
    }
  }, [currentPackageId, router, state]);

  return (
    <form key={formKey} action={formAction} className="grid gap-4">
      <input type="hidden" name="id" defaultValue={values.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <Input name="name" defaultValue={values.name} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Slug</label>
          <Input name="slug" defaultValue={values.slug} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tipo de viaje</label>
          <select
            name="travelType"
            defaultValue={values.travelType}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {travelTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Destino</label>
          <select
            name="destinationId"
            defaultValue={values.destinationId}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            required
          >
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Hotel sugerido</label>
          <select
            name="hotelId"
            defaultValue={values.hotelId}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Sin hotel vinculado</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Proveedor base</label>
          <select
            name="supplierId"
            defaultValue={values.supplierId}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Sin proveedor principal</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ubicacion visible</label>
          <Input name="locationLabel" defaultValue={values.locationLabel} placeholder="Caribe Mexicano" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ciudad de salida incluida</label>
          <Input name="departureCity" defaultValue={values.departureCity} placeholder="Ciudad de Mexico" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Plan base</label>
          <select
            name="mealPlanId"
            defaultValue={values.mealPlanId}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Plan por definir</option>
            {mealPlans.map((mealPlan) => (
              <option key={mealPlan.id} value={mealPlan.id}>
                {mealPlan.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Habitacion base</label>
          <select
            name="defaultRoomTypeId"
            defaultValue={values.defaultRoomTypeId}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Habitacion por definir</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Resumen corto</label>
        <Textarea name="summary" rows={3} defaultValue={values.summary} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Descripcion</label>
        <Textarea name="description" rows={5} defaultValue={values.description} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Base de precio publicada</label>
          <Input
            name="priceBasis"
            defaultValue={values.priceBasis}
            placeholder="Tarifa publicada desde Chihuahua para 2 adultos"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Condiciones de reserva inmediata</label>
          <Input
            name="bookingConditionsSummary"
            defaultValue={values.bookingConditionsSummary}
            placeholder="Salida desde CDMX, Junior Suite, plan all inclusive"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Imagen hero</label>
          <Input name="heroImageUrl" defaultValue={values.heroImageUrl} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Highlight comercial</label>
          <Input name="highlight" defaultValue={values.highlight} placeholder="Anticipo desde..." />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Galeria</label>
          <Input name="galleryUrls" defaultValue={values.galleryUrls} placeholder="URL1, URL2, URL3" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Tags de marketing</label>
          <Input
            name="marketingTags"
            defaultValue={values.marketingTags}
            placeholder="All inclusive, Traslados, Familiar"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Dias</label>
          <Input name="durationDays" type="number" min={1} defaultValue={values.durationDays} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Noches</label>
          <Input name="durationNights" type="number" min={1} defaultValue={values.durationNights} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Precio manual de referencia</label>
          <Input name="basePriceFrom" type="number" min={0} defaultValue={values.basePriceFrom} />
          <p className="text-xs text-slate-500">
            Si capturas cargos abajo, este valor se recalcula automaticamente con la composicion comercial.
          </p>
        </div>
      </div>

      <PackagePricingEditor key={`pricing-editor-${formKey}`} initialValue={values.components} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Adultos incluidos</label>
          <Input name="includedAdults" type="number" min={1} defaultValue={values.includedAdults} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Menores incluidos</label>
          <Input name="includedMinors" type="number" min={0} defaultValue={values.includedMinors} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Minimo viajeros</label>
          <Input name="minTravelers" type="number" min={1} defaultValue={values.minTravelers} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nota de reserva</label>
        <Textarea
          name="reservationNote"
          rows={3}
          defaultValue={values.reservationNote}
          placeholder="Aclara cuando aplica el precio publicado y cuando conviene cotizar."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="directBookable" defaultChecked={values.directBookable} />
          Permite reserva inmediata
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={values.featured} />
          Destacado en home
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={values.isActive} />
          Visible en catalogo
        </label>
      </div>

      {state.status !== "idle" ? (
        <p className={`text-sm ${state.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton isEditing={Boolean(values.id)} />
    </form>
  );
}
