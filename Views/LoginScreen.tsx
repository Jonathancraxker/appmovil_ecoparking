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
import { loginUser, refreshToken } from '../services/authService';
import { useFonts } from 'expo-font';

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

  useEffect(() => {
    const verifySession = async () => {
      try {
        let token = await AsyncStorage.getItem('accessToken');
        const rol = await AsyncStorage.getItem('rol');

        if (!token) {
          token = await refreshToken();
        }

        if (token && rol) {
          if (rol.toLowerCase().includes('juc')) {
            router.replace('/(tabs-Juca)/homeJuca');
          } else {
            router.replace('/(tabs-AdmPro)/home');
          }
          return;
        }
      } catch (error) {
        console.log('Error al verificar sesión:', error);
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

      if (data.user && data.token && data.refreshToken) {
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        await AsyncStorage.setItem('rol', codigo.toLowerCase());

        Alert.alert('Bienvenido', `Hola ${data.user.nombre || 'usuario'} 👋`);

        if (codigo.toLowerCase().includes('juc')) {
          router.replace('/(tabs-Juca)/homeJuca');
        } else {
          router.replace('/(tabs-AdmPro)/home');
        }
      } else {
        Alert.alert('Error', data.message || 'No se pudo iniciar sesión.');
      }
    } catch (err: any) {
      console.log('❌ Error al iniciar sesión:', err.message);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPress = () => router.push('/registro');

  if (!fontsLoaded || checkingSession) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6C9A8B" />
        <Text style={{ color: '#fff', marginTop: 10, fontFamily: 'Poppins' }}>
          Verificando sesión...
        </Text>
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
