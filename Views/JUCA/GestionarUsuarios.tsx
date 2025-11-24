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
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import HeaderAdmin from '../../components/HeaderAdmin'; // Usamos HeaderAdmin si es para el admin
import { useFonts } from 'expo-font';

// Importamos tus servicios existentes
import {
  getUsersService,
  deleteUserByIdService,
  updateUserByIdService,
  createUserService, 
  updateUserPassword // Asegúrate de tener este servicio creado o impórtalo de authService si es genérico
} from '../../services/usuariosServiceAdm'; // Ajusta la ruta si es necesario

// Estado inicial
const initialFormData = {
  nombre: '',
  correo: '',
  contrasena: '',
  codigo: '',
  tipo_usuario: 'Administrativo',
  telefono: '',
  division: '',
  intentos: '0'
};

export default function GestionarUsuario() {
  // Estados
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Crear/Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // null = Crear
  const [formData, setFormData] = useState(initialFormData);

  // Modal Contraseña
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  // Cargar Usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsersService();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // --- MANEJADORES DEL FORMULARIO ---
  const handleOpenModal = (user: any = null) => {
    setCurrentUser(user);
    if (user) {
      // Modo Editar
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        contrasena: '', // No se edita aquí
        codigo: user.codigo || '',
        tipo_usuario: user.tipo_usuario || 'Profesor',
        telefono: user.telefono || '',
        division: user.division || '',
        intentos: String(user.intentos || '0')
      });
    } else {
      // Modo Crear
      setFormData(initialFormData);
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.nombre || !formData.correo || !formData.codigo || !formData.telefono) {
        Alert.alert("Campos incompletos", "Por favor llena los campos obligatorios.");
        return;
    }

    // Validación contraseña al crear
    if (!currentUser && formData.contrasena.length < 8) {
        Alert.alert("Contraseña Insegura", "La contraseña debe tener al menos 8 caracteres.");
        return;
    }

    try {
        if (currentUser) {
            // EDITAR (Excluyendo contraseña)
            const { contrasena, ...dataToUpdate } = formData;
            await updateUserByIdService(currentUser.id, dataToUpdate);
            Alert.alert("Éxito", "Usuario actualizado correctamente.");
        } else {
            // CREAR
            await createUserService(formData);
            Alert.alert("Éxito", "Usuario registrado correctamente.");
        }
        setModalVisible(false);
        fetchUsuarios();
    } catch (error: any) {
        Alert.alert("Error", error.message || "Ocurrió un error al guardar.");
    }
  };

  // --- MANEJO DE ELIMINAR ---
  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar este usuario permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserByIdService(id);
              Alert.alert('Eliminado', 'Usuario eliminado correctamente');
              fetchUsuarios();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  // --- MANEJO DE CONTRASEÑA ---
  const handleOpenPasswordModal = (user: any) => {
      setCurrentUser(user);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
        Alert.alert("Error", "Completa ambos campos.");
        return;
    }
    if (newPassword !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden.");
        return;
    }
    if (newPassword.length < 8) {
        Alert.alert("Error", "Mínimo 8 caracteres.");
        return;
    }
    
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;
    if (!specialCharRegex.test(newPassword)) {
      Alert.alert('Error', 'Debe tener al menos un carácter especial.');
      return;
    }

    try {
        await updateUserPassword(currentUser.id, newPassword);
        Alert.alert("Éxito", "Contraseña actualizada.");
        setPasswordModalVisible(false);
    } catch (error) {
        Alert.alert("Error", "No se pudo actualizar la contraseña.");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderAdmin title="Gestión de Usuarios" />

      <ScrollView contentContainerStyle={styles.container}>
        
        <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => handleOpenModal(null)}
        >
            <MaterialIcons name="add-circle-outline" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Agregar Usuario</Text>
        </TouchableOpacity>

        {loading ? (
             <ActivityIndicator size="large" color="#6C9A8B" style={{marginTop: 50}} />
        ) : (
            usuarios.map((u) => (
            <View key={u.id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{u.nombre}</Text>
                    <View style={[styles.badge, u.intentos >= 5 ? styles.badgeDanger : styles.badgeSuccess]}>
                        <Text style={styles.badgeText}>{u.tipo_usuario}</Text>
                    </View>
                </View>
                
                <Text style={styles.cardText}>📧 {u.correo}</Text>
                <Text style={styles.cardText}>🆔 {u.codigo}</Text>
                <Text style={styles.cardText}>📞 {u.telefono}</Text>
                <Text style={styles.cardText}>🏢 {u.division}</Text>
                
                {/* Alerta visual de intentos */}
                <Text style={[styles.cardText, {fontWeight: 'bold', color: u.intentos >= 5 ? '#E74C3C' : '#566573'}]}>
                    🔒 Intentos: {u.intentos}
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.btnAction} onPress={() => handleOpenModal(u)}>
                        <MaterialIcons name="edit" size={20} color="#FFF" />
                        <Text style={styles.btnText}></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#34495E'}]} onPress={() => handleOpenPasswordModal(u)}>
                        <MaterialIcons name="vpn-key" size={20} color="#FFF" />
                        <Text style={styles.btnText}></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#E74C3C'}]} onPress={() => handleDelete(u.id)}>
                        <MaterialIcons name="delete" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
            ))
        )}
      </ScrollView>

      {/* --- MODAL CREAR/EDITAR --- */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <ScrollView>
                <Text style={styles.modalTitle}>{currentUser ? "Editar Usuario" : "Agregar Usuario"}</Text>

                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} value={formData.nombre} onChangeText={(t)=>setFormData({...formData, nombre: t})} />

                <Text style={styles.label}>Correo</Text>
                <TextInput style={styles.input} value={formData.correo} onChangeText={(t)=>setFormData({...formData, correo: t})} keyboardType="email-address" autoCapitalize='none'/>

                {/* Solo mostrar contraseña al crear */}
                {!currentUser && (
                    <>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput 
                            style={styles.input} 
                            value={formData.contrasena} 
                            onChangeText={(t)=>setFormData({...formData, contrasena: t})} 
                            secureTextEntry
                            placeholder="Mínimo 8 caracteres"
                        />
                    </>
                )}

                <View style={{flexDirection: 'row', gap: 10}}>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>Código</Text>
                        <TextInput style={styles.input} value={formData.codigo} onChangeText={(t)=>setFormData({...formData, codigo: t})} />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput style={styles.input} value={formData.telefono} onChangeText={(t)=>setFormData({...formData, telefono: t})} keyboardType="phone-pad" maxLength={10} />
                    </View>
                </View>

                <Text style={styles.label}>División</Text>
                <TextInput style={styles.input} value={formData.division} onChangeText={(t)=>setFormData({...formData, division: t})} />

                {/* Simulación de Select para Tipo de Usuario */}
                <Text style={styles.label}>Tipo de Usuario: {formData.tipo_usuario}</Text>
                <View style={{flexDirection: 'row', gap: 5, marginBottom: 10}}>
                    {['Administrativo', 'Profesor', 'Juca'].map((tipo) => (
                        <TouchableOpacity 
                            key={tipo}
                            onPress={() => setFormData({...formData, tipo_usuario: tipo})}
                            style={[styles.chip, formData.tipo_usuario === tipo && styles.chipActive]}
                        >
                            <Text style={[styles.chipText, formData.tipo_usuario === tipo && {color: 'white'}]}>{tipo}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                {/* Simulación de Select para Intentos */}
                <Text style={styles.label}>Intentos Fallidos: {formData.intentos}</Text>
                <View style={{flexDirection: 'row', gap: 5, flexWrap: 'wrap'}}>
                    {['0', '1', '2', '3', '4', '5'].map((num) => (
                        <TouchableOpacity 
                            key={num}
                            onPress={() => setFormData({...formData, intentos: num})}
                            style={[styles.chip, formData.intentos === num && {backgroundColor: '#E74C3C', borderColor: '#E74C3C'}]}
                        >
                            <Text style={[styles.chipText, formData.intentos === num && {color: 'white'}]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.button, {backgroundColor: '#AAB7B8'}]}>
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={[styles.button, {backgroundColor: '#6C9A8B'}]}>
                        <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL CONTRASEÑA --- */}
      <Modal visible={passwordModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
                <Text style={{fontSize: 12, color: '#666', marginBottom: 10}}>Usuario: {currentUser?.correo}</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Nueva contraseña" 
                    secureTextEntry 
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Confirmar contraseña" 
                    secureTextEntry 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={[styles.button, {backgroundColor: '#AAB7B8'}]}>
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePasswordSubmit} style={[styles.button, {backgroundColor: '#34495E'}]}>
                        <Text style={styles.buttonText}>Actualizar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  addButton: { flexDirection: 'row', backgroundColor: '#6C9A8B', padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#FFF', fontFamily: 'Poppins-SemiBold', marginLeft: 8 },
  
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#DDD', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#2E4053' },
  cardText: { fontSize: 13, fontFamily: 'Inter', color: '#566573', marginBottom: 2 },
  
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeSuccess: { backgroundColor: '#D5F5E3' },
  badgeDanger: { backgroundColor: '#FADBD8' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

  actions: { flexDirection: 'row', marginTop: 10, gap: 8 },
  btnAction: { flexDirection: 'row', backgroundColor: '#F1C40F', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flex: 1 },
  btnText: { color: '#FFF', fontSize: 12, fontFamily: 'Poppins-SemiBold', marginLeft: 4 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 15, textAlign: 'center', color: '#2E4053' },
  label: { marginTop: 8, marginBottom: 4, fontFamily: 'Inter', fontSize: 12, color: '#555' },
  input: { backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#D5DBDB', borderRadius: 8, padding: 10, marginBottom: 8, fontFamily: 'Inter' },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#AAB7B8', marginRight: 5, marginBottom: 5 },
  chipActive: { backgroundColor: '#6C9A8B', borderColor: '#6C9A8B' },
  chipText: { fontSize: 12, fontFamily: 'Inter' },

  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  button: { flex: 1, borderRadius: 8, alignItems: 'center', paddingVertical: 12 },
  buttonText: { color: '#FFF', fontFamily: 'Poppins-SemiBold', fontSize: 14 },
});