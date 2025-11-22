import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <-- Importación CLAVE para navegación
import { api } from '../api/axios'; 
import { useFonts } from 'expo-font';

// NOTA: Se elimina 'type RegisterProps' ya que usamos useNavigation
// NOTA: Asegúrate de que tu componente de Login se llame 'LoginScreen' en tu Navigation Stack
export default function RegisterScreen() {
  const navigation = useNavigation<any>(); // <-- Inicializamos el hook de navegación

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [division, setDivision] = useState('');
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleCreate = async () => {
    if (!correo.trim() || !contrasena.trim() || !nombre.trim() || !codigo.trim() || !telefono.trim() || !division.trim()) {
      Alert.alert('Campos vacíos', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);

    try {
      const formData = {
        nombre: nombre,
        correo: correo,
        contrasena: contrasena,
        codigo: codigo,
        telefono: telefono,
        division: division
      };

      await api.post('/usuarios/registro', formData);

      // Limpiar todos los campos
      setNombre('');
      setCorreo('');
      setContrasena('');
      setCodigo('');
      setTelefono('');
      setDivision('');

      Alert.alert('¡Éxito!', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      
      // ✅ Solución: Navegación usando React Navigation
      navigation.navigate('login'); 

    } catch (err: any) {
      console.log('❌ Error al registrar:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Error de conexión. Intenta más tarde.';
      Alert.alert('Error al registrar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/portada.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.headerContainer}>
          <Text style={styles.subtitle}>Registro</Text>
          <Text style={styles.title}>EcoParking</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre} 
            placeholder="Tu nombre completo"
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="words"
          />
          
          <Text style={styles.label}>Correo institucional</Text>
          <TextInput
            value={correo}
            onChangeText={setCorreo} 
            placeholder="ejemplo@uteq.edu.mx"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={contrasena}
            onChangeText={setContrasena} 
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Código de acceso</Text>
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Ej. ADM123 o JUC456"
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej. 4421234567"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>División</Text>
          <TextInput
            value={division}
            onChangeText={setDivision}
            placeholder="Ej. TIC's, Industrial..."
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="characters"
          />

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('login')} // ✅ Solución: Navegación usando React Navigation
            disabled={loading}
          >
            <Text style={styles.secondaryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.55)' 
  },
  headerContainer: {
    position: 'absolute',
    top: '10%',
    alignItems: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    opacity: 0.9,
    fontFamily: 'Poppins',
  },
  title: {
    color: '#fff',
    fontSize: 42,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 20,
    borderRadius: 10,
    marginTop: 210,
  },
  label: {
    color: '#fff',
    marginTop: 6,
    marginBottom: 6,
    opacity: 0.9,
    fontFamily: 'Inter',
  },
  input: {
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C9A8B',
    marginTop: 10,
  },
  primaryText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#2E4053',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  secondaryText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
});