import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>
      </CardContent>
    </Card>
  );
}
