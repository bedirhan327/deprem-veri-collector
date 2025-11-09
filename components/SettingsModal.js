import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function SettingsModal({
  visible,
  notifyThreshold,
  onThresholdChange,
  distanceThreshold,
  onDistanceThresholdChange,
  minMagnitude,
  onMinMagnitudeChange,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Ayarlar</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Mesafe Eşiği */}
            <Text style={styles.settingsLabel}>📍 Konumundan kaç km yakınsa bildirim:</Text>
            <View style={styles.settingsOptions}>
              {[50, 100, 200, 400, 600, 1000].map((km) => (
                <TouchableOpacity
                  key={km}
                  onPress={() => onDistanceThresholdChange(km)}
                  style={[
                    styles.settingsOption,
                    distanceThreshold === km && styles.settingsOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.settingsOptionText,
                      distanceThreshold === km && styles.settingsOptionTextSelected,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalDivider} />

            {/* ML Eşiği (Konum bazlı) */}
            <Text style={styles.settingsLabel}>🔔 Konum bazlı bildirim için ML eşiği:</Text>
            <View style={styles.settingsOptions}>
              {[1, 2, 3, 4, 5].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  onPress={() => onThresholdChange(ml)}
                  style={[
                    styles.settingsOption,
                    notifyThreshold === ml && styles.settingsOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.settingsOptionText,
                      notifyThreshold === ml && styles.settingsOptionTextSelected,
                    ]}
                  >
                    ML ≥ {ml}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalDivider} />

            {/* Minimum Büyüklük (Her zaman bildirim) */}
            <Text style={styles.settingsLabel}>🚨 Her zaman bildirim için minimum ML:</Text>
            <Text style={styles.settingsDescription}>
              Bu değerden büyük depremler için konum fark etmeksizin bildirim gönderilir
            </Text>
            <View style={styles.settingsOptions}>
              {[4, 5, 6, 7].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  onPress={() => onMinMagnitudeChange(ml)}
                  style={[
                    styles.settingsOption,
                    minMagnitude === ml && styles.settingsOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.settingsOptionText,
                      minMagnitude === ml && styles.settingsOptionTextSelected,
                    ]}
                  >
                    ML ≥ {ml}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.settingsCloseButton}>
              <Text style={styles.settingsCloseButtonText}>Kapat</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 0,
    borderRadius: 20,
    minWidth: 300,
    maxWidth: "90%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  settingsDescription: {
    fontSize: 11,
    color: "#666",
    paddingHorizontal: 20,
    marginBottom: 8,
    fontStyle: "italic",
    lineHeight: 16,
  },
  settingsOptions: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  settingsOption: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  settingsOptionSelected: {
    backgroundColor: "#1976D2",
    borderColor: "#1565C0",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsOptionText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 13,
  },
  settingsOptionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  settingsCloseButton: {
    padding: 12,
    margin: 20,
    marginTop: 10,
    backgroundColor: "#1976D2",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  settingsCloseButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

