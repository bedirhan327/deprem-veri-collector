import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InfoBox({ debugInfo }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>🕐 Son kontrol:</Text>
        <Text style={styles.infoValue}>
          {debugInfo.lastFetch
            ? new Date(debugInfo.lastFetch).toLocaleTimeString("tr-TR")
            : "-"}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>🆕 Yeni:</Text>
        <Text style={[styles.infoValue, styles.infoValueHighlight]}>
          {debugInfo.newCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    position: "absolute",
    top: 150,
    left: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    minWidth: 180,
    zIndex: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 3,
  },
  infoLabel: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
    marginRight: 8,
  },
  infoValue: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  infoValueHighlight: {
    color: "#1976D2",
    fontWeight: "700",
  },
});

