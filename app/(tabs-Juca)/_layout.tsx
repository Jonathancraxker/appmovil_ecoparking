import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function TabsAdmin() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E4053',
        tabBarInactiveTintColor: '#e0e0e0',
        tabBarLabelStyle: { fontFamily: 'Montserrat-Regular', fontSize: 12 },
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#6C9A8B',
          borderTopWidth: 0,
          elevation: 10,
        },
      }}
      
    >
      {/* ✅ Home */}
      <Tabs.Screen
        name="homeJuca"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      {/* ✅ Crear cita */}
      <Tabs.Screen
        name="crearCita"
        options={{
          title: 'Crear cita',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-available" size={size} color={color} />
          ),
        }}
      />

      

      
      {/* ✅ citas */}
      <Tabs.Screen
        name="citasJucas"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-available" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Perfil */}
      <Tabs.Screen
        name="perfilJuca"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* ✅ Reportes */}
      <Tabs.Screen
        name="reportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="chart-line" size={size} color={color} />
          ),
        }}
      />

      {/* 🔒 Ocultos */}
      <Tabs.Screen name="asistenciaAdmin" options={{ href: null }} />
      <Tabs.Screen name="certificacionesAdmin" options={{ href: null }} />
      <Tabs.Screen name="gestionarEventos" options={{ href: null }} />
      <Tabs.Screen name="gestionarInsignias" options={{ href: null }} />
      <Tabs.Screen name="gestionCumple" options={{ href: null }} />
      <Tabs.Screen name="gestionUsuario" options={{ href: null }} />
      <Tabs.Screen name="participacionAdmin" options={{ href: null }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
      <Tabs.Screen name="eventos" options={{ href: null }} />
      <Tabs.Screen name="anunciosstudents" options={{ href: null }} />
      <Tabs.Screen name="certificaciones" options={{ href: null }} />
      <Tabs.Screen name="gestionRecompensas" options={{ href: null }} />
      <Tabs.Screen name="vista-participacion" options={{ href: null }} />
      <Tabs.Screen name="tokens" options={{ href: null }} />
      <Tabs.Screen name="gestionAnuncios" options={{ href: null }} />
      <Tabs.Screen name="gestionarcitas" options={{ href: null }} />
      <Tabs.Screen name="gestionarusuario" options={{ href: null }} />
    </Tabs>
  );
}
