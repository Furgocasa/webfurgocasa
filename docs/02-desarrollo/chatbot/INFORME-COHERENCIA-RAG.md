# Informe de coherencia RAG vs web

Generado: 2026-06-30T14:18:07.007Z

- Avisos (revisar): **8**
- Informativos: **2**
- Correctos: **8**

## Avisos a revisar

### Temporadas
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "baja" -> web "Temporada Media - San José": [115, 105, 95, 85] vs texto CSV: [95, 85, 75, 65]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "baja" -> web "Temporada Media - Semana Santa 2026": [115, 105, 95, 85] vs texto CSV: [95, 85, 75, 65]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "media" -> web "Temporada Media - Mediados Junio": [110, 100, 95, 85] vs texto CSV: [125, 115, 105, 95]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "alta" -> web "Temporada Alta - Verano (Jun-Jul)": [125, 115, 105, 95] vs texto CSV: [155, 145, 135, 125]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "baja" -> web "Final abril - inicio mayo 2026": [95, 85, 80, 65] vs texto CSV: [95, 85, 75, 65]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "media" -> web "Temporada Media - Septiembre y Octubre": [115, 105, 95, 85] vs texto CSV: [125, 115, 105, 95]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "alta" -> web "Temporada Alta - Verano (Agosto Centro)": [155, 145, 125, 115] vs texto CSV: [155, 145, 135, 125]. Revisar/actualizar el texto orientativo del CSV.
- [ ] Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "alta" -> web "Temporada Alta - Verano (Ago-Sep)": [125, 115, 105, 95] vs texto CSV: [155, 145, 135, 125]. Revisar/actualizar el texto orientativo del CSV.

## Informativos

### Vehiculos
- El CSV de modelos aun contiene 12 fichas individuales que se IGNORAN (las fichas se toman de la BBDD). Puedes eliminarlas para evitar confusion: DETHLEFFS GLOBETRAIL 600 DB, KNAUS BOXSTAR STREET MANUAL, WEINSBERG CARATOUR 600 MQ, KNAUS BOXSTAR STREET FAMILY, LIVINGSTONE SPORT 5, SUNLIGHT CLIFF 601 ADVENTURE, ADRIA TWIN PLUS 600 SPB FAMILY, CHALLENGER V114 MAX ROAD PREMIUM, KNAUS BOXSTAR STREET AUTOMATICA, KNAUS BOXLIFE 600 QD, WEINSBERG CARABUS 600 MQ EDITION FIRE, WEINSBERG CARABUS 540 MQ EDITION FIRE

### Ajustes
- No hay ajustes de fianza/franquicia en settings. El CSV indica fianza 1000 € y franquicia 900 €/siniestro; verificar manualmente.

## Verificaciones correctas

### Vehiculos
- Flota indexada desde la BBDD (10): Dreamer D55 Fun, Dethleffs Globetrail DS, Knaus Boxstar Street, Knaus Boxstar 600 Family, Adria Twin Plus 600 SPB, Weinsberg Carabus 540 Mq FIRE, Weinsberg CaraTour 600 MQ, Weinsberg Carabus 600 Mq FIRE, Knaus Boxstar Street 600 MQ, Knaus Boxlife DQ

### Extras
- Extras indexados desde la BBDD (7): Edredón invierno, 2ª cama (4 plazas), Mascotas permitidas, Bicicletas, Aparcamiento en Murcia, Toallas de baño, Sábanas y almohadas

### Temporadas
- Precios temporada "media" coinciden web/CSV: [125, 115, 105, 95]
- Precios temporada "alta" coinciden web/CSV: [155, 145, 135, 125]

### Ubicaciones
- Sede "MURCIA" coherente entre CSV y web.
- Sede "MADRID" coherente entre CSV y web.
- Sede "ALBACETE" coherente entre CSV y web.
- Sede "ALICANTE" coherente entre CSV y web.

