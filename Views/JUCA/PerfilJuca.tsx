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
  ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import HeaderJucas from '../../components/HeaderJucas';

import {
  getProfile,
  updateProfile,
  updateUserPassword,
} from '../../services/authService';

export default function ProfileScreenT() {
  // Estados de Datos
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [division, setDivision] = useState('');
  const [rol, setRol] = useState('');
  const [codigo, setCodigo] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Controla si se pueden editar los campos

  // Estados para el Modal de Contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState(''); // Nueva confirmación

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
    Roboto_Mono: require('../../assets/fonts/Roboto_Mono/RobotoMono-Regular.ttf'),
  });

  // Cargar Perfil
  const cargarPerfil = async () => {
    setLoading(true);
    const data = await getProfile();
    if (data.message) {
      Alert.alert('Error', data.message);
    } else {
      setId(data.id);
      setNombre(data.nombre);
      setCorreo(data.correo);
      setTelefono(data.telefono);
      setDivision(data.division);
      setRol(data.tipo_usuario);
      setCodigo(data.codigo);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  // Función para Actualizar Perfil
  const handleActualizar = async () => {
    const data = { nombre, correo, telefono, division };
    if (telefono.length !== 10) {
      Alert.alert('Alerta', 'El teléfono debe tener exactamente 10 dígitos.');
      return;
    }
    setLoading(true);
    const result = await updateProfile(id, data);
    setLoading(false);

    if (result.message && !result.message.toLowerCase().includes('actualizado')) {
      Alert.alert('Error', result.message);
      return;
    }

    Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    setIsEditing(false);
  };

  // Función para Cancelar Edición (Recarga los datos originales)
  const handleCancelarEdicion = () => {
    setIsEditing(false);
    cargarPerfil(); // Vuelve a traer los datos del servidor para deshacer cambios locales
  };

// Actualizar contraseña
  const handleActualizarPassword = async () => {
    if (!nuevaPassword.trim()) {
      Alert.alert('Error', 'Escribe la nueva contraseña.');
      return;
    }

    if (nuevaPassword.length < 8) { // Mínimo 8 caracteres
        Alert.alert('Contraseña Insegura', 'La contraseña debe tener al menos 8 caracteres.');
        return;
    }
    
    // Validación de al menos 1 carácter especial
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;
    if (!specialCharRegex.test(nuevaPassword)) {
        Alert.alert('Contraseña Insegura', 'La contraseña debe contener al menos un carácter especial (ej. @, #, $, %, -).');
        return;
    }

    setLoading(true);
    const result = await updateUserPassword(id, nuevaPassword);
    setLoading(false);
    if (result.message === "Contraseña actualizada exitosamente" || result.message?.toLowerCase().includes("exitosa") || result.message?.toLowerCase().includes("correctamente")) {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
        setNuevaPassword('');
        setModalVisible(false);
    } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar la contraseña.');
    }
  };

  if (!fontsLoaded) return null;

  if (loading && !id) { // Solo muestra spinner pantalla completa si es la primera carga
      return (
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color="#6C9A8B" />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <HeaderJucas title="Perfil" />

      {/* --- MODAL CAMBIAR PASSWORD --- */}
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

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#AAB7B8"
              secureTextEntry
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleActualizarPassword}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Actualizar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setNuevaPassword('');
                setConfirmarPassword('');
            }}>
              <Text style={{ textAlign: 'center', marginTop: 12, color: '#666' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
            style={styles.avatar}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre completo"
            placeholderTextColor="#AAB7B8"
            editable={isEditing}
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Número de contacto"
            placeholderTextColor="#AAB7B8"
            keyboardType="phone-pad"
            editable={isEditing}
            maxLength={10}
          />

          <Text style={styles.label}>División</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={division}
            onChangeText={setDivision}
            placeholder="Ej. Ingeniería en Software"
            placeholderTextColor="#AAB7B8"
            editable={isEditing}
          />

          <Text style={styles.label}>Rol</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={rol}
            editable={false}
          />
          
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={codigo}
            editable={false}
          />

          {/* --- BOTONES DE ACCIÓN --- */}
          {!isEditing ? (
            // MODO VISUALIZACIÓN
            <>
                <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                    <Text style={styles.buttonText}>Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#34495E', marginTop: 10 }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                </TouchableOpacity>
            </>
          ) : (
            // MODO EDICIÓN
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity 
                    style={[styles.button, { flex: 1, marginRight: 5, backgroundColor: '#95A5A6', marginTop: 0 }]} 
                    onPress={handleCancelarEdicion}
                >
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, { flex: 1, marginLeft: 5, marginTop: 0 }]} 
                    onPress={handleActualizar}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Guardar</Text>}
                </TouchableOpacity>
            </View>
          )}

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
  // Estilo nuevo para inputs deshabilitados (cuando no se está editando)
  inputDisabled: {
    backgroundColor: '#FAFAFA', // Un gris muy suave
    color: '#5D6D7E', // Texto un poco más claro
    borderColor: '#E5E8E8'
  },
  // Estilo para inputs que NUNCA se editan (Rol, Código)
  inputReadOnly: {
    backgroundColor: '#E9ECEF',
    color: '#7F8C8D'
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