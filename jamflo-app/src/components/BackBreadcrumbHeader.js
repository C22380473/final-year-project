import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const BackBreadcrumbHeader = ({ navigation, breadcrumb }) => (
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>

    <Text style={styles.breadcrumb}>{breadcrumb}</Text>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    borderWidth: 2,
    borderColor: "#13B4B0",
    borderRadius: 24,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  breadcrumb: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
  },
});
