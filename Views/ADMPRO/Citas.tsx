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
  Platform,
  Switch
} from 'react-native';

import { Picker } from '@react-native-picker/picker'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

import { useFonts } from 'expo-font';
import HeaderAdmin from '../../components/HeaderAdmin'; 
import { registrarCitaService } from '../../services/citasServiceAdm';
import { filtrarCajonesService } from '../../services/cajonesService'; 

export default function CitasAdmin() {

  // Campos Cita
  const [motivo, setMotivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estado, setEstado] = useState('Confirmada'); 
  
  // Estados para Cajones
  const [cajones, setCajones] = useState<any[]>([]);
  const [loadingCajones, setLoadingCajones] = useState(false);

  // Campos Invitado
  const [invitados, setInvitados] = useState<any[]>([]);
  const [nuevoInvitado, setNuevoInvitado] = useState({ 
    nombre: '', 
    correo: '', 
    empresa: '', 
    tipo_visitante: '',
    matricula: '' 
  });

  // --- NUEVOS ESTADOS PARA VIAJE COMPARTIDO ---
  const [traeVehiculo, setTraeVehiculo] = useState(true);
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');
  const [idCajon, setIdCajon] = useState(''); 

  const [loading, setLoading] = useState(false);

  // Pickers visibles
  const [showFechaInicioPicker, setShowFechaInicioPicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  // --- LÓGICA PARA CARGAR CAJONES ---
  const consultarCajones = async () => {
    if (!fechaInicio || !horaInicio || !horaFin) {
        Alert.alert("Atención", "Por favor selecciona la fecha y el horario primero.");
        return;
    }
    setLoadingCajones(true);
    try {
        const data = await filtrarCajonesService({ 
            fecha_inicio: fechaInicio, 
            fecha_fin: fechaFin, 
            hora_inicio: horaInicio, 
            hora_fin: horaFin 
        });
        setCajones(data);
        if (data.length === 0) Alert.alert("Aviso", "No hay cajones disponibles en ese horario.");
    } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los cajones.");
    } finally {
        setLoadingCajones(false);
    }
  };

  // --- 🟢 FILTRO INTELIGENTE DE CAJONES LOCALES ---
  // Esta variable elimina de la lista los cajones que los conductores ya eligieron en la pantalla actual
  const cajonesDisponiblesLocales = cajones.filter(
    cajonBD => !invitados.some(inv => inv.es_conductor && String(inv.id_cajon) === String(cajonBD.id))
  );

  // --- LÓGICA PICKERS ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
          setShowFechaInicioPicker(false);
      }
      if (event.type === "set" && selectedDate) {
          const fecha = selectedDate.toISOString().split("T")[0];
          setFechaInicio(fecha);
          setFechaFin(fecha);
      }
  };

  const handleTimeChange = (event: any, selectedDate?: Date, type?: 'hi' | 'hf') => {
      if (Platform.OS === 'android') {
          if (type === 'hi') setShowHoraInicioPicker(false);
          if (type === 'hf') setShowHoraFinPicker(false);
      }
      if (event.type === "set" && selectedDate) {
          const hora = selectedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
          if (type === 'hi') setHoraInicio(hora);
          if (type === 'hf') setHoraFin(hora);
      }
  };

  // --- AGREGAR INVITADO (LÓGICA CONDUCTOR/PASAJERO) ---
  const agregarInvitado = () => {
    if (!nuevoInvitado.nombre.trim() || !nuevoInvitado.correo.trim() || !nuevoInvitado.empresa.trim() || !nuevoInvitado.tipo_visitante.trim()) {
      Alert.alert("Datos incompletos", "Por favor completa Nombre, Correo, Empresa y Tipo.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoInvitado.correo)) {
      Alert.alert("Correo inválido", "Ingresa un correo válido.");
      return;
    }

    let matriculaFinal = nuevoInvitado.matricula;
    let idCajonFinal = idCajon;

    if (traeVehiculo) {
        if (!matriculaFinal.trim() || !idCajonFinal) {
            Alert.alert("Faltan datos", "El conductor necesita una matrícula y un cajón asignado.");
            return;
        }
    } else {
        if (!conductorSeleccionado) {
            Alert.alert("Faltan datos", "Selecciona con quién comparte vehículo este pasajero.");
            return;
        }
        // 🟢 Solo buscamos entre los que están marcados como conductores reales
        const conductor = invitados.find(inv => inv.nombre === conductorSeleccionado && inv.es_conductor);
        if (conductor) {
            matriculaFinal = conductor.matricula;
            idCajonFinal = conductor.id_cajon;
        }
    }

    // 🟢 Guardamos la bandera "es_conductor" para el manejo de UI
    setInvitados([...invitados, { 
        ...nuevoInvitado, 
        matricula: matriculaFinal,
        id_cajon: idCajonFinal,
        es_conductor: traeVehiculo 
    }]);

    setNuevoInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '', matricula: '' });
    setIdCajon('');
    setConductorSeleccionado('');
    setTraeVehiculo(true);
  };

  const eliminarInvitadoLocal = (index: number) => {
      const nuevosInvitados = [...invitados];
      nuevosInvitados.splice(index, 1);
      setInvitados(nuevosInvitados);
  };

  // --- REGISTRAR CITA EN BACKEND ---
  const handleRegistrar = async () => {
    if (!motivo || !fechaInicio || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Completa los datos generales de la cita.');
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

      setMotivo('');
      setFechaInicio('');
      setFechaFin('');
      setHoraInicio('');
      setHoraFin('');
      setInvitados([]);
      setCajones([]);

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

          <Text style={styles.label}>Motivo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Reunión mensual"
            placeholderTextColor="#AAB7B8"
            value={motivo}
            onChangeText={setMotivo}
          />

          <Text style={styles.label}>Fecha de la Cita</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowFechaInicioPicker(true)}>
              <Text style={{ color: fechaInicio ? '#2E4053' : '#AAB7B8' }}>{fechaInicio || 'Seleccionar fecha'}</Text>
          </TouchableOpacity>

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

          {showFechaInicioPicker && <DateTimePicker mode="date" value={new Date()} onChange={handleDateChange} />}
          {showHoraInicioPicker && <DateTimePicker mode="time" value={new Date()} is24Hour={true} onChange={(e, t) => handleTimeChange(e, t, 'hi')} />}
          {showHoraFinPicker && <DateTimePicker mode="time" value={new Date()} is24Hour={true} onChange={(e, t) => handleTimeChange(e, t, 'hf')} />}


          {/* --- SECCIÓN INVITADOS --- */}
          <Text style={[styles.label, { marginTop: 20, fontSize: 16, color: '#6C9A8B', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 }]}>Agregar Invitados</Text>
          
          <View style={styles.invBox}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nombre" placeholderTextColor="#AAB7B8" value={nuevoInvitado.nombre} onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, nombre: t })} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Correo" placeholderTextColor="#AAB7B8" value={nuevoInvitado.correo} onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, correo: t })} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View style={[styles.invBox, {marginTop: 5}]}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Empresa" placeholderTextColor="#AAB7B8" value={nuevoInvitado.empresa} onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, empresa: t })} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Tipo (Ej. Proveedor)" placeholderTextColor="#AAB7B8" value={nuevoInvitado.tipo_visitante} onChangeText={(t) => setNuevoInvitado({ ...nuevoInvitado, tipo_visitante: t })} />
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, marginBottom: 5, backgroundColor: '#F8F9F9', padding: 10, borderRadius: 8}}>
              <Text style={{fontFamily: 'Inter', color: '#2E4053'}}>¿Trae vehículo propio?</Text>
              <Switch value={traeVehiculo} onValueChange={setTraeVehiculo} trackColor={{ false: "#AAB7B8", true: "#6C9A8B" }} thumbColor={"#FFF"} />
          </View>

          {traeVehiculo ? (
              <View>
                  <TextInput 
                    style={[styles.input, { marginTop: 5 }]} 
                    placeholder="Matrícula (Ej. UKL-247-K)" 
                    placeholderTextColor="#AAB7B8" 
                    value={nuevoInvitado.matricula} 
                    maxLength={9} 
                    onChangeText={(t) => setNuevoInvitado({ 
                        ...nuevoInvitado, 
                        matricula: t.replace(/ /g, '-').replace(/[^A-Za-z0-9-]/g, '').toUpperCase() 
                    })} 
                    autoCapitalize="characters" 
                  />

                  <TouchableOpacity style={[styles.addBtn, {backgroundColor: '#2E4053', marginTop: 15}]} onPress={consultarCajones}>
                      <Text style={{color: '#FFF', fontWeight: 'bold'}}>Ver Cajones Disponibles</Text>
                  </TouchableOpacity>

                  {loadingCajones ? <ActivityIndicator size="small" color="#6C9A8B" style={{marginTop: 10}} /> : (
                    <View style={[styles.input, {padding: 0, marginTop: 5}]}>
                      {/* 🟢 Leemos de cajonesDisponiblesLocales en vez de cajones generales */}
                      <Picker selectedValue={idCajon} onValueChange={(val) => setIdCajon(val)}>
                          <Picker.Item label="-- Asignar un Cajón --" value="" />
                          {cajonesDisponiblesLocales.map(c => (
                              <Picker.Item key={c.id} label={`Cajón ${c.numero_cajon}`} value={c.id} />
                          ))}
                      </Picker>
                    </View>
                  )}
              </View>
          ) : (
              <View style={[styles.input, {padding: 0, marginTop: 5}]}>
                  <Picker selectedValue={conductorSeleccionado} onValueChange={(val) => setConductorSeleccionado(val)}>
                      <Picker.Item label="-- Comparte coche con: --" value="" />
                      {/* 🟢 Filtramos usando la nueva bandera es_conductor */}
                      {invitados.filter(inv => inv.es_conductor).map((inv, idx) => (
                          <Picker.Item key={idx} label={inv.nombre} value={inv.nombre} />
                      ))}
                  </Picker>
              </View>
          )}

          <TouchableOpacity style={styles.addBtn} onPress={agregarInvitado}>
            <Text style={[styles.buttonText, {fontSize: 14}]}>+ Añadir a la lista</Text>
          </TouchableOpacity>

          {/* Lista de invitados */}
          <View style={{marginTop: 10}}>
              {invitados.length > 0 ? (
                  invitados.map((inv, idx) => (
                    <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, backgroundColor: '#F4F6F6', padding: 10, borderRadius: 6, borderLeftWidth: 4, borderLeftColor: inv.es_conductor ? '#3498DB' : '#F39C12'}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontFamily: 'Poppins-SemiBold', color: '#2E4053', fontSize: 13}}>
                                {idx + 1}. {inv.nombre} <Text style={{fontWeight: 'normal', fontFamily: 'Inter', fontSize: 12}}>({inv.tipo_visitante})</Text>
                            </Text>
                            <Text style={{fontFamily: 'Inter', color: '#777', fontSize: 11}}>
                                {inv.correo} • Matrícula: {inv.matricula}
                            </Text>
                            <Text style={{fontFamily: 'Inter', color: inv.es_conductor ? '#27AE60' : '#888', fontSize: 11, fontWeight: 'bold'}}>
                                {inv.es_conductor ? `🚗 Conductor` : '🚶‍♂️ Pasajero (Compartido)'}
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

          <TouchableOpacity style={styles.button} onPress={handleRegistrar} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>GUARDAR CITA</Text>}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 20, paddingBottom: 60 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 22, color: '#2E4053', marginBottom: 15 },
  card: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderColor: '#AAB7B8', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  label: { fontFamily: 'Inter', color: '#2E4053', marginTop: 10, marginBottom: 4, fontSize: 14 },
  input: { backgroundColor: '#FDFEFE', borderRadius: 8, paddingHorizontal: 12, height: 44, borderColor: '#AAB7B8', borderWidth: 1, fontFamily: 'Inter', fontSize: 14, color: '#2E4053', justifyContent: "center" },
  invBox: { flexDirection: "row", gap: 8 },
  addBtn: { backgroundColor: '#34495E', paddingVertical: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  button: { backgroundColor: '#6C9A8B', borderRadius: 10, alignItems: 'center', paddingVertical: 14, marginTop: 25 },
  buttonText: { color: '#FDFEFE', fontFamily: 'Poppins', fontWeight: '600', fontSize: 16 },
});