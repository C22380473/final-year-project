import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { auth, db} from "../config/firebaseConfig";
import { CommunityRoutineCard } from "../components/CommunityRoutineCard";
import { getPublicRoutines } from "../services/routineService";
import { useRoutineComments } from "../hooks/useRoutineComments";
import { rateRoutine, reactToComment } from "../services/routineService";
import { doc, onSnapshot, getDoc } from "firebase/firestore";


function PublicRoutineRow({ routine, navigation, canRate, viewerId, onViewDetails }) {
  const routineId = routine.routineId || routine.id;

  const { comments, newComment, setNewComment, postComment, deleteComment, editComment } =
    useRoutineComments(routineId);

  const [userRating, setUserRating] = React.useState(0);

  // Only listen to rating doc if viewer can rate
  useEffect(() => {
    if (!canRate || !viewerId) {
      setUserRating(0);
      return;
    }

    const ratingRef = doc(db, "routines", routineId, "ratings", viewerId);
    return onSnapshot(ratingRef, (snap) => {
      setUserRating(snap.exists() ? Number(snap.data()?.value || 0) : 0);
    });
  }, [routineId, viewerId, canRate]);

  const handleRate = useCallback(
    async (value) => {
      try {
        setUserRating(value);
        await rateRoutine({ routineId, value });
      } catch (e) {
        Alert.alert("Error", "Could not save rating.");
      }
    },
    [routineId]
  );

  const handleLikeComment = useCallback(
    async (commentId) => {
      await reactToComment({ routineId, commentId, value: 1 });
    },
    [routineId]
  );

  const handleDislikeComment = useCallback(
    async (commentId) => {
      await reactToComment({ routineId, commentId, value: -1 });
    },
    [routineId]
  );

  return (
    <CommunityRoutineCard
      routine={routine}
      onView={() => onViewDetails?.(routine)}
      onSave={null}
      onPressAuthor={(userId) => navigation.navigate("Profile", { userId })}

      avgRating={Number(routine.avgRating || 0)}
      ratingCount={Number(routine.ratingCount || 0)}

      comments={comments}
      newComment={newComment}
      onChangeComment={setNewComment}
      onPostComment={postComment}
      onLikeComment={handleLikeComment}
      onDislikeComment={handleDislikeComment}
      currentUserId={viewerId}
      onDeleteComment={deleteComment}
      onEditComment={editComment}

      userRating={canRate ? userRating : 0}
      onRate={canRate ? handleRate : null}
    />
  );
}

export default function ProfileScreen({ navigation, route }) {
  const viewerId = auth.currentUser?.uid;
  const profileUserId = route?.params?.userId || viewerId; 
  const isOwner = profileUserId === viewerId;

  const [loading, setLoading] = useState(false);
  const [publicRoutines, setPublicRoutines] = useState([]);

  // Profile fields (wire to Firestore later)
  const [username, setUsername] = useState(auth.currentUser?.email?.split("@")?.[0] || "user");
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");


  
  // Duolingo-ish stats (wire to Firestore later)
  const [stats, setStats] = useState({
    streak: 3,
    achievements: 5,
    minsToday: 0,
    xp: 1200,
  });

  const badges = useMemo(
    () => [
      { id: "b1", icon: "musical-notes", label: "Daily Practice" },
      { id: "b2", icon: "star", label: "5-Star Routine" },
      { id: "b3", icon: "time", label: "On Time" },
    ],
    []
  );

  useEffect(() => {
  // reset UI while loading a different profile
  setUsername("");
  setDisplayName("");
  setPhotoURL("");

  const loadProfile = async () => {
    if (!profileUserId) return;

    const snap = await getDoc(doc(db, "users", profileUserId));
    if (snap.exists()) {
      const data = snap.data();
      setUsername(data.username || profileUserId);
      setDisplayName(data.displayName || "");
      setPhotoURL(data.photoURL || "");
    }
  };

  loadProfile();
}, [profileUserId]);

  useEffect(() => {
    const load = async () => {
      if (!profileUserId) return;
      setLoading(true);
      const res = await getPublicRoutines({ userId: profileUserId, max: 50 });
      setLoading(false);

      if (!res?.success) {
        Alert.alert("Error", "Could not load your public routines.");
        return;
      }
      setPublicRoutines(res.routines || []);
    };

    load();
  }, [profileUserId]);

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

  const handleEditPicture = useCallback(async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    const up = await uploadProfilePhoto({ uid });
    if (up.canceled) return;

    if (!up.success) {
      Alert.alert("Error", "Upload failed.");
      return;
    }

    setPhotoURL(up.url);

    await updateUserProfile({
      uid,
      photoURL: up.url,
    });

    Alert.alert("Updated", "Profile picture updated.");
  } catch (e) {
    console.log(e);
    Alert.alert("Error", "Could not update picture.");
  }
}, []);

 const handleSaveProfile = useCallback(async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const cleanUsername = (username || "").trim().replace("@", "");
  const cleanDisplay = (displayName || "").trim();

  const res = await updateUserProfile({
    uid,
    username: cleanUsername,
    displayName: cleanDisplay,
  });

  if (res.success) Alert.alert("Saved", "Profile updated.");
  else Alert.alert("Error", res.message || "Could not save profile.");
}, [username, displayName]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}


            {isOwner && (
            <TouchableOpacity style={styles.editPicBtn} onPress={handleEditPicture}>
              <Text style={styles.editPicText}>Edit Picture</Text>
            </TouchableOpacity>
            )}
          </View>

          <Text style={styles.handleText}>@{username}</Text>

          {isOwner ? (
            <View style={styles.displayNameRow}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Add display name (optional)"
                style={styles.displayNameInput}
              />
              <TouchableOpacity style={styles.saveMiniBtn} onPress={handleSaveProfile}>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "700", color: "#111" }}>
              {displayName || username}
            </Text>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatTile icon="flame" value={stats.streak} label="Daily Streak" />
          <StatTile icon="trophy" value={stats.achievements} label="Achievements" />
          <StatTile icon="time" value={stats.minsToday} label="Mins Today" />
          <StatTile icon="flash" value={stats.xp} label="XP" big />
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {badges.map((b) => (
            <View key={b.id} style={styles.badge}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name={b.icon} size={28} color="#218ED5" />
              </View>
              <Text style={styles.badgeLabel} numberOfLines={1}>{b.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Public routines */}
        <Text style={styles.sectionTitle}>Public Routines</Text>
        {loading && <Text style={{ color: "#666" }}>Loading...</Text>}

        {(publicRoutines || []).map((routine) => {
            const routineId = routine.routineId || routine.id;
            const canRate = !!viewerId && routine.userId !== viewerId;

            return (
              <View key={routineId} style={{ marginBottom: 4 }}>
                <PublicRoutineRow
                  routine={routine}
                  navigation={navigation}
                  viewerId={viewerId}
                  canRate={canRate}
                  onViewDetails={handleViewDetails}
                />
              </View>
            );
          })}
      </ScrollView>

      <BottomNav
        activeTab="Profile"
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

function StatTile({ icon, value, label, big }) {
  return (
    <View style={[styles.statTile, big && styles.statTileBig]}>
      <Ionicons name={icon} size={22} color={icon === "flame" ? "#FF6B00" : "#218ED5"} />
      <Text style={[styles.statValue, big && styles.statValueBig]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
    marginBottom: 12,
    alignItems: "center",
  },

  avatarWrap: { alignItems: "center" },
  avatar: { width: 110, height: 110, borderRadius: 999, backgroundColor: "#ddd" },
  avatarPlaceholder: { backgroundColor: "#d9d9d9" },

  editPicBtn: {
    marginTop: -18,
    backgroundColor: "#EDEDED",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editPicText: { fontSize: 12, fontWeight: "700", color: "#333" },

  handleText: { marginTop: 10, fontSize: 14, fontWeight: "800", color: "#218ED5" },

  displayNameRow: { flexDirection: "row", alignItems: "center", marginTop: 10, width: "100%" },
  displayNameInput: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveMiniBtn: {
    marginLeft: 8,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#13B4B0",
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statTile: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EDEDED",
    alignItems: "center",
  },
  statTileBig: { flex: 1.2 },
  statValue: { marginTop: 6, fontSize: 18, fontWeight: "900", color: "#111" },
  statValueBig: { fontSize: 20 },
  statLabel: { marginTop: 2, fontSize: 11, fontWeight: "700", color: "#666", textAlign: "center" },

  sectionTitle: { fontSize: 25, fontWeight: "700", marginTop: 10, marginBottom: 10 },

  badge: { width: 110, marginRight: 12, alignItems: "center" },
  badgeIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#333" },
});