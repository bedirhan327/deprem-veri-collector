import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function PushTestResult({ result, onClose }) {
  if (!result) return null;

  return (
    <View
      style={[
        styles.pushTestResult,
        result.success ? styles.pushTestResultSuccess : styles.pushTestResultError,
      ]}
    >
      <Text style={styles.pushTestResultText}>
        {result.loading ? "⏳ " : result.success ? "✅ " : "❌ "}
        {result.message}
      </Text>
      {result.details && (
        <Text style={styles.pushTestResultDetails}>
          Token: {result.details.totalTokens || 0} | Geçerli:{" "}
          {result.details.validTokens || 0} | Gönderilen:{" "}
          {result.details.sent || 0}
        </Text>
      )}
      <TouchableOpacity onPress={onClose} style={styles.pushTestResultClose}>
        <Text style={styles.pushTestResultCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pushTestResult: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pushTestResultSuccess: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  pushTestResultError: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  pushTestResultText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  pushTestResultDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  pushTestResultClose: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pushTestResultCloseText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
});

