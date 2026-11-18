// Utilidades de vinculación Conductor <-> Acompañante (mismo criterio que la web)

export const TIPO_CONDUCTOR = 'Conductor';
export const TIPO_ACOMPANANTE = 'Acompañante';

/**
 * ¿Este invitado es el conductor del vehículo?
 * - Si el backend ya trae tipo_acompanante, se usa ese valor.
 * - Para registros viejos (tipo_acompanante NULL) se conserva la heurística anterior:
 *   el primer invitado de cada cajón es el conductor.
 */
export const esConductor = (inv: any, lista: any[]): boolean => {
  if (inv?.tipo_acompanante) return inv.tipo_acompanante === TIPO_CONDUCTOR;
  if (!inv?.id_cajon) return false;
  return lista.find((c) => c.id_cajon === inv.id_cajon)?.id === inv.id;
};

export const getConductores = (lista: any[]): any[] =>
  lista.filter((inv) => inv.id_cajon && esConductor(inv, lista));
