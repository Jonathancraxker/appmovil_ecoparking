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

import HeaderAdmin from '../../components/HeaderAdmin';
import {
  getMisCitasService,
  deleteCitaService,
  updateCitaService
} from "../../services/citasServiceAdm";

export default function Homeadm() {
  // --- ESTADOS ---
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Datos
  const [citas, setCitas] = useState<any[]>([]);
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [qrValue, setQrValue] = useState('');
  
  // Referencias
  const qrCodeRef = useRef<any>(null);
  const isFocused = useIsFocused();

  // Formulario
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [hora, setHora] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estadoCita, setEstadoCita] = useState('');
  const [invitadosList, setInvitadosList] = useState<any[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');

  // Pickers
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

  // --- FUNCIONES ---
  const cargarCitas = async () => {
    setLoading(true);
    try {
        const data = await getMisCitasService(); 
        setCitas(data);
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = (action: string, cita: any) => {
    setMenuVisible(null);
    setSelectedCita(cita);

    if (action === 'editar') {
      setTitulo(cita.motivo || '');
      setFecha(cita.fecha_inicio?.split("T")[0] || '');
      setFechaFin(cita.fecha_fin?.split("T")[0] || '');
      setHora(cita.hora_inicio || '');
      setHoraFin(cita.hora_fin || '');
      setEstadoCita(cita.estado_cita || '');
      setInvitadosList(cita.invitados || []);
      setNuevoNombre('');
      setNuevoCorreo('');
      setModalVisible(true);
    }

    if (action === 'eliminar') setDeleteVisible(true);

    if (action === 'qr') {
      if (!cita.url_validacion) { 
        Alert.alert("QR no disponible", "Esta cita no tiene un código QR generado."); 
        return; 
      }
      setQrValue(cita.url_validacion);
      setQrModalVisible(true);
    }
  };

  const agregarInvitado = () => {
    if (!nuevoNombre.trim() || !nuevoCorreo.trim()) {
      Alert.alert("Datos incompletos", "Ingresa nombre y correo.");
      return;
    }
    setInvitadosList([...invitadosList, { nombre: nuevoNombre, correo: nuevoCorreo }]);
    setNuevoNombre('');
    setNuevoCorreo('');
  };

  const guardarEdicion = async () => {
    if (!titulo || !fecha || !fechaFin || !hora || !horaFin || !estadoCita) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const dataToSend = {
      fecha_inicio: fecha,
      fecha_fin: fechaFin,
      hora_inicio: hora,
      hora_fin: horaFin,
      motivo: titulo,
      estado_cita: estadoCita || "Confirmada",
      numero_invitados: invitadosList.length,
      invitados: invitadosList,
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

  // --- PROCESAR QR (COMPARTIR/GUARDAR) ---
  const procesarQR = (modo: 'compartir' | 'guardar') => {
    if (!qrValue || !qrCodeRef.current) return;

    qrCodeRef.current.toDataURL(async (data: string) => {
      const filename = FileSystem.cacheDirectory + 'qr_ecoparking.png';

      try {
        await FileSystem.writeAsStringAsync(filename, data, {
          encoding: 'base64', 
        });

        await Sharing.shareAsync(filename, {
            mimeType: 'image/png',
            dialogTitle: modo === 'guardar' ? 'Guardar Código QR' : 'Compartir Código QR',
        });

      } catch (err: any) {
        if (!err.message?.includes('deprecated')) {
             Alert.alert("Error", "No se pudo procesar el QR.");
             console.error(err);
        }
      }
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Mis Citas" />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.welcome}>Bienvenido, administrador 👋</Text>
        <Text style={styles.sectionTitle}>Gestión de Citas</Text>

        {loading ? (
             <ActivityIndicator size="large" color="#6C9A8B" style={{marginTop: 50}} />
        ) : (
            citas.map((cita) => (
            <View 
                key={cita.id} 
                // SOLUCIÓN AL MENÚ TAPADO: zIndex dinámico
                style={[styles.card, { zIndex: menuVisible === cita.id ? 1000 : 1 }]}
            >
                <View style={styles.cardContent}>
                <MaterialIcons name="event-note" size={36} color="#3498DB" style={{ marginRight: 10 }} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>#{cita.id} - {cita.motivo}</Text>
                    <Text style={styles.cardDesc}>Invitados: {cita.numero_invitados}</Text>

                    <Text style={styles.cardInfo}>
                    📅 {cita.fecha_inicio?.split("T")[0]}   ⏰ {cita.hora_inicio}
                    </Text>
                    <Text style={{
                        fontSize: 12, 
                        fontWeight: 'bold', 
                        color: cita.estado_cita === 'Confirmada' ? 'green' : 'red'
                    }}>
                        {cita.estado_cita}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setMenuVisible(menuVisible === cita.id ? null : cita.id)}
                    style={{ padding: 10 }}
                >
                    <MaterialIcons name="more-vert" size={24} color="#2E4053" />
                </TouchableOpacity>
                </View>

                {/* MENU FLOTANTE */}
                {menuVisible === cita.id && (
                <View style={styles.overlayMenu}>
                    <View style={styles.menuBox}>
                    <TouchableOpacity onPress={() => handleAction("editar", cita)}>
                        <Text style={styles.menuItem}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleAction("qr", cita)}>
                        <Text style={styles.menuItem}>Mostrar QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleAction("eliminar", cita)}>
                        <Text style={[styles.menuItem, { color: "#E74C3C" }]}>Eliminar</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                )}
            </View>
            ))
        )}
        
        {citas.length === 0 && !loading && (
            <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>No hay citas registradas.</Text>
        )}
      </ScrollView>

      {/* === MODAL EDITAR === */}
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

                <Text style={styles.label}>Estado</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* Opción: Confirmada */}
                    <TouchableOpacity 
                        onPress={() => setEstadoCita('Confirmada')}
                        style={[
                            styles.input, 
                            { 
                                flex: 1,
                                justifyContent: 'center', 
                                alignItems: 'center',
                                backgroundColor: estadoCita === 'Confirmada' ? '#27AE60' : '#FDFEFE',
                                borderColor: estadoCita === 'Confirmada' ? '#27AE60' : '#AAB7B8',
                            }
                        ]}
                    >
                        <Text style={{ 
                            fontWeight: 'bold', 
                            color: estadoCita === 'Confirmada' ? 'white' : '#2E4053' 
                        }}>
                            Confirmada
                        </Text>
                    </TouchableOpacity>
                    {/* Opción: Cancelada */}
                    <TouchableOpacity 
                        onPress={() => setEstadoCita('Cancelada')}
                        style={[
                            styles.input, 
                            { 
                                flex: 1,
                                justifyContent: 'center', 
                                alignItems: 'center',
                                backgroundColor: estadoCita === 'Cancelada' ? '#E74C3C' : '#FDFEFE',
                                borderColor: estadoCita === 'Cancelada' ? '#E74C3C' : '#AAB7B8',
                            }
                        ]}
                    >
                        <Text style={{ 
                            fontWeight: 'bold', 
                            color: estadoCita === 'Cancelada' ? 'white' : '#2E4053' 
                        }}>
                            Cancelada
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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

                {/* PICKERS */}
                {showFechaPicker && (
                <DateTimePicker
                    value={fecha ? new Date(fecha) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => {
                    setShowFechaPicker(false);
                    if (d) setFecha(d.toISOString().split("T")[0]);
                    }}
                />
                )}
                {showFechaFinPicker && (
                <DateTimePicker
                    value={fechaFin ? new Date(fechaFin) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => {
                    setShowFechaFinPicker(false);
                    if (d) setFechaFin(d.toISOString().split("T")[0]);
                    }}
                />
                )}
                {showHoraPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, t) => {
                    setShowHoraPicker(false);
                    if (t) setHora(t.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false}));
                    }}
                />
                )}
                {showHoraFinPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, t) => {
                    setShowHoraFinPicker(false);
                    if (t) setHoraFin(t.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false}));
                    }}
                />
                )}

                <Text style={[styles.label, {marginTop: 15}]}>Lista de Invitados ({invitadosList.length})</Text>
                
                <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput 
                        style={[styles.input, {flex: 1}]} 
                        placeholder="Nombre" 
                        value={nuevoNombre} 
                        onChangeText={setNuevoNombre} 
                    />
                    <TextInput 
                        style={[styles.input, {flex: 1}]} 
                        placeholder="Correo" 
                        value={nuevoCorreo} 
                        onChangeText={setNuevoCorreo} 
                        autoCapitalize="none"
                    />
                </View>
                <TouchableOpacity onPress={agregarInvitado} style={[styles.button, {backgroundColor: '#3498DB', marginTop: 5}]}>
                    <Text style={styles.buttonText}>+ Agregar Invitado</Text>
                </TouchableOpacity>


                <View style={styles.modalButtons}>
                <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[styles.button, { backgroundColor: '#AAB7B8' }]}
                >
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={guardarEdicion}
                    style={[styles.button, { backgroundColor: '#6C9A8B' }]}
                >
                    <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL ELIMINAR --- */}
      <Modal visible={deleteVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, {padding: 30}]}>
            <Text style={styles.modalTitle}>¿Eliminar esta cita?</Text>
            <Text style={{textAlign: 'center', marginBottom: 20, color: '#555'}}>Se borrarán los invitados y el código QR asociado.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={[styles.button, { backgroundColor: '#AAB7B8' }]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={eliminarCita}
                style={[styles.button, { backgroundColor: '#E74C3C' }]}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL QR (REDISEÑADO Y CORREGIDO) --- */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { alignItems: 'center', paddingVertical: 25 }]}>
            <Text style={[styles.modalTitle, {marginBottom: 20}]}>Código QR de Acceso</Text>

            {/* Contenedor Blanco Sólido para el QR */}
            <View style={{ 
                backgroundColor: 'white', 
                padding: 15, 
                borderRadius: 10, 
                elevation: 5, 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4
            }}>
                {qrValue ? (
                    <QRCode
                      value={qrValue}
                      size={200}
                      backgroundColor='white'
                      quietZone={5} 
                      getRef={(c) => (qrCodeRef.current = c)} 
                    />
                ) : (
                    <Text style={{color: '#E74C3C'}}>Error: QR no disponible</Text>
                )}
            </View>
            
            <Text style={{marginTop: 20, fontSize: 16, color: '#333', fontWeight: 'bold', textAlign: 'center'}}>
                {selectedCita?.motivo}
            </Text>

            {/* Botones Grandes con Texto Blanco */}
            <View style={{width: '100%', marginTop: 25, gap: 12}}>
                
                {qrValue && (
                  <>
                    <TouchableOpacity
                        onPress={() => procesarQR('compartir')}
                        style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="share" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Compartir QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => procesarQR('guardar')}
                        style={[styles.actionButton, { backgroundColor: '#27AE60' }]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="file-download" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Guardar en Galería</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                    onPress={() => setQrModalVisible(false)}
                    style={[styles.actionButton, { backgroundColor: '#95A5A6', marginTop: 10 }]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>Cerrar</Text>
                </TouchableOpacity>
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
  card: { 
      backgroundColor: '#FFF', 
      borderRadius: 16, 
      padding: 15, 
      borderWidth: 1, 
      borderColor: '#D5DBDB', 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 4, 
      elevation: 3, 
      marginBottom: 15,
      position: 'relative' // Necesario para zIndex
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#2E4053', fontFamily: 'Poppins-SemiBold', fontSize: 16 },
  cardDesc: { color: '#566573', fontFamily: 'Inter', fontSize: 13 },
  cardInfo: { color: '#6C9A8B', fontFamily: 'Inter', fontSize: 12, marginTop: 3 },
  
  // Menú flotante
  overlayMenu: {
    position: "absolute",
    right: 40,
    top: 40,
    zIndex: 9999,
    elevation: 50,
  },
  menuBox: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 120,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#2E4053",
    fontFamily: 'Inter',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxHeight: '90%' },
  modalTitle: { color: '#2E4053', fontFamily: 'Poppins-SemiBold', fontSize: 18, marginBottom: 15, textAlign: 'center' },
  label: { marginTop: 10, fontFamily: 'Inter', color: '#2E4053', fontSize: 14 },
  input: { backgroundColor: '#FDFEFE', borderRadius: 8, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: '#AAB7B8', justifyContent: 'center', marginBottom: 5, fontFamily: 'Inter' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  button: { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  buttonText: { color: '#FDFEFE', fontFamily: 'Poppins', fontSize: 15, fontWeight: '600' },
  
  // Estilos Nuevos para el Modal QR
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
});