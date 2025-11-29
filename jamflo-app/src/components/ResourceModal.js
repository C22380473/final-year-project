import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const ResourceModal = ({
  visible,
  resourceType,
  setResourceType,
  resourceUrl,
  setResourceUrl,
  onSave,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <LinearGradient colors={["#218ED5", "#13B4B0"]} style={styles.card}>
          {/* Title */}
          <Text style={styles.title}>Add a Resource</Text>

          {/* Type Options */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.option,
                resourceType === "file" && styles.optionSelected,
              ]}
              onPress={() => setResourceType("file")}
            >
              <Ionicons name="document" size={32} color="#fff" />
              <Text style={styles.optionText}>Attach a File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                resourceType === "video" && styles.optionSelected,
              ]}
              onPress={() => setResourceType("video")}
            >
              <Ionicons name="videocam" size={32} color="#fff" />
              <Text style={styles.optionText}>Link a Video</Text>
            </TouchableOpacity>
          </View>

          {/* URL Input */}
          <Text style={[styles.label, { color: "#fff", marginTop: 16 }]}>
            Resource URL
          </Text>
          <TextInput
            style={[styles.input]}
            placeholder="Paste a URL"
            value={resourceUrl}
            onChangeText={setResourceUrl}
            autoCapitalize="none"
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.outlineButton]}
              onPress={onClose}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  option: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "#fff",
  },
  optionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
    marginRight: 8,
  },
  outlineButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
    marginLeft: 8,
  },
  saveText: {
    color: "#218ED5",
    fontWeight: "700",
  },
});
