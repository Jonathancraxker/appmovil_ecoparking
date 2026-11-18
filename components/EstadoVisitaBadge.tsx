import React from 'react';
import { Text, View } from 'react-native';

const CONFIG: Record<string, { label: string; bg: string }> = {
  Pendiente: { label: 'Pendiente', bg: '#95A5A6' },
  Dentro: { label: '🟢 Dentro del estacionamiento', bg: '#27AE60' },
  Finalizado: { label: '✔ Visita finalizada', bg: '#34495E' },
};

export default function EstadoVisitaBadge({ estado }: { estado?: string | null }) {
  const cfg = CONFIG[estado || 'Pendiente'] || CONFIG.Pendiente;
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: cfg.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3 }}>
      <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'Inter' }}>{cfg.label}</Text>
    </View>
  );
}
