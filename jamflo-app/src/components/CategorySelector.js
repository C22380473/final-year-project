import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";

const CATEGORIES = [
  "Warm Up","Scales","Chords","Technique","Rhythm","Theory","Improvisation","Repertoire","Cool Down",
];

export const CategorySelector = ({ value, onChange }) => (
  <View style={{ marginBottom: 12 }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, value === cat && styles.selected]}
          onPress={() => onChange(cat)}
        >
          <Text style={[styles.text, value === cat && styles.textSelected]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginRight: 8,
  },
  selected: {
    backgroundColor: "#218ED5",
    borderColor: "#218ED5",
  },
  text: { fontSize: 13, fontWeight: "500", color: "#666" },
  textSelected: { color: "#fff" },
});
