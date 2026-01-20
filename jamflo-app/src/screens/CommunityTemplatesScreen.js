import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { getPublicRoutines, duplicateRoutine } from "../services/routineService";
import { auth } from "../config/firebaseConfig";

const FILTERS = ["All", "Blues", "Jazz", "Technique", "Fingerstyle"];

export default function CommunityTemplatesScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedById, setExpandedById] = useState({});
  const [commentById, setCommentById] = useState({});
  const [loading, setLoading] = useState(false);

  const [publicRoutines, setPublicRoutines] = useState([]);

  useEffect(() => {
    const fetchPublic = async () => {
      setLoading(true);
      const res = await getPublicRoutines(50);
      setLoading(false);

      if (!res?.success) {
        Alert.alert("Error", res?.message || "Failed to load community routines.");
        return;
      }
      setPublicRoutines(res.routines || []);
    };

    fetchPublic();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return publicRoutines
      .filter((r) => {
        // Optional routine-level category/tag
        const tag = (r.category || r.tag || "All").toLowerCase();
        if (selectedFilter !== "All" && tag !== selectedFilter.toLowerCase()) return false;

        if (!s) return true;
        const name = (r.name || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        const author = (r.authorName || "").toLowerCase();
        return name.includes(s) || desc.includes(s) || author.includes(s);
      })
      .slice(0, 50);
  }, [publicRoutines, selectedFilter, search]);

  const toggleExpanded = (routineId) => {
    setExpandedById((prev) => ({ ...prev, [routineId]: !prev[routineId] }));
  };

  const calcMinutes = (routine) => routine.totalDuration || 0;

  const flattenExercises = (routine) => {
    // community card in your mock shows exercises; your data is nested in focusBlocks
    const blocks = routine.focusBlocks || [];
    const all = [];
    blocks.forEach((b) => {
      (b.exercises || []).forEach((ex) => all.push(ex));
    });
    return all;
  };

  const handleSaveRoutine = async (routineId) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login required", "Please log in to save routines.");
      return;
    }

    const res = await duplicateRoutine(routineId, user.uid);
    if (res?.success) {
      Alert.alert("Saved", "A private copy was added to your routines.");
      // optionally navigate Home/MyRoutines
    } else {
      Alert.alert("Error", res?.message || "Could not save this routine.");
    }
  };

  const handleStartRoutine = (routine) => {
    // IMPORTANT: don’t run “live sessions” on the shared routine object.
    // Navigate to a practice screen and pass a cloned copy.
    navigation.navigate("Practice", { routine }); // adjust to your route
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Community Templates</Text>
        <Text style={styles.subtitle}>Discover shared routines/focus blocks, make it yours.</Text>

        <TextInput
          style={styles.search}
          placeholder="Search routines..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterPill, selectedFilter === filter && styles.filterActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && <Text style={{ color: "#666" }}>Loading...</Text>}

        {filtered.map((routine) => {
          const routineId = routine.routineId || routine.id;
          const expanded = !!expandedById[routineId];
          const exercises = flattenExercises(routine);

          return (
            <View key={routineId} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{routine.name}</Text>

                <View style={styles.tag}>
                  <Text style={styles.tagText}>{routine.category || routine.tag || "Community"}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc}>{routine.description || "No description provided."}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.meta}>👤 {routine.authorName || "Anonymous"}</Text>
                <Text style={styles.meta}>⏱ {calcMinutes(routine)} mins</Text>
                {/* rating/reviews later if you implement */}
              </View>

              <TouchableOpacity style={styles.toggle} onPress={() => toggleExpanded(routineId)}>
                <Text style={styles.toggleText}>{expanded ? "Hide Details" : "Show Details"}</Text>
              </TouchableOpacity>

              {expanded && (
                <>
                  <Text style={styles.section}>Exercises</Text>
                  {exercises.length === 0 ? (
                    <Text style={{ color: "#777" }}>No exercises found.</Text>
                  ) : (
                    exercises.map((ex, index) => (
                      <View key={ex.exerciseId || index} style={styles.exercise}>
                        <Text style={styles.exerciseText}>
                          {index + 1}. {ex.name || "Untitled exercise"}
                        </Text>
                        <Text style={styles.exerciseMeta}>
                          {(ex.duration || "0")}min · 🎵 {(ex.tempo || "—")} BPM
                        </Text>
                      </View>
                    ))
                  )}

                  <Text style={styles.section}>Comments</Text>
                  <Text style={{ color: "#777" }}>
                    Comments coming soon
                  </Text>

                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add Comment..."
                    value={commentById[routineId] || ""}
                    onChangeText={(t) => setCommentById((p) => ({ ...p, [routineId]: t }))}
                  />

                  <TouchableOpacity
                    style={styles.postBtn}
                    onPress={() => Alert.alert("Coming soon", "Comment posting not wired yet.")}
                  >
                    <Text style={styles.postText}>Post Comment</Text>
                  </TouchableOpacity>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => handleStartRoutine(routine)}>
                      <Text style={styles.primaryText}>Start Routine</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleSaveRoutine(routineId)}>
                      <Text style={styles.secondaryText}>⭐ Save Routine</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          );
        })}
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

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },

  search: { backgroundColor: "#eee", borderRadius: 12, padding: 12, marginBottom: 12 },

  filterRow: { marginBottom: 16 },
  filterPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "#eee", marginRight: 8 },
  filterActive: { backgroundColor: "#218ED5" },
  filterText: { color: "#555", fontSize: 13 },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E5E5", marginBottom: 16 },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  tag: { backgroundColor: "#eee", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12 },

  cardDesc: { color: "#666", marginVertical: 6 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  meta: { marginRight: 12, fontSize: 12, color: "#555" },

  toggle: { alignSelf: "center", backgroundColor: "#eee", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 12 },
  toggleText: { fontSize: 12, fontWeight: "600" },

  section: { fontWeight: "700", marginTop: 12, marginBottom: 6 },

  exercise: { backgroundColor: "#E6F4FA", borderRadius: 10, padding: 10, marginBottom: 6 },
  exerciseText: { fontWeight: "600" },
  exerciseMeta: { fontSize: 12, color: "#555" },

  commentInput: { backgroundColor: "#eee", borderRadius: 10, padding: 10, marginTop: 6 },

  postBtn: { alignSelf: "flex-start", backgroundColor: "#13B4B0", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginTop: 6 },
  postText: { color: "#fff", fontSize: 12 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  primaryBtn: { backgroundColor: "#218ED5", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 20 },
  primaryText: { color: "#fff", fontWeight: "600" },

  secondaryBtn: { borderWidth: 1, borderColor: "#218ED5", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 20 },
  secondaryText: { color: "#218ED5", fontWeight: "600" },
});
