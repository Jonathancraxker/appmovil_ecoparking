// 📁 Views/JUCA/ReportesJuca.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderJucas from '../../components/HeaderJucas'; // ✅ Importa el nuevo header

export default function ReportesJuca() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      {/* ✅ Encabezado unificado con el estilo Jucas */}
      <HeaderJucas title="Reportes" />

      {/* 🔹 Contenido principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.infoText}>
          Aquí podrás visualizar y gestionar los reportes del sistema.
        </Text>

        {/* 🔸 Zona para mostrar reportes */}
        <View style={styles.reportBox}>
          <Text style={styles.reportTitle}>📊 Reporte general</Text>
          <Text style={styles.reportDescription}>
            En esta sección se mostrarán los datos analíticos, estadísticas o registros generados
            por los usuarios y administradores.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  infoText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#2E4053',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderColor: '#AAB7B8',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  reportTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#2E4053',
    marginBottom: 8,
  },
  reportDescription: {
    fontFamily: 'Inter',
    color: '#566573',
    fontSize: 14,
    lineHeight: 20,
  },
});
