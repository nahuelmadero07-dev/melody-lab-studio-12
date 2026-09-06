// Estado que puede tomar un pedido en su ciclo de vida
export type PedidoStatus = "generando" | "listo" | "pagado" | "error";

// Representa una fila de la tabla `pedidos` en Supabase
export type Pedido = {
  id: string;
  token: string;

  // Data del formulario
  ocasion: string;
  tu_nombre: string;
  destinatario: string;
  relacion: string;
  historia: string;
  estilo: string;
  clima: string;
  voz: string;
  email: string;
  whatsapp: string | null;

  // Estado
  status: PedidoStatus;
  error_message: string | null;

  // Contenido generado
  letra: string | null;
  url_a: string | null;
  url_b: string | null;
  snippet_a: string | null;
  snippet_b: string | null;

  // Pago
  plan: string | null;
  monto: number | null;
  payment_id: string | null;
  paid_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
};

// Payload que llega desde el formulario /crear
export type NuevoPedido = {
  ocasion: string;
  tuNombre: string;
  destinatario: string;
  relacion: string;
  historia: string;
  estilo: string;
  clima: string;
  voz: string;
  email: string;
  whatsapp: string;
};
