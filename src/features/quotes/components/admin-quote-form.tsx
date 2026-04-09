"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
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

type FlightSegmentState = {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  type: string;
};

type TransferHotelState = {
  id: string;
  name: string;
  price: string;
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^0-9.-]+/g, "");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

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
  const [nights, setNights] = useState(4);
  const [hotelPricePerNight, setHotelPricePerNight] = useState("3247");
  const [flightTotalAmount, setFlightTotalAmount] = useState("0");
  const [discountTotalInput, setDiscountTotalInput] = useState("0");
  const [depositPercentage, setDepositPercentage] = useState("30");
  const [includeFlights, setIncludeFlights] = useState(true);
  const [baggageLabel, setBaggageLabel] = useState("Tarifa con articulo personal y equipaje de mano");
  const [personalItemLabel, setPersonalItemLabel] = useState("1 articulo personal");
  const [carryOnLabel, setCarryOnLabel] = useState("10 kg de mano");
  const [flightSegments, setFlightSegments] = useState<FlightSegmentState[]>([
    {
      id: makeId("flight"),
      origin: "Ciudad de Mexico",
      destination: "Cancun",
      departureDate: "",
      departureTime: "08:30",
      arrivalTime: "10:45",
      type: "Vuelo directo",
    },
    {
      id: makeId("flight"),
      origin: "Cancun",
      destination: "Ciudad de Mexico",
      departureDate: "",
      departureTime: "18:40",
      arrivalTime: "21:05",
      type: "Vuelo directo",
    },
  ]);
  const [includeTransfer, setIncludeTransfer] = useState(true);
  const [transferAirport, setTransferAirport] = useState("Aeropuerto Internacional de Cancun");
  const [transferService, setTransferService] = useState("Servicio privado redondo");
  const [transferHotels, setTransferHotels] = useState<TransferHotelState[]>([
    {
      id: makeId("transfer"),
      name: hotelOptions[0]?.name ?? "Hotel Cancun Resort",
      price: "$1,250 MXN",
    },
  ]);

  const effectiveSelectedHotelId = selectedHotelId || hotelOptions[0]?.id || "";
  const selectedHotel = hotelOptions.find((hotel) => hotel.id === effectiveSelectedHotelId) ?? hotelOptions[0];
  const currentMealPlans = selectedHotel?.mealPlans ?? [];
  const currentRoomTypes = selectedHotel?.roomTypes ?? [];
  const effectiveSelectedMealPlanId =
    currentMealPlans.find((mealPlan) => mealPlan.id === selectedMealPlanId)?.id ?? currentMealPlans[0]?.id ?? "";
  const visibleRoomTypes = currentRoomTypes.filter(
    (roomType) => !roomType.mealPlanId || roomType.mealPlanId === effectiveSelectedMealPlanId,
  );
  const effectiveSelectedRoomTypeId =
    visibleRoomTypes.find((roomType) => roomType.id === selectedRoomTypeId)?.id ?? visibleRoomTypes[0]?.id ?? "";
  const effectiveSelectedSupplierId = selectedSupplierId || supplierOptions[0]?.id || "";
  const currentRoomType = visibleRoomTypes.find((roomType) => roomType.id === effectiveSelectedRoomTypeId);
  const packageSummary = packageOptions.find((travelPackage) => travelPackage.slug === selectedPackageSlug);

  const hotelLineTotal = parseAmount(hotelPricePerNight) * Math.max(nights, 1);
  const transferLineTotal = includeTransfer
    ? transferHotels.reduce((sum, hotel) => sum + parseAmount(hotel.price), 0)
    : 0;
  const flightLineTotal = includeFlights ? parseAmount(flightTotalAmount) : 0;
  const subtotalAmount = hotelLineTotal + flightLineTotal + transferLineTotal;
  const discountTotal = Math.min(parseAmount(discountTotalInput), subtotalAmount);
  const grandTotal = Math.max(subtotalAmount - discountTotal, 0);
  const depositPercentageValue = Math.max(Math.min(parseAmount(depositPercentage), 100), 0);
  const depositRequiredAmount = Math.round(grandTotal * (depositPercentageValue / 100));
  const balanceDueAmount = Math.max(grandTotal - depositRequiredAmount, 0);
  const hotelDepositAmount = Math.round(hotelLineTotal * (depositPercentageValue / 100));
  const hotelBalanceAmount = Math.max(hotelLineTotal - hotelDepositAmount, 0);

  function addFlightSegment() {
    setFlightSegments((current) => [
      ...current,
      {
        id: makeId("flight"),
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        type: "Vuelo directo",
      },
    ]);
  }

  function updateFlightSegment(segmentId: string, field: keyof Omit<FlightSegmentState, "id">, value: string) {
    setFlightSegments((current) =>
      current.map((segment) => (segment.id === segmentId ? { ...segment, [field]: value } : segment)),
    );
  }

  function removeFlightSegment(segmentId: string) {
    setFlightSegments((current) => current.filter((segment) => segment.id !== segmentId));
  }

  function addTransferHotel() {
    setTransferHotels((current) => [...current, { id: makeId("transfer"), name: "", price: "" }]);
  }

  function updateTransferHotel(rowId: string, field: keyof Omit<TransferHotelState, "id">, value: string) {
    setTransferHotels((current) => current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  }

  function removeTransferHotel(rowId: string) {
    setTransferHotels((current) => current.filter((row) => row.id !== rowId));
  }

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      try {
        const adults = Number(formData.get("adults") ?? 2);
        const minors = Number(formData.get("minors") ?? 0);
        const destination = String(formData.get("destination") ?? "");
        const checkIn = String(formData.get("checkIn") ?? "");
        const checkOut = String(formData.get("checkOut") ?? "");
        const supplierCode = String(formData.get("supplierCode") ?? "");
        const supplierName = String(formData.get("supplierName") ?? "");
        const hotelName = String(formData.get("hotelName") ?? "");
        const hotelCode = String(formData.get("hotelCode") ?? "");
        const hotelImage = String(formData.get("hotelImage") ?? "");
        const mealPlanName = String(formData.get("mealPlanName") ?? "");
        const roomTypeName = String(formData.get("roomTypeName") ?? "");

        const normalizedFlightSegments = includeFlights
          ? flightSegments
              .map((segment) => ({
                origin: segment.origin,
                destination: segment.destination,
                departureDate: segment.departureDate,
                departureTime: segment.departureTime,
                arrivalTime: segment.arrivalTime,
                type: segment.type,
              }))
              .filter(
              (segment) =>
                segment.origin.trim() &&
                segment.destination.trim() &&
                segment.departureDate &&
                segment.departureTime &&
                segment.arrivalTime,
            )
          : [];

        const normalizedTransferHotels = includeTransfer
          ? transferHotels
              .map((hotel) => ({
                name: hotel.name,
                price: hotel.price,
              }))
              .filter((hotel) => hotel.name.trim() && hotel.price.trim())
          : [];

        const quoteItems: Array<{
          itemType: "HOTEL" | "FLIGHT" | "TRANSFER";
          title: string;
          description?: string;
          unitPrice: number;
          quantity: number;
          lineTotal: number;
          currency: string;
          metadata?: Record<string, unknown>;
        }> = [
          {
            itemType: "HOTEL",
            title: hotelName,
            description: `${destination} · ${roomTypeName} · ${mealPlanName}`,
            unitPrice: hotelLineTotal,
            quantity: 1,
            lineTotal: hotelLineTotal,
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
              nights,
              adults,
              minors,
            },
          },
        ];

        if (includeFlights && normalizedFlightSegments.length > 0 && flightLineTotal > 0) {
          quoteItems.push({
            itemType: "FLIGHT",
            title: "Vuelos",
            description: `${normalizedFlightSegments[0]?.origin ?? ""} · ${normalizedFlightSegments[normalizedFlightSegments.length - 1]?.destination ?? ""}`.trim(),
            unitPrice: flightLineTotal,
            quantity: 1,
            lineTotal: flightLineTotal,
            currency: "MXN",
            metadata: {
              baggageLabel,
              personalItemLabel,
              carryOnLabel,
              segments: normalizedFlightSegments,
            },
          });
        }

        if (includeTransfer && normalizedTransferHotels.length > 0 && transferLineTotal > 0) {
          quoteItems.push({
            itemType: "TRANSFER",
            title: "Traslados",
            description: `${transferAirport} · ${transferService}`,
            unitPrice: transferLineTotal,
            quantity: 1,
            lineTotal: transferLineTotal,
            currency: "MXN",
            metadata: {
              airport: transferAirport,
              service: transferService,
              hotels: normalizedTransferHotels,
            },
          });
        }

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
          subtotal: subtotalAmount,
          discountTotal,
          depositRequired: depositRequiredAmount,
          depositPercentage: depositPercentageValue,
          validUntil: String(formData.get("validUntil") ?? ""),
          customerNotes: String(formData.get("customerNotes") ?? ""),
          proposalData: {
            clientName: String(formData.get("customerName") ?? ""),
            clientPhone: String(formData.get("phone") ?? ""),
            destination,
            checkIn,
            checkOut,
            nights,
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
                depositAmount: formatCurrency(hotelDepositAmount),
                balanceDueDate: String(formData.get("hotelBalanceDueDate") ?? ""),
                balanceAmount: formatCurrency(hotelBalanceAmount),
                pricePerNight: formatCurrency(parseAmount(hotelPricePerNight)),
                total: formatCurrency(hotelLineTotal),
                legend: String(formData.get("hotelLegend") ?? ""),
                note: String(formData.get("hotelNote") ?? ""),
              },
            ],
            flights:
              includeFlights && normalizedFlightSegments.length > 0
                ? { baggageLabel, personalItemLabel, carryOnLabel, segments: normalizedFlightSegments }
                : null,
            transfer:
              includeTransfer && normalizedTransferHotels.length > 0
                ? { airport: transferAirport, adults, minors, service: transferService, hotels: normalizedTransferHotels }
                : null,
          },
          quoteItems,
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
        setMessage(error instanceof Error ? error.message : "No fue posible crear la cotizacion.");
      }
    });
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-title" className="text-sm font-medium text-slate-700">
          Titulo interno de la cotizacion
        </label>
        <Input id="admin-quote-title" name="title" placeholder="Ej. Escapada familiar en Cancun · Agosto 2026" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-quote-customer" className="text-sm font-medium text-slate-700">
          Nombre del cliente
        </label>
        <Input id="admin-quote-customer" name="customerName" placeholder="Nombre completo del cliente" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-email" className="text-sm font-medium text-slate-700">
          Correo del cliente
        </label>
        <Input id="admin-quote-email" name="email" placeholder="correo@cliente.com" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-phone" className="text-sm font-medium text-slate-700">
          Telefono o WhatsApp
        </label>
        <Input id="admin-quote-phone" name="phone" placeholder="+52 614 000 0000" />
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
          <option value="">Cotizacion manual o viaje a medida</option>
          {packageOptions.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} · {pkg.destination}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Datos generales del viaje</p>
          <p className="text-xs text-slate-500">
            Define destino, ocupacion, fechas y vigencia de la propuesta antes de cargar los bloques comerciales.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="admin-quote-destination" className="text-sm font-medium text-slate-700">
              Destino cotizado
            </label>
            <Input
              id="admin-quote-destination"
              name="destination"
              placeholder="Destino principal"
              defaultValue={packageSummary?.destination ?? selectedHotel?.destination ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-origin" className="text-sm font-medium text-slate-700">
              Ciudad de salida
            </label>
            <Input id="admin-quote-origin" name="originCity" placeholder="Ej. Chihuahua" />
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
            <Input
              id="admin-quote-nights"
              name="nights"
              type="number"
              value={nights}
              min={1}
              onChange={(event) => setNights(Math.max(Number(event.target.value || 1), 1))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-adults" className="text-sm font-medium text-slate-700">
              Numero de adultos
            </label>
            <Input id="admin-quote-adults" name="adults" type="number" defaultValue={2} min={1} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minors" className="text-sm font-medium text-slate-700">
              Numero de menores
            </label>
            <Input id="admin-quote-minors" name="minors" type="number" defaultValue={0} min={0} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minor-ages" className="text-sm font-medium text-slate-700">
              Edades de menores
            </label>
            <Input id="admin-quote-minor-ages" name="minorAges" placeholder="Ej. 4, 8" />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Hotel, proveedor y configuracion comercial</p>
          <p className="text-xs text-slate-500">
            Selecciona la base operativa para que proveedor, plan, habitacion e imagen principal queden congelados en la cotizacion.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Hotel</label>
            <select
              name="hotelId"
              value={effectiveSelectedHotelId}
              onChange={(event) => {
                const nextHotel = hotelOptions.find((hotel) => hotel.id === event.target.value);
                const nextMealPlanId = nextHotel?.mealPlans[0]?.id ?? "";
                const nextRoomTypeId =
                  nextHotel?.roomTypes.find((roomType) => !roomType.mealPlanId || roomType.mealPlanId === nextMealPlanId)?.id ??
                  nextHotel?.roomTypes[0]?.id ??
                  "";

                setSelectedHotelId(event.target.value);
                setSelectedMealPlanId(nextMealPlanId);
                setSelectedRoomTypeId(nextRoomTypeId);
                setTransferHotels((current) =>
                  current.map((row, index) => (index === 0 ? { ...row, name: nextHotel?.name ?? row.name } : row)),
                );
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
              onChange={(event) => {
                const nextMealPlanId = event.target.value;
                const nextRoomTypeId =
                  currentRoomTypes.find((roomType) => !roomType.mealPlanId || roomType.mealPlanId === nextMealPlanId)?.id ?? "";
                setSelectedMealPlanId(nextMealPlanId);
                setSelectedRoomTypeId(nextRoomTypeId);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {(currentMealPlans.length > 0 ? currentMealPlans : mealPlanOptions).map((mealPlan) => (
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
              {visibleRoomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Clave o codigo del hotel</label>
            <Input name="hotelCode" defaultValue={selectedHotel?.legacyHotelCode ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">URL de imagen principal para la propuesta</label>
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
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Condiciones hoteleras y pagos</p>
          <p className="text-xs text-slate-500">
            El sistema calcula subtotal, anticipo sugerido y saldo con base en hotel, vuelos, traslados y descuento.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Precio por noche del hotel</label>
            <Input value={hotelPricePerNight} onChange={(event) => setHotelPricePerNight(event.target.value)} placeholder="3247" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descuento aplicado</label>
            <Input value={discountTotalInput} onChange={(event) => setDiscountTotalInput(event.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Porcentaje de anticipo</label>
            <Input value={depositPercentage} onChange={(event) => setDepositPercentage(event.target.value)} placeholder="30" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha limite de anticipo</label>
            <Input name="hotelDepositDueDate" type="date" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha limite de liquidacion</label>
            <Input name="hotelBalanceDueDate" type="date" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hotel</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(hotelLineTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatCurrency(parseAmount(hotelPricePerNight))} por noche</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vuelos</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(flightLineTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">{includeFlights ? "Incluidos en propuesta" : "No incluidos"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Traslados</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(transferLineTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">{includeTransfer ? "Sumados desde hoteles del traslado" : "No incluidos"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subtotal</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(subtotalAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">Antes de descuento</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Descuento</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(discountTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">Aplicado automaticamente al total</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total final</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(grandTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">Subtotal menos descuento</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Anticipo sugerido</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(depositRequiredAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">{depositPercentageValue}% del total final</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saldo pendiente</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(balanceDueAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">Total final menos anticipo</p>
          </div>
        </div>

        <input type="hidden" name="subtotal" value={subtotalAmount} />
        <input type="hidden" name="discountTotal" value={discountTotal} />
        <input type="hidden" name="depositRequired" value={depositRequiredAmount} />
        <input type="hidden" name="hotelPricePerNight" value={parseAmount(hotelPricePerNight)} />
        <input type="hidden" name="hotelTotal" value={hotelLineTotal} />
        <input type="hidden" name="hotelDepositAmount" value={hotelDepositAmount} />
        <input type="hidden" name="hotelBalanceAmount" value={hotelBalanceAmount} />
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Condiciones comerciales visibles</p>
          <p className="text-xs text-slate-500">
            Estas leyendas se integran en la propuesta PDF y en el resumen que recibe el cliente.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Leyenda comercial</label>
            <Textarea name="hotelLegend" rows={3} placeholder="Ej. Pago inmediato, no reembolsable y sujeto a disponibilidad." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nota visible para el cliente</label>
            <Textarea name="hotelNote" rows={3} placeholder="Ej. Incluye hospedaje, plan seleccionado y asistencia antes del viaje." />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Vuelos incluidos en la propuesta</p>
            <p className="text-xs text-slate-500">
              Captura cada tramo del itinerario y el sistema integra el bloque completo en la propuesta.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeFlights}
              onChange={(event) => setIncludeFlights(event.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Incluir vuelos
          </label>
        </div>

        {includeFlights ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Etiqueta de tarifa</label>
                <Input value={baggageLabel} onChange={(event) => setBaggageLabel(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Articulo personal</label>
                <Input value={personalItemLabel} onChange={(event) => setPersonalItemLabel(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Equipaje de mano</label>
                <Input value={carryOnLabel} onChange={(event) => setCarryOnLabel(event.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              {flightSegments.map((segment, index) => (
                <div key={segment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Tramo {index + 1}</p>
                    {flightSegments.length > 1 ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFlightSegment(segment.id)}>
                        <Trash2 className="size-4" />
                        Eliminar tramo
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Origen</label>
                      <Input value={segment.origin} onChange={(event) => updateFlightSegment(segment.id, "origin", event.target.value)} placeholder="Ciudad o aeropuerto de salida" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Destino</label>
                      <Input value={segment.destination} onChange={(event) => updateFlightSegment(segment.id, "destination", event.target.value)} placeholder="Ciudad o aeropuerto de llegada" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Tipo de vuelo</label>
                      <Input value={segment.type} onChange={(event) => updateFlightSegment(segment.id, "type", event.target.value)} placeholder="Ej. Vuelo directo" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Fecha</label>
                      <Input type="date" value={segment.departureDate} onChange={(event) => updateFlightSegment(segment.id, "departureDate", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Hora de salida</label>
                      <Input type="time" value={segment.departureTime} onChange={(event) => updateFlightSegment(segment.id, "departureTime", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Hora de llegada</label>
                      <Input type="time" value={segment.arrivalTime} onChange={(event) => updateFlightSegment(segment.id, "arrivalTime", event.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <Button type="button" variant="outline" onClick={addFlightSegment}>
                <Plus className="size-4" />
                Agregar tramo de vuelo
              </Button>
              <div className="w-full max-w-xs space-y-2">
                <label className="text-sm font-medium text-slate-700">Importe total de vuelos</label>
                <Input value={flightTotalAmount} onChange={(event) => setFlightTotalAmount(event.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">La propuesta se guardará sin bloque de vuelos.</p>
        )}
      </div>

      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Traslado aeropuerto - hotel - aeropuerto</p>
            <p className="text-xs text-slate-500">
              Captura aeropuerto, servicio y hoteles con precio; el sistema suma este bloque automaticamente.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeTransfer}
              onChange={(event) => setIncludeTransfer(event.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Incluir traslados
          </label>
        </div>

        {includeTransfer ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Aeropuerto</label>
                <Input value={transferAirport} onChange={(event) => setTransferAirport(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipo de servicio</label>
                <Input value={transferService} onChange={(event) => setTransferService(event.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              {transferHotels.map((hotel, index) => (
                <div key={hotel.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Hotel {index + 1}</label>
                    <Input value={hotel.name} onChange={(event) => updateTransferHotel(hotel.id, "name", event.target.value)} placeholder="Nombre del hotel" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Precio del traslado</label>
                    <Input value={hotel.price} onChange={(event) => updateTransferHotel(hotel.id, "price", event.target.value)} placeholder="$1,250 MXN" />
                  </div>
                  <div className="flex items-end">
                    {transferHotels.length > 1 ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTransferHotel(hotel.id)}>
                        <Trash2 className="size-4" />
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <Button type="button" variant="outline" onClick={addTransferHotel}>
                <Plus className="size-4" />
                Agregar hotel al traslado
              </Button>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total traslados</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(transferLineTotal)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">La propuesta se guardará sin bloque de traslados.</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-notes" className="text-sm font-medium text-slate-700">
          Notas visibles al cliente
        </label>
        <Textarea id="admin-quote-notes" name="customerNotes" rows={4} placeholder="Indicaciones, inclusiones o aclaraciones que verá el cliente." />
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
