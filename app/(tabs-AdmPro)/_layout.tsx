import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function TabsAdmin() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E4053',
        tabBarInactiveTintColor: '#cccccc',
        tabBarLabelStyle: { fontFamily: 'Montserrat-Regular', fontSize: 12 },
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#6C9A8B',
          borderTopWidth: 0,
          elevation: 8,
        },
      }}
    >
      

      {/* 🏠 Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {/* 🗓 Crear cita */}
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Crear Cita',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-available" size={size} color={color} />
          ),
        }}
      />

      {/* 👤 Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={size} color={color} />
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
    </Tabs>
  );
}
