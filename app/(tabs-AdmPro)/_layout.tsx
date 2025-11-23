import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function TabsAdmin() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E4053',
        tabBarInactiveTintColor: '#e0e0e0', // Cambié a un gris claro para mejor contraste
        tabBarLabelStyle: { 
            fontFamily: 'Montserrat-Regular', 
            fontSize: 12,
            marginBottom: 5 // Un pequeño margen extra para el texto
        },
        headerShown: false,
        tabBarStyle: {
          height: 80,
          // bottom: '1',
          paddingBottom: 5,
          paddingTop: 10,
          backgroundColor: '#6C9A8B',
          borderTopWidth: 0,
          elevation: 10,
        },
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={24} color={color} /> // Tamaño fijo recomendado
          ),
        }}
      />
      
      {/* 🗓 Crear cita */}
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Crear Cita',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-available" size={24} color={color} />
          ),
        }}
      />

      {/* 👤 Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={22} color={color} /> // FontAwesome suele ser más grande, bajamos un poco el size
          ),
        }}
      />
    </Tabs>
  );
}