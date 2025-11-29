import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ReorderButtons = ({ index, total, onUp, onDown }) => (
  <View style={styles.reorderButtons}>
    <TouchableOpacity
      onPress={onUp}
      disabled={index === 0}
      style={[styles.btn, index === 0 && styles.disabled]}
    >
      <Ionicons name="chevron-up" size={18} color={index === 0 ? "#CCC" : "#218ED5"} />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={onDown}
      disabled={index === total - 1}
      style={[styles.btn, index === total - 1 && styles.disabled]}
    >
      <Ionicons
        name="chevron-down"
        size={18}
        color={index === total - 1 ? "#CCC" : "#218ED5"}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  reorderButtons: { flexDirection: "column", marginRight: 8 },
  btn: { padding: 2 },
  disabled: { opacity: 0.3 },
});
