import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

// Importamos solo loginUser desde tu servicio corregido
import { loginUser } from '../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  // 1. VERIFICACIÓN DE SESIÓN SIMPLIFICADA
  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const rol = await AsyncStorage.getItem('rol');
        const userData = await AsyncStorage.getItem('userData');

        // Si tenemos token y rol guardados, redirigimos automáticamente
        if (token && rol && userData) {
          // Verificación exacta (Case Sensitive según tu petición)
          if (rol.includes('Juca')) {
            router.replace('/(tabs-Juca)/homeJuca');
          } else if (rol.includes('Administrativo') || rol.includes('Profesor')) {
            router.replace('/(tabs-AdmPro)/home');
        } else {
            // Fallback por si acaso (opcional, puedes quitarlo si estás seguro)
            Alert.alert("Error de Rol", "No tienes permiso para acceder a la app.");
        }
        }
      } catch (error) {
        console.log('Sesión no encontrada, permanecer en login');
      } finally {
        setCheckingSession(false);
      }
    };
    verifySession();
  }, []);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim() || !codigo.trim()) {
      Alert.alert('Campos vacíos', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(correo, contrasena, codigo);

      if (data.success) {
        Alert.alert('Bienvenido', `Hola ${data.user.nombre || 'usuario'} 👋`);
        const rolUsuario = data.user.tipo_usuario || codigo;

        if (rolUsuario === 'Juca') {
          router.replace('/(tabs-Juca)/homeJuca');
        } else if (rolUsuario === 'Administrativo' || rolUsuario === 'Profesor') {
          router.replace('/(tabs-AdmPro)/home');
        } else {
            // Fallback por si acaso (opcional, puedes quitarlo si estás seguro)
            Alert.alert("Error de Rol", "No tienes permiso para acceder a la app.");
        }

      } else {
        // Aquí mostramos el mensaje de error real que viene del servicio
        Alert.alert('Aviso', data.message);
      }

    } catch (err: any) {
      console.log('Error inesperado:', err);
      Alert.alert('Error', 'Ocurrió un problema inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPress = () => router.push('/registro');

  if (!fontsLoaded || checkingSession) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6C9A8B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/portada.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <Text style={styles.subtitle}>Login</Text>
          <Text style={styles.title}>EcoParking</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Correo</Text>
          <TextInput
            value={correo}
            onChangeText={setCorreo}
            placeholder="@correo.com"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="******"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Código</Text>
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Ej. JUC123 o ADM123"
            style={styles.input}
            placeholderTextColor="#888"
            // No forzamos 'characters' para que el usuario escriba exacto lo que quiera
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRegisterPress}>
            <Text style={styles.secondaryText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  headerContainer: { position: 'absolute', top: '10%', alignItems: 'center' },
  subtitle: { color: '#fff', fontSize: 20, opacity: 0.9, fontFamily: 'Poppins' },
  title: { color: '#fff', fontSize: 42, fontFamily: 'Poppins-SemiBold', marginBottom: 10 },
  card: { width: '85%', backgroundColor: 'rgba(255,255,255,0.18)', padding: 20, borderRadius: 10, marginTop: 210 },
  label: { color: '#fff', marginTop: 6, marginBottom: 6, opacity: 0.9, fontFamily: 'Inter' },
  input: { height: 42, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8, fontFamily: 'Inter' },
  primaryButton: { height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6C9A8B', marginTop: 10 },
  primaryText: { color: '#fff', fontFamily: 'Poppins', fontWeight: '600' },
  secondaryButton: { marginTop: 10, alignSelf: 'center', backgroundColor: '#2E4053', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  secondaryText: { color: '#fff', fontFamily: 'Poppins', fontWeight: '600' },
});