"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PackageOption = {
  slug: string;
  name: string;
  destination: string;
  hotelName: string;
  supplierName: string;
  mealPlanName: string;
  roomTypeName: string;
};

type HotelOption = {
  id: string;
  name: string;
  destination: string;
  supplierName: string;
  legacyHotelCode: string;
  heroImageUrl: string;
  mealPlans: { id: string; name: string }[];
  roomTypes: { id: string; name: string; mealPlanId: string }[];
};

type SupplierOption = {
  id: string;
  code: string;
  name: string;
};

type MealPlanOption = {
  id: string;
  name: string;
};

const defaultFlightsJson = JSON.stringify(
  {
    baggageLabel: "Tarifa con articulo personal y equipaje de mano",
    personalItemLabel: "1 articulo personal",
    carryOnLabel: "10 kg de mano",
    segments: [
      {
        origin: "Ciudad de Mexico",
        destination: "Cancun",
        departureDate: "2026-08-12",
        departureTime: "08:30",
        arrivalTime: "10:45",
        type: "Vuelo directo",
      },
      {
        origin: "Cancun",
        destination: "Ciudad de Mexico",
        departureDate: "2026-08-16",
        departureTime: "18:40",
        arrivalTime: "21:05",
        type: "Vuelo directo",
      },
    ],
  },
  null,
  2,
);

const defaultTransferJson = JSON.stringify(
  {
    airport: "Aeropuerto Internacional de Cancun",
    adults: 2,
    minors: 0,
    service: "Servicio privado redondo",
    hotels: [
      {
        name: "Hotel Cancun Resort",
        price: "$1,250 MXN",
      },
    ],
  },
  null,
  2,
);

function findMealPlanName(mealPlanOptions: MealPlanOption[], mealPlanId: string) {
  return mealPlanOptions.find((mealPlan) => mealPlan.id === mealPlanId)?.name ?? "";
}

function findSupplierName(supplierOptions: SupplierOption[], supplierId: string) {
  return supplierOptions.find((supplier) => supplier.id === supplierId)?.name ?? "";
}

export function AdminQuoteForm({
  packageOptions,
  hotelOptions,
  supplierOptions,
  mealPlanOptions,
}: {
  packageOptions: PackageOption[];
  hotelOptions: HotelOption[];
  supplierOptions: SupplierOption[];
  mealPlanOptions: MealPlanOption[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedHotelId, setSelectedHotelId] = useState(hotelOptions[0]?.id ?? "");
  const [selectedMealPlanId, setSelectedMealPlanId] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState(supplierOptions[0]?.id ?? "");
  const [selectedPackageSlug, setSelectedPackageSlug] = useState("");

  const effectiveSelectedHotelId = selectedHotelId || hotelOptions[0]?.id || "";
  const selectedHotel = hotelOptions.find((hotel) => hotel.id === effectiveSelectedHotelId) ?? hotelOptions[0];
  const currentMealPlans = selectedHotel?.mealPlans ?? [];
  const currentRoomTypes = selectedHotel?.roomTypes ?? [];
  const effectiveSelectedMealPlanId =
    currentMealPlans.find((mealPlan) => mealPlan.id === selectedMealPlanId)?.id ?? currentMealPlans[0]?.id ?? "";
  const effectiveSelectedRoomTypeId =
    currentRoomTypes.find((roomType) => roomType.id === selectedRoomTypeId)?.id ?? currentRoomTypes[0]?.id ?? "";
  const effectiveSelectedSupplierId = selectedSupplierId || supplierOptions[0]?.id || "";

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      try {
        const adults = Number(formData.get("adults") ?? 2);
        const minors = Number(formData.get("minors") ?? 0);
        const destination = String(formData.get("destination") ?? "");
        const checkIn = String(formData.get("checkIn") ?? "");
        const checkOut = String(formData.get("checkOut") ?? "");
        const flightsRaw = String(formData.get("flightsJson") ?? "").trim();
        const transferRaw = String(formData.get("transferJson") ?? "").trim();
        const supplierCode = String(formData.get("supplierCode") ?? "");
        const supplierName = String(formData.get("supplierName") ?? "");
        const hotelName = String(formData.get("hotelName") ?? "");
        const hotelCode = String(formData.get("hotelCode") ?? "");
        const hotelImage = String(formData.get("hotelImage") ?? "");
        const mealPlanName = String(formData.get("mealPlanName") ?? "");
        const roomTypeName = String(formData.get("roomTypeName") ?? "");

        const payload = {
          customerName: String(formData.get("customerName") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          title: String(formData.get("title") ?? ""),
          packageSlug: String(formData.get("packageSlug") ?? ""),
          originCity: String(formData.get("originCity") ?? ""),
          departureDateTentative: String(formData.get("departureDateTentative") ?? ""),
          adults,
          minors,
          subtotal: Number(formData.get("subtotal") ?? 0),
          discountTotal: Number(formData.get("discountTotal") ?? 0),
          depositRequired: Number(formData.get("depositRequired") ?? 0),
          validUntil: String(formData.get("validUntil") ?? ""),
          customerNotes: String(formData.get("customerNotes") ?? ""),
          proposalData: {
            clientName: String(formData.get("customerName") ?? ""),
            clientPhone: String(formData.get("phone") ?? ""),
            destination,
            checkIn,
            checkOut,
            nights: Number(formData.get("nights") ?? 1),
            adults,
            minors,
            minorAges: String(formData.get("minorAges") ?? ""),
            generatedAt: new Date().toLocaleDateString("es-MX"),
            footerNote: String(formData.get("footerNote") ?? ""),
            hotels: [
              {
                supplierCode,
                supplierName,
                name: hotelName,
                code: hotelCode,
                image: hotelImage,
                mealPlan: mealPlanName,
                roomType: roomTypeName,
                depositDueDate: String(formData.get("hotelDepositDueDate") ?? ""),
                depositAmount: String(formData.get("hotelDepositAmount") ?? ""),
                balanceDueDate: String(formData.get("hotelBalanceDueDate") ?? ""),
                balanceAmount: String(formData.get("hotelBalanceAmount") ?? ""),
                pricePerNight: String(formData.get("hotelPricePerNight") ?? ""),
                total: String(formData.get("hotelTotal") ?? ""),
                legend: String(formData.get("hotelLegend") ?? ""),
                note: String(formData.get("hotelNote") ?? ""),
              },
            ],
            flights: flightsRaw ? JSON.parse(flightsRaw) : null,
            transfer: transferRaw ? JSON.parse(transferRaw) : null,
          },
          quoteItems: [
            {
              itemType: "HOTEL",
              title: hotelName,
              description: `${destination} · ${roomTypeName} · ${mealPlanName}`,
              unitPrice: Number(formData.get("subtotal") ?? 0),
              quantity: 1,
              lineTotal: Number(formData.get("subtotal") ?? 0),
              currency: "MXN",
              metadata: {
                supplierCode,
                supplierName,
                hotelCode,
                hotelName,
                mealPlanName,
                roomTypeName,
                checkIn,
                checkOut,
                adults,
                minors,
              },
            },
          ],
        };

        const response = await fetch("/api/admin/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          setMessage(result.message ?? "No fue posible crear la cotizacion.");
          return;
        }

        router.push(`/admin/quotes/${result.quote.id}`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Revisa vuelos o traslados antes de guardar.");
      }
    });
  }

  const packageSummary = packageOptions.find((travelPackage) => travelPackage.slug === selectedPackageSlug);
  const currentRoomType = currentRoomTypes.find((roomType) => roomType.id === effectiveSelectedRoomTypeId);

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-title" className="text-sm font-medium text-slate-700">
          Titulo interno de la cotizacion
        </label>
        <Input id="admin-quote-title" name="title" placeholder="Ej. Verano en Cancun para familia Terry" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-quote-customer" className="text-sm font-medium text-slate-700">
          Nombre del cliente
        </label>
        <Input id="admin-quote-customer" name="customerName" placeholder="Nombre del cliente" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-email" className="text-sm font-medium text-slate-700">
          Correo del cliente
        </label>
        <Input id="admin-quote-email" name="email" placeholder="Correo del cliente" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-phone" className="text-sm font-medium text-slate-700">
          Telefono o WhatsApp
        </label>
        <Input id="admin-quote-phone" name="phone" placeholder="Telefono / WhatsApp" />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-package" className="text-sm font-medium text-slate-700">
          Paquete comercial de referencia
        </label>
        <select
          id="admin-quote-package"
          name="packageSlug"
          value={selectedPackageSlug}
          onChange={(event) => setSelectedPackageSlug(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
        >
          <option value="">Cotizacion manual / sin paquete base</option>
          {packageOptions.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} · {pkg.destination}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Datos del viaje</p>
        <p className="mt-1 text-xs text-slate-500">Aterriza la propuesta comercial y la ocupacion exacta antes de guardar la cotizacion.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="admin-quote-destination" className="text-sm font-medium text-slate-700">
              Destino cotizado
            </label>
            <Input
              id="admin-quote-destination"
              name="destination"
              placeholder="Destino cotizado"
              defaultValue={packageSummary?.destination ?? selectedHotel?.destination ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-origin" className="text-sm font-medium text-slate-700">
              Ciudad de origen / salida
            </label>
            <Input id="admin-quote-origin" name="originCity" placeholder="Ciudad de origen" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-departure" className="text-sm font-medium text-slate-700">
              Fecha tentativa de salida
            </label>
            <Input id="admin-quote-departure" name="departureDateTentative" type="date" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-valid-until" className="text-sm font-medium text-slate-700">
              Vigencia de la cotizacion
            </label>
            <Input id="admin-quote-valid-until" name="validUntil" type="date" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-checkin" className="text-sm font-medium text-slate-700">
              Check-in
            </label>
            <Input id="admin-quote-checkin" name="checkIn" type="date" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-checkout" className="text-sm font-medium text-slate-700">
              Check-out
            </label>
            <Input id="admin-quote-checkout" name="checkOut" type="date" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-nights" className="text-sm font-medium text-slate-700">
              Numero de noches
            </label>
            <Input id="admin-quote-nights" name="nights" type="number" defaultValue={4} min={1} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-adults" className="text-sm font-medium text-slate-700">
              Adultos
            </label>
            <Input id="admin-quote-adults" name="adults" type="number" defaultValue={2} min={1} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minors" className="text-sm font-medium text-slate-700">
              Menores
            </label>
            <Input id="admin-quote-minors" name="minors" type="number" defaultValue={0} min={0} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minor-ages" className="text-sm font-medium text-slate-700">
              Edades de menores
            </label>
            <Input id="admin-quote-minor-ages" name="minorAges" placeholder="Ej. 5, 8" />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Hotel, proveedor y configuracion base</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Hotel</label>
            <select
              name="hotelId"
              value={effectiveSelectedHotelId}
              onChange={(event) => {
                const nextHotel = hotelOptions.find((hotel) => hotel.id === event.target.value);
                setSelectedHotelId(event.target.value);
                setSelectedMealPlanId(nextHotel?.mealPlans[0]?.id ?? "");
                setSelectedRoomTypeId(nextHotel?.roomTypes[0]?.id ?? "");
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {hotelOptions.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} · {hotel.destination}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Proveedor</label>
            <select
              name="supplierId"
              value={effectiveSelectedSupplierId}
              onChange={(event) => setSelectedSupplierId(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {supplierOptions.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.code ? ` · ${supplier.code}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Plan de alimentos</label>
            <select
              name="mealPlanId"
              value={effectiveSelectedMealPlanId}
              onChange={(event) => setSelectedMealPlanId(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {currentMealPlans.map((mealPlan) => (
                <option key={mealPlan.id} value={mealPlan.id}>
                  {mealPlan.name}
                </option>
              ))}
              {currentMealPlans.length === 0 &&
                mealPlanOptions.map((mealPlan) => (
                  <option key={mealPlan.id} value={mealPlan.id}>
                    {mealPlan.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tipo de habitacion</label>
            <select
              name="roomTypeId"
              value={effectiveSelectedRoomTypeId}
              onChange={(event) => setSelectedRoomTypeId(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {currentRoomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Codigo hotel</label>
            <Input name="hotelCode" defaultValue={selectedHotel?.legacyHotelCode ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Imagen para propuesta</label>
            <Input name="hotelImage" defaultValue={selectedHotel?.heroImageUrl ?? ""} />
          </div>
        </div>

        <input type="hidden" name="supplierCode" value={supplierOptions.find((supplier) => supplier.id === effectiveSelectedSupplierId)?.code ?? ""} />
        <input type="hidden" name="supplierName" value={findSupplierName(supplierOptions, effectiveSelectedSupplierId)} />
        <input type="hidden" name="hotelName" value={selectedHotel?.name ?? ""} />
        <input type="hidden" name="mealPlanName" value={findMealPlanName(mealPlanOptions, effectiveSelectedMealPlanId)} />
        <input type="hidden" name="roomTypeName" value={currentRoomType?.name ?? ""} />
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Condiciones hoteleras y pagos</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Subtotal cotizado</label>
            <Input name="subtotal" type="number" defaultValue={9990} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descuento aplicado</label>
            <Input name="discountTotal" type="number" defaultValue={0} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Anticipo requerido</label>
            <Input name="depositRequired" type="number" defaultValue={3500} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha limite anticipo</label>
            <Input name="hotelDepositDueDate" type="date" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Monto anticipo</label>
            <Input name="hotelDepositAmount" placeholder="$3,500 MXN" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Precio por noche</label>
            <Input name="hotelPricePerNight" placeholder="$3,247 MXN" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha liquidacion</label>
            <Input name="hotelBalanceDueDate" type="date" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Monto saldo</label>
            <Input name="hotelBalanceAmount" placeholder="$9,490 MXN" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Total hotel</label>
            <Input name="hotelTotal" placeholder="$12,990 MXN" required />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Leyenda comercial</label>
            <Textarea name="hotelLegend" rows={3} placeholder="Pago inmediato, no acepta cambios ni cancelaciones." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nota visible</label>
            <Textarea name="hotelNote" rows={3} placeholder="Incluye hospedaje, alimentos, amenidades y asistencia previa al viaje." />
          </div>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-notes" className="text-sm font-medium text-slate-700">
          Notas visibles al cliente
        </label>
        <Textarea id="admin-quote-notes" name="customerNotes" rows={4} placeholder="Notas visibles al cliente" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-footer" className="text-sm font-medium text-slate-700">
          Leyenda legal o nota al pie
        </label>
        <Textarea
          id="admin-quote-footer"
          name="footerNote"
          rows={2}
          defaultValue="*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso."
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-flights-json" className="text-sm font-medium text-slate-700">
          Bloque JSON de vuelos
        </label>
        <Textarea
          id="admin-quote-flights-json"
          name="flightsJson"
          className="min-h-60 font-mono text-xs"
          defaultValue={defaultFlightsJson}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-transfer-json" className="text-sm font-medium text-slate-700">
          Bloque JSON de traslados
        </label>
        <Textarea
          id="admin-quote-transfer-json"
          name="transferJson"
          className="min-h-48 font-mono text-xs"
          defaultValue={defaultTransferJson}
        />
      </div>
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creando cotizacion...
          </>
        ) : (
          "Crear cotizacion con propuesta"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-amber-600">{message}</p> : null}
    </form>
  );
}
