-- Frenos contra muestras gratis ilimitadas.
-- Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez sin problema.

alter table pedidos add column if not exists email_normalizado text;
alter table pedidos add column if not exists ip text;
alter table pedidos add column if not exists dispositivo text;

-- Rellena el email normalizado de los pedidos que ya existen
-- (sin esto, los que ya generaron muestras arrancarían de cero).
update pedidos
set email_normalizado = case
  when split_part(lower(email), '@', 2) in ('gmail.com', 'googlemail.com')
    then replace(split_part(split_part(lower(email), '@', 1), '+', 1), '.', '') || '@gmail.com'
  else split_part(split_part(lower(email), '@', 1), '+', 1) || '@' || split_part(lower(email), '@', 2)
end
where email_normalizado is null and email is not null;

-- Índices para que contar sea rápido
create index if not exists pedidos_email_normalizado_idx on pedidos (email_normalizado, created_at);
create index if not exists pedidos_ip_idx on pedidos (ip, created_at);
create index if not exists pedidos_dispositivo_idx on pedidos (dispositivo, created_at);
