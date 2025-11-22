// Views/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import HeaderJucas from '../../components/HeaderJucas';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderJucas title="Inicio" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Panel de Control</Text>

        <View style={styles.cardContainer}>

          {/* 🔹 Ir a Gestionar Citas */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('gestionarcitas')}
          >
            <MaterialIcons name="calendar-today" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Citas</Text>
            <Text style={styles.cardDesc}>Gestiona tus citas y horarios</Text>
          </TouchableOpacity>

          {/* 🔹 Ir a Gestionar Usuarios */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('gestionarusuario')}
          >
            <MaterialIcons name="people-outline" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Clientes</Text>
            <Text style={styles.cardDesc}>Consulta y administra tus clientes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="settings" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Configuración</Text>
            <Text style={styles.cardDesc}>Ajusta tu cuenta y preferencias</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#2E4053',
    marginBottom: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#2E4053',
    marginTop: 10,
  },
  cardDesc: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: '#566573',
    textAlign: 'center',
    marginTop: 4,
  },
});
