import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import HeaderAdmin from '../../components/HeaderAdmin';
import { getProfile, updateProfile, updateUserPassword } from '../../services/authService';

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
  const [isEditing, setIsEditing] = useState(false); // Controla edición

  // Estados para Modal Contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState(''); // Nueva confirmación

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  // Cargar datos del perfil
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

  // Actualizar Perfil
  // Función para Actualizar Perfil
    const handleActualizarPerfil = async () => {
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

  // Cancelar Edición (Recarga datos originales)
  const handleCancelarEdicion = () => {
    setIsEditing(false);
    cargarPerfil();
  };

  // Actualizar Contraseña
  const handleActualizarPassword = async () => {
    if (!nuevaPassword || !confirmarPassword) {
      Alert.alert("Error", "Por favor completa ambos campos");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
    }
    
    if (nuevaPassword.length < 8) {
        Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
        return;
    }

    // Validación carácter especial
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;
    if (!specialCharRegex.test(nuevaPassword)) {
        Alert.alert('Error', 'La contraseña debe contener al menos un carácter especial.');
        return;
    }

    setLoading(true);
    const result = await updateUserPassword(id, nuevaPassword); // Tu servicio espera el string directo o el objeto? (Ajustar según authService)
    // Asumiendo que authService.ts: updateUserPassword(id, passwordString) hace el {contrasena: ...}
    // Si tu servicio espera objeto, usa: updateUserPassword(id, { contrasena: nuevaPassword })
    setLoading(false);

    // Validación corregida
    if (result.message && !result.message.toLowerCase().includes('actualizada')) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Éxito", "Contraseña actualizada exitosamente");
    setNuevaPassword("");
    setConfirmarPassword("");
    setModalVisible(false);
  };

  if (!fontsLoaded) return null;

  if (loading && !id) {
      return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#6C9A8B" />
          </View>
      );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="" />

      {/* Modal para contraseña */}
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
              {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>Actualizar</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setNuevaPassword("");
                setConfirmarPassword("");
            }}>
              <Text style={{ textAlign: "center", marginTop: 12, color: "#666" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ScrollView para que todo se desplace */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>

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
            editable={isEditing}
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={correo}
            editable={isEditing} // Ahora es editable si se activa el modo
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput 
            style={[styles.input, !isEditing && styles.inputDisabled]} 
            value={telefono} 
            onChangeText={setTelefono} 
            editable={isEditing}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>División</Text>
          <TextInput 
            style={[styles.input, !isEditing && styles.inputDisabled]} 
            value={division} 
            onChangeText={setDivision} 
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
          {/* BOTONES DE ACCIÓN */}
          {!isEditing ? (
            // MODO VISUALIZACIÓN
            <>
                <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                    <Text style={styles.buttonText}>Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#34495E", marginTop: 10 }]}
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
                    onPress={handleActualizarPerfil}
                >
                     {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>Guardar</Text>}
                </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40, 
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000090",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 15,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#2E4053",
    marginBottom: 20,
  },
  profileCard: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#AAB7B8",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#6C9A8B",
  },
  label: {
    fontFamily: "Inter",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    color: "#2E4053",
  },
  input: {
    backgroundColor: "#FDFEFE",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderColor: "#AAB7B8",
    borderWidth: 1,
    fontFamily: "Inter",
  },
  // Estilos nuevos para inputs inactivos
  inputDisabled: {
    backgroundColor: '#FAFAFA',
    color: '#5D6D7E', 
    borderColor: '#E5E8E8'
  },
  inputReadOnly: {
    backgroundColor: "#E9ECEF",
    color: '#7F8C8D'
  },
  button: {
    backgroundColor: "#6C9A8B",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});