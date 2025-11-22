import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import HeaderJucas from '../../components/HeaderJucas';

import {
  getProfile,
  updateProfile,
  updateUserPassword,
} from '../../services/authService';

export default function ProfileScreenT() {
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [division, setDivision] = useState('');
  const [rol, setRol] = useState('');

  // Modal contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
    Roboto_Mono: require('../../assets/fonts/Roboto_Mono/RobotoMono-Regular.ttf'),
  });

  useEffect(() => {
    const cargar = async () => {
      const data = await getProfile();
      if (data.message) {
        Alert.alert('Error', data.message);
        return;
      }

      setId(data.id);
      setNombre(data.nombre);
      setCorreo(data.correo);
      setTelefono(data.telefono);
      setDivision(data.division);
      setRol(data.tipo_usuario);
    };

    cargar();
  }, []);

  if (!fontsLoaded) return null;

  // Actualizar perfil
  const handleActualizar = async () => {
    const result = await updateProfile(id, nombre, telefono, division);

    if (result.message) {
      Alert.alert('Error', result.message);
      return;
    }

    Alert.alert('Perfil actualizado', `✅ Los datos se guardaron correctamente.`);
  };

  // Actualizar contraseña
  const handleActualizarPassword = async () => {
    if (!nuevaPassword.trim()) {
      Alert.alert('Error', 'Escribe la nueva contraseña.');
      return;
    }

    const result = await updateUserPassword(id, { contrasena: nuevaPassword });

    if (result.message) {
      Alert.alert('Error', result.message);
      return;
    }

    Alert.alert('Éxito', 'Contraseña actualizada correctamente.');

    setNuevaPassword('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <HeaderJucas title="Perfil" />

      {/* MODAL CAMBIAR PASSWORD */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>

            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor="#AAB7B8"
              secureTextEntry
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleActualizarPassword}>
              <Text style={styles.buttonText}>Actualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', marginTop: 12 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SCROLL */}
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
            style={styles.avatar}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre completo"
            placeholderTextColor="#AAB7B8"
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#E9ECEF' }]}
            value={correo}
            editable={false}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Número de contacto"
            placeholderTextColor="#AAB7B8"
          />

          <Text style={styles.label}>División</Text>
          <TextInput
            style={styles.input}
            value={division}
            onChangeText={setDivision}
            placeholder="Ej. Ingeniería en Software"
            placeholderTextColor="#AAB7B8"
          />

          <Text style={styles.label}>Rol</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#E9ECEF' }]}
            value={rol}
            editable={false}
          />

          {/* BOTÓN GUARDAR */}
          <TouchableOpacity style={styles.button} onPress={handleActualizar}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          {/* BOTÓN CAMBIAR CONTRASEÑA */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#34495E', marginTop: 10 }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFEFE',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#2E4053',
    marginTop: 20,
    marginBottom: 10,
  },
  profileCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderColor: '#AAB7B8',
    borderWidth: 1,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#6C9A8B',
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
  },
  button: {
    backgroundColor: '#6C9A8B',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    color: '#FDFEFE',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000090',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 15,
  },
});
