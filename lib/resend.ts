import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Mientras no tengas un dominio verificado en Resend, tenés que usar el
// dominio sandbox de ellos que SOLO manda a tu propio email (el mismo con
// el que te registraste). Cuando conectes melodylabstudio.com, cambiás esta
// constante por algo tipo "canciones@melodylabstudio.com".
const FROM = "Melody Lab Studio <onboarding@resend.dev>";

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
