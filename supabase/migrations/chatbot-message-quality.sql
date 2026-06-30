-- Clasificacion de calidad por MENSAJE (respuestas del asistente), no solo por conversacion.
-- Ejecutar en Supabase SQL Editor si la tabla chatbot_messages ya existe.

ALTER TABLE chatbot_messages
  ADD COLUMN IF NOT EXISTS response_quality TEXT NOT NULL DEFAULT 'sin_tipo'
  CHECK (response_quality IN ('correcta', 'mejorable', 'incorrecta', 'sin_tipo'));

ALTER TABLE chatbot_messages
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_chatbot_msg_assistant_quality
  ON chatbot_messages (response_quality, created_at DESC)
  WHERE role = 'assistant';
