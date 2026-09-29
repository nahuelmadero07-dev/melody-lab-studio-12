import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Remitente de los mails.
 *
 * Mientras no tengas un dominio verificado en Resend, se usa el remitente de
 * prueba de ellos (onboarding@resend.dev), que SOLO entrega a la casilla con la
 * que te registraste en Resend. A cualquier otro cliente le rebota con 403.
 *
 * Cuando verifiques tu dominio en resend.com/domains, cargá en Vercel la
 * variable de entorno RESEND_FROM con un valor como:
 *   Melody Lab Studio <canciones@tudominio.com>
 * y redeployá. No hace falta tocar este archivo.
 */
const FROM =
  process.env.RESEND_FROM?.trim() || "Melody Lab Studio <onboarding@resend.dev>";

export async function enviarEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}
