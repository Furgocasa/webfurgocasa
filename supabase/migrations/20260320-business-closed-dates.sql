-- Días de cierre global (festivos / vacaciones oficina): no recogida ni devolución en web.
CREATE TABLE IF NOT EXISTS business_closed_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT business_closed_dates_range_ok CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_business_closed_dates_range
    ON business_closed_dates (start_date, end_date);

ALTER TABLE business_closed_dates ENABLE ROW LEVEL SECURITY;

-- Lectura pública (calendario buscador / API)
CREATE POLICY "business_closed_dates_select_public"
    ON business_closed_dates FOR SELECT
    USING (true);

-- Escritura solo administradores activos
CREATE POLICY "business_closed_dates_admin_insert"
    ON business_closed_dates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
              AND admins.is_active = true
        )
    );

CREATE POLICY "business_closed_dates_admin_update"
    ON business_closed_dates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
              AND admins.is_active = true
        )
    );

CREATE POLICY "business_closed_dates_admin_delete"
    ON business_closed_dates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
              AND admins.is_active = true
        )
    );
