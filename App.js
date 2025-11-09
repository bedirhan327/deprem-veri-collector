import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import useSupercluster from "use-supercluster";

// ✅ Constants
import { width, height, INITIAL_REGION, HIGH_MAGNITUDE_THRESHOLD, BUBBLE_THRESHOLD, DATA_URL } from "./constants/config";

// ✅ Utils
import { getUserLocation } from "./utils/location";
import {
  registerForPushNotificationsAsync,
  sendLocalNotification,
} from "./utils/notifications";
import { parseML, getDistanceKm, getMarkerSize, colorScale } from "./utils/helpers";

// ✅ Components
import InfoBox from "./components/InfoBox";
import DepremModal from "./components/DepremModal";
import SettingsModal from "./components/SettingsModal";
import ButtonGroup from "./components/ButtonGroup";
import PushTestResult from "./components/PushTestResult";

export default function App() {
  const [depremData, setDepremData] = useState([]);
  const [limit, setLimit] = useState(100);
  const [selectedDeprem, setSelectedDeprem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [notifyThreshold, setNotifyThreshold] = useState(1);
  const [distanceThreshold, setDistanceThreshold] = useState(400); // km
  const [minMagnitude, setMinMagnitude] = useState(6); // ML >= bu değer ise her zaman bildirim
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const seenRef = useRef(new Set());
  const [debugInfo, setDebugInfo] = useState({ lastFetch: null, newCount: 0 });
  const mapRef = useRef(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [zoom, setZoom] = useState(8);
  const [pushTestResult, setPushTestResult] = useState(null);
  const [bounds, setBounds] = useState([
    INITIAL_REGION.longitude - INITIAL_REGION.longitudeDelta / 2,
    INITIAL_REGION.latitude - INITIAL_REGION.latitudeDelta / 2,
    INITIAL_REGION.longitude + INITIAL_REGION.longitudeDelta / 2,
    INITIAL_REGION.latitude + INITIAL_REGION.latitudeDelta / 2,
  ]);

  // 🔹 Expo Push Token al ve Vercel API'ye gönder
  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try {
          // Platform bilgisini belirle
          let platform = "unknown";
          if (token.startsWith("MOCK_")) {
            platform = "simulator";
          } else if (Platform.OS === "android") {
            platform = "android";
          } else if (Platform.OS === "ios") {
            platform = "ios";
          }

          const response = await fetch("https://deprem-haritas.vercel.app/api/register-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              token,
              platform,
              deviceInfo: {
                os: Platform.OS,
                version: Platform.Version,
              }
            }),
          });
          
          const result = await response.json();
          if (response.ok) {
            console.log("✅ Token Vercel'e başarıyla gönderildi:", token);
            console.log("📊 Toplam kayıtlı token sayısı:", result.count);
          } else {
            console.error("❌ Token gönderme hatası:", result.message || "Bilinmeyen hata");
          }
        } catch (err) {
          console.error("❌ Token gönderme hatası (network):", err.message);
        }
      } else {
        console.warn("⚠️ Token alınamadı - bildirimler çalışmayabilir");
      }
    })();
  }, []);

  // 📍 Konumu al
  useEffect(() => {
    (async () => {
      const loc = await getUserLocation();
      if (loc) setUserLocation(loc);
    })();
  }, []);

  // 🔁 Veriyi çek ve yeni deprem varsa bildirim gönder
  const fetchData = async () => {
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
      const data = await res.json();
      setDepremData(data);

      const eventKey = (d) =>
        `${d.Tarih}|${d.Saat}|${d.Enlem}|${d.Boylam}|${d.ML}`;

      if (!firstLoadDone) {
        data.forEach((d) => seenRef.current.add(eventKey(d)));
        setFirstLoadDone(true);
        setDebugInfo({ lastFetch: new Date(), newCount: 0 });
        return;
      }

      const newEvents = [];
      for (const d of data) {
        const key = eventKey(d);
        if (!seenRef.current.has(key)) {
          seenRef.current.add(key);
          newEvents.push(d);
        }
      }

      if (newEvents.length > 0) {
        for (const deprem of newEvents) {
          const ml = parseML(deprem.ML);
          const lat = parseML(deprem.Enlem);
          const lon = parseML(deprem.Boylam);

          let shouldNotify = false;

          // Yüksek büyüklük kontrolü (ayarlanabilir eşik)
          if (ml >= minMagnitude) {
            shouldNotify = true;
          } else if (userLocation) {
            // Konum bazlı kontrol (ayarlanabilir mesafe ve ML eşiği)
            const distance = getDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lon
            );
            if (distance <= distanceThreshold && ml >= notifyThreshold) {
              shouldNotify = true;
            }
          }

          if (shouldNotify) {
            await sendLocalNotification(
              `Yeni Deprem: ${deprem.Yer ?? "—"}`,
              `ML: ${deprem.ML}, Derinlik: ${deprem.Derinlik} km`
            );
          }
        }
      }

      setDebugInfo({ lastFetch: new Date(), newCount: newEvents.length });
    } catch (err) {
      console.error("❌ fetchData error:", err);
    }
  };

  // 🔁 Her 5 sn'de bir veri çek (daha hızlı bildirim için)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 15 saniye → 5 saniye
    return () => clearInterval(interval);
  }, [userLocation, notifyThreshold, distanceThreshold, minMagnitude]);

  // 🔹 Yerel test bildirimi
  const sendTestNotification = async () => {
    await sendLocalNotification("Test Bildirimi", "Bu bir testtir 🚨");
  };

  // 🔹 Push notification API testi
  const testPushNotification = async () => {
    setPushTestResult({ loading: true, message: "Bildirim gönderiliyor..." });
    
    try {
      const response = await fetch("https://deprem-haritas.vercel.app/api/send-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🧪 Test Bildirimi",
          body: `Test zamanı: ${new Date().toLocaleTimeString("tr-TR")}`,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setPushTestResult({
          success: true,
          message: `✅ Başarılı! ${result.sent || 0} bildirim gönderildi`,
          details: result,
        });
        console.log("✅ Push notification test başarılı:", result);
      } else {
        setPushTestResult({
          success: false,
          message: `❌ Hata: ${result.message || "Bilinmeyen hata"}`,
          details: result,
        });
        console.error("❌ Push notification test hatası:", result);
      }
    } catch (error) {
      setPushTestResult({
        success: false,
        message: `❌ Network hatası: ${error.message}`,
        details: null,
      });
      console.error("❌ Push notification test network hatası:", error);
    }
  };

  const handleRegionChange = (region) => {
    if (!region) return;
    const newZoom = Math.round(Math.log2(360 / region.longitudeDelta));
    setZoom(newZoom);
    setBounds([
      region.longitude - region.longitudeDelta / 2,
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      region.latitude + region.latitudeDelta / 2,
    ]);
  };

  // --- Supercluster ---
  const highMagData = depremData
    .slice(0, limit)
    .filter((d) => parseML(d.ML) >= HIGH_MAGNITUDE_THRESHOLD);

  const lowMagData = depremData
    .slice(0, limit)
    .filter((d) => parseML(d.ML) < HIGH_MAGNITUDE_THRESHOLD);

  const lowMagPoints = lowMagData
    .map((deprem, index) => {
      const ml = parseML(deprem.ML);
      const lat = parseML(deprem.Enlem);
      const lon = parseML(deprem.Boylam);
      if (isNaN(lat) || isNaN(lon)) return null;
      return {
        type: "Feature",
        properties: { cluster: false, depremId: index, data: deprem, ml },
        geometry: { type: "Point", coordinates: [lon, lat] },
      };
    })
    .filter(Boolean);

  const { clusters, supercluster } = useSupercluster({
    points: lowMagPoints,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Harita */}
      <MapView
        ref={mapRef}
        style={{ width, height }}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChange}
      >
        {highMagData.map((deprem, i) => {
          const ml = parseML(deprem.ML);
          const lat = parseML(deprem.Enlem);
          const lon = parseML(deprem.Boylam);
          if (isNaN(lat) || isNaN(lon)) return null;
          const size = getMarkerSize(ml, zoom);
          return (
            <Marker
              key={`high-${i}`}
              coordinate={{ latitude: lat, longitude: lon }}
              onPress={() => setSelectedDeprem(deprem)}
            >
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colorScale(ml),
                  borderWidth: 1,
                  borderColor: "#333",
                }}
              />
            </Marker>
          );
        })}

        {clusters.map((cluster) => {
          const [lon, lat] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count } = cluster.properties;

          if (isCluster) {
            const clusterSize = 30 + (point_count / lowMagPoints.length) * 30;
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    20
                  );
                  mapRef.current?.animateToRegion(
                    {
                      latitude: lat,
                      longitude: lon,
                      latitudeDelta: INITIAL_REGION.latitudeDelta / (2 * expansionZoom),
                      longitudeDelta: INITIAL_REGION.longitudeDelta / (2 * expansionZoom),
                    },
                    300
                  );
                }}
              >
                <View
                  style={{
                    width: clusterSize,
                    height: clusterSize,
                    borderRadius: clusterSize / 2,
                    backgroundColor: "#1976D2",
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "#fff",
                    borderWidth: 1,
                    opacity: 0.8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {point_count}
                  </Text>
                </View>
              </Marker>
            );
          }

          const ml = cluster.properties.ml;
          const deprem = cluster.properties.data;

          if (ml >= BUBBLE_THRESHOLD) {
            const size = getMarkerSize(ml, zoom);
            return (
              <Marker
                key={`bubble-${cluster.properties.depremId}`}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() => setSelectedDeprem(deprem)}
              >
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colorScale(ml),
                    borderWidth: 1,
                    borderColor: "#333",
                  }}
                />
              </Marker>
            );
          } else {
            return (
              <Marker
                key={`pin-${cluster.properties.depremId}`}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() => setSelectedDeprem(deprem)}
                pinColor={colorScale(ml)}
              />
            );
          }
        })}
      </MapView>

      {/* Sağ üst ayarlar butonu */}
      <View style={{ position: "absolute", top: 50, right: 15, zIndex: 10 }}>
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Bilgi kutusu */}
      <InfoBox debugInfo={debugInfo} />

      {/* Limit ve test butonları */}
      <ButtonGroup
        limit={limit}
        onLimitChange={setLimit}
        onTestLocal={sendTestNotification}
        onTestPush={testPushNotification}
        onRefresh={fetchData}
      />

      {/* Push test sonuç kutusu */}
      <PushTestResult
        result={pushTestResult}
        onClose={() => setPushTestResult(null)}
      />

      {/* Deprem detay modal */}
      <DepremModal
        selectedDeprem={selectedDeprem}
        onClose={() => setSelectedDeprem(null)}
      />

      {/* Ayarlar modal */}
      <SettingsModal
        visible={settingsVisible}
        notifyThreshold={notifyThreshold}
        onThresholdChange={setNotifyThreshold}
        distanceThreshold={distanceThreshold}
        onDistanceThresholdChange={setDistanceThreshold}
        minMagnitude={minMagnitude}
        onMinMagnitudeChange={setMinMagnitude}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  settingsButtonText: {
    fontSize: 20,
  },
});
