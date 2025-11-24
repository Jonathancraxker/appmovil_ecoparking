import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

import { useFonts } from 'expo-font';
import HeaderAdmin from '../../components/HeaderJucas';
import { registrarCitaService } from '../../services/citasServiceJuca';

export default function CitasAdmin() {

  // Campos Cita
  const [motivo, setMotivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estado, setEstado] = useState('Confirmada'); 

  // Campos Invitado
  const [invitados, setInvitados] = useState<any[]>([]);
  // CORRECCIÓN: Inicializamos con todos los campos necesarios
  const [nuevoInvitado, setNuevoInvitado] = useState({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });

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

  // --- LÓGICA PICKERS (CORREGIDA) ---
  const handleDateChange = (event: any, selectedDate?: Date, type?: 'fi' | 'ff') => {
      // En Android hay que ocultar el picker siempre
      if (Platform.OS === 'android') {
          if (type === 'fi') setShowFechaInicioPicker(false);
          if (type === 'ff') setShowFechaFinPicker(false);
      }

      // Solo actualizamos si el usuario confirmó (type === 'set' y hay fecha)
      if (event.type === "set" && selectedDate) {
          const fecha = selectedDate.toISOString().split("T")[0];
          if (type === 'fi') setFechaInicio(fecha);
          if (type === 'ff') setFechaFin(fecha);
      }
      // Si canceló, no hacemos nada
  };

  const handleTimeChange = (event: any, selectedDate?: Date, type?: 'hi' | 'hf') => {
      if (Platform.OS === 'android') {
          if (type === 'hi') setShowHoraInicioPicker(false);
          if (type === 'hf') setShowHoraFinPicker(false);
      }

      if (event.type === "set" && selectedDate) {
          // Formato HH:MM
          const hora = selectedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
          if (type === 'hi') setHoraInicio(hora);
          if (type === 'hf') setHoraFin(hora);
      }
  };


  // Agregar invitado a la lista local
  const agregarInvitado = () => {
    // Validación completa de los 4 campos
    if (!nuevoInvitado.nombre.trim() || !nuevoInvitado.correo.trim() || !nuevoInvitado.empresa.trim() || !nuevoInvitado.tipo_visitante.trim()) {
      Alert.alert("Datos incompletos", "Por favor completa todos los campos del invitado (Nombre, Correo, Empresa, Tipo).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoInvitado.correo)) {
      Alert.alert("Correo inválido", "Ingresa un correo válido.");
      return;
    }

    // Agregamos al array local
    setInvitados([...invitados, { ...nuevoInvitado }]);
    // Limpiamos inputs
    setNuevoInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });
  };

  // Eliminar invitado de la lista local
  const eliminarInvitadoLocal = (index: number) => {
      const nuevosInvitados = [...invitados];
      nuevosInvitados.splice(index, 1);
      setInvitados(nuevosInvitados);
  };

  // Registrar Cita + Invitados
  const handleRegistrar = async () => {
    if (!motivo || !fechaInicio || !fechaFin || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Por favor completa todos los campos de la cita.');
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
        '¡Éxito!',
        `Cita registrada correctamente.\nID: ${result.id_cita || 'N/A'}`
      );

      // Reset formulario completo
      setMotivo('');
      setFechaInicio('');
      setFechaFin('');
      setHoraInicio('');
      setHoraFin('');
      setInvitados([]);
      setNuevoInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });

    } catch (error: any) {
      console.log(error);
      const msg = error.message || 'No se pudo registrar la cita.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Registrar Cita" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nueva Cita</Text>

        <View style={styles.card}>

          {/* Motivo */}
          <Text style={styles.label}>Motivo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Reunión mensual"
            placeholderTextColor="#AAB7B8"
            value={motivo}
            onChangeText={setMotivo}
          />

          {/* FECHAS (Row) */}
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Fecha Inicio</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowFechaInicioPicker(true)}>
                    <Text style={{ color: fechaInicio ? '#2E4053' : '#AAB7B8' }}>{fechaInicio || 'Seleccionar'}</Text>
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Fecha Fin</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowFechaFinPicker(true)}>
                    <Text style={{ color: fechaFin ? '#2E4053' : '#AAB7B8' }}>{fechaFin || 'Seleccionar'}</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* HORAS (Row) */}
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Hora Inicio</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowHoraInicioPicker(true)}>
                    <Text style={{ color: horaInicio ? '#2E4053' : '#AAB7B8' }}>{horaInicio || '--:--'}</Text>
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Hora Fin</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowHoraFinPicker(true)}>
                    <Text style={{ color: horaFin ? '#2E4053' : '#AAB7B8' }}>{horaFin || '--:--'}</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* PICKERS (Controlados) */}
          {showFechaInicioPicker && (
            <DateTimePicker
              mode="date" value={new Date()}
              onChange={(e, d) => handleDateChange(e, d, 'fi')}
            />
          )}
          {showFechaFinPicker && (
            <DateTimePicker
              mode="date" value={new Date()}
              onChange={(e, d) => handleDateChange(e, d, 'ff')}
            />
          )}
          {showHoraInicioPicker && (
            <DateTimePicker
              mode="time" value={new Date()} is24Hour={true}
              onChange={(e, t) => handleTimeChange(e, t, 'hi')}
            />
          )}
          {showHoraFinPicker && (
            <DateTimePicker
              mode="time" value={new Date()} is24Hour={true}
              onChange={(e, t) => handleTimeChange(e, t, 'hf')}
            />
          )}

          {/* --- SECCIÓN INVITADOS --- */}
          <Text style={[styles.label, { marginTop: 20, fontSize: 16, color: '#6C9A8B', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 }]}>Agregar Invitados</Text>
          
          {/* Fila 1: Nombre y Correo */}
          <View style={styles.invBox}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nombre"
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
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Fila 2: Empresa y Tipo (NUEVOS CAMPOS) */}
          <View style={[styles.invBox, {marginTop: 5}]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Empresa"
              placeholderTextColor="#AAB7B8"
              value={nuevoInvitado.empresa}
              onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, empresa: t })}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Tipo (Ej. Proveedor)"
              placeholderTextColor="#AAB7B8"
              value={nuevoInvitado.tipo_visitante}
              onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, tipo_visitante: t })}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={agregarInvitado}>
            <Text style={[styles.buttonText, {fontSize: 14}]}>+ Añadir a la lista</Text>
          </TouchableOpacity>

          {/* Lista de invitados agregados */}
          <View style={{marginTop: 10}}>
              {invitados.length > 0 ? (
                  invitados.map((inv, idx) => (
                    <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, backgroundColor: '#F4F6F6', padding: 10, borderRadius: 6}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontFamily: 'Poppins-SemiBold', color: '#2E4053', fontSize: 13}}>
                                {idx + 1}. {inv.nombre} <Text style={{fontWeight: 'normal', fontFamily: 'Inter', fontSize: 12}}>({inv.tipo_visitante})</Text>
                            </Text>
                            <Text style={{fontFamily: 'Inter', color: '#777', fontSize: 11}}>
                                {inv.correo} • {inv.empresa}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => eliminarInvitadoLocal(idx)} style={{padding: 5}}>
                            <MaterialIcons name="close" size={18} color="#E74C3C" />
                        </TouchableOpacity>
                    </View>
                  ))
              ) : (
                  <Text style={{fontFamily: 'Inter', color: '#AAA', fontSize: 12, fontStyle: 'italic', textAlign: 'center', padding: 10}}>No hay invitados agregados aún.</Text>
              )}
          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegistrar}
            disabled={loading}
          >
            {loading ? (
                 <ActivityIndicator color="#FFF" />
            ) : (
                 <Text style={styles.buttonText}>GUARDAR CITA</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#2E4053',
    marginBottom: 15,
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
    marginTop: 10,
    marginBottom: 4,
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
    backgroundColor: '#34495E', 
    paddingVertical: 10,
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