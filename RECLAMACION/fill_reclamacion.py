"""
Rellena la sección "IDENTIFICACIÓN DEL RECLAMADO" en las 3 primeras páginas
de la hoja de reclamaciones con los datos fiscales de Furgocasa.
"""
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

# --- Datos del reclamado ---
DATA = {
    "razon_social": "FURGOCASA CAMPERVANS SL",
    "domicilio": "Av. de Puente Tocinos, 4",
    "cp": "30007",
    "localidad": "Casillas",
    "provincia": "Murcia",
    "nif": "B87947412",
    "telefono": "678 081 261",
    "email": "reservas@furgocasa.com",
    "actividad": "Alquiler de autocaravanas y campers",
}

# --- Coordenadas de los campos (extraídas del PDF original) ---
# Valores en la misma línea que los labels, justo después del texto de la etiqueta.
OFFSET_Y = 0

FIELDS = [
    # (campo, x_valor, y_label)
    ("razon_social", 168, 728.5),   # tras "Nombre o Razón Social (*)"
    ("domicilio", 100, 705.3),      # tras "Domicilio (*)"
    ("cp", 72, 682.0),             # tras "C.P. (*)"
    ("localidad", 178, 682.0),     # tras "Localidad (*)"
    ("provincia", 478, 682.0),     # tras "Provincia (*)"
    ("nif", 98, 658.9),            # tras "NIF / CIF (*)"
    ("telefono", 245, 658.9),      # tras "Teléfono"
    ("telefono", 362, 658.9),      # tras "Móvil"
    ("email", 68, 635.7),          # tras "E-mail"
    ("actividad", 362, 635.7),     # tras "Actividad"
]

FONT_NAME = "Helvetica"
FONT_SIZE = 8


def create_overlay(page_width, page_height):
    """Crea un PDF overlay con los datos del reclamado."""
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(page_width, page_height))
    c.setFont(FONT_NAME, FONT_SIZE)

    for field_key, x, y_label in FIELDS:
        value = DATA[field_key]
        c.drawString(x, y_label + OFFSET_Y, value)

    c.save()
    buf.seek(0)
    return buf


def main():
    input_path = "33145-Hojas-de-reclamaciones-Ejemplar-para-papel-autocopiativo.pdf"
    output_path = "Hoja-Reclamaciones-FURGOCASA-CAMPERVANS-SL.pdf"

    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(reader.pages):
        if i < 3:  # Solo rellenar las 3 primeras páginas
            w = float(page.mediabox.width)
            h = float(page.mediabox.height)
            overlay_buf = create_overlay(w, h)
            overlay_reader = PdfReader(overlay_buf)
            overlay_page = overlay_reader.pages[0]
            page.merge_page(overlay_page)

        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    print(f"PDF generado: {output_path}")


if __name__ == "__main__":
    main()
