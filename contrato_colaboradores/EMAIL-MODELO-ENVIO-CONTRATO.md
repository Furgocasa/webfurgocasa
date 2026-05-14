# Email modelo · Envío de contrato a creadores de contenido

> **Plantilla maestra.** Email tipo que enviamos al creador una vez que (1) ha rellenado el formulario `/api/creator-collaboration`, (2) hemos hablado por WhatsApp o teléfono, y (3) ambas partes han confirmado interés y fechas aproximadas. Acompaña al contrato personalizado en PDF/DOCX adjunto.
>
> **Cómo usarla**: sustituye todos los `{{placeholders}}` y pega el cuerpo en tu cliente de email. Asunto incluido al principio.
>
> **Coherente con**:
> - Landing pública `https://www.furgocasa.com/es/creadores-de-contenido`.
> - Contrato modelo: [`MODELO-CONTRATO-COLABORACION-CREADORES.md`](./MODELO-CONTRATO-COLABORACION-CREADORES.md).
> - Guía interna del programa: [`GUIA-INTERNA-PROGRAMA-CREADORES.md`](./GUIA-INTERNA-PROGRAMA-CREADORES.md).

---

## 1 · Cabecera del email

| Campo | Valor |
|---|---|
| **Para** | `{{CREADOR_EMAIL}}` |
| **CC** | `reservas@furgocasa.com` |
| **De** | `{{REMITENTE_NOMBRE}} <{{REMITENTE_EMAIL}}>` |
| **Asunto** | **Tu colaboración con FURGOCASA · contrato y siguientes pasos · ref. `{{REFERENCIA_COLABORACION}}`** |
| **Adjuntos** | `Contrato-Colaboracion-{{REFERENCIA_COLABORACION}}.pdf` (o `.docx`) · *Política de privacidad (opcional, si lo pide)* |

---

## 2 · Cuerpo del email (versión larga, recomendada)

> Hola `{{CREADOR_NOMBRE}}`,
>
> Gracias de nuevo por tu propuesta y por la conversación de estos días. Tras revisar tu portfolio y vuestra disponibilidad, **te confirmamos que la colaboración encaja por nuestra parte**, así que paso a dejarte por escrito el acuerdo concreto y los siguientes pasos.
>
> Te adjunto el **contrato personalizado** con todos los datos rellenos. Si todo es como hemos hablado, basta con que lo firmes y nos lo devuelvas; si necesitas matizar algo, dímelo y lo ajustamos antes de firmar.
>
> ---
>
> ### Resumen del acuerdo
>
> | Concepto | Valor |
> |---|---|
> | Nivel pactado | **`{{NIVEL}}`** (Tiny / Light / Standard / Premium / Personalizado) |
> | Días de cesión de la camper | `{{DIAS_CESION}}` |
> | Periodo de cesión | Del **`{{FECHA_PICKUP}}`** al **`{{FECHA_DROPOFF}}`** |
> | Vehículo | `{{VEHICULO_MODELO}}` — matrícula `{{VEHICULO_MATRICULA}}` |
> | Importe del alquiler (IVA incl.) | **`{{IMPORTE_ALQUILER}}` €** |
> | Fianza (independiente) | **1.000 €** |
> | Referencia interna | `{{REFERENCIA_COLABORACION}}` |
>
> **Entregables mínimos del nivel `{{NIVEL}}`**:
>
> - Fotos seleccionadas: `{{ENTREGABLES_FOTOS}}`.
> - B-roll bruto útil: `{{ENTREGABLES_BROLL}}`.
> - Pieza editada por ti: `{{ENTREGABLES_EDITADA}}`.
>
> Cualquier desviación se cierra por escrito en el Anexo I del contrato.
>
> ---
>
> ### Cómo funciona el cobro y el reembolso
>
> 1. **Cobramos el alquiler como una reserva normal** a tarifa estándar de las fechas: `{{IMPORTE_ALQUILER}}` €, IVA incluido, al 100 % en un único cobro **antes de la entrega del vehículo** (Redsys o transferencia, lo que prefieras).
> 2. **La fianza es independiente**: 1.000 €, por transferencia con al menos 72 h de antelación, y cubre lo de siempre (daños, kilometraje, multas, combustible, limpieza). No se mezcla con el contenido.
> 3. **Cuando entregues el material pactado dentro de plazo** y lo aprobemos, emitimos **factura rectificativa por el 100 %** del alquiler y te lo reembolsamos al método de pago original.
> 4. Si la entrega supera el **80 %** de los mínimos pero falta algo, podemos ofrecerte (una sola vez) **7 días naturales adicionales** para completarlo.
> 5. Si no entregas, lo entregas fuera de plazo o no llega a los mínimos del nivel pactado, el alquiler permanece facturado y no procede reembolso. La fianza, en cualquier caso, sigue su flujo habitual.
>
> **Y para que te quedes tranquilo**: la aprobación es **técnica y temática**, no estética. No vamos a entrar a discutir si el encuadre debería haber sido otro o si el atardecer «no nos convence». Si cumples los mínimos del nivel `{{NIVEL}}`, está bien hecho y va del tema (camper / viaje), se aprueba. Esto está recogido por escrito en la **Cláusula 4.2 bis** del contrato adjunto.
>
> ---
>
> ### Plazos del ciclo
>
> | Hito | Plazo por defecto |
> |---|---|
> | Entrega del material por ti | **30 días naturales** desde la devolución del vehículo |
> | Revisión y comunicación de la decisión por nuestra parte | **14 días naturales** desde la entrega completa |
> | Factura rectificativa + reembolso (si aprueba) | **10 días naturales** desde la aprobación |
> | Vía de entrega habitual | WeTransfer o Google Drive con permiso de descarga |
>
> ---
>
> ### Cesión de derechos (resumen)
>
> - Cesión **no exclusiva, mundial, perpetua**, en todos los medios online y offline (incluida publicidad pagada), con derecho de modificación.
> - Tú **conservas la autoría** y puedes usar el material en tu portfolio.
> - **No te pedimos exclusividad**: puedes seguir colaborando con quien quieras antes, durante y después.
> - Lo único que aplica al material que nos cedes es la **idoneidad de marca**: nada ofensivo, sin marcas competidoras visibles, sin conducción imprudente, y autorización de imagen firmada para personas reconocibles que aparezcan.
>
> El detalle legal completo está en la Cláusula 7 del contrato adjunto.
>
> ---
>
> ### Próximos pasos
>
> 1. **Revisa el contrato adjunto**. Si todo coincide con lo que hemos hablado, fírmalo (firma electrónica o impreso, escaneado y devuelto) y nos lo devuelves a este mismo email.
> 2. Al recibir el contrato firmado te confirmamos **fechas firmes** y te pasamos los **datos de pago**.
> 3. Realizas el **pago del alquiler** (`{{IMPORTE_ALQUILER}}` €) y la **fianza** (1.000 €) con al menos **72 h de antelación** a la fecha de recogida.
> 4. El **`{{FECHA_PICKUP}}`** te entregamos la camper en nuestras instalaciones de **Casillas (Murcia)** o en el punto de recogida que hayamos acordado.
> 5. Tras la devolución, tienes hasta el **`{{FECHA_LIMITE_ENTREGA_MATERIAL}}`** para enviarnos el material.
>
> ---
>
> ### Si necesitas algo antes de firmar
>
> Puedes responder a este email o escribirme directamente por **WhatsApp** al **+34 868 36 41 61** indicando la referencia **`{{REFERENCIA_COLABORACION}}`**. Si prefieres una llamada rápida para revisar el contrato punto por punto, también vale: dime un par de huecos y la organizamos.
>
> Gracias por la propuesta y la energía con la que lo estás planteando. Tenemos ganas de ver qué sale.
>
> Un abrazo,
>
> **`{{REMITENTE_NOMBRE}}`**
> `{{REMITENTE_CARGO}}` · FURGOCASA
> info@furgocasa.com · +34 868 36 41 61
> https://www.furgocasa.com

---

## 3 · Cuerpo del email (versión corta, opcional)

Para cuando ya hayáis aclarado todo por WhatsApp y solo necesitas adjuntar el contrato sin volver a explicar el modelo.

> Hola `{{CREADOR_NOMBRE}}`,
>
> Tal y como hablamos, te adjunto el **contrato personalizado** de la colaboración **`{{REFERENCIA_COLABORACION}}`**. Resumen:
>
> - Nivel **`{{NIVEL}}`** · `{{DIAS_CESION}}` días · del `{{FECHA_PICKUP}}` al `{{FECHA_DROPOFF}}`.
> - Vehículo `{{VEHICULO_MODELO}}` (matrícula `{{VEHICULO_MATRICULA}}`).
> - Alquiler: **`{{IMPORTE_ALQUILER}}` €** (cobrados al 100 % antes de la entrega; reembolso íntegro vía factura rectificativa al entregar el material aprobado).
> - Fianza independiente: **1.000 €** (transferencia con 72 h de antelación).
>
> Pasos: revisar → firmar → devolver firmado → te paso datos de pago → entrega del vehículo el `{{FECHA_PICKUP}}` → entrega del material antes del `{{FECHA_LIMITE_ENTREGA_MATERIAL}}`.
>
> Cualquier duda, respondes a este email o por WhatsApp al **+34 868 36 41 61** indicando la referencia.
>
> Un abrazo,
> **`{{REMITENTE_NOMBRE}}`** · FURGOCASA

---

## 4 · Notas internas para el equipo (no enviar al creador)

- **Antes de mandar el email**, comprobar que en el contrato adjunto:
  - El `{{NIVEL}}` y la tabla de entregables del Anexo I coinciden con lo hablado.
  - `{{IMPORTE_ALQUILER}}` cuadra con la tarifa de las fechas en el sistema.
  - `{{FECHA_PICKUP}}`/`{{FECHA_DROPOFF}}` caen dentro de las **ventanas permitidas** (octubre–mayo + huecos puntuales; nunca julio, primera quincena de agosto, Semana Santa, puentes ni picos navideños).
  - `{{REFERENCIA_COLABORACION}}` sigue el formato `COL-YYYY-NNN`.
  - `{{FECHA_LIMITE_ENTREGA_MATERIAL}}` = `{{FECHA_DROPOFF}}` + 30 días naturales.
- **Adjunto**: preferimos enviar el contrato en **PDF firmable** además del DOCX. Si solo tienes DOCX, conviértelo antes de enviarlo (Word → Guardar como PDF o pandoc).
- **CC interno**: siempre `reservas@furgocasa.com` para que quede en la bandeja compartida.
- **Tras la respuesta del creador**:
  - Si firma sin cambios → archivar el firmado en `creadores/{{REFERENCIA_COLABORACION}}/` y bloquear fechas en el sistema (`colaboracion=true`, `referencia={{REFERENCIA_COLABORACION}}`).
  - Si pide cambios → renegociar por email/WhatsApp, regenerar el contrato y volver a enviar.
- **Recordatorios automáticos**:
  - 24 h antes del pickup: revisar que pago y fianza están dentro.
  - El día del dropoff: programar tarea «revisar entrega de material» a 30 días vista.

---

*Versión de la plantilla: **1.0** · Última actualización: 2026-05-14 · Si actualizas la landing pública o el contrato modelo, recuerda sincronizar también esta plantilla.*
