import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import { useIsFocused } from '@react-navigation/native';

// Importaciones de Expo
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import HeaderAdmin from '../../components/HeaderJucas';

// 1. IMPORTACIONES DESDE citasServiceAdm
import {
  getCitasAdminService,
  deleteCitaService,
  updateCitaService,
  getInvitadosByCitaService,
  registrarInvitadoService,
  updateInvitadoService,
  deleteInvitadoService
} from "../../services/citasServiceJuca";

export default function Homeadm() {
  // --- ESTADOS UI ---
  const [modalVisible, setModalVisible] = useState(false); // Editar Cita
  const [deleteVisible, setDeleteVisible] = useState(false); // Eliminar Cita
  const [showInvitadoModal, setShowInvitadoModal] = useState(false); // Gestionar Invitados
  const [qrModalVisible, setQrModalVisible] = useState(false); // Ver QR
  
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // --- DATOS ---
  const [citas, setCitas] = useState<any[]>([]);
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [qrValue, setQrValue] = useState('');
  
  // Referencias
  const qrCodeRef = useRef<any>(null);
  const isFocused = useIsFocused();

  // --- FORMULARIO CITA (EDICIÓN) ---
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [hora, setHora] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estadoCita, setEstadoCita] = useState('');
  
  // --- FORMULARIO INVITADOS ---
  const [invitadosList, setInvitadosList] = useState<any[]>([]);
  const [currentInvitado, setCurrentInvitado] = useState<any>(null);
  const [formInvitado, setFormInvitado] = useState({
    nombre: '', 
    correo: '', 
    empresa: '', 
    tipo_visitante: ''
  });

  // --- PICKERS ---
  const [showFechaPicker, setShowFechaPicker] = useState(false);
  const [showFechaFinPicker, setShowFechaFinPicker] = useState(false);
  const [showHoraPicker, setShowHoraPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  // --- EFECTOS ---
  useEffect(() => {
    if (isFocused) cargarCitas();
  }, [isFocused]);

  // --- HELPERS PARA FECHAS (CORRECCIÓN) ---
  // Convierten el string 'YYYY-MM-DD' a objeto Date para que el picker se abra en la fecha correcta
  const getDateFromString = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Convierten 'HH:MM' a objeto Date
  const getTimeFromString = (timeStr: string) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // --- FUNCIONES PRINCIPALES ---

  const cargarCitas = async () => {
    setLoading(true);
    try {
        const data = await getCitasAdminService(); 
        setCitas(data);
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (action: string, cita: any) => {
    setMenuVisible(null);
    setSelectedCita(cita);

    if (action === 'editar') {
      setTitulo(cita.motivo || '');
      setFecha(cita.fecha_inicio?.split("T")[0] || '');
      setFechaFin(cita.fecha_fin?.split("T")[0] || '');
      setHora(cita.hora_inicio || '');
      setHoraFin(cita.hora_fin || '');
      setEstadoCita(cita.estado_cita || 'Confirmada');
      setModalVisible(true);
    }

    if (action === 'eliminar') {
        setDeleteVisible(true);
    }

    if (action === 'qr') {
      if (!cita.url_validacion) { 
        Alert.alert("QR no disponible", "Esta cita no tiene un código QR generado."); 
        return; 
      }
      setQrValue(cita.url_validacion);
      setQrModalVisible(true);
    }

    if (action === 'invitados') {
        setLoading(true);
        try {
            const invitados = await getInvitadosByCitaService(cita.id);
            setInvitadosList(invitados);
            setFormInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });
            setCurrentInvitado(null);
            setShowInvitadoModal(true);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los invitados.");
        } finally {
            setLoading(false);
        }
    }
  };

  // --- GESTIÓN DE CITA (EDICIÓN/ELIMINACIÓN) ---

  const guardarEdicionCita = async () => {
    if (!titulo || !fecha || !fechaFin || !hora || !horaFin) {
      Alert.alert("Error", "Todos los campos de la cita son obligatorios");
      return;
    }

    const dataToSend = {
      fecha_inicio: fecha,
      fecha_fin: fechaFin,
      hora_inicio: hora,
      hora_fin: horaFin,
      motivo: titulo,
      estado_cita: estadoCita,
    };

    const result = await updateCitaService(selectedCita.id, dataToSend);

    if (result.message && !result.message.toLowerCase().includes('actualizada')) {
        Alert.alert("Error", result.message);
    } else {
        Alert.alert("Éxito", "Cita actualizada correctamente");
        setModalVisible(false);
        cargarCitas();
    }
  };

  const eliminarCita = async () => {
    await deleteCitaService(selectedCita.id);
    Alert.alert("Eliminado", "Cita eliminada correctamente 🗑️");
    setDeleteVisible(false);
    cargarCitas();
  };

  // --- GESTIÓN DE INVITADOS (CRUD INDIVIDUAL) ---

  const handleSaveInvitado = async () => {
      if (!formInvitado.nombre.trim() || !formInvitado.correo.trim() || !formInvitado.empresa.trim() || !formInvitado.tipo_visitante.trim()) {
          Alert.alert("Datos incompletos", "Todos los campos son obligatorios.");
          return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formInvitado.correo)) {
          Alert.alert("Correo inválido", "Ingresa un correo válido.");
          return;
      }

      try {
          if (currentInvitado) {
              await updateInvitadoService(currentInvitado.id, { 
                  ...formInvitado, 
                  id_cita: selectedCita.id 
              });
              Alert.alert("Éxito", "Invitado actualizado");
          } else {
              await registrarInvitadoService({ 
                  ...formInvitado, 
                  id_cita: selectedCita.id 
              });
              Alert.alert("Éxito", "Invitado agregado");
          }
          
          const updatedList = await getInvitadosByCitaService(selectedCita.id);
          setInvitadosList(updatedList);
          
          setFormInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });
          setCurrentInvitado(null);
          cargarCitas(); 

      } catch (error: any) {
          Alert.alert("Error", error.message || "No se pudo guardar el invitado");
      }
  };

  const handleEditInvitado = (inv: any) => {
      setCurrentInvitado(inv);
      setFormInvitado({
          nombre: inv.nombre,
          correo: inv.correo,
          empresa: inv.empresa || '',
          tipo_visitante: inv.tipo_visitante || ''
      });
  };

  const handleCancelEditInvitado = () => {
      setCurrentInvitado(null);
      setFormInvitado({ nombre: '', correo: '', empresa: '', tipo_visitante: '' });
  };

  const handleDeleteInvitado = async (idInv: number) => {
      Alert.alert("Eliminar", "¿Seguro que deseas eliminar este invitado?", [
          { text: "Cancelar", style: 'cancel' },
          { text: "Eliminar", style: 'destructive', onPress: async () => {
              try {
                  await deleteInvitadoService(idInv);
                  Alert.alert("Éxito", "Invitado eliminado correctamente");
                  const updatedList = await getInvitadosByCitaService(selectedCita.id);
                  setInvitadosList(updatedList);
                  cargarCitas();
              } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
          }}
      ]);
  };

  // --- PROCESAR QR ---
  const procesarQR = (modo: 'compartir' | 'guardar') => {
    if (!qrValue || !qrCodeRef.current) return;
    qrCodeRef.current.toDataURL(async (data: string) => {
      const filename = FileSystem.cacheDirectory + 'qr_ecoparking.png';
      try {
        await FileSystem.writeAsStringAsync(filename, data, { encoding: 'base64' });
        await Sharing.shareAsync(filename, { mimeType: 'image/png', dialogTitle: modo === 'guardar' ? 'Guardar Código QR' : 'Compartir Código QR' });
      } catch (err: any) {
        if (!err.message?.includes('deprecated')) {
             Alert.alert("Error", "No se pudo procesar el QR.");
        }
      }
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Mis Citas" />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>Gestión Citas</Text>

        {loading && !showInvitadoModal ? (
             <ActivityIndicator size="large" color="#6C9A8B" style={{marginTop: 50}} />
        ) : (
            citas.map((cita) => (
            <View key={cita.id} style={[styles.card, { zIndex: menuVisible === cita.id ? 1000 : 1 }]}>
                <View style={styles.cardContent}>
                <MaterialIcons name="event-note" size={36} color="#3498DB" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>#{cita.id} - {cita.motivo}</Text>
                    <Text style={styles.cardDesc}>Invitados: {cita.numero_invitados}</Text>
                    <Text style={styles.cardInfo}>📅 {cita.fecha_inicio?.split("T")[0]}   ⏰ {cita.hora_inicio}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: cita.estado_cita === 'Confirmada' ? '#27AE60' : '#E74C3C' }}>{cita.estado_cita}</Text>
                </View>
                <TouchableOpacity onPress={() => setMenuVisible(menuVisible === cita.id ? null : cita.id)} style={{ padding: 10 }}>
                    <MaterialIcons name="more-vert" size={24} color="#2E4053" />
                </TouchableOpacity>
                </View>

                {menuVisible === cita.id && (
                <View style={styles.overlayMenu}>
                    <View style={styles.menuBox}>
                    <TouchableOpacity onPress={() => handleAction("editar", cita)}><Text style={styles.menuItem}>Editar cita</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction("invitados", cita)}><Text style={styles.menuItem}>Ver invitados</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction("qr", cita)}><Text style={styles.menuItem}>Mostrar QR</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction("eliminar", cita)}><Text style={[styles.menuItem, { color: "#E74C3C" }]}>Eliminar Cita</Text></TouchableOpacity>
                    </View>
                </View>
                )}
            </View>
            ))
        )}
        {citas.length === 0 && !loading && <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>No hay citas registradas.</Text>}
      </ScrollView>

      {/* MODAL EDITAR CITA */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <ScrollView>
                <Text style={styles.modalTitle}>Editar Cita</Text>

                <Text style={styles.label}>Título</Text>
                <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

                <Text style={styles.label}>Fecha inicio</Text>
                <TouchableOpacity onPress={() => setShowFechaPicker(true)} style={styles.input}>
                    <Text>{fecha || "Seleccionar fecha"}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Fecha fin</Text>
                <TouchableOpacity onPress={() => setShowFechaFinPicker(true)} style={styles.input}>
                    <Text>{fechaFin || "Seleccionar fecha fin"}</Text>
                </TouchableOpacity>
                
                {/* Estado (Switch) */}
                <Text style={styles.label}>Estado</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => setEstadoCita('Confirmada')} style={[styles.stateButton, estadoCita === 'Confirmada' ? styles.stateActiveGreen : styles.stateInactive]}><Text style={[styles.stateText, estadoCita === 'Confirmada' && {color: 'white'}]}>Confirmada</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setEstadoCita('Cancelada')} style={[styles.stateButton, estadoCita === 'Cancelada' ? styles.stateActiveOrange : styles.stateInactive]}><Text style={[styles.stateText, estadoCita === 'Cancelada' && {color: 'white'}]}>Cancelada</Text></TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                     <View style={{width: '48%'}}>
                        <Text style={styles.label}>Hora inicio</Text>
                        <TouchableOpacity onPress={() => setShowHoraPicker(true)} style={styles.input}>
                            <Text>{hora || "00:00"}</Text>
                        </TouchableOpacity>
                     </View>
                     <View style={{width: '48%'}}>
                        <Text style={styles.label}>Hora fin</Text>
                        <TouchableOpacity onPress={() => setShowHoraFinPicker(true)} style={styles.input}>
                            <Text>{horaFin || "00:00"}</Text>
                        </TouchableOpacity>
                     </View>
                </View>

                {/* PICKERS CORREGIDOS: SI EL USUARIO CANCELA (NO DATA), NO SE CAMBIA EL ESTADO */}
                {showFechaPicker && (
                    <DateTimePicker 
                        mode="date" 
                        value={getDateFromString(fecha)} 
                        onChange={(e, d) => { 
                            setShowFechaPicker(false); 
                            if (e.type === 'set' && d) setFecha(d.toISOString().split("T")[0]); 
                        }} 
                    />
                )}
                {showFechaFinPicker && (
                    <DateTimePicker 
                        mode="date" 
                        value={getDateFromString(fechaFin)} 
                        onChange={(e, d) => { 
                            setShowFechaFinPicker(false); 
                            if (e.type === 'set' && d) setFechaFin(d.toISOString().split("T")[0]); 
                        }} 
                    />
                )}
                {showHoraPicker && (
                    <DateTimePicker 
                        mode="time" 
                        value={getTimeFromString(hora)} 
                        is24Hour={true} 
                        onChange={(e, t) => { 
                            setShowHoraPicker(false); 
                            if (e.type === 'set' && t) setHora(t.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false})); 
                        }} 
                    />
                )}
                {showHoraFinPicker && (
                    <DateTimePicker 
                        mode="time" 
                        value={getTimeFromString(horaFin)} 
                        is24Hour={true} 
                        onChange={(e, t) => { 
                            setShowHoraFinPicker(false); 
                            if (e.type === 'set' && t) setHoraFin(t.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false})); 
                        }} 
                    />
                )}
                
                <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.button, { backgroundColor: '#AAB7B8' }]}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={guardarEdicionCita} style={[styles.button, { backgroundColor: '#6C9A8B' }]}>
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL GESTIONAR INVITADOS */}
      <Modal visible={showInvitadoModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
            <View style={[styles.modalBox, {height: '85%'}]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                    <Text style={styles.modalTitle}>Invitados de la Cita</Text>
                    <TouchableOpacity onPress={() => setShowInvitadoModal(false)}><MaterialIcons name="close" size={24} color="#333" /></TouchableOpacity>
                </View>

                <View style={{backgroundColor: '#F8F9F9', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#EEE'}}>
                    <Text style={{fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 5}}>{currentInvitado ? 'EDITAR INVITADO' : 'AGREGAR NUEVO INVITADO'}</Text>
                    <View style={{flexDirection: 'row', gap: 5, marginBottom: 5}}>
                        <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} placeholder="Nombre" value={formInvitado.nombre} onChangeText={(t) => setFormInvitado({...formInvitado, nombre: t})} />
                        <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} placeholder="Correo" value={formInvitado.correo} onChangeText={(t) => setFormInvitado({...formInvitado, correo: t})} autoCapitalize="none" />
                    </View>
                    <View style={{flexDirection: 'row', gap: 5}}>
                        <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} placeholder="Empresa" value={formInvitado.empresa} onChangeText={(t) => setFormInvitado({...formInvitado, empresa: t})} />
                        <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} placeholder="Tipo" value={formInvitado.tipo_visitante} onChangeText={(t) => setFormInvitado({...formInvitado, tipo_visitante: t})} />
                    </View>
                    <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                        <TouchableOpacity style={[styles.button, {marginTop: 0, flex: 1, backgroundColor: currentInvitado ? '#F39C12' : '#3498DB'}]} onPress={handleSaveInvitado}>
                            <Text style={styles.buttonText}>{currentInvitado ? 'Actualizar' : 'Agregar'}</Text>
                        </TouchableOpacity>
                        {currentInvitado && (
                            <TouchableOpacity style={[styles.button, {marginTop: 0, flex: 1, backgroundColor: '#95A5A6'}]} onPress={handleCancelEditInvitado}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView>
                    {invitadosList.length === 0 ? (
                        <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>No hay invitados registrados.</Text>
                    ) : (
                        invitadosList.map((inv, idx) => (
                            <View key={inv.id} style={styles.guestItem}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.guestName}>{idx + 1}. {inv.nombre} <Text style={styles.guestType}>({inv.tipo_visitante})</Text></Text>
                                    <Text style={styles.guestDetails}>{inv.correo} • {inv.empresa}</Text>
                                </View>
                                <View style={{flexDirection: 'row', gap: 10}}>
                                    <TouchableOpacity onPress={() => handleEditInvitado(inv)} style={{padding: 5}}><MaterialIcons name="edit" size={22} color="#F39C12" /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteInvitado(inv.id)} style={{padding: 5}}><MaterialIcons name="delete" size={22} color="#E74C3C" /></TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* MODAL ELIMINAR CITA */}
      <Modal visible={deleteVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, {padding: 30}]}>
            <Text style={styles.modalTitle}>¿Eliminar Cita?</Text>
            <Text style={{textAlign: 'center', marginBottom: 20, color: '#555'}}>Se borrarán todos los datos y el QR.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteVisible(false)} style={[styles.button, { backgroundColor: '#AAB7B8' }]}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={eliminarCita} style={[styles.button, { backgroundColor: '#E74C3C' }]}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL QR */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { alignItems: 'center', paddingVertical: 25 }]}>
            <Text style={[styles.modalTitle, {marginBottom: 20}]}>Código QR</Text>
            <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 5 }}>
                {qrValue ? <QRCode value={qrValue} size={200} backgroundColor='white' quietZone={5} getRef={(c) => (qrCodeRef.current = c)} /> : <Text>Error</Text>}
            </View>
            <View style={{width: '100%', marginTop: 25, gap: 12}}>
                <TouchableOpacity onPress={() => procesarQR('compartir')} style={[styles.actionButton, { backgroundColor: '#3498DB' }]}><MaterialIcons name="share" size={24} color="#FFF" /><Text style={styles.actionButtonText}>Compartir</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => procesarQR('guardar')} style={[styles.actionButton, { backgroundColor: '#27AE60' }]}><MaterialIcons name="file-download" size={24} color="#FFF" /><Text style={styles.actionButtonText}>Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setQrModalVisible(false)} style={[styles.actionButton, { backgroundColor: '#95A5A6' }]}><Text style={styles.actionButtonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  welcome: { color: '#2E4053', fontFamily: 'Poppins-SemiBold', fontSize: 22 },
  sectionTitle: { color: '#2E4053', fontFamily: 'Poppins', fontSize: 18, marginTop: 10, marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#D5DBDB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 15, position: 'relative' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#2E4053', fontFamily: 'Poppins-SemiBold', fontSize: 16 },
  cardDesc: { color: '#566573', fontFamily: 'Inter', fontSize: 13 },
  cardInfo: { color: '#6C9A8B', fontFamily: 'Inter', fontSize: 12, marginTop: 3 },
  overlayMenu: { position: "absolute", right: 40, top: 40, zIndex: 9999, elevation: 50 },
  menuBox: { backgroundColor: "#FFF", borderRadius: 8, paddingVertical: 5, borderWidth: 1, borderColor: "#eee", elevation: 5, minWidth: 160 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15, fontSize: 14, color: "#2E4053", fontFamily: 'Inter', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxHeight: '90%' },
  modalTitle: { color: '#2E4053', fontFamily: 'Poppins-SemiBold', fontSize: 18, marginBottom: 15, textAlign: 'center' },
  label: { marginTop: 10, fontFamily: 'Inter', color: '#2E4053', fontSize: 14 },
  input: { backgroundColor: '#FDFEFE', borderRadius: 8, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: '#AAB7B8', justifyContent: 'center', marginBottom: 5, fontFamily: 'Inter' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  button: { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  buttonText: { color: '#FDFEFE', fontFamily: 'Poppins', fontSize: 15, fontWeight: '600' },
  stateButton: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  stateInactive: { backgroundColor: '#FDFEFE', borderColor: '#AAB7B8' },
  stateActiveGreen: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  stateActiveOrange: { backgroundColor: '#E74C3C', borderColor: '#E74C3C' },
  stateText: { fontFamily: 'Inter', fontWeight: 'bold', color: '#2E4053' },
  guestItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#F4F6F6', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#3498DB' },
  guestName: { fontFamily: 'Poppins-SemiBold', color: '#2E4053', fontSize: 13 },
  guestType: { fontWeight: 'normal', fontFamily: 'Inter', fontSize: 12, color: '#555' },
  guestDetails: { fontFamily: 'Inter', color: '#777', fontSize: 11, marginTop: 2 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10, elevation: 2 },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins-SemiBold' },
});