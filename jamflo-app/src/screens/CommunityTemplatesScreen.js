import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import {
  getPublicRoutines,
  duplicateRoutine,
  rateRoutine,
  reactToComment,
} from "../services/routineService";
import { auth, db } from "../config/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { CommunityRoutineCard } from "../components/CommunityRoutineCard";
import { useRoutineComments } from "../hooks/useRoutineComments";
import { normalizeTag } from "../utils/tagUtils";

function RoutineCardRow({ routine, navigation, onSaveRoutine, onViewDetails,  onRefreshRoutines}) {
  const routineId = routine.routineId || routine.id;

  const { comments, newComment, setNewComment, postComment, deleteComment, editComment } =
    useRoutineComments(routineId);

  const currentUserId = auth.currentUser?.uid || null;
  const isRoutineOwner = routine.userId === currentUserId;

  const [userRating, setUserRating] = React.useState(0);

  // ✅ Keep userRating in sync with Firestore (/routines/{routineId}/ratings/{uid})
  useEffect(() => {
    if (!currentUserId) {
      setUserRating(0);
      return;
    }

    const ratingRef = doc(db, "routines", routineId, "ratings", currentUserId);

    const unsub = onSnapshot(
      ratingRef,
      (snap) => {
        if (!snap.exists()) {
          setUserRating(0);
          return;
        }
        const val = Number(snap.data()?.value || 0);
        setUserRating(val);
      },
      (err) => {
        console.log("RATING SNAPSHOT ERROR:", err?.code, err?.message);
      }
    );

    return () => unsub();
  }, [routineId, currentUserId]);

  const handleRate = useCallback(
    async (value) => {
      try {
        // ✅ optimistic UI
        setUserRating(value);

        await rateRoutine({ routineId, value });

        // ✅ refresh so avgRating/ratingCount update
        await onRefreshRoutines?.();
      } catch (e) {
        console.log("RATE ERROR:", e?.code, e?.message);
        Alert.alert("Error", "Could not save rating.");
      }
    },
    [routineId, onRefreshRoutines]
  );

  const handleLikeComment = useCallback(
    async (commentId) => {
      try {
        await reactToComment({ routineId, commentId, value: 1 });
      } catch (e) {
        console.log(e);
        Alert.alert("Error", "Could not react to comment.");
      }
    },
    [routineId]
  );

  const handleDislikeComment = useCallback(
    async (commentId) => {
      try {
        await reactToComment({ routineId, commentId, value: -1 });
      } catch (e) {
        console.log(e);
        Alert.alert("Error", "Could not react to comment.");
      }
    },
    [routineId]
  );

  return (
    <CommunityRoutineCard
      routine={routine}
      onView={() => onViewDetails(routine)}
      onSave={() => onSaveRoutine(routineId)}
      onPressAuthor={(userId) => navigation.navigate("Profile", { userId })}

      comments={comments}
      newComment={newComment}
      onChangeComment={setNewComment}
      onPostComment={postComment}

      onLikeComment={handleLikeComment}
      onDislikeComment={handleDislikeComment}

      avgRating={Number(routine.avgRating || 0)}
      ratingCount={Number(routine.ratingCount || 0)}

      // ✅ FIX: pass actual user rating
      userRating={userRating}
      onRate={handleRate}

      currentUserId={currentUserId}
      isRoutineOwner={isRoutineOwner}
      onDeleteComment={deleteComment}
      onEditComment={editComment}
    />
  );
}

export default function CommunityTemplatesScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicRoutines, setPublicRoutines] = useState([]);

  const fetchPublic = useCallback(async () => {
    setLoading(true);
    const res = await getPublicRoutines(50);
    setLoading(false);

    if (!res?.success) {
      Alert.alert("Error", res?.message || "Failed to load community routines.");
      return;
    }

    setPublicRoutines(res.routines || []);
  }, []);

  useEffect(() => {
    fetchPublic();
  }, [fetchPublic]);

  const availableTags = useMemo(() => {
    const tagCounts = {};

    for (const routine of publicRoutines || []) {
      for (const tag of routine.tags || []) {
        const clean = normalizeTag(tag);
        if (!clean) continue;

        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      }
    }

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // most used first
      .map(([tag]) => tag);

    return ["All", ...sortedTags.slice(0, 12)];
  }, [publicRoutines]);


  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const selected = normalizeTag(selectedFilter);

    return (publicRoutines || []).filter((r) => {
      const routineTags = Array.isArray(r.tags)
        ? r.tags.map(normalizeTag).filter(Boolean)
        : [];

      if (selected !== "all" && !routineTags.includes(selected)) {
        return false;
      }

      if (!s) return true;

      const searchable = [
        r.name || "",
        r.description || "",
        r.authorName || "",
        ...(r.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(s);
    });
  }, [publicRoutines, selectedFilter, search]);

  const handleSaveRoutine = useCallback(
    async (routineId) => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Login required", "Please log in to save routines.");
        return;
      }

      const res = await duplicateRoutine(routineId, user);
      if (res?.success) {
        Alert.alert("Saved", "A private copy was added to your routines.");
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", res?.message || "Could not save this routine.");
      }
    },
    [navigation]
  );

  const handleViewDetails = useCallback((routine) => {
    let msg = `${routine.description || "No description"}\n\n`;
    msg += `Total: ${routine.totalDuration || 0} mins\n`;
    msg += `Focus Blocks: ${routine.focusBlocks?.length || 0}\n\n`;

    routine.focusBlocks?.forEach((b, i) => {
      msg += `━━━━━━━\n${i + 1}. ${b.name}\n`;
      msg += `   ⏱ ${b.totalDuration || 0} mins\n`;

      (b.exercises || []).forEach((ex, ix) => {
        msg += `   - ${ix + 1}. ${ex.name}\n`;
      });
      msg += "\n";
    });

    Alert.alert(routine.name, msg);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Community Templates</Text>
        <Text style={styles.subtitle}>
          Discover shared routines/focus blocks, make it yours.
        </Text>

        <TextInput
          style={styles.search}
          placeholder="Search routines..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {availableTags.map((filter) => (
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

        {loading && <Text style={{ color: "#666" }}>Loading...</Text>}

        {filtered.map((routine) => (
          <View key={routine.routineId || routine.id} style={{ marginBottom: 4 }}>
            <RoutineCardRow
              routine={routine}
              navigation={navigation}
              onSaveRoutine={handleSaveRoutine}
              onViewDetails={handleViewDetails}
              onRefreshRoutines={fetchPublic}
            />
          </View>
        ))}

        {!loading && filtered.length === 0 && (
          <Text style={{ color: "#666", marginTop: 20 }}>
            No routines match your search.
          </Text>
        )}
      </ScrollView>

      <BottomNav
        activeTab="Community"
        onTabPress={(t) => {
          if (t === "Home") navigation.navigate("Home");
          if (t === "Create") navigation.navigate("CreateRoutine");
          if (t === "Community") navigation.navigate("Community");
          if (t === "Profile") navigation.navigate("Profile");
        }}
      />
    </View>
  );
}

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
});