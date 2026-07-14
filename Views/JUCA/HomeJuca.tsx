// Views/HomeScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderJucas from '../../components/HeaderJucas';

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

          {/* 🔹 Ir a Gestionar Citas */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('gestionarCitasJuca')}
          >
            <MaterialIcons name="calendar-today" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Mis Citas</Text>
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

          <TouchableOpacity style={styles.card} 
          onPress={() => navigation.navigate('perfilJuca')}>
            <MaterialIcons name="settings" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Configuración</Text>
            <Text style={styles.cardDesc}>Ajusta tu cuenta y preferencias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} 
          onPress={() => navigation.navigate('reportes')}>
            <MaterialIcons name="bar-chart" size={40} color="#6C9A8B" />
            <Text style={styles.cardTitle}>Reportes</Text>
            <Text style={styles.cardDesc}>Revisa las estadísticas</Text>
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