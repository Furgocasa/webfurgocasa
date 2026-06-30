# Informe de coherencia RAG vs web

Generado: 2026-06-30T20:46:03.111Z

- Avisos (revisar): **0**
- Informativos: **9**
- Correctos: **10**

## Avisos a revisar

Sin avisos. Todo cuadra.

## Informativos

### Vehiculos
- El CSV de modelos aun contiene 12 fichas individuales que se IGNORAN (las fichas se toman de la BBDD). Puedes eliminarlas para evitar confusion: DETHLEFFS GLOBETRAIL 600 DB, KNAUS BOXSTAR STREET MANUAL, WEINSBERG CARATOUR 600 MQ, KNAUS BOXSTAR STREET FAMILY, LIVINGSTONE SPORT 5, SUNLIGHT CLIFF 601 ADVENTURE, ADRIA TWIN PLUS 600 SPB FAMILY, CHALLENGER V114 MAX ROAD PREMIUM, KNAUS BOXSTAR STREET AUTOMATICA, KNAUS BOXLIFE 600 QD, WEINSBERG CARABUS 600 MQ EDITION FIRE, WEINSBERG CARABUS 540 MQ EDITION FIRE

### Temporadas
- No se pudieron extraer los precios orientativos del CSV CONDICIONES para comparar.
- Temporada web "Temporada Media - Fin Diciembre 2025" (media) precios=[125, 115, 105, 95] (sin equivalente claro en el CSV para comparar).
- Temporada web "Temporada Media - San José" (baja) precios=[115, 105, 95, 85] (sin equivalente claro en el CSV para comparar).
- Temporada web "Temporada Alta - Verano 2027" (alta) precios=[155, 145, 135, 125] (sin equivalente claro en el CSV para comparar).

### Sedes (minimos/sobrecoste)
- "Madrid": extra_fee en BBDD = 150 € (por trayecto). Sobrecoste REAL al cliente = 300 € (recogida + devolucion). El RAG debe indexar 300 €, no 150 €.
- "Albacete": extra_fee en BBDD = 200 € (por trayecto). Sobrecoste REAL al cliente = 400 € (recogida + devolucion). El RAG debe indexar 400 €, no 200 €.
- "Alicante": extra_fee en BBDD = 200 € (por trayecto). Sobrecoste REAL al cliente = 400 € (recogida + devolucion). El RAG debe indexar 400 €, no 200 €.

### Ajustes
- No hay ajustes de fianza/franquicia en settings. El CSV indica fianza 1000 € y franquicia 900 €/siniestro; verificar manualmente.

## Verificaciones correctas

### Vehiculos
- Flota indexada desde la BBDD (10): Dreamer D55 Fun, Dethleffs Globetrail DS, Knaus Boxstar Street, Knaus Boxstar 600 Family, Adria Twin Plus 600 SPB, Weinsberg Carabus 540 Mq FIRE, Weinsberg CaraTour 600 MQ, Weinsberg Carabus 600 Mq FIRE, Knaus Boxstar Street 600 MQ, Knaus Boxlife DQ

### Extras
- Extras indexados desde la BBDD (7): Edredón invierno, 2ª cama (4 plazas), Mascotas permitidas, Bicicletas, Aparcamiento en Murcia, Toallas de baño, Sábanas y almohadas

### Ubicaciones
- Sede "MURCIA" coherente entre CSV y web.
- Sede "MADRID" coherente entre CSV y web.
- Sede "ALBACETE" coherente entre CSV y web.
- Sede "ALICANTE" coherente entre CSV y web.

### Sedes (minimos/sobrecoste)
- "Madrid": minimo 12 dias (oct-jun) / 20 dias (jul-sep).
- Murcia: sin sobrecoste; minimo segun temporada.
- "Albacete": minimo 7 dias (oct-jun) / 7 dias (jul-sep).
- "Alicante": minimo 7 dias (oct-jun) / 7 dias (jul-sep).

