import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderJucas from '../../components/HeaderJucas';
import { useFonts } from 'expo-font';

export default function CitasJuca() {
  const [motivo, setMotivo] = useState('');
  const [matricula, setMatricula] = useState('');

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [invitados, setInvitados] = useState([]);
  const [nuevoInvitado, setNuevoInvitado] = useState({ nombre: '', correo: '' });

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

  // ➕ AGREGAR INVITADO
  const agregarInvitado = () => {
    if (!nuevoInvitado.nombre.trim() || !nuevoInvitado.correo.trim()) {
      Alert.alert('Error', 'Completa el nombre y correo del invitado.');
      return;
    }
    setInvitados([...invitados, nuevoInvitado]);
    setNuevoInvitado({ nombre: '', correo: '' });
  };

  // REGISTRAR CITA
  const handleCreateCita = () => {
    if (!motivo.trim() || !matricula.trim()) {
      Alert.alert('Error', 'Completa motivo y matrícula.');
      return;
    }

    Alert.alert(
      'Cita creada',
      `Tu cita fue registrada:\n\n📌 Motivo: ${motivo}\n📅 Fecha: ${fechaInicio.toLocaleDateString()}\n🕒 Hora: ${horaInicio.toLocaleTimeString()}\n🚗 Matrícula: ${matricula}\n👥 Invitados: ${invitados.length}`
    );

    // Reset
    setMotivo('');
    setMatricula('');
    setInvitados([]);
  };

  return (
    <View style={styles.container}>
      <HeaderJucas title="Registrar Nueva Cita" />

      <View style={styles.form}>

        {/* Motivo */}
        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe el motivo"
          placeholderTextColor="#AAB7B8"
          value={motivo}
          onChangeText={setMotivo}
        />

        {/* Matrícula */}
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa la matrícula"
          placeholderTextColor="#AAB7B8"
          value={matricula}
          onChangeText={setMatricula}
        />

        {/* Fecha */}
        <Text style={styles.label}>Fecha Inicio</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.selector}>
          <Text style={styles.selectorText}>
            {fechaInicio.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setFechaInicio(d);
            }}
          />
        )}

        {/* Hora */}
        <Text style={styles.label}>Hora Inicio</Text>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={styles.selector}>
          <Text style={styles.selectorText}>
            {horaInicio.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={horaInicio}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowTimePicker(false);
              if (t) setHoraInicio(t);
            }}
          />
        )}

        {/* Estado */}
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>Confirmada ✅</Text>
        </View>

        {/* INVITADOS */}
        <Text style={[styles.label, { marginTop: 15 }]}>Invitados</Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Nombre"
            placeholderTextColor="#AAB7B8"
            value={nuevoInvitado.nombre}
            onChangeText={(t) =>
              setNuevoInvitado({ ...nuevoInvitado, nombre: t })
            }
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Correo"
            placeholderTextColor="#AAB7B8"
            value={nuevoInvitado.correo}
            onChangeText={(t) =>
              setNuevoInvitado({ ...nuevoInvitado, correo: t })
            }
          />
        </View>

        <TouchableOpacity style={styles.addInvBtn} onPress={agregarInvitado}>
          <Text style={styles.buttonText}>Agregar Invitado</Text>
        </TouchableOpacity>

        {/* Lista de invitados */}
        {invitados.map((i, idx) => (
          <Text
            key={idx}
            style={{
              marginTop: 5,
              color: '#2E4053',
              fontFamily: 'Poppins',
            }}>
            ✔ {i.nombre} — {i.correo}
          </Text>
        ))}

        {/* Registrar */}
        <TouchableOpacity style={styles.button} onPress={handleCreateCita}>
          <Text style={styles.buttonText}>Registrar Cita</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFEFE' },
  form: { padding: 22 },

  label: {
    fontSize: 16,
    color: '#2E4053',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D6DBDF',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFF',
    fontSize: 15,
    color: '#2E4053',
    fontFamily: 'Poppins',
  },

  selector: {
    borderWidth: 1,
    borderColor: '#D6DBDF',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFF',
  },

  selectorText: {
    fontSize: 15,
    color: '#2E4053',
    fontFamily: 'Poppins',
  },

  statusBox: {
    backgroundColor: '#E8F6F3',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  statusText: {
    color: '#6C9A8B',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },

  addInvBtn: {
    backgroundColor: '#2E4053',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  button: {
    backgroundColor: '#6C9A8B',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: '#FDFEFE',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
