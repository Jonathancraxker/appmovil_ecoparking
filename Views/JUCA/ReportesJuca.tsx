import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { useFonts } from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';

// Importaciones para Archivos
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderJucas from '../../components/HeaderJucas';
import {
    getCitasAdminService,
    getReportesService, 
    getEstadisticasService, 
    getPrediccionService, 
    crearReporteService,
    getPdfUrl
} from '../../services/reportesService';

export default function ReportesJuca() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [reportes, setReportes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [prediccion, setPrediccion] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  
  const [selectedCita, setSelectedCita] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    Inter: require('../../assets/fonts/Inter/Inter_28pt-Regular.ttf'),
  });

  useEffect(() => {
    if (isFocused) {
        cargarDatos();
    }
  }, [isFocused]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
        const [resReportes, resStats, resPred, resCitas] = await Promise.all([
            getReportesService(),
            getEstadisticasService(),
            getPrediccionService(),
            getCitasAdminService()
        ]);

        setReportes(resReportes);
        setStats(resStats);
        setPrediccion(resPred);
        setCitas(resCitas);
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };

  const handleCrearReporte = async () => {
    if (!selectedCita) {
        Alert.alert("Atención", "Selecciona una cita primero.");
        return;
    }

    setLoadingAction(true);
    try {
        const res = await crearReporteService(selectedCita);
        Alert.alert("¡Éxito!", `Reporte #${res.id} creado correctamente.`);
        cargarDatos();
        setSelectedCita('');
    } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo crear el reporte.");
    } finally {
        setLoadingAction(false);
    }
  };

  // --- FUNCIÓN DE DESCARGA DE PDF ROBUSTA ---
  const handleDescargarPDF = async (id_reporte: number) => {
      setDownloadingPdf(id_reporte);
      try {
          const token = await AsyncStorage.getItem("accessToken");
          const pdfUrl = getPdfUrl(id_reporte);
          // Nombre temporal en caché
          const fileUri = FileSystem.cacheDirectory + `reporte_${id_reporte}.pdf`;

          // 1. Descargar el archivo a la caché de la app
          const downloadRes = await FileSystem.downloadAsync(pdfUrl, fileUri, {
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (downloadRes.status !== 200) {
              Alert.alert("Error", "El servidor no pudo generar el PDF.");
              return;
          }

          // 2. Guardar o Compartir según la plataforma
          if (Platform.OS === "android") {
              saveAndroidFile(downloadRes.uri, `reporte_${id_reporte}.pdf`);
          } else {
              // En iOS usamos compartir
              await Sharing.shareAsync(downloadRes.uri);
          }

      } catch (error) {
          console.log("Error descarga:", error);
          Alert.alert("Error", "Hubo un problema al descargar el archivo.");
      } finally {
          setDownloadingPdf(null);
      }
  };

  const PERSISTENT_URI_KEY = 'SAF_DOWNLOAD_URI';
  // --- Lógica específica para Android (SAF) ---
  const saveAndroidFile = async (fileUri: string, fileName: string) => {
    let directoryUri = await AsyncStorage.getItem(PERSISTENT_URI_KEY);
    
    try {
        let requiresNewPermission = false;

        // 1. Si NO tenemos un URI guardado, necesitamos pedir uno.
        if (!directoryUri) {
            requiresNewPermission = true;
        } 
        // 2. NOTA: Eliminamos la verificación getUriPermissionsAsync porque es la que causa el TypeError.
        // Si el URI guardado ya no tiene permisos, el error ocurrirá en el paso 4 y se solicitará uno nuevo.

        if (requiresNewPermission) {
            // Paso A: Solicitar un nuevo permiso de carpeta al usuario
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            
            if (!permissions.granted) {
                // Si el usuario cancela, hacemos el fallback a Sharing
                await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: 'Guardar PDF' });
                return;
            }
            
            // Guardar el nuevo URI
            directoryUri = permissions.directoryUri;
            await AsyncStorage.setItem(PERSISTENT_URI_KEY, directoryUri);
        }

        // --- Continuar con la escritura del archivo ---
        
        // 3. Leer el archivo descargado como Base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
        
        // 4. Intentar crear el archivo en la carpeta seleccionada (usando el URI persistente)
        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri!, // Usamos el URI que ahora debe ser válido
            fileName, 
            'application/pdf'
        );

        // 5. Escribir el contenido
        await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: 'base64' });
        
        Alert.alert("Guardado", "El PDF se guardó en la carpeta seleccionada.");

    } catch (e) {
        // Este bloque se ejecuta si:
        // a) El create/write falla (URI inválido/expirado, etc.)
        // b) Ocurre un error imprevisto (como el TypeError que eliminamos, o un error de lectura/escritura)
        
        console.log("Error guardando Android (SAF):", e); 
        
        // Borramos el URI corrupto para forzar una nueva selección la próxima vez
        await AsyncStorage.removeItem(PERSISTENT_URI_KEY); 
        
        // Fallback a compartir el archivo
        Alert.alert(
            "Error de Guardado", 
            "No se pudo guardar el archivo. Intenta seleccionando la carpeta de nuevo.",
            [{ text: "Compartir", onPress: () => Sharing.shareAsync(fileUri, { mimeType: 'application/pdf' }) }]
        );
    }
};

  if (!fontsLoaded) return null;

  if (loading) {
      return (
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color="#6C9A8B" />
          </View>
      );
  }

  // --- (El resto del JSX y Estilos es idéntico al anterior, solo pego para completar) ---
  return (
    <View style={{ flex: 1, backgroundColor: '#FDFEFE' }}>
      <HeaderJucas title="Dashboard" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. PREDICCIÓN */}
        {prediccion && (
            <View style={styles.prediccionCard}>
                <Text style={styles.prediccionTitle}>Predicción del Próximo Mes</Text>
                <Text style={styles.prediccionMes}>{prediccion.mes_predicho}</Text>
                <Text style={styles.prediccionNumero}>{prediccion.visitas_predichas}</Text>
                <Text style={styles.prediccionLabel}>Citas estimadas</Text>
            </View>
        )}

        {/* 2. ESTADÍSTICAS GENERALES */}
        {stats && stats.estadisticasVisitas && (
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Análisis de Afluencia</Text>                
                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Promedio de Citas</Text>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Por Día:</Text>
                        <Text style={styles.statValue}>{stats.estadisticasVisitas.mediaPorDia}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Por Semana:</Text>
                        <Text style={styles.statValue}>{stats.estadisticasVisitas.mediaPorSemana}</Text>
                    </View>
                    <View style={[styles.statRow, {borderBottomWidth: 0}]}>
                        <Text style={styles.statLabel}>Por Mes:</Text>
                        <Text style={styles.statValue}>{stats.estadisticasVisitas.mediaPorMes}</Text>
                    </View>
                </View>

                <View style={{flexDirection: 'row', gap: 10}}>
                    <View style={[styles.statsCard, {flex: 1}]}>
                        <Text style={styles.cardTitle}>Picos de Afluencia (Moda)</Text>
                        <View style={styles.statRowSmall}>
                            <Text style={styles.statLabelSmall}>Día Top - visitas</Text>
                            <Text style={styles.statValueSmall}>{stats.estadisticasVisitas.modaDiaSemana}</Text>
                        </View>
                        <View style={[styles.statRowSmall, {borderBottomWidth: 0}]}>
                            <Text style={styles.statLabelSmall}>Hora Top</Text>
                            <Text style={styles.statValueSmall}>{stats.estadisticasVisitas.modaHora}</Text>
                        </View>
                    </View>
                    <View style={[styles.statsCard, {flex: 1}]}>
                        <Text style={styles.cardTitle}>Totales</Text>
                        <View style={styles.statRowSmall}>
                            <Text style={styles.statLabelSmall}>Mediana/Día</Text>
                            <Text style={styles.statValueSmall}>{stats.estadisticasVisitas.medianaVisitas}</Text>
                        </View>
                        <View style={[styles.statRowSmall, {borderBottomWidth: 0}]}>
                            <Text style={styles.statLabelSmall}>Total Citas</Text>
                            <Text style={styles.statValueSmall}>{stats.estadisticasVisitas.totalVisitas}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )}

        {/* 3. TOP VISITANTES */}
        {stats && (
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Análisis de Visitantes (Top 5)</Text>
                
                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Empresas</Text>
                    {stats.topEmpresas?.map((item: any, i: number) => (
                        <View key={i} style={styles.topRow}>
                            <Text style={styles.topText}>{i + 1}. {item.empresa}</Text>
                            <Text style={styles.topValue}>{item.cantidad}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Divisiones</Text>
                    {stats.topDivisiones?.map((item: any, i: number) => (
                        <View key={i} style={styles.topRow}>
                            <Text style={styles.topText}>{i + 1}. {item.division}</Text>
                            <Text style={styles.topValue}>{item.cantidad}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Tipos de Visitante</Text>
                    {stats.topTipoVisitante?.map((item: any, i: number) => (
                        <View key={i} style={styles.topRow}>
                            <Text style={styles.topText}>{i + 1}. {item.tipo_visitante}</Text>
                            <Text style={styles.topValue}>{item.cantidad}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )}

        {/* 4. CREAR REPORTE */}
        <View style={styles.createCard}>
            <Text style={styles.createTitle}>Generar Nuevo Reporte</Text>
            <Text style={styles.label}>Seleccionar Cita (Fecha auto):</Text>
            
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedCita}
                    onValueChange={(itemValue) => setSelectedCita(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="-- Seleccione una cita --" value="" />
                    {citas.map((c) => (
                        <Picker.Item 
                            key={c.id} 
                            label={`(ID: ${c.id}) - ${c.motivo}`} 
                            value={c.id} 
                            style={{fontSize: 14}}
                        />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleCrearReporte}
                disabled={loadingAction}
            >
                {loadingAction ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>Guardar Reporte de Hoy</Text>}
            </TouchableOpacity>
        </View>

        {/* 5. HISTORIAL */}
        <Text style={styles.sectionHeader}>Historial de Reportes</Text>
        {reportes.length === 0 ? (
            <Text style={{textAlign: 'center', color: '#888', marginTop: 10}}>No hay reportes registrados.</Text>
        ) : (
            reportes.map((rep) => (
                <View key={rep.reporte_id} style={styles.reportItem}>
                    <View style={{flex: 1}}>
                        <Text style={styles.repDate}>
                            📅 {new Date(rep.fecha_reporte).toLocaleDateString()}
                        </Text>
                        <Text style={styles.repHora}>
                            ⏰ {new Date(rep.fecha_reporte).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                        <Text style={styles.repMotivo}>Cita: {rep.motivo_cita}</Text>
                        <Text style={styles.repUser}>Creado por: <Text style={{fontWeight: 'bold'}}>{rep.correo_usuario}</Text> ({rep.tipo_usuario})</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.pdfBtn} 
                        onPress={() => handleDescargarPDF(rep.reporte_id)}
                        disabled={downloadingPdf === rep.reporte_id}
                    >
                        {downloadingPdf === rep.reporte_id ? (
                            <ActivityIndicator size="small" color="#E74C3C" />
                        ) : (
                            <>
                                <FontAwesome5 name="file-pdf" size={20} color="#E74C3C" />
                                <Text style={styles.pdfText}>PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 15, paddingBottom: 80 },
  
  prediccionCard: { backgroundColor: '#007BFF', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 25, elevation: 5 },
  prediccionTitle: { fontFamily: 'Poppins', color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  prediccionMes: { fontFamily: 'Poppins-SemiBold', color: '#FFF', fontSize: 20, marginTop: 5 },
  prediccionNumero: { fontFamily: 'Poppins-SemiBold', color: '#FFF', fontSize: 50, lineHeight: 60 },
  prediccionLabel: { fontFamily: 'Inter', color: 'rgba(255,255,255,0.9)', fontSize: 14 },

  section: { marginBottom: 20 },
  sectionHeader: { fontFamily: 'Poppins-SemiBold', fontSize: 20, color: '#2E4053', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },

  statsCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0', elevation: 1 },
  cardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#555', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5 },
  
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  statLabel: { fontFamily: 'Inter', color: '#333', fontSize: 14 },
  statValue: { fontFamily: 'Poppins-SemiBold', color: '#2E4053', fontSize: 14 },

  statRowSmall: { flexDirection: 'column', marginBottom: 8 },
  statLabelSmall: { fontFamily: 'Inter', color: '#777', fontSize: 12 },
  statValueSmall: { fontFamily: 'Poppins-SemiBold', color: '#2E4053', fontSize: 16 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#F9F9F9' },
  topText: { fontFamily: 'Inter', fontSize: 13, color: '#333', flex: 1 },
  topValue: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#2E4053' },

  createCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#BDC3C7', marginBottom: 30 },
  createTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#2E4053', marginBottom: 10 },
  label: { fontFamily: 'Inter', fontSize: 14, color: '#555', marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, marginBottom: 15, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  button: { backgroundColor: '#27AE60', borderRadius: 8, alignItems: 'center', paddingVertical: 12 },
  buttonText: { color: '#FFF', fontFamily: 'Poppins-SemiBold' },

  reportItem: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#6C9A8B', elevation: 2 },
  repDate: { fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 2 },
  repHora: { fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 2 },
  repMotivo: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#2E4053' },
  repUser: { fontFamily: 'Inter', fontSize: 13, color: '#34495E', marginTop: 2 },
  pdfBtn: { padding: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDEBD0', borderRadius: 8, minWidth: 50 },
  pdfText: { fontSize: 10, color: '#E74C3C', fontFamily: 'Poppins-SemiBold', marginTop: 2 },
});