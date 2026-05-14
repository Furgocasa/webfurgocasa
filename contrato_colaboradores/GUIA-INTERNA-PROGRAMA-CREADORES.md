# Guía interna · Programa de colaboraciones con creadores de contenido

> **Documento NO contractual y NO público.** Es la chuleta del equipo FURGOCASA para gestionar el programa de creadores de forma consistente. Si lo que necesitas es el documento legal, ve a [`MODELO-CONTRATO-COLABORACION-CREADORES.md`](./MODELO-CONTRATO-COLABORACION-CREADORES.md). Si lo que necesitas es la versión pública, está en `https://www.furgocasa.com/es/creadores-de-contenido`.
>
> Esta guía sintetiza todo lo que hemos pactado entre el equipo y los creadores en las primeras conversaciones, para no tener que recordar nada de memoria.

---

## 0 · Tabla de contenidos

1. Filosofía y diferencia con Storytellers
2. Niveles de colaboración (tabla canónica)
3. Criterios técnicos mínimos
4. Idoneidad de marca y exclusividad
5. Modelo económico (cobro + reembolso)
6. Plazos del ciclo
7. Subsanación (cuándo sí, cuándo no)
8. Flujo operativo paso a paso
9. Preguntas frecuentes que nos hacen (con respuesta corta)
10. Plantillas de email/WhatsApp
11. Errores típicos a evitar
12. Punteros (dónde vive cada cosa en el código y en los docs)

---

## 1 · Filosofía y diferencia con Storytellers

- **Storytellers** = clientes que YA han alquilado y comparten material a cambio de un descuento futuro. Es un canal pasivo y masivo. Lo gestiona el sistema (crons, emails 05–08).
- **Creadores de contenido** (este programa) = personas que presentan una **propuesta previa**, firman un **contrato**, ceden derechos **amplios** y reciben a cambio el **reembolso del alquiler** condicionado a entregar lo pactado. Es un canal activo, escaso, comercial.

**Regla**: si alguien escribe a `info@`/`reservas@` proponiéndose como influencer SIN haber alquilado, va por este programa. Si ya alquiló y quiere mandar fotos del viaje, va por Storytellers.

---

## 2 · Niveles de colaboración (tabla canónica)

Fuente única en código: `src/lib/content-creators/levels.ts` → `COLLAB_LEVELS`.

| Nivel | Cesión | Fotos seleccionadas | B-roll bruto útil | Pieza editada por el creador |
|---|---|---|---|---|
| **Tiny** | 1 día | 10–15 fotos (2–3 escenas) | 3–5 min útiles | — |
| **Light** | 2–3 días | 25–35 fotos (más localizaciones) | 10–15 min útiles | 1 reel vertical |
| **Standard** | 4–5 días | 45–60 fotos (variedad real) | 20–30 min útiles | 2 reels verticales |
| **Premium** | Hasta 7 días | 70–100 fotos | 40–50 min útiles | 2–3 reels verticales + 1 vídeo experiencia de hasta 90 s |
| **Personalizado** | > 7 días o atípico | Pactado en Anexo I | Pactado en Anexo I | Pactado en Anexo I |

**Regla mental rápida**: ~12–15 fotos útiles **post-selección** por día de rodaje. Buscamos variedad, no 50 versiones del mismo atardecer.

**Variedad orientativa** de la entrega: 30 % exterior con vehículo · 30 % interior y detalle · 20 % uso real (personas/escenas/cocina) · 20 % paisaje/atardecer/mood. Justificadamente revisable si la propuesta narrativa lo pide.

---

## 3 · Criterios técnicos mínimos

| Pieza | Mínimo aceptable |
|---|---|
| Foto (cámara) | RAW (.cr3 / .nef / .arw u otro) + JPEG de previsualización seleccionado |
| Foto (móvil de alta gama) | Archivo original sin recompresión adicional |
| Vídeo | 4K mínimo · 25 o 30 fps · LOG/flat si el equipo lo permite · ≥100 Mbps |
| Audio (talking-heads) | Micro externo o equivalente, sin viento, sin ruido de tráfico baked |
| Pieza editada | Vertical 9:16 · sin transiciones ni música baked en el b-roll adjunto |
| Pre-selección | Obligatoria: no aceptamos 1.500 fotos ni 200 clips |
| Estructura de carpetas | `01-exterior/ 02-interior/ 03-uso/ 04-detalles/ 05-talking-head/` |

**Qué entendemos por «fotos seleccionadas»**: fotos pre-seleccionadas y con edición básica (encuadre, exposición, color razonable). **No** esperamos revelado editorial ni limpieza pixel a pixel salvo pacto específico.

**Qué entendemos por «b-roll bruto útil»**: clips pre-seleccionados, estabilizados o bien grabados, sin pruebas, descartes, audio basura ni clips repetidos. Minutos aprovechables, no minutos brutos para «cumplir».

---

## 4 · Idoneidad de marca y exclusividad

### 4.1 · Qué NO admitimos en el material que nos entregan

Estos cuatro filtros aplican al contenido que recibimos, no a lo que el creador haga por su cuenta:

1. Cualquier elemento ofensivo, discriminatorio o ilegal.
2. Marcas competidoras del sector alquiler de campers/autocaravanas visibles.
3. Conducción manifiestamente imprudente o incumplimientos normativos visibles.
4. Personas reconocibles sin autorización de imagen firmada (modelo en Anexo III del contrato).

### 4.2 · Exclusividad: NO la pedimos

**Decisión expresa del programa**: no exigimos exclusividad, ni durante ni después de la colaboración. Los creadores pueden:

- Trabajar con otras marcas (incluso del sector alquiler de campers) antes, durante y después.
- Publicar contenido propio del viaje en sus canales desde el día de la entrega.
- Usar el material en su portfolio personal y profesional (salvo Anexo II expreso).

Lo único que aplica al material concreto que nos ceden es la **idoneidad de marca** del punto 4.1. No es exclusividad; es higiene del activo que nos entregan.

### 4.3 · Criterio de aprobación razonable

El programa NO valora gusto subjetivo. Aprobamos el material cuando cumple los **mínimos cuantitativos** del nivel, los **mínimos técnicos** y la **temática camper/viaje**. Si una entrega cumple esos tres filtros y la idoneidad de marca de 4.1, se aprueba aunque a alguien del equipo le guste más o menos.

**Esto se traduce en**:

- **Lo que SÍ es motivo de no aprobar**: faltan piezas, no llegan a los mínimos del nivel, hay problemas técnicos (foco, audio, exposición, formato), incumplen idoneidad de marca o salen del tema (p. ej., reportaje urbano sin la camper).
- **Lo que NO es motivo de no aprobar**: «me gusta más el otro encuadre», «el atardecer no convence», «el sandwich queda raro», «la luz podría ser otra», «yo lo habría editado distinto».

Si dudas si una entrega cumple o no, vuelve a la tabla del §2 y al checklist técnico del §3, no a tu gusto personal. Está contractualmente protegido en la **Cláusula 4.2 bis** del contrato modelo.

---

## 5 · Modelo económico (cobro + reembolso)

### 5.1 · Resumen

1. La colaboración **se cobra como un alquiler normal** a tarifa estándar de las fechas. Al 100 % en un único cobro **antes de la entrega del vehículo** (no aplica el 50/50 de las reservas comunes).
2. La **fianza de 1.000 €** sigue su flujo habitual (cubre daños, kilometraje, multas, combustible, limpieza). Es **independiente** de la entrega del contenido.
3. Si el creador **entrega lo pactado a tiempo y FURGOCASA aprueba**, emitimos **factura rectificativa por el 100 %** y reembolsamos al método de pago original.
4. Si **no entrega, entrega fuera de plazo o no cumple mínimos**, el alquiler queda facturado y no procede reembolso.

### 5.2 · Por qué este modelo y no «cesión gratis»

- Si regaláramos el viaje confiando en la palabra, **mezclaríamos la fianza** con el riesgo de impago de contenido. Si además hay un golpe o un percance, nos quedamos sin nada para reparar.
- Cobrando el alquiler y reembolsándolo a la entrega, la **fianza queda íntegra para su función** y el creador asume el riesgo justo: si cumple, recupera el 100 %.

### 5.3 · Cosas que NO entran en el reembolso

- Combustible, kilometraje extra, multas, daños, limpieza extraordinaria: se gestionan contra la fianza como con cualquier cliente.
- El reembolso del alquiler **no** incluye remuneración adicional por usos posteriores del material, ediciones nuevas, publicidad pagada o reedición. Está «todo dentro» del reembolso pactado.

---

## 6 · Plazos del ciclo

Valores **por defecto** del contrato. Se pueden mover en el Anexo I si hay motivo, pero conviene no tocarlos sin razón.

| Hito | Plazo por defecto | Cuenta desde |
|---|---|---|
| Entrega del material por el creador | **30 días naturales** | Día de devolución del vehículo (dropoff) |
| Revisión y decisión por FURGOCASA | **14 días naturales** | Fecha en que la entrega está completa |
| Factura rectificativa + reembolso | **10 días naturales** | Aprobación de la entrega |
| Plazo extra de subsanación (opcional) | **7 días naturales** | Día en que el creador acepta expresamente la oferta |
| Devolución de fianza | **7–14 días hábiles** | Devolución del vehículo (flujo independiente) |

**Vía de entrega habitual**: WeTransfer o Google Drive con permiso de descarga. Si el creador propone otra (Frame.io, Dropbox propio, etc.), aceptamos siempre que podamos descargar el material entero antes de que caduque el enlace.

---

## 7 · Subsanación (cuándo sí, cuándo no)

Regla del programa:

- La oferta de subsanación es **discrecional** de FURGOCASA. No es un derecho del creador.
- Solo la ofrecemos cuando la entrega está **por encima del 80 % de los mínimos** del nivel pactado. Por debajo de eso, no compensa el coste de revisión doble.
- Es **una sola oportunidad**: 7 días naturales adicionales para completar lo que falta.
- Se documenta por email. Si el creador la acepta, se reabre la revisión cuando complete; si no la acepta o pasa el plazo, la entrega queda como «no cumple» y el alquiler permanece facturado.

**Heurística de cuándo ofrecerla**:

- Faltan 2–3 piezas y son fácilmente recuperables (un reel, unas fotos de interior, un talking-head). → Ofrecer.
- Faltan piezas centrales (todo el b-roll, todo el bloque de interior, la pieza editada). → No ofrecer.
- El nivel de calidad técnica no llega (todo movido, todo sobreexpuesto, audio inutilizable). → No ofrecer.

---

## 8 · Flujo operativo paso a paso

### Antes del viaje

1. **Solicitud llega** por el formulario `/api/creator-collaboration` → email a `reservas@` con datos, nivel pedido, teléfono, días, aceptación del modelo cobro+reembolso.
2. **Pre-cualificación** (24–72 h): mirar portfolio/canales, encaje con la flota, fechas dentro de ventana permitida (octubre–mayo + huecos puntuales; **nunca** julio, primera quincena de agosto, Semana Santa, puentes ni picos navideños).
3. **Llamada o WhatsApp** para concretar: itinerario, número de piezas, fechas firmes, vehículo.
4. **Enviar contrato personalizado** (basado en [`MODELO-CONTRATO-COLABORACION-CREADORES.md`](./MODELO-CONTRATO-COLABORACION-CREADORES.md)) con todos los `{{placeholders}}` rellenos, acompañado del email tipo [`EMAIL-MODELO-ENVIO-CONTRATO.md`](./EMAIL-MODELO-ENVIO-CONTRATO.md) (versión larga la primera vez, versión corta si ya está todo aclarado por WhatsApp).
5. **Crear reserva** en el sistema marcada como `colaboracion=true` y con `referencia=COL-YYYY-NNN`. Bloquear fechas como reserva normal.
6. **Cobrar al 100 %** por Redsys/transferencia antes de la entrega del vehículo. Fianza por transferencia con mínimo 72 h de antelación.
7. **Confirmar autorizaciones de imagen** si el creador prevé personas reconocibles distintas a él mismo.

### Durante el viaje

8. Trato igual que cualquier cliente: contrato de alquiler estándar firmado en la entrega, briefing de uso, ETA de devolución a las 10:00.
9. Si el creador pide algo extra (segundo conductor, salir de España, etc.), va por la vía habitual y por escrito.

### Después del viaje

10. **Dropoff**: revisión del vehículo. Fianza se gestiona en su flujo normal (7–14 días hábiles).
11. **Programar recordatorio interno a 30 días** (calendario o tarea) para revisar si llegó la entrega.
12. **Llega la entrega**: descargar todo, archivar bajo `creadores/COL-YYYY-NNN/`.
13. **Revisar contra los mínimos** del nivel pactado (cantidades, técnica, variedad, idoneidad de marca).
14. **Decisión binaria** en ≤14 días:
    - **CUMPLE** → factura rectificativa tipo R, motivo «Reembolso por entrega satisfactoria del contenido pactado – referencia COL-YYYY-NNN»; reembolso por el método original en ≤10 días.
    - **NO CUMPLE** → si la entrega está >80 % completa, evaluar oferta de subsanación (7 días). En otro caso, notificar por email con motivación; el alquiler queda facturado tal cual.
15. **Archivar** todo: emails de decisión, copia de la entrega, factura rectificativa (si procede), capturas de los canales del creador donde publique el material.

---

## 9 · Preguntas frecuentes que nos hacen (respuesta corta)

### «¿Cuáles son los mínimos exactos?»

→ Tabla del §2 + criterios técnicos del §3. Se cierra por escrito en el Anexo I del contrato, con cantidades exactas.

### «¿Por qué me cobráis si es una colaboración?»

→ Para proteger la fianza. Si fusionáramos riesgos, podríamos quedarnos sin reparar daños. Tú recuperas el 100 % cuando entregues lo pactado.

### «¿Y si entrego casi todo?»

→ Si superas el 80 % de los mínimos te ofrecemos una sola subsanación de 7 días. Por debajo, no procede reembolso.

### «¿Me exigís exclusividad?»

→ **No**. Puedes seguir colaborando con quien quieras antes, durante y después. Lo único que aplica al material que nos cedes es la idoneidad de marca (no marcas competidoras visibles, etc.).

### «¿Puedo publicar el material en mis redes?»

→ Sí, la pieza editada desde el momento de la entrega. Lo único que pedimos no divulgar son importes y tarifas internas.

### «¿Conservo la autoría?»

→ Sí, autoría moral siempre. La cesión es **no exclusiva, mundial, perpetua, todos los medios** con derecho de modificación. Tú puedes seguir usando el material en tu portfolio.

### «¿Qué pasa si la furgo se rompe o tenéis que cancelar?»

→ Te ofrecemos vehículo equivalente, reprogramación dentro del periodo permitido o cancelación íntegra con reembolso. No procede lucro cesante.

### «¿Aceptáis colaboraciones en julio o Semana Santa?»

→ No. Solo octubre–mayo y huecos puntuales en otras temporadas. Sin excepciones para temporada alta de verano, Semana Santa, puentes ni picos navideños.

### «¿Cuántos seguidores necesito?»

→ No es el criterio principal. Pesa más el portfolio, la propuesta y la calidad técnica que la audiencia.

### «¿Vale grabar con móvil?»

→ Sí, si es de alta gama y entrega el mismo nivel de calidad (nítido, estable, bien iluminado, buen audio).

### «¿Y si el material no nos termina de gustar pero técnicamente está bien?»

→ Se aprueba. No tenemos margen para «no me convence». El criterio es **técnico y temático**, no estético. Mira la Cláusula 4.2 bis del contrato y el §4.3 de esta guía: si cumple cantidad, técnica, idoneidad de marca y temática, cumple.

---

## 10 · Plantillas de email/WhatsApp

### 10.1 · Respuesta inicial a una solicitud que encaja

> Hola {{NOMBRE}}, gracias por escribirnos.
>
> He revisado tu propuesta y nos encaja. Antes de firmar nada, te dejo por escrito cómo funciona el programa:
>
> 1. Nivel propuesto: **{{NIVEL}}** ({{DIAS}} días de cesión). Entregables mínimos: {{ENTREGABLES_RESUMEN}}.
> 2. Cobro: facturamos el alquiler a tarifa estándar de las fechas (~{{IMPORTE}} €, IVA incluido). Se cobra al 100 % antes de la entrega del vehículo. La fianza son 1.000 € independientes.
> 3. Reembolso: al entregar el material completo y aprobado, te emitimos factura rectificativa por el 100 % y te reembolsamos al método de pago original. Plazos por defecto: entrega 30 días desde dropoff · revisión 14 días · reembolso 10 días.
> 4. Cesión de derechos: amplia (no exclusiva, mundial, perpetua, todos los medios, con derecho de modificación). Conservas autoría y portfolio.
> 5. Exclusividad: **no te pedimos**. Solo aplicamos idoneidad de marca al material que nos cedes (sin competidores visibles, sin conducción imprudente, autorizaciones de imagen para personas reconocibles).
>
> Si te encaja, dime fechas firmes y te paso el contrato personalizado para revisión.

### 10.2 · Notificación de aprobación

> Hola {{NOMBRE}},
>
> Hemos revisado la entrega de tu colaboración **{{REFERENCIA}}** y queda **APROBADA**. Cumple los mínimos del nivel {{NIVEL}} pactados en el contrato.
>
> En los próximos {{PLAZO_REEMBOLSO_DIAS}} días emitiremos la factura rectificativa por el 100 % ({{IMPORTE}} €) y procesaremos el reembolso al método de pago original.
>
> Mil gracias por el material, lo vamos a usar muchísimo.

### 10.3 · Oferta de subsanación

> Hola {{NOMBRE}},
>
> La entrega está casi completa (estimamos un {{PORCENTAJE}} % de los mínimos del nivel {{NIVEL}}). Como excepción y por una única vez, te ofrecemos **7 días naturales adicionales** para completar lo siguiente:
>
> - {{LISTA_DE_FALTANTES}}
>
> Si aceptas, contesta a este email **antes del {{FECHA_LIMITE_ACEPTACION}}**. Al recibir tu confirmación se reabre la revisión cuando completes. Si no aceptas o no llega lo faltante dentro del plazo, la entrega quedará como «no cumple» y el alquiler permanecerá facturado.

### 10.4 · Notificación de no aprobación

> Hola {{NOMBRE}},
>
> Tras revisar la entrega de la colaboración **{{REFERENCIA}}**, la decisión es **NO APROBADA** por los siguientes motivos:
>
> - {{LISTA_DE_MOTIVOS}}
>
> Conforme al contrato firmado (Cláusula 4.4), el alquiler permanece facturado y no procede reembolso por el contenido no entregado. La fianza se libera en su ventana habitual.
>
> Quedamos a tu disposición si quieres comentarlo por teléfono.

---

## 11 · Errores típicos a evitar

- **Ceder vehículo en julio/agosto/Semana Santa por flojeza comercial**. Es la única forma de no devaluar el programa.
- **Aprobar entregas «por pena»** cuando no llegan a los mínimos. Genera precedente y desordena el modelo.
- **Mezclar reembolso del alquiler con devolución de fianza** en un mismo movimiento. Son flujos distintos, con plazos distintos y motivos distintos.
- **Confundir Storytellers con creadores**. Un cliente que ya alquiló no entra en este programa.
- **No documentar la decisión por email**. Aunque haya conversación por WhatsApp, todo lo importante por escrito y archivado.
- **Hablar de penalizaciones**. El modelo no es penalización; es alquiler normal con reembolso condicionado. Esa diferencia importa en términos fiscales y legales.
- **Mezclar gusto personal con criterio de aprobación**. La aprobación es técnica y temática, no editorial. Si cumple los mínimos del nivel, cumple, aunque a ti te gustara otra cosa. El contrato (4.2 bis) y esta guía (§4.3) lo protegen explícitamente: rechazar una entrega «porque no nos convence» sin un motivo técnico/temático concreto sería incumplir nosotros.

---

## 12 · Punteros

### En código

- Niveles y helpers: `src/lib/content-creators/levels.ts` (`COLLAB_LEVELS`, `levelFromDays`, `levelTagFromDays`).
- Landing pública: `src/components/content-creators/content-creators-landing.tsx`.
- Formulario: `src/components/content-creators/creator-application-form.tsx`.
- API: `src/app/api/creator-collaboration/route.ts`.

### En documentación

- Contrato modelo: [`./MODELO-CONTRATO-COLABORACION-CREADORES.md`](./MODELO-CONTRATO-COLABORACION-CREADORES.md).
- Email tipo de envío del contrato: [`./EMAIL-MODELO-ENVIO-CONTRATO.md`](./EMAIL-MODELO-ENVIO-CONTRATO.md).
- Guía interna (este documento): `./GUIA-INTERNA-PROGRAMA-CREADORES.md`.
- Tabla pública: `https://www.furgocasa.com/es/creadores-de-contenido` (sección «Niveles de colaboración»).
- Datos canónicos de empresa: `src/lib/company.ts`.

### En el sistema

- Reservas marcadas como `colaboracion=true` y `referencia=COL-YYYY-NNN`.
- Carpeta de entregas: `creadores/COL-YYYY-NNN/`.

---

*Versión de la guía: **1.0** · Última actualización: 2026-05-14 · Si actualizas niveles, plazos o el modelo económico, recuerda sincronizar landing pública, contrato modelo y esta guía en el mismo commit.*
