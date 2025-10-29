import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Button,
  StyleSheet,
  Dimensions,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as d3Scale from "d3-scale";
import * as Notifications from "expo-notifications";

// Bildirim izinlerini ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [depremData, setDepremData] = useState([]);
  const [limit, setLimit] = useState(100);
  const [selectedDeprem, setSelectedDeprem] = useState(null);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [lastDepremTimestamp, setLastDepremTimestamp] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const mapRef = useRef(null);
  const seenRef = useRef(new Set());
  const [debugInfo, setDebugInfo] = useState({ lastFetch: null, newCount: 0 });

  const DATA_URL =
    "https://raw.githubusercontent.com/bedirhan327/deprem-haritas-/main/public/data/deprem_data.json";

  const fetchData = async () => {
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const data = await res.json();
      setDepremData(data);

      // Yardımcılar ve tespit
      const toNumber = (v) => {
        const s = (v ?? "").toString().replace(",", ".");
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      };
      const eventKey = (d) =>
        `${d.Tarih}|${d.Saat}|${d.Enlem}|${d.Boylam}|${d.ML}`;

      if (firstLoad) {
        // İlk yüklemede mevcut kayıtları görmüş say
        data.forEach((d) => seenRef.current.add(eventKey(d)));
        if (data.length > 0) {
          const newestTime = data.reduce((max, d) => {
            const t = new Date(d.Tarih + " " + d.Saat);
            return t > max ? t : max;
          }, new Date(0));
          setLastDepremTimestamp(newestTime);
        }
        setFirstLoad(false);
        setDebugInfo({ lastFetch: new Date(), newCount: 0 });
      } else {
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
            if (toNumber(deprem.ML) >= 1) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `Yeni Deprem: ${deprem.Yer}`,
                  body: `ML: ${deprem.ML}, Derinlik: ${deprem.Derinlik} km`,
                },
                trigger: null,
              });
            }
          }

          const newestTime = newEvents.reduce((max, d) => {
            const t = new Date(d.Tarih + " " + d.Saat);
            return t > max ? t : max;
          }, lastDepremTimestamp || new Date(0));
          setLastDepremTimestamp(newestTime);
        }
        setDebugInfo({ lastFetch: new Date(), newCount: newEvents.length });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();

    // Bildirim izinlerini sor
    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
          sound: true,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      if (status !== "granted") {
        alert("Bildirim izinleri verilmedi!");
      }
    })();

    // Her 1 dakikada bir verileri çek
    const interval = setInterval(fetchData, 15 * 1000);
    return () => clearInterval(interval);
  }, []);

  const colorScale = d3Scale
    .scaleThreshold()
    .domain([2, 4, 6])
    .range(["#91cf60", "#fee08b", "#fc8d59", "#d73027"]);

  const { width, height } = Dimensions.get("window");

  const getMarkerSize = (ML, zoomFactor) => {
    const magnitude = Math.max(0, ML || 0);
    // Base size grows with magnitude but stays reasonable across full range
    const baseSize = 10 + 5 * magnitude; // e.g., ML 2 -> 20, ML 6 -> 40
    // Gently dampen size change across zoom levels (less sensitive than 1/sqrt)
    const zoomDampen = Math.pow(Math.max(0.5, Math.min(zoomFactor, 20)), -0.12);
    const size = baseSize * zoomDampen;
    // Clamp to keep visuals balanced on both far and near zooms
    return Math.max(12, Math.min(size, 42));
  };

  const handleRegionChange = (region) => {
    const zoom = 10 / region.longitudeDelta;
    setZoomFactor(zoom);
  };

  const filteredData = depremData
    .slice(0, limit)
    .sort((a, b) => (a.ML || 0) - (b.ML || 0));

  // Manuel test bildirim fonksiyonu
  const sendTestNotification = async () => {
    const fakeDeprem = {
      Yer: "Test Deprem",
      ML: 4.5,
      Derinlik: 10,
      Tarih: "2025-10-29",
      Saat: "12:00",
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Yeni Deprem: ${fakeDeprem.Yer}`,
        body: `ML: ${fakeDeprem.ML}, Derinlik: ${fakeDeprem.Derinlik} km`,
      },
      trigger: null,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 39.0,
          longitude: 35.0,
          latitudeDelta: 8,
          longitudeDelta: 8,
        }}
        onRegionChangeComplete={handleRegionChange}
      >
        {filteredData.map((deprem, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(deprem.Enlem),
              longitude: parseFloat(deprem.Boylam),
            }}
            zIndex={Math.max(1, Math.floor((deprem.ML || 0) * 100))}
            onPress={() => setSelectedDeprem(deprem)}
          >
            <View
              style={{
                width: getMarkerSize(deprem.ML, zoomFactor),
                height: getMarkerSize(deprem.ML, zoomFactor),
                borderRadius: getMarkerSize(deprem.ML, zoomFactor) / 2,
                backgroundColor: colorScale(deprem.ML || 0),
                borderWidth: 1,
                borderColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </Marker>
        ))}
      </MapView>

      {/* Debug overlay: last fetch time and new detection count */}
      <View
        style={{
          position: "absolute",
          top: 105,
          left: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }}>
          Son kontrol: {debugInfo.lastFetch ? new Date(debugInfo.lastFetch).toLocaleTimeString() : "-"}
        </Text>
        <Text style={{ color: "#fff", fontSize: 12 }}>
          Yeni: {debugInfo.newCount}
        </Text>
      </View>

      <ScrollView
        horizontal
        style={styles.buttonContainer}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsHorizontalScrollIndicator={false}
      >
        {[100, 500, 1000].map((num) => (
          <View key={num} style={styles.buttonWrapper}>
            <Button
              title={`Son ${num}`}
              onPress={() => setLimit(num)}
              color={limit === num ? "#333" : "#888"}
            />
          </View>
        ))}
        {/* Manuel test butonu */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Bildirim Test"
            onPress={sendTestNotification}
            color="#FF4500"
          />
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedDeprem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDeprem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setSelectedDeprem(null)}
        >
          <View style={styles.modalContent}>
            {selectedDeprem && (
              <>
                <Text style={styles.modalText}>
                  Yer: {selectedDeprem.Yer || selectedDeprem.yer}
                </Text>
                <Text style={styles.modalText}>
                  ML: {selectedDeprem.ML || selectedDeprem.ml}
                </Text>
                <Text style={styles.modalText}>
                  Derinlik: {selectedDeprem.Derinlik || selectedDeprem.derinlik} km
                </Text>
                <Text style={styles.modalText}>
                  Tarih: {selectedDeprem.Tarih || selectedDeprem.tarih}
                </Text>
                <Text style={styles.modalText}>
                  Saat: {selectedDeprem.Saat || selectedDeprem.saat}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
  },
  buttonWrapper: {
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    minWidth: 250,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
