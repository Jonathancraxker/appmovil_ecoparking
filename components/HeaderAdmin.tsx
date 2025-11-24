import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { logoutUser } from '../services/authService'; // Importamos la nueva función

export default function HeaderAdmin({ title }: { title: string }) {
  const router = useRouter();

  const handleLogout = async () => {
      await logoutUser();
      // Redirección al login
      router.replace('/'); 
    };
  
  // const handleLogout = async () => {
  //   // Confirmación opcional para experiencia de usuario
  //   Alert.alert(
  //     "Cerrar Sesión",
  //     "¿Estás seguro que deseas salir?",
  //     [
  //       { text: "Cancelar", style: "cancel" },
  //       { 
  //         text: "Salir", 
  //         style: "destructive",
  //         onPress: async () => {
  //           await logoutUser(); // Llamamos al servicio para cerrar sesión
  //           router.replace('/'); // Redirigimos al login
  //         }
  //       }
  //     ]
  //   );
  // };

  return (
    <ImageBackground
      source={require('../assets/images/image.png')} 
      style={styles.headerBackground}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Montserrat-Regular', 
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 154, 139, 0.6)', 
  },
});