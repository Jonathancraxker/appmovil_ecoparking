import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useFonts } from 'expo-font';
import HeaderAdmin from '../../components/HeaderAdmin';
import { registrarCitaService } from '../../services/citasServiceAdm';

export default function CitasAdmin() {

  // Campos
  const [motivo, setMotivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estado, setEstado] = useState('Confirmada');

  const [invitados, setInvitados] = useState([]);
  const [nuevoInvitado, setNuevoInvitado] = useState({ nombre: '', correo: '' });

  const [loading, setLoading] = useState(false);

  // Pickers visibles
  const [showFechaInicioPicker, setShowFechaInicioPicker] = useState(false);
  const [showFechaFinPicker, setShowFechaFinPicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  // Agregar invitado
  const agregarInvitado = () => {
    if (!nuevoInvitado.nombre || !nuevoInvitado.correo) {
      Alert.alert("Error", "Completa nombre y correo del invitado.");
      return;
    }
    setInvitados([...invitados, nuevoInvitado]);
    setNuevoInvitado({ nombre: '', correo: '' });
  };

  // Registrar
  const handleRegistrar = async () => {
    if (!motivo || !fechaInicio || !fechaFin || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const body = {
      motivo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado_cita: estado,
      numero_invitados: invitados.length,
      invitados: invitados
    };

    try {
      setLoading(true);
      const result = await registrarCitaService(body);

      Alert.alert(
        'Cita Registrada',
        `La cita fue agregada correctamente.\n\nID: ${result.id_cita}\nToken QR: ${result.token_qr}`
      );

      // Reset formulario
      setMotivo('');
      setFechaInicio('');
      setFechaFin('');
      setHoraInicio('');
      setHoraFin('');
      setInvitados([]);

    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Registrar Cita" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Nueva Cita</Text>

        <View style={styles.card}>

          {/* Motivo */}
          <Text style={styles.label}>Motivo</Text>
          <TextInput
            style={styles.input}
            placeholder="Motivo de la cita"
            placeholderTextColor="#AAB7B8"
            value={motivo}
            onChangeText={setMotivo}
          />

          {/* FECHA INICIO */}
          <Text style={styles.label}>Fecha Inicio</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowFechaInicioPicker(true)}
          >
            <Text style={{ color: fechaInicio ? '#2E4053' : '#AAB7B8' }}>
              {fechaInicio || 'Seleccionar fecha'}
            </Text>
          </TouchableOpacity>

          {showFechaInicioPicker && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={new Date()}
              onChange={(e, d) => {
                setShowFechaInicioPicker(false);
                if (d) {
                  const fecha = d.toISOString().split("T")[0];
                  setFechaInicio(fecha);
                }
              }}
            />
          )}

          {/* FECHA FIN */}
          <Text style={styles.label}>Fecha Fin</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowFechaFinPicker(true)}
          >
            <Text style={{ color: fechaFin ? '#2E4053' : '#AAB7B8' }}>
              {fechaFin || 'Seleccionar fecha'}
            </Text>
          </TouchableOpacity>

          {showFechaFinPicker && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={new Date()}
              onChange={(e, d) => {
                setShowFechaFinPicker(false);
                if (d) {
                  const fecha = d.toISOString().split("T")[0];
                  setFechaFin(fecha);
                }
              }}
            />
          )}

          {/* HORA INICIO */}
          <Text style={styles.label}>Hora Inicio</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowHoraInicioPicker(true)}
          >
            <Text style={{ color: horaInicio ? '#2E4053' : '#AAB7B8' }}>
              {horaInicio || '--:--'}
            </Text>
          </TouchableOpacity>

          {showHoraInicioPicker && (
            <DateTimePicker
              mode="time"
              display="spinner"
              value={new Date()}
              onChange={(e, t) => {
                setShowHoraInicioPicker(false);
                if (t) {
                  const hora = t.toTimeString().slice(0, 5);
                  setHoraInicio(hora);
                }
              }}
            />
          )}

          {/* HORA FIN */}
          <Text style={styles.label}>Hora Fin</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowHoraFinPicker(true)}
          >
            <Text style={{ color: horaFin ? '#2E4053' : '#AAB7B8' }}>
              {horaFin || '--:--'}
            </Text>
          </TouchableOpacity>

          {showHoraFinPicker && (
            <DateTimePicker
              mode="time"
              display="spinner"
              value={new Date()}
              onChange={(e, t) => {
                setShowHoraFinPicker(false);
                if (t) {
                  const hora = t.toTimeString().slice(0, 5);
                  setHoraFin(hora);
                }
              }}
            />
          )}

          {/* Estado */}
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#E9ECEF' }]}
            editable={false}
            value={estado}
          />

          {/* Invitados */}
          <Text style={[styles.label, { marginTop: 18 }]}>Invitados</Text>

          <View style={styles.invBox}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nombre invitado"
              placeholderTextColor="#AAB7B8"
              value={nuevoInvitado.nombre}
              onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, nombre: t })}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Correo"
              placeholderTextColor="#AAB7B8"
              value={nuevoInvitado.correo}
              onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, correo: t })}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={agregarInvitado}>
            <Text style={styles.buttonText}>Agregar Invitado</Text>
          </TouchableOpacity>

          {invitados.map((i, idx) => (
            <Text key={idx} style={{ marginTop: 5, color: '#2E4053', fontFamily: 'Inter' }}>
              ✔ {i.nombre} — {i.correo}
            </Text>
          ))}

          {/* Botón Registrar */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegistrar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Guardando..." : "Registrar Cita"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 40, paddingBottom: 60 },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#2E4053',
    marginBottom: 25,
  },
  card: {
    width: '90%',
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
  label: {
    fontFamily: 'Inter',
    color: '#2E4053',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FDFEFE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderColor: '#AAB7B8',
    borderWidth: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#2E4053',
    justifyContent: "center",
  },
  invBox: {
    flexDirection: "row",
    gap: 8,
  },
  addBtn: {
    backgroundColor: '#2E4053',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: '#6C9A8B',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 25,
  },
  buttonText: {
    color: '#FDFEFE',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
  },
});   