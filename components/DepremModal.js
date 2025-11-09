import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DepremModal({ selectedDeprem, onClose }) {
  if (!selectedDeprem) return null;

  return (
    <Modal
      visible={!!selectedDeprem}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📍 Deprem Detayı</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.modalInfoRow}>
            <Text style={styles.modalLabel}>📍 Yer:</Text>
            <Text style={styles.modalValue}>{selectedDeprem.Yer ?? "—"}</Text>
          </View>
          <View style={styles.modalInfoRow}>
            <Text style={styles.modalLabel}>📊 ML:</Text>
            <Text style={[styles.modalValue, styles.modalValueBold]}>
              {selectedDeprem.ML ?? "—"}
            </Text>
          </View>
          <View style={styles.modalInfoRow}>
            <Text style={styles.modalLabel}>⬇️ Derinlik:</Text>
            <Text style={styles.modalValue}>
              {selectedDeprem.Derinlik ?? "—"} km
            </Text>
          </View>
          <View style={styles.modalInfoRow}>
            <Text style={styles.modalLabel}>📅 Tarih:</Text>
            <Text style={styles.modalValue}>{selectedDeprem.Tarih ?? "—"}</Text>
          </View>
          <View style={styles.modalInfoRow}>
            <Text style={styles.modalLabel}>🕐 Saat:</Text>
            <Text style={styles.modalValue}>{selectedDeprem.Saat ?? "—"}</Text>
          </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
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
    fontSize: 20,
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
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  modalValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  modalValueBold: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },
});

