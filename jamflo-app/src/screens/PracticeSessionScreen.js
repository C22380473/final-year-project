import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { auth } from "../config/firebaseConfig";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { useRoutineSessionData } from "../hooks/useRoutineSessionData";
import { useRoutineNotes } from "../hooks/useRoutineNotes";
import { useSessionPersistence } from "../hooks/useSessionPersistence";
import { useExerciseNavigator } from "../hooks/useExerciseNavigator";
import {useMetronome } from "../hooks/useMetronome";
import { OverallProgressCard } from "../components/practiceSession/OverallProgressCard";
import { SessionExerciseCard } from "../components/practiceSession/SessionExerciseCard";
import { MetronomeCard } from "../components/practiceSession/MetronomeCard";
import { SessionOverviewCard } from "../components/practiceSession/SessionOverviewCard";
import { ResourcesCard } from "../components/practiceSession/ResourcesCard";
import { NotesCard } from "../components/practiceSession/NotesCard";

const { width: SCREEN_W } = Dimensions.get("window");
const BOTTOM_NAV_HEIGHT = 72;

// ─── Auth guard ──────────────────────────────────────────────────────────────
export default function PracticeSessionScreen(props) {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return (
      <View style={[styles.bg, styles.center]}>
        <Text style={styles.emptyTitle}>You're not signed in</Text>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <PracticeSessionInner {...props} userId={userId} />;
}

// ─── Main screen ─────────────────────────────────────────────────────────────
function PracticeSessionInner({ navigation, route, userId }) {
  const routineId  = route?.params?.routineId;
  const startFresh = route?.params?.startFresh === true;
  const mode       = startFresh ? "fresh" : "continue";

  // ── Paging ──
  const pagesRef  = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);

  // ── Session state ──
  const [isRunning, setIsRunning] = useState(false);
  const [restoredRemainingMs, setRestoredRemainingMs] = useState(null);
  const sessionCompletedRef = useRef(false);
  const markCompletedRef = useRef(null);

  // ── Metronome state ──
  const [bpm, setBpm] = useState(120);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [currentBeat0, setCurrentBeat0] = useState(0);

  // Metronome runs independently of practice timer:
  // - it plays when metronomeEnabled is ON AND isRunning is true
  // - if you want it to play even when practice timer is paused,
  //   pass `isRunning: metronomeEnabled` instead (see note below).
  const { isReady: metronomeReady, stop: stopMetronome } = useMetronome({
    bpm,
    beatsPerBar,
    enabled: metronomeEnabled,
    isRunning,         // metronome follows the play/pause button
    volume: 1.0,
    onBeat: (beatIdx0) => setCurrentBeat0(beatIdx0),
    debug: true,
  });

  const handleStop = useCallback(() => {
  setIsRunning(false);
  stopMetronome();
}, [stopMetronome]);

  // ── Data ──
  const { routine, focusBlocks, loadingRoutine, loadError } = useRoutineSessionData(routineId);

  const {
    routineNotes,
    noteText,
    setNoteText,
    savingNote,
    saveNote:   handleSaveNote,
    deleteNote: handleDeleteNote,
    editNote:   handleEditNote,
  } = useRoutineNotes(routineId);

  // ── Navigator ──
  const nav = useExerciseNavigator({
    focusBlocks,
    initialBlockIndex:   0,
    initialExerciseIndex: 0,
    onComplete: async () => {
      if (sessionCompletedRef.current) return;
      sessionCompletedRef.current = true;
      setIsRunning(false);
      await markCompletedRef.current?.();
      stopMetronome();
      Alert.alert(
        "Session complete! 🎸",
        "Nice work — you finished this practice session!",
        [{ text: "Back to Home", onPress: () => navigation.goBack() }],
      );
    },
  });

  const currentExercise = nav.currentExercise;
  const durationMs      = nav.durationMs;
  const safeDurationMs  = typeof durationMs === "number" && durationMs > 0 ? durationMs : 1;

  // ── Timer ──
  const { seconds, remainingMs } = useCountdownTimer({
    durationMs:         safeDurationMs,
    initialRemainingMs: restoredRemainingMs ?? safeDurationMs,
    isRunning,
    onFinish:   () => nav.goNext(),
    exerciseId: currentExercise?.id,
  });

  // ── Persistence ──
  const { save, saveNow, markCompleted } = useSessionPersistence({
    routineId,
    userId,
    mode,
    getSnapshot: () => ({
      blockIndex:    nav.blockIndex,
      exerciseIndex: nav.exerciseIndex,
      remainingMs,
      isRunning,
      bpm,
      beatsPerBar,
      isCompleted:  sessionCompletedRef.current === true,
      updatedAtMs:  Date.now(),
    }),
    onRestore: (snap) => {
      nav.setPosition(snap.blockIndex ?? 0, snap.exerciseIndex ?? 0);
      setRestoredRemainingMs(typeof snap.remainingMs === "number" ? snap.remainingMs : null);
      setIsRunning(!!snap.isRunning);
      setBpm(snap.bpm ?? 120);
      setBeatsPerBar(snap.beatsPerBar ?? 4);
    },
  });

  useEffect(() => { markCompletedRef.current = markCompleted; }, [markCompleted]);

  // Auto-set BPM from exercise tempo
  useEffect(() => {
    const t = Number(currentExercise?.tempo);
    if (Number.isFinite(t) && t > 0) setBpm(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.id]);

  // Clear restored value after exercise change
  useEffect(() => {
    if (restoredRemainingMs !== null) setRestoredRemainingMs(null);
  }, [currentExercise?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save on state changes
  useEffect(() => {
    if (!userId || !routineId || sessionCompletedRef.current) return;
    save();
  }, [save, userId, routineId, nav.blockIndex, nav.exerciseIndex, remainingMs, isRunning, bpm, beatsPerBar]);

  // ── Derived UI ──
  const handleToggleRun = useCallback(() => setIsRunning((v) => !v), []);

  const timerText = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  const exerciseProgress = useMemo(() => {
    if (!durationMs) return 0;
    return 1 - Math.max(0, Math.min(1, remainingMs / durationMs));
  }, [remainingMs, durationMs]);

  const overallProgress = useMemo(() => {
    if (!nav.progress.totalExercises) return 0;
    return nav.progress.completedExercises / nav.progress.totalExercises;
  }, [nav.progress]);

  // ── Loading / error / empty states ──
  if (loadingRoutine) {
    return (
      <View style={[styles.bg, styles.center]}>
        <Text style={styles.emptyTitle}>Loading session…</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.bg, styles.center]}>
        <Text style={styles.emptyTitle}>Couldn't load routine</Text>
        <Text style={styles.emptyText}>{loadError}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!nav.totalExercises) {
    return (
      <View style={[styles.bg, styles.center]}>
        <Text style={styles.emptyTitle}>No exercises found</Text>
        <Text style={styles.emptyText}>
          Add exercises to a focus block before starting a session.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Paging helpers ──
  const onScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    setPageIndex(Math.round(x / SCREEN_W));
  };

  const goToPage = (idx) => {
    setPageIndex(idx);
    pagesRef.current?.scrollTo({ x: idx * SCREEN_W, animated: true });
  };

  // ── Exit ──
  const handleExit = async () => {
    setIsRunning(false);
    stopMetronome(); // ✅ ensure scheduler clears immediately

    if (sessionCompletedRef.current) {
      await markCompleted();
    } else {
      await saveNow();
    }
    navigation.goBack();
  };

  // ── Resources ──
  const resources = Array.isArray(currentExercise?.resources) ? currentExercise.resources : [];

  const openResource = async (url) => {
    if (!url) return;
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert("Can't open link", "This resource link is not supported on this device.");
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Error", "Could not open the resource.");
    }
  };

  // ── Render ──
  return (
    <View style={styles.bg}>
      <AppHeader />

      <View style={styles.titleRow}>
        <Text style={styles.routineTitle}>{routine?.name ?? "Practice Session"}</Text>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => goToPage(i)}
            style={[styles.dot, pageIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        ref={pagesRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {/* PAGE 1 — Practice */}
        <ScrollView
          style={styles.page}
          contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
          showsVerticalScrollIndicator={false}
        >
          <OverallProgressCard
            progress={overallProgress}
            rightText={`${nav.currentBlock?.name ?? "Practice"} • Exercise ${
              nav.safeExerciseIndex + 1
            } of ${nav.exercisesInCurrentBlock.length}`}
          />

          <SessionExerciseCard
            isRunning={isRunning}
            focusBlockName={nav.currentBlock?.name}
            category={currentExercise?.category}
            title={currentExercise?.name}
            subtitle={currentExercise?.notes}
            durationMins={currentExercise?.durationMins}
            onPrev={nav.goPrev}
            onToggleRun={handleToggleRun}
            onSkip={nav.skipExercise}
            timerText={timerText}
            progress={exerciseProgress}
          />

          <MetronomeCard
            bpm={bpm}
            setBpm={setBpm}
            beatsPerBar={beatsPerBar}
            setBeatsPerBar={setBeatsPerBar}
            currentBeat0={currentBeat0}
            isRunning={isRunning}
            onStop={handleStop}
            metronomeEnabled={metronomeEnabled}
            setMetronomeEnabled={setMetronomeEnabled}
          />

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* PAGE 2 — Overview */}
        <ScrollView
          style={styles.page}
          contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
          showsVerticalScrollIndicator={false}
        >
          <SessionOverviewCard
            focusBlocks={focusBlocks}
            currentBlockIndex={nav.safeBlockIndex}
            currentExerciseIndex={nav.safeExerciseIndex}
            onSelect={(bIdx, eIdx) => {
              if (isRunning) return;
              nav.setPosition(bIdx, eIdx);
            }}
          />
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* PAGE 3 — Resources + Notes */}
        <ScrollView
          style={styles.page}
          contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
          showsVerticalScrollIndicator={false}
        >
          <ResourcesCard
            isRunning={isRunning}
            resources={resources}
            onOpen={(url) => { if (!isRunning) openResource(url); }}
          />

          <NotesCard
            notes={routineNotes}
            noteText={noteText}
            setNoteText={setNoteText}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            onEdit={handleEditNote}
            isRunning={isRunning}
            saving={savingNote}
          />

          <View style={{ height: 80 }} />
        </ScrollView>
      </ScrollView>

      <BottomNav
        activeTab="Home"
        onTabPress={(t) => {
          if (t === "Home")      navigation.navigate("Home");
          if (t === "Create")    navigation.navigate("CreateRoutine");
          if (t === "Community") navigation.navigate("Community");
          if (t === "Tools")     navigation.navigate("Tools");
          if (t === "Profile")   navigation.navigate("Profile");
        }}
      />
    </View>
  );
}

/* ─────────────────────────── styles ─────────────────────────────────────── */
const styles = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: "#11b5b0" },
  center: { justifyContent: "center", alignItems: "center", padding: 24 },

  emptyTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  emptyText:  { color: "rgba(255,255,255,0.9)", marginTop: 8, textAlign: "center", fontWeight: "700" },
  emptyBtn:   { marginTop: 18, backgroundColor: "rgba(255,255,255,0.9)", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
  emptyBtnText: { fontWeight: "900", color: "#0f172a" },

  titleRow: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  routineTitle: { fontSize: 28, fontWeight: "800", color: "#ffffff", flex: 1 },
  exitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  exitText: { color: "#ffffff", fontWeight: "700" },

  dotsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingBottom: 10 },
  dot:       { width: 22, height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive: { backgroundColor: "rgba(255,255,255,0.95)" },

  page: { width: SCREEN_W, paddingHorizontal: 18 },
});