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
      
      {/* ✅ Citas */}
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
      {/* Gestionar citas y usuarios */}
      <Tabs.Screen name="gestionarcitas" options={{ href: null }} />
      <Tabs.Screen name="gestionarusuario" options={{ href: null }} />
    </Tabs>
  );
}