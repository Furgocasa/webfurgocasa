-- Lock por campaña para evitar doble procesamiento en ticks solapados.
--
-- Escenario que arreglamos:
--   Vercel Cron corre mailing-tick cada minuto. Si un tick tarda > 60s
--   procesando una campaña grande (con Gmail/Outlook throttling es
--   perfectamente posible), el siguiente tick arranca antes de que
--   termine el anterior y ambos intentan enviar la misma fila pending
--   → email duplicado.
--
-- Solución:
--   Antes de empezar a procesar una campaña, el cron hace un UPDATE
--   atómico sobre mailing_campaigns.tick_lock_at con una cláusula
--   WHERE que solo acepta si está NULL o si el lock es viejo
--   (watchdog de 5 minutos para recuperar de procesos muertos).
--   Si el UPDATE afecta a 1 fila → este tick tiene el lock.
--   Si afecta a 0 filas → otro tick ya está dentro; skipeamos.
--
-- El cron libera el lock (tick_lock_at = NULL) en un finally al
-- acabar de procesar cada campaña.

ALTER TABLE public.mailing_campaigns
  ADD COLUMN IF NOT EXISTS tick_lock_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.mailing_campaigns.tick_lock_at IS
  'Lock exclusivo del cron mailing-tick. Se pone en NOW() al tomar la campaña y se libera (NULL) al terminar. Si lleva > 5 min sin liberarse, el siguiente tick lo considera abandonado y lo recupera.';

-- Índice parcial para saltarse las campañas ya "tomadas" sin escanear toda la tabla.
CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_tick_lock
  ON public.mailing_campaigns (tick_lock_at)
  WHERE tick_lock_at IS NOT NULL;
