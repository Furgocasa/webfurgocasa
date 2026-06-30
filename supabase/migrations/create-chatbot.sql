-- ============================================
-- CHATBOT RAG - Base de conocimiento + conversaciones
-- Sustituye el flujo WhatsApp + N8N + Airtable + Notion
-- por un chatbot embebido con RAG (pgvector) y registro en Supabase.
-- ============================================

-- Extension necesaria para embeddings (RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- --------------------------------------------
-- 1. Base de conocimiento (chunks + embeddings)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_kb_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Origen del fragmento (de que fuente proviene)
    -- CSV: condiciones, funcionamiento, faqs, modelos_general
    -- BBDD web (solo lectura): vehiculos, ubicaciones, extras, empresa, temporadas
    source TEXT NOT NULL CHECK (source IN (
        'condiciones',
        'funcionamiento',
        'modelos',
        'modelos_general',
        'faqs',
        'vehiculos',
        'ubicaciones',
        'extras',
        'empresa',
        'temporadas',
        'prompt'
    )),

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Hash del contenido para upsert idempotente en la ingesta
    content_hash TEXT NOT NULL UNIQUE,

    -- text-embedding-3-small => 1536 dimensiones
    embedding vector(1536),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_kb_source ON chatbot_kb_chunks(source);

-- Indice de similitud por coseno (ivfflat). Requiere ANALYZE tras la ingesta.
CREATE INDEX IF NOT EXISTS idx_chatbot_kb_embedding
    ON chatbot_kb_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Funcion RPC para recuperar los fragmentos mas relevantes (la llama el API con service role)
CREATE OR REPLACE FUNCTION match_chatbot_chunks(
    query_embedding vector(1536),
    match_count INT DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    source TEXT,
    title TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        c.id,
        c.source,
        c.title,
        c.content,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM chatbot_kb_chunks c
    WHERE c.embedding IS NOT NULL
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- --------------------------------------------
-- 2. Conversaciones
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificador anonimo del visitante (localStorage)
    session_id TEXT NOT NULL,

    -- Datos de contacto opcionales que el usuario pueda facilitar
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,

    -- Idioma detectado en la conversacion
    language TEXT DEFAULT 'es',

    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),

    -- Clasificacion de calidad (replica el "Tipo de respuesta" de Notion)
    response_quality TEXT NOT NULL DEFAULT 'sin_tipo' CHECK (response_quality IN (
        'correcta',
        'mejorable',
        'incorrecta',
        'sin_tipo'
    )),

    admin_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conv_last_msg ON chatbot_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_conv_quality ON chatbot_conversations(response_quality);
CREATE INDEX IF NOT EXISTS idx_chatbot_conv_language ON chatbot_conversations(language);

-- --------------------------------------------
-- 3. Mensajes
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,

    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),

    content TEXT NOT NULL DEFAULT '',

    -- Adjuntos (imagen / audio)
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'audio')),

    -- Transcripcion del audio (Whisper)
    transcription TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_msg_conversation ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_created ON chatbot_messages(created_at);

-- --------------------------------------------
-- 4. RLS
-- El API publico escribe con service role (bypassa RLS).
-- Los admins autenticados pueden leer/gestionar.
-- --------------------------------------------
ALTER TABLE chatbot_kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chatbot_kb_admin_read"
    ON chatbot_kb_chunks
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "chatbot_conv_admin_all"
    ON chatbot_conversations
    FOR ALL
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "chatbot_msg_admin_all"
    ON chatbot_messages
    FOR ALL
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- --------------------------------------------
-- 5. Storage bucket para adjuntos del chat (imagenes/audio)
-- --------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('chatbot-uploads', 'chatbot-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura publica de los adjuntos (las URLs son aleatorias / no enumerables)
CREATE POLICY "chatbot_uploads_public_read"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'chatbot-uploads');
