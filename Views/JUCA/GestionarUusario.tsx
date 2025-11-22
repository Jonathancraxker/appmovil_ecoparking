import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HeaderJuca from '../../components/HeaderJucas';
import { useFonts } from 'expo-font';
import {
  getUsersService,
  deleteUserByIdService,
  updateUserByIdService,
} from '../../services/authService';

export default function GestionarUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    codigo: '',
    tipo_usuario: '',
    telefono: '',
    division: '',
  });

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const fetchUsuarios = async () => {
    try {
      const data = await getUsersService();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 🔹 Eliminar usuario
  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteUserByIdService(id);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              fetchUsuarios();
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // 🔹 Preparar edición
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      correo: user.correo,
      codigo: user.codigo,
      tipo_usuario: user.tipo_usuario,
      telefono: user.telefono,
      division: user.division,
    });
    setModalVisible(true);
  };

  // 🔹 Guardar cambios
  const saveEdit = async () => {
    // Validar que no haya campos vacíos
    const emptyField = Object.entries(formData).find(([k, v]) => !v);
    if (emptyField) {
      return Alert.alert('Error', 'Por favor completa todos los campos.');
    }

    try {
      await updateUserByIdService(editingUser.id, formData);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      setModalVisible(false);
      setEditingUser(null);
      fetchUsuarios();
    } catch (error) {
      console.error('Error editando usuario:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <HeaderJuca title="Gestionar Usuarios" />

      <ScrollView contentContainerStyle={styles.content}>
        {usuarios.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.cardTitle}>{u.nombre}</Text>
            <Text style={styles.cardText}>📧 {u.correo}</Text>
            <Text style={styles.cardText}>🆔 {u.codigo}</Text>
            <Text style={styles.cardText}>👤 Rol: {u.tipo_usuario}</Text>
            <Text style={styles.cardText}>📞 {u.telefono}</Text>
            <Text style={styles.cardText}>🏢 {u.division}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(u)}>
                <MaterialIcons name="edit" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(u.id)}>
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para edición */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={formData.correo}
              onChangeText={(text) => setFormData({ ...formData, correo: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Código"
              value={formData.codigo}
              onChangeText={(text) => setFormData({ ...formData, codigo: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Rol"
              value={formData.tipo_usuario}
              onChangeText={(text) => setFormData({ ...formData, tipo_usuario: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={formData.telefono}
              onChangeText={(text) => setFormData({ ...formData, telefono: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="División"
              value={formData.division}
              onChangeText={(text) => setFormData({ ...formData, division: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={{ color: '#fff' }}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#6C9A8B',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
  },
  cardTitle: { fontSize: 18, color: '#fff', fontFamily: 'Poppins-SemiBold' },
  cardText: { fontSize: 14, color: '#FDFEFE', fontFamily: 'Poppins', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 12 },
  btnEdit: { backgroundColor: '#2E4053', padding: 10, borderRadius: 8 },
  btnDelete: { backgroundColor: '#566573', padding: 10, borderRadius: 8 },

  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#2E4053', padding: 10, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#566573', padding: 10, borderRadius: 8 },
});
