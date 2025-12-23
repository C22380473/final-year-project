import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";

/* -------------------- DUMMY DATA -------------------- */

const TEMPLATE = {
  title: "Beginner Blues Foundation",
  description: "Perfect for learning blues fundamentals",
  author: "BluesMaster123",
  duration: "30 Mins",
  rating: 4.7,
  reviews: 5,
  tag: "Blues",
  exercises: [
    { id: 1, name: "Minor Pentatonic Scale", duration: "10min", bpm: 80 },
    { id: 2, name: "Blues Shuffle Rhythm", duration: "10min", bpm: 90 },
    { id: 3, name: "String Bending", duration: "10min", bpm: 60 },
  ],
  comments: [
    {
      id: 1,
      user: "JazzPlayer",
      date: "10/10/2025",
      text: "Great routine! Really helped my blues playing.",
    },
    {
      id: 2,
      user: "RockStr123",
      date: "19/10/2025",
      text: "Perfect for beginners!",
    },
  ],
};

const FILTERS = ["All", "Blues", "Jazz", "Technique", "Fingerstyle"];

export default function CommunityTemplatesScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [expanded, setExpanded] = useState(true);
  const [comment, setComment] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text style={styles.title}>Community Templates</Text>
        <Text style={styles.subtitle}>
          Discover shared routines/focus blocks, make it yours.
        </Text>

        {/* SEARCH */}
        <TextInput
          style={styles.search}
          placeholder="Search routines..."
        />

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                selectedFilter === filter && styles.filterActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TEMPLATE CARD */}
        <View style={styles.card}>
          {/* CARD HEADER */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{TEMPLATE.title}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{TEMPLATE.tag}</Text>
            </View>
          </View>

          <Text style={styles.cardDesc}>{TEMPLATE.description}</Text>

          {/* META */}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>👤 {TEMPLATE.author}</Text>
            <Text style={styles.meta}>⏱ {TEMPLATE.duration}</Text>
            <Text style={styles.meta}>⭐ {TEMPLATE.rating} ({TEMPLATE.reviews})</Text>
          </View>

          {/* TOGGLE */}
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.toggleText}>
              {expanded ? "Hide Details" : "Show Details"}
            </Text>
          </TouchableOpacity>

          {expanded && (
            <>
              {/* EXERCISES */}
              <Text style={styles.section}>Exercises</Text>
              {TEMPLATE.exercises.map((ex, index) => (
                <View key={ex.id} style={styles.exercise}>
                  <Text style={styles.exerciseText}>
                    {index + 1}. {ex.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.duration} · 🎵 {ex.bpm} BPM
                  </Text>
                </View>
              ))}

              {/* COMMENTS */}
              <Text style={styles.section}>Comments</Text>
              {TEMPLATE.comments.map((c) => (
                <View key={c.id} style={styles.comment}>
                  <Text style={styles.commentUser}>
                    {c.user} <Text style={styles.commentDate}>{c.date}</Text>
                  </Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))}

              <TextInput
                style={styles.commentInput}
                placeholder="Add Comment..."
                value={comment}
                onChangeText={setComment}
              />

              <TouchableOpacity style={styles.postBtn}>
                <Text style={styles.postText}>Post Comment</Text>
              </TouchableOpacity>

              {/* ACTION BUTTONS */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryText}>Start Routine</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>⭐ Save Routine</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav
      activeTab="Community"
      onTabPress={(t) => {
        if (t === "Home") navigation.navigate("Home");
        if (t === "Create") navigation.navigate("CreateRoutine");
        if (t === "Community") navigation.navigate("Community");
      }}
      />
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },

  search: {
    backgroundColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  filterRow: { marginBottom: 16 },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  filterActive: { backgroundColor: "#218ED5" },
  filterText: { color: "#555", fontSize: 13 },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  tag: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12 },

  cardDesc: { color: "#666", marginVertical: 6 },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  meta: { marginRight: 12, fontSize: 12, color: "#555" },

  toggle: {
    alignSelf: "center",
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toggleText: { fontSize: 12, fontWeight: "600" },

  section: { fontWeight: "700", marginTop: 12, marginBottom: 6 },

  exercise: {
    backgroundColor: "#E6F4FA",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  exerciseText: { fontWeight: "600" },
  exerciseMeta: { fontSize: 12, color: "#555" },

  comment: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  commentUser: { fontWeight: "700", fontSize: 12 },
  commentDate: { color: "#777", fontWeight: "400" },
  commentText: { fontSize: 13 },

  commentInput: {
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },

  postBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#13B4B0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  postText: { color: "#fff", fontSize: 12 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  primaryBtn: {
    backgroundColor: "#218ED5",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  primaryText: { color: "#fff", fontWeight: "600" },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#218ED5",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  secondaryText: { color: "#218ED5", fontWeight: "600" },
});
