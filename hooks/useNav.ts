// Hooks de navegación tomados de expo-router (en vez de @react-navigation/native),
// para que usen el mismo contexto que las pantallas del Tabs y no fallen con
// "Couldn't find a navigation object".
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';

export { useNavigation };

export const useIsFocused = (): boolean => {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );
  return focused;
};
