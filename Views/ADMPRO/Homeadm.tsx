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
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import { useIsFocused } from '@react-navigation/native';

// Importaciones necesarias para compartir la imagen PNG en Expo
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

import HeaderAdmin from '../../components/HeaderAdmin';
import {
  getMisCitasService,
  deleteCitaService,
  updateCitaService
} from "../../services/authService";

export default function Homeadm() {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrValue, setQrValue] = useState('');

  // Referencia para el componente QRCode
  const qrCodeRef = useRef(null);

  const isFocused = useIsFocused();

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [hora, setHora] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [invitadosList, setInvitadosList] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [citas, setCitas] = useState([]);

  const [showFechaPicker, setShowFechaPicker] = useState(false);
  const [showFechaFinPicker, setShowFechaFinPicker] = useState(false);
  const [showHoraPicker, setShowHoraPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  useEffect(() => {
    if (isFocused) cargarCitas();
  }, [isFocused]);

  const cargarCitas = async () => {
    const data = await getMisCitasService();
    setCitas(data);
  };

  const handleAction = (action, cita) => {
    setMenuVisible(null);
    setSelectedCita(cita);

    if (action === 'editar') {
      setTitulo(cita.motivo || '');
      setFecha(cita.fecha_inicio?.split("T")[0] || '');
      setFechaFin(cita.fecha_fin?.split("T")[0] || '');
      setHora(cita.hora_inicio || '');
      setHoraFin(cita.hora_fin || '');
      setInvitadosList(cita.invitados || []);
      setNuevoNombre('');
      setNuevoCorreo('');
      setModalVisible(true);
    }

    if (action === 'eliminar') setDeleteVisible(true);

    if (action === 'qr') {
      if (!cita.url_validacion) { 
        Alert.alert("QR no disponible"); 
        return; 
      }
      setQrValue(cita.url_validacion);
      setQrModalVisible(true);
    }
  };

  const agregarInvitado = () => {
    if (!nuevoNombre || !nuevoCorreo) {
      Alert.alert("Debe ingresar nombre y correo del invitado");
      return;
    }
    setInvitadosList([...invitadosList, { nombre: nuevoNombre, correo: nuevoCorreo }]);
    setNuevoNombre('');
    setNuevoCorreo('');
  };

  const guardarEdicion = async () => {
    if (!titulo || !fecha || !fechaFin || !hora || !horaFin) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    await updateCitaService(selectedCita.id, {
      fecha_inicio: fecha,
      fecha_fin: fechaFin,
      hora_inicio: hora,
      hora_fin: horaFin,
      motivo: titulo,
      estado_cita: "Pendiente",
      numero_invitados: invitadosList.length,
      invitados: invitadosList,
    });

    Alert.alert("Cita actualizada correctamente");
    setModalVisible(false);
    cargarCitas();
  };

  const eliminarCita = async () => {
    await deleteCitaService(selectedCita.id);
    Alert.alert("Cita eliminada correctamente 🗑️");
    setDeleteVisible(false);
    cargarCitas();
  };

  const compartirQR = async () => {
    if (!qrValue) return;

    if (!qrCodeRef.current) {
      Alert.alert("Error", "QR no disponible.");
      return;
    }

    qrCodeRef.current.toDataURL(async (data) => {
      const filename = FileSystem.cacheDirectory + 'qr_cita.png';

      try {
        await FileSystem.writeAsStringAsync(filename, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await Share.share({
          message: qrValue,
          url: filename,
          title: 'QR de la Cita'
        });

      } catch (err) {
        Alert.alert("Error", "No se pudo compartir.");
      }
    });
  };
  const guardarQR = async () => {
  if (!qrCodeRef.current) {
    Alert.alert("Error", "QR no disponible.");
    return;
  }

  try {
    // Pedir permisos
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede guardar sin permisos.");
      return;
    }

    // Obtener el Base64 del QR
    qrCodeRef.current.toDataURL(async (base64Data) => {
      const filename = FileSystem.documentDirectory + `qr_${Date.now()}.png`;

      try {
        // Crear archivo PNG
        await FileSystem.writeAsStringAsync(filename, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Guardarlo en galería
        const asset = await MediaLibrary.createAssetAsync(filename);
        await MediaLibrary.createAlbumAsync("QRs", asset, false);

        Alert.alert("Listo ✔️", "El QR se guardó en tu galería");

      } catch (error) {
        console.log(error);
        Alert.alert("Error", "No se pudo guardar el QR.");
      }
    });

  } catch (e) {
    console.log(e);
    Alert.alert("Error", "Ocurrió un problema.");
  }
};


  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Administrador" />

      <ScrollView style={styles.container}>
        <Text style={styles.welcome}>Bienvenido, administrador 👋</Text>
        <Text style={styles.sectionTitle}>Mis Citas</Text>

        {/* === LISTA DE CITAS === */}
        {citas.map((cita) => (
          <View key={cita.id} style={styles.card}>
            <View style={styles.cardContent}>
              <MaterialIcons name="event" size={36} color="#6C9A8B" style={{ marginRight: 10 }} />

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{cita.motivo}</Text>
                <Text style={styles.cardDesc}>Invitados: {cita.numero_invitados}</Text>

                <Text style={styles.cardInfo}>
                  📅 {cita.fecha_inicio?.split("T")[0]}   ⏰ {cita.hora_inicio}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setMenuVisible(menuVisible === cita.id ? null : cita.id)}
              >
                <MaterialIcons name="more-vert" size={24} color="#2E4053" />
              </TouchableOpacity>
            </View>

            {/* === MENU FLOTANTE === */}
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

                <TouchableOpacity
                  style={styles.menuBackdrop}
                  onPress={() => setMenuVisible(null)}
                />
              </View>
            )}
          </View>
        ))}

      </ScrollView>

      {/* === MODALES (EDITAR, ELIMINAR, QR) === */}
      {/* --- MODAL EDITAR --- */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
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

            <Text style={styles.label}>Hora inicio</Text>
            <TouchableOpacity onPress={() => setShowHoraPicker(true)} style={styles.input}>
              <Text>{hora || "Seleccionar hora"}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Hora fin</Text>
            <TouchableOpacity onPress={() => setShowHoraFinPicker(true)} style={styles.input}>
              <Text>{horaFin || "Seleccionar hora fin"}</Text>
            </TouchableOpacity>

            {/* PICKERS */}
            {showFechaPicker && (
              <DateTimePicker
                value={fecha ? new Date(fecha) : new Date()}
                mode="date"
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
                onChange={(e, t) => {
                  setShowHoraPicker(false);
                  if (t) setHora(t.toTimeString().slice(0, 5));
                }}
              />
            )}

            {showHoraFinPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                onChange={(e, t) => {
                  setShowHoraFinPicker(false);
                  if (t) setHoraFin(t.toTimeString().slice(0, 5));
                }}
              />
            )}

            <Text style={styles.label}>Invitados</Text>
            {invitadosList.map((inv, idx) => (
              <Text key={idx} style={{ fontFamily: 'Inter', fontSize: 13 }}>
                {idx + 1}. {inv.nombre} ({inv.correo})
              </Text>
            ))}

            <TextInput
              style={styles.input}
              placeholder="Nombre invitado"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />

            <TextInput
              style={styles.input}
              placeholder="Correo invitado"
              keyboardType="email-address"
              value={nuevoCorreo}
              onChangeText={setNuevoCorreo}
            />

            <TouchableOpacity
              onPress={agregarInvitado}
              style={[styles.button, { backgroundColor: '#6C9A8B', marginTop: 5 }]}
            >
              <Text style={styles.buttonText}>Agregar invitado</Text>
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
          </View>
        </View>
      </Modal>

      {/* --- MODAL ELIMINAR --- */}
      <Modal visible={deleteVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Eliminar esta cita?</Text>

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

      {/* --- MODAL QR --- */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>QR de la Cita</Text>

            {qrValue !== '' && (
              <QRCode
                value={qrValue}
                size={200}
                getRef={qrCodeRef}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setQrModalVisible(false)}
                style={[styles.button, { backgroundColor: '#AAB7B8' }]}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={compartirQR}
                style={[styles.button, { backgroundColor: '#6C9A8B' }]}
              >
                <Text style={styles.buttonText}>Compartir</Text>
              </TouchableOpacity>
               <TouchableOpacity
    onPress={guardarQR}
    style={[styles.button, { backgroundColor: '#1ABC9C' }]}
  >
    <Text style={styles.buttonText}>Descargar</Text>
  </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:20 },
  welcome:{ color:'#2E4053', fontFamily:'Poppins-SemiBold', fontSize:22 },
  sectionTitle:{ color:'#2E4053', fontFamily:'Poppins', fontSize:18, marginTop:10, marginBottom:20 },
  card:{ backgroundColor:'#FFF', borderRadius:16, padding:15, borderWidth:1, borderColor:'#D5DBDB', shadowOpacity:0.05, shadowRadius:6, elevation:2, marginBottom:15 },
  cardContent:{ flexDirection:'row', alignItems:'center' },
  cardTitle:{ color:'#2E4053', fontFamily:'Poppins-SemiBold', fontSize:16 },
  cardDesc:{ color:'#566573', fontFamily:'Inter', fontSize:13 },
  cardInfo:{ color:'#6C9A8B', fontFamily:'Inter', fontSize:12, marginTop:3 },

  overlayMenu: {
    position: "absolute",
    right: 20,
    top: 10,
    zIndex: 9999,
    elevation: 50,
  },
  menuBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#D5DBDB",
    elevation: 10,
    zIndex: 10000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#2E4053",
  },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },

  modalContainer:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  modalBox:{ backgroundColor:'#FFF', borderRadius:16, padding:20, width:'90%' },
  modalTitle:{ color:'#2E4053', fontFamily:'Poppins-SemiBold', fontSize:18, marginBottom:15, textAlign:'center' },
  label:{ marginTop:10, fontFamily:'Inter', color:'#2E4053' },
  input:{ backgroundColor:'#FDFEFE', borderRadius:8, paddingHorizontal:10, height:44, borderWidth:1, borderColor:'#AAB7B8', justifyContent:'center', marginBottom:10 },
  modalButtons:{ flexDirection:'row', justifyContent:'space-between', marginTop:20 },
  button:{ flex:1, marginHorizontal:5, borderRadius:10, alignItems:'center', paddingVertical:12 },
  buttonText:{ color:'#FDFEFE', fontFamily:'Poppins', fontSize:15 },
});
