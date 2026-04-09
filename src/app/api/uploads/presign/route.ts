import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: false,
    message:
      "Presign scaffold listo. Falta conectar Cloudflare R2 o S3 con credenciales reales para generar URLs firmadas.",
  });
}
