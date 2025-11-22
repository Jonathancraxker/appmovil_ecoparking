import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import HeaderAdmin from '../../components/HeaderAdmin';
import { getProfile, updateProfile, updateUserPassword } from '../../services/authService';

export default function ProfileScreenT() {
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [division, setDivision] = useState('');
  const [rol, setRol] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  if (!fontsLoaded) return null;

  const handleActualizarPerfil = async () => {
    const result = await updateProfile(id, nombre, telefono, division);
    if (result.message) {
      Alert.alert("Error", result.message);
      return;
    }
    Alert.alert("Éxito", "Perfil actualizado correctamente");
  };

  const handleActualizarPassword = async () => {
    if (!nuevaPassword) {
      Alert.alert("Error", "Escribe la nueva contraseña");
      return;
    }
    const result = await updateUserPassword(id, { contrasena: nuevaPassword });
    if (result.message) {
      Alert.alert("Error", result.message);
      return;
    }
    Alert.alert("Éxito", "Contraseña actualizada exitosamente");
    setNuevaPassword("");
    setModalVisible(false);
  };

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
              secureTextEntry
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleActualizarPassword}>
              <Text style={styles.buttonText}>Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 12 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ScrollView para que todo se desplace */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#E9ECEF" }]}
            value={correo}
            editable={false}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />

          <Text style={styles.label}>División</Text>
          <TextInput style={styles.input} value={division} onChangeText={setDivision} />

          <Text style={styles.label}>Rol</Text>
          <TextInput style={styles.input} value={rol} editable={false} />

          <TouchableOpacity style={styles.button} onPress={handleActualizarPerfil}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#34495E", marginTop: 10 }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 40, // agrega espacio para que se vea el último botón
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
