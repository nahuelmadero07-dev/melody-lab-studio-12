import { supabaseAdmin } from "@/lib/supabase";

/**
 * FRENOS CONTRA MUESTRAS GRATIS ILIMITADAS
 *
 * Cada muestra le cuesta plata real a fal.ai. Antes el único freno era
 * "3 por email por hora": alcanzaba con esperar una hora o cambiar de email.
 *
 * Ahora se chequean 3 cosas en el servidor (no se pueden saltear desde el navegador):
 *   1. EMAIL      — normalizado (juan.perez+1@gmail.com = juanperez@gmail.com)
 *   2. DISPOSITIVO — una cookie que el navegador guarda la primera vez
 *   3. IP         — la conexión de internet (frena el modo incógnito)
 *
 * Solo cuentan las muestras NO pagadas: el que compra puede volver a crear.
 * Para cambiar los límites, tocá solo estos números.
 */
export const LIMITES = {
  porEmail: { maximo: 2, horas: 24 * 7 },       // 2 muestras sin pagar por semana
  porDispositivo: { maximo: 2, horas: 24 * 7 }, // 2 muestras sin pagar por semana
  porIp: { maximo: 3, horas: 24 },              // 3 muestras sin pagar por día
};

export const COOKIE_DISPOSITIVO = "ml_dev";

/** Dominios de emails descartables/temporales más comunes. */
const DOMINIOS_DESCARTABLES = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "temp-mail.io", "tempmail.net", "tempmailo.com", "tempr.email", "yopmail.com",
  "yopmail.net", "trashmail.com", "getnada.com", "nada.email", "dispostable.com",
  "maildrop.cc", "mailnesia.com", "fakeinbox.com", "throwawaymail.com",
  "emailondeck.com", "mohmal.com", "moakt.com", "mintemail.com", "spamgourmet.com",
  "minuteinbox.com", "burnermail.io", "mail.tm", "mail.gw", "inboxkitten.com",
  "tmpmail.org", "tmpmail.net", "luxusmail.org", "1secmail.com", "1secmail.org",
  "1secmail.net", "emailfake.com", "fakemail.net", "dropmail.me", "10mail.org",
  "byom.de", "harakirimail.com", "discard.email", "spambox.us", "cuvox.de",
]);

export function esEmailDescartable(email: string): boolean {
  const dominio = email.split("@")[1]?.toLowerCase().trim() ?? "";
  return DOMINIOS_DESCARTABLES.has(dominio);
}

/**
 * Lleva el email a su forma "real" para que no se pueda repetir con trucos:
 *  - todo en minúsculas
 *  - saca el "+algo" (juan+1@x.com → juan@x.com), que llega a la misma casilla
 *  - en Gmail, saca los puntos (juan.perez = juanperez, es la misma cuenta)
 */
export function normalizarEmail(email: string): string {
  const limpio = email.trim().toLowerCase();
  const [usuarioRaw, dominioRaw] = limpio.split("@");
  if (!usuarioRaw || !dominioRaw) return limpio;

  let usuario = usuarioRaw.split("+")[0];
  let dominio = dominioRaw;
  if (dominio === "gmail.com" || dominio === "googlemail.com") {
    usuario = usuario.replace(/\./g, "");
    dominio = "gmail.com";
  }
  return `${usuario}@${dominio}`;
}

/** IP real del visitante detrás del proxy de Vercel. */
export function obtenerIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

/**
 * Cuenta muestras NO pagadas en la ventana de tiempo para una columna dada.
 * Si la columna todavía no existe en Supabase (no se corrió el SQL), devuelve
 * null y ese freno se saltea en vez de romper la página.
 */
async function contar(columna: string, valor: string, horas: number): Promise<number | null> {
  const desde = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq(columna, valor)
    .neq("status", "pagado")
    .gte("created_at", desde);

  if (error) {
    console.error(`[antiabuso] No se pudo contar por ${columna}:`, error.message);
    return null;
  }
  return count ?? 0;
}

/**
 * Devuelve un mensaje para mostrarle al usuario si NO puede generar otra
 * muestra, o null si puede seguir.
 */
export async function chequearLimites(args: {
  email: string;            // ya en minúsculas
  emailNormalizado: string;
  dispositivo: string | null;
  ip: string | null;
}): Promise<string | null> {
  const MENSAJE_YA_TENES =
    "Ya generaste tus muestras gratis. Revisá tu email: ahí está el link para escucharlas y desbloquear la canción completa.";

  // 1. Email. Primero por email normalizado; si esa columna no existe, por email tal cual.
  let porEmail = await contar("email_normalizado", args.emailNormalizado, LIMITES.porEmail.horas);
  if (porEmail === null) {
    porEmail = await contar("email", args.email, LIMITES.porEmail.horas);
  }
  if ((porEmail ?? 0) >= LIMITES.porEmail.maximo) return MENSAJE_YA_TENES;

  // 2. Dispositivo (cookie)
  if (args.dispositivo) {
    const n = await contar("dispositivo", args.dispositivo, LIMITES.porDispositivo.horas);
    if ((n ?? 0) >= LIMITES.porDispositivo.maximo) return MENSAJE_YA_TENES;
  }

  // 3. IP
  if (args.ip) {
    const n = await contar("ip", args.ip, LIMITES.porIp.horas);
    if ((n ?? 0) >= LIMITES.porIp.maximo) {
      return "Se generaron demasiadas muestras gratis desde esta conexión hoy. Revisá tu email para escuchar las que ya creaste, o probá de nuevo mañana.";
    }
  }

  return null;
}
