# Melody Lab Studio

Canciones personalizadas con IA para regalar. El usuario cuenta su historia, la IA compone la canción con voz cantada real, la persona escucha un adelanto gratis y desbloquea la canción completa por $9,90.

**Stack**: Next.js 14 + TypeScript + Tailwind + Supabase + Gemini + fal.ai (Lyria 3 Pro) + Backblaze B2 + Resend + Mercado Pago.

## Arquitectura

```
Usuario → /crear (formulario 9 pasos)
      ↓ POST /api/pedido
Supabase.pedidos.insert (status=generando)
      ↓ fire-and-forget POST /api/generar/[id]
      ↓ redirect a /escuchar/{token}
      ↓
[EN BACKGROUND, /api/generar/[id]:]
  Gemini → letra
  Lyria 3 Pro (fal.ai) x2 → dos versiones cantadas
  Descargar MP3 de fal
  Subir a Backblaze B2 (privado)
  Update Supabase (status=listo)
  Resend → email al cliente
      ↓
Usuario en /escuchar/{token}:
  Página server-side que revalida cada 5s
  Muestra reproductor con corte a 30s (frontend JS)
  Botón "desbloquear" → POST /api/crear-pago → Mercado Pago Checkout
      ↓
Mercado Pago webhook → POST /api/webhook-mp
  Consulta pago real en API MP
  Verifica firma HMAC
  Update Supabase (status=pagado, payment_id, paid_at)
  Resend → email de confirmación con link a descarga
      ↓
Usuario vuelve a /escuchar/{token}:
  Ahora ve las canciones completas y botón de descarga
```

## Correr local

Requisitos: **Node.js 18.17+**.

```bash
npm install
cp .env.example .env.local
# Editá .env.local con tus credenciales reales (las tenés en melody-lab-credenciales.txt)
npm run dev
```

Abrí `http://localhost:3000`.

Nota: en local, el webhook de Mercado Pago no te va a llegar (MP necesita URL pública). Para probar el flujo de pago end-to-end, deployá primero a Vercel.

## Deploy a Vercel

### 1. Push a GitHub

```bash
git add .
git commit -m "backend orquestador completo"
git push
```

Vercel autodeploya en 60-90 segundos. Va a fallar el primer build si no cargaste las env vars — hacelo antes o inmediatamente después.

### 2. Cargar variables de entorno en Vercel

Vercel Dashboard → Project → Settings → Environment Variables.

Cargá cada variable del `.env.example` con el valor real de tu archivo `melody-lab-credenciales.txt`. Marcá los 3 entornos (Production, Preview, Development).

Después de cargar todas: Deployments → último deploy → menú (⋯) → **Redeploy**.

### 3. Aplicar el schema de Supabase

Si no lo hiciste ya (en la fase de setup del módulo 2), copiá el SQL del archivo `docs/schema.sql` (o el que te di en el chat) y ejecutalo en Supabase → SQL Editor.

### 4. Configurar el webhook de Mercado Pago

Mercado Pago Dashboard → Developers → tu app → Webhooks.

URL: `https://tu-app.vercel.app/api/webhook-mp`
Eventos: **Pagos**.

Copiá el "secret" que MP genera y ponelo como `MP_WEBHOOK_SECRET` en las env vars de Vercel. Redeployá.

### 5. Modo test vs producción

- **Testing**: `MP_USAR_PROD=false` — Mercado Pago te da URLs de sandbox. Podés simular pagos con tarjetas de prueba sin cobros reales.
- **Producción**: `MP_USAR_PROD=true` — cobros reales.

## Estructura del proyecto

```
melody-lab-studio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Landing home
│   ├── globals.css
│   ├── crear/
│   │   └── page.tsx              # Formulario 9 pasos
│   ├── escuchar/[token]/
│   │   ├── page.tsx              # Página server-side de escucha
│   │   └── client.tsx            # Reproductor + botón comprar
│   └── api/
│       ├── pedido/route.ts       # POST — crea pedido y dispara pipeline
│       ├── generar/[id]/route.ts # POST — pipeline pesado (interno)
│       ├── crear-pago/route.ts   # POST — genera link MP
│       └── webhook-mp/route.ts   # POST — recibe notificaciones MP
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts                 # Letra
│   ├── fal.ts                    # Lyria 3 Pro
│   ├── b2.ts                     # Storage
│   ├── resend.ts                 # Emails
│   ├── mercadopago.ts            # Pagos
│   ├── pipeline.ts               # Orquestador
│   └── emails.ts                 # Templates HTML
├── types.ts
├── .env.example
└── ...configs
```

## Costos por venta

| Concepto | Costo |
|---|---|
| Gemini (letra) | ~$0.001 |
| Lyria 3 Pro x2 (2 versiones) | $0.16 |
| Backblaze B2 (storage 1 mes) | despreciable |
| Resend (2 emails) | gratis (< 3000/mes) |
| Mercado Pago (~5% de $9.90) | $0.50 |
| **Total costo por venta** | **~$0.66** |
| **Precio venta** | **$9.90** |
| **Margen bruto** | **~$9.24** |

## Notas para próximas versiones (v2+)

- **Cortar el snippet en backend**: en vez de limitar a 30s desde JS (que un usuario técnico puede bypassar), cortar el MP3 real con ffmpeg antes de subirlo. Subir 2 archivos: `snippet.mp3` (30s) y `full.mp3` (completo). Guardar la `full.mp3` sin URL firmada hasta que pague.
- **Verificar endpoint de Lyria 3 Pro**: si al deployar da error tipo "model not found", verificar el endpoint exacto en https://fal.ai/models y actualizar `LYRIA_ENDPOINT` en `lib/fal.ts`.
- **Dominio propio**: cuando compres el dominio y lo verifiques en Resend, cambiar el `FROM` en `lib/resend.ts` para que los emails salgan desde `canciones@melodylabstudio.com`.
- **Timeout de Lyria**: si consistentemente supera 60s (plan Hobby), migrar a Vercel Pro (300s) o encolar con QStash / Inngest.
- **Rate limiting**: agregar rate limiting en `/api/pedido` para evitar abuse
