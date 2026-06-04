/**
 * Puntos delicados del contrato que el cliente debe confirmar explícitamente
 * (además de aceptar y firmar). Importes y plazos extraídos del contrato real
 * `public/documentos/condiciones-alquiler.pdf`.
 *
 * Este archivo NO debe importar dependencias de Node: lo usan tanto el
 * componente cliente (checks) como el servidor (validación y PDF firmado).
 */

export interface ConfirmationItem {
  id: string;
  label: string;
}

/** Confirmaciones asociadas a las Condiciones del Alquiler Detalladas. */
export const CONDITIONS_CONFIRMATIONS: ConfirmationItem[] = [
  {
    id: "fianza",
    label:
      "Confirmo haber leído que debo abonar una fianza de 1.000 € por transferencia bancaria, como máximo 72 horas antes del inicio del alquiler.",
  },
  {
    id: "franquicia",
    label:
      "Confirmo haber leído que el seguro tiene una franquicia de 900 € por siniestro, importe que asumo en caso de daños.",
  },
  {
    id: "limpieza",
    label:
      "Confirmo haber leído que debo devolver el vehículo limpio por dentro y con los depósitos de aguas y WC vacíos. En caso contrario se aplican suplementos: aguas grises 20 €, WC químico 70 € y limpieza del habitáculo desde 120 €.",
  },
  {
    id: "combustible",
    label:
      "Confirmo haber leído que debo devolver el vehículo con el mismo nivel de combustible con el que se entrega. El combustible que falte se cobra con un recargo del 100% (el doble del precio).",
  },
  {
    id: "retrasos",
    label:
      "Confirmo haber leído que hay penalización por retraso, tanto en la entrega como en la recogida: 40 € la primera hora y 20 € por cada hora extra, con un máximo equivalente a 2 días de alquiler por cada día de retraso.",
  },
  {
    id: "fumar",
    label:
      "Confirmo haber leído que está prohibido fumar en el vehículo y que su incumplimiento conlleva una penalización de 200 €.",
  },
  {
    id: "conductor",
    label:
      "Confirmo haber leído que todos los conductores deben tener un mínimo de 25 años y carnet de conducir B con al menos 3 años de antigüedad.",
  },
];

/** Confirmaciones asociadas al Anexo de Protección de Datos. */
export const DATA_PROTECTION_CONFIRMATIONS: ConfirmationItem[] = [
  {
    id: "geolocalizacion",
    label:
      "Confirmo haber leído que todos los vehículos llevan instalado un dispositivo de geolocalización (GPS).",
  },
];

export const ALL_CONFIRMATION_IDS: string[] = [
  ...CONDITIONS_CONFIRMATIONS,
  ...DATA_PROTECTION_CONFIRMATIONS,
].map((c) => c.id);

export function findConfirmationLabel(id: string): string | null {
  const all = [...CONDITIONS_CONFIRMATIONS, ...DATA_PROTECTION_CONFIRMATIONS];
  return all.find((c) => c.id === id)?.label || null;
}
