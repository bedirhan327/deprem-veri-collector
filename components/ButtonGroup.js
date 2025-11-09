import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ButtonGroup({
  limit,
  onLimitChange,
  onTestLocal,
  onTestPush,
  onRefresh,
}) {
  return (
    <ScrollView
      horizontal
      style={styles.buttonContainer}
      contentContainerStyle={styles.buttonContent}
      showsHorizontalScrollIndicator={false}
    >
      {[100, 500, 1000].map((num) => {
        const selected = limit === num;
        return (
          <TouchableOpacity
            key={num}
            onPress={() => onLimitChange(num)}
            style={[styles.customButton, selected && styles.customButtonSelected]}
          >
            <Text
              style={[
                styles.customButtonText,
                selected && styles.customButtonTextSelected,
              ]}
            >
              Son {num}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={onTestLocal}
        style={[styles.customButton, styles.customButtonTest]}
      >
        <Text style={[styles.customButtonText, { color: "#FF4500" }]}>
          Yerel Test
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onTestPush}
        style={[styles.customButton, styles.customButtonPush]}
      >
        <Text style={[styles.customButtonText, { color: "#1976D2" }]}>
          Push Test
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRefresh}
        style={[styles.customButton, styles.customButtonRefresh]}
      >
        <Text style={[styles.customButtonText, { color: "#4CAF50" }]}>
          🔄 Yenile
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  buttonContent: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 6,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  customButtonSelected: {
    backgroundColor: "#1976D2",
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderColor: "#1565C0",
  },
  customButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 13,
  },
  customButtonTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  customButtonTest: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FF9800",
  },
  customButtonPush: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  customButtonRefresh: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
});

