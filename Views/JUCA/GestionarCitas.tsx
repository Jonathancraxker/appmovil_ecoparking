import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderJuca from '../../components/HeaderJucas';
import { 
  getCitasAdminService, 
  deleteCitaService, 
  registrarCitaService, 
  updateCitaService,
  getCitaPorIdService // 🔹 Importamos la función
} from '../../services/authService';

export default function GestionarCitas({ navigation }) {
  const [citas, setCitas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCita, setEditingCita] = useState(null);

  const [motivo, setMotivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [invitados, setInvitados] = useState([]);
  const [nuevoInvitado, setNuevoInvitado] = useState({ nombre: '', correo: '' });

  const [showFechaInicio, setShowFechaInicio] = useState(false);
  const [showFechaFin, setShowFechaFin] = useState(false);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraFin, setShowHoraFin] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const data = await getCitasAdminService();
      setCitas(data);
    } catch (e) {
      console.log("Error cargando citas:", e);
    }
  };

  const agregarInvitado = () => {
    if (!nuevoInvitado.nombre || !nuevoInvitado.correo) {
      Alert.alert("Error", "Completa nombre y correo del invitado.");
      return;
    }
    setInvitados([...invitados, nuevoInvitado]);
    setNuevoInvitado({ nombre: '', correo: '' });
  };

  const abrirModalRegistro = async (cita = null) => {
    if (cita) {
      // 🔹 Traemos la cita completa desde el backend
      const data = await getCitaPorIdService(cita.id);
      if (data) {
        setEditingCita(data);
        setMotivo(data.motivo);
        setFechaInicio(data.fecha_inicio?.split("T")[0] || '');
        setFechaFin(data.fecha_fin?.split("T")[0] || '');
        setHoraInicio(data.hora_inicio);
        setHoraFin(data.hora_fin);
        setInvitados(data.invitados || []);
      }
    } else {
      setEditingCita(null);
      setMotivo('');
      setFechaInicio('');
      setFechaFin('');
      setHoraInicio('');
      setHoraFin('');
      setInvitados([]);
    }
    setModalVisible(true);
  };

  const guardarCita = async () => {
    if (!motivo || !fechaInicio || !fechaFin || !horaInicio || !horaFin) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    const body = {
      motivo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado_cita: "Pendiente",
      numero_invitados: invitados.length,
      invitados
    };

    try {
      if (editingCita) {
        await updateCitaService(editingCita.id, body);
        Alert.alert("Cita actualizada correctamente");
      } else {
        await registrarCitaService(body);
        Alert.alert("Cita registrada correctamente");
      }
      setModalVisible(false);
      cargarCitas();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "No se pudo guardar la cita");
    }
  };

  const eliminarCita = (id) => {
    Alert.alert(
      "Eliminar cita",
      "¿Seguro que quieres eliminar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCitaService(id);
              cargarCitas();
            } catch (e) {
              console.log("Error eliminando cita:", e);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderJuca title="Gestionar Citas" />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.btnNuevo}
          onPress={() => abrirModalRegistro()}
        >
          <Text style={styles.btnText}>+ Nueva Cita</Text>
        </TouchableOpacity>

        {citas.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.motivo}</Text>
            <Text style={styles.cardText}>Fecha: {item.fecha_inicio} → {item.fecha_fin}</Text>
            <Text style={styles.cardText}>Hora: {item.hora_inicio} → {item.hora_fin}</Text>
            <Text style={styles.cardText}>Invitados: {item.numero_invitados}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => abrirModalRegistro(item)}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => eliminarCita(item.id)}
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingCita ? "Editar Cita" : "Nueva Cita"}</Text>

            <TextInput style={styles.input} placeholder="Motivo" value={motivo} onChangeText={setMotivo} />

            <TouchableOpacity style={styles.input} onPress={() => setShowFechaInicio(true)}>
              <Text>{fechaInicio || "Seleccionar fecha inicio"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.input} onPress={() => setShowFechaFin(true)}>
              <Text>{fechaFin || "Seleccionar fecha fin"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.input} onPress={() => setShowHoraInicio(true)}>
              <Text>{horaInicio || "Seleccionar hora inicio"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.input} onPress={() => setShowHoraFin(true)}>
              <Text>{horaFin || "Seleccionar hora fin"}</Text>
            </TouchableOpacity>

            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Invitados</Text>
            {invitados.map((inv, idx) => (
              <Text key={idx}>{idx + 1}. {inv.nombre} ({inv.correo})</Text>
            ))}

            <TextInput style={styles.input} placeholder="Nombre invitado" value={nuevoInvitado.nombre} onChangeText={t => setNuevoInvitado({ ...nuevoInvitado, nombre: t })}/>
            <TextInput style={styles.input} placeholder="Correo invitado" value={nuevoInvitado.correo} onChangeText={t => setNuevoInvitado({ ...nuevoInvitado, correo: t })}/>
            <TouchableOpacity style={styles.btnAgregar} onPress={agregarInvitado}>
              <Text style={styles.btnText}>Agregar Invitado</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity style={[styles.btnEdit, { flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnNuevo, { flex: 1 }]} onPress={guardarCita}>
                <Text style={styles.btnText}>{editingCita ? "Guardar" : "Registrar"}</Text>
              </TouchableOpacity>
            </View>

            {showFechaInicio && (
              <DateTimePicker
                value={fechaInicio ? new Date(fechaInicio) : new Date()}
                mode="date"
                onChange={(e, d) => { setShowFechaInicio(false); if(d) setFechaInicio(d.toISOString().split("T")[0]); }}
              />
            )}
            {showFechaFin && (
              <DateTimePicker
                value={fechaFin ? new Date(fechaFin) : new Date()}
                mode="date"
                onChange={(e, d) => { setShowFechaFin(false); if(d) setFechaFin(d.toISOString().split("T")[0]); }}
              />
            )}
            {showHoraInicio && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                onChange={(e, t) => { setShowHoraInicio(false); if(t) setHoraInicio(t.toTimeString().slice(0,5)); }}
              />
            )}
            {showHoraFin && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                onChange={(e, t) => { setShowHoraFin(false); if(t) setHoraFin(t.toTimeString().slice(0,5)); }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ Los estilos pueden quedarse igual que los tenías


const styles = StyleSheet.create({
  container:{ flex: 1, backgroundColor: '#fff' },
  content:{ padding: 20 },
  card:{ backgroundColor: '#6c9a8b', padding: 18, borderRadius: 10, marginBottom: 18 },
  cardTitle:{ fontSize: 18, color: '#fff', fontWeight: '600' },
  cardText:{ fontSize: 14, color: '#eee', marginTop: 3 },
  actions:{ flexDirection: 'row', marginTop: 10, gap: 10 },
  btnEdit:{ backgroundColor: '#0066ff', padding: 10, borderRadius: 8, alignItems:'center', justifyContent:'center' },
  btnDelete:{ backgroundColor: '#ff0033', padding: 10, borderRadius: 8, alignItems:'center', justifyContent:'center' },
  btnNuevo:{ backgroundColor: '#2E4053', padding: 12, borderRadius: 10, alignItems:'center', marginBottom: 15 },
  btnAgregar:{ backgroundColor: '#6C9A8B', padding: 10, borderRadius: 8, alignItems:'center', marginTop:5 },
  btnText:{ color: '#fff', fontWeight:'600' },
  modalContainer:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' },
  modalBox:{ width:'90%', backgroundColor:'#fff', borderRadius:12, padding:20 },
  modalTitle:{ fontSize:18, fontWeight:'bold', marginBottom:15 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:10, paddingVertical:8, marginBottom:10 }
});
