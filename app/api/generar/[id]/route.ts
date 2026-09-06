import { NextRequest, NextResponse } from "next/server";
import { ejecutarPipeline } from "@/lib/pipeline";

// Este endpoint hace el trabajo pesado. Necesitamos más timeout.
// Hobby: 60s, Pro: 300s, Enterprise: 900s. Si Lyria tarda mucho, migrar a Pro.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Protección mínima: solo se invoca desde nuestro propio backend
  const secret = req.headers.get("x-internal-secret");
  if (secret !== (process.env.INTERNAL_SECRET ?? "dev")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const baseUrl = getBaseUrl(req);
  await ejecutarPipeline(params.id, baseUrl);

  return NextResponse.json({ ok: true });
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
