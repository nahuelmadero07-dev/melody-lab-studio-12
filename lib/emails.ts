/**
 * Templates HTML minimalistas y consistentes con la paleta de la marca.
 * Los emails HTML son quisquillosos — usamos solo estilos inline y tablas.
 */

type EmailArgs = {
  destinatarioLabel: string; // el "para quién" de la canción, para personalizar
  urlEscuchar: string;
};

const COLORS = {
  bg: "#1A1428",
  surface: "#251B3A",
  parchment: "#F5EFE0",
  muted: "#B4A8CC",
  gold: "#E9C46A",
  night: "#0F0B1A",
};

export function emailCancionLista(args: EmailArgs) {
  return {
    subject: `La canción para ${args.destinatarioLabel} está lista 🎶`,
    html: layout(`
      <p style="font-size:18px;color:${COLORS.parchment};margin:0 0 16px 0;line-height:1.5">
        Ya está — terminamos de componer la canción para <strong>${escape(args.destinatarioLabel)}</strong>.
      </p>
      <p style="font-size:16px;color:${COLORS.muted};margin:0 0 32px 0;line-height:1.6">
        Preparamos dos versiones distintas para que elijas la que más te emocione.
        Podés escuchar un adelanto de cada una gratis. Si te gusta, desbloqueás la
        canción completa (2 min y medio) por $9,90.
      </p>
      ${botonGold("Escuchar mi canción", args.urlEscuchar)}
      <p style="font-size:13px;color:${COLORS.muted};margin:32px 0 0 0;line-height:1.5">
        Este link es único para vos. Guardalo — con él vas a poder volver a escucharla
        cuando quieras, aunque se la hayas regalado ya.
      </p>
    `),
  };
}

export function emailPagoConfirmado(args: EmailArgs) {
  return {
    subject: `¡Listo! Tu canción completa está desbloqueada`,
    html: layout(`
      <p style="font-size:18px;color:${COLORS.parchment};margin:0 0 16px 0;line-height:1.5">
        Gracias por tu compra. Ya podés escuchar y descargar la canción completa
        para <strong>${escape(args.destinatarioLabel)}</strong>.
      </p>
      <p style="font-size:16px;color:${COLORS.muted};margin:0 0 32px 0;line-height:1.6">
        Podés mandársela por WhatsApp, hacerla sonar en persona, o descargarla como
        MP3 para tenerla para siempre.
      </p>
      ${botonGold("Escuchar y descargar", args.urlEscuchar)}
      <p style="font-size:13px;color:${COLORS.muted};margin:32px 0 0 0;line-height:1.5">
        Si algo no funciona o querés modificar la canción, respondé este mail y te
        ayudamos. Tenés 7 días de garantía.
      </p>
    `),
  };
}

/* ---------- Helpers internos de layout ---------- */

function layout(inner: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg}">
    <tr><td align="center" style="padding:48px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.surface};border-radius:16px;border:1px solid rgba(180,168,204,0.08)">
        <tr><td style="padding:40px">
          <p style="font-family:Georgia,serif;font-size:24px;color:${COLORS.parchment};margin:0 0 4px 0;letter-spacing:-0.02em">
            Melody Lab <span style="color:${COLORS.muted}">Studio</span><span style="color:${COLORS.gold}">.</span>
          </p>
          <div style="height:1px;background:rgba(180,168,204,0.15);margin:24px 0"></div>
          ${inner}
        </td></tr>
      </table>
      <p style="font-size:11px;color:#7A6E96;margin:24px 0 0 0;max-width:560px;line-height:1.5">
        Las canciones son generadas con inteligencia artificial. No representan a artistas reales.
        © ${new Date().getFullYear()} Melody Lab Studio.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function botonGold(texto: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:9999px;background:${COLORS.gold}">
    <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${COLORS.night};text-decoration:none;border-radius:9999px">${texto}</a>
  </td></tr></table>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
