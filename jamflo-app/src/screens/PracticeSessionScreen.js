import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/firebaseConfig";

const { width: SCREEN_W } = Dimensions.get("window");
const BOTTOM_NAV_HEIGHT = 72; 


export default function PracticeSessionScreen({ navigation, route }) {
  const routineId = route?.params?.routineId;
  const startFresh = route?.params?.startFresh === true;


  // Fallback routine for first render
  const fallbackRoutine = {
    name: "Practice Session",
    focusBlocks: [],
    resources: [],
  };

  // Hooks
  const [routine, setRoutine] = useState(fallbackRoutine);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const pagesRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Session state: focus block + exercise within block
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [restoredRemainingMs, setRestoredRemainingMs] = useState(null);
  const sessionCompletedRef = useRef(false);
  const skipBeforeRemoveSaveRef = useRef(false);


  // Metronome UI state
  const [bpm, setBpm] = useState(60);
  const [beats, setBeats] = useState(2);

  // Notetaking state
  const [routineNotes, setRoutineNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
  if (!routineId) return;

  const notesCol = collection(db, "routines", routineId, "routineNotes");
  const q = query(notesCol, orderBy("createdAt", "desc"));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const next = snap.docs.map((d) => ({
        routineNoteId: d.id,
        ...d.data(),
      }));
      setRoutineNotes(next);
    },
    (err) => {
      console.log("routineNotes snapshot error:", err);
      Alert.alert("Error", "Could not load notes.");
    }
  );

  return unsub;
}, [routineId]);

const makeRoutineNoteId = () =>
  `routineNote_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const handleSaveNote = useCallback(async () => {
  const clean = noteText.trim();
  if (!clean || !routineId) return;

  setSavingNote(true);
  try {
    const routineNoteId = makeRoutineNoteId();
    const ref = doc(db, "routines", routineId, "routineNotes", routineNoteId);

    await setDoc(ref, {
      routineNoteId, // explicit field name as you want
      text: clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setNoteText("");
  } catch (e) {
    console.log(e);
    Alert.alert("Error", "Could not save note.");
  } finally {
    setSavingNote(false);
  }
}, [noteText, routineId]);

const handleDeleteNote = useCallback(
  async (routineNoteId) => {
    if (!routineId || !routineNoteId) return;
    try {
      await deleteDoc(doc(db, "routines", routineId, "routineNotes", routineNoteId));
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not delete note.");
    }
  },
  [routineId]
);

const handleEditNote = useCallback(
  async (routineNoteId, newText) => {
    const clean = newText.trim();
    if (!routineId || !routineNoteId || !clean) return;

    try {
      await updateDoc(doc(db, "routines", routineId, "routineNotes", routineNoteId), {
        text: clean,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not edit note.");
    }
  },
  [routineId]
);
  // ------------------------
  // Firestore load by routineId
  // ------------------------
  useEffect(() => {
    let cancelled = false;

    const loadRoutineById = async () => {
      setLoadingRoutine(true);
      setLoadError(null);
      sessionCompletedRef.current = false;


      if (!routineId) {
        setLoadingRoutine(false);
        setLoadError("Missing routineId. Start a session from your routine list.");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "routines", routineId));

        if (!snap.exists()) {
          if (!cancelled) {
            setRoutine(fallbackRoutine);
            setLoadError("Routine not found (document does not exist).");
          }
          return;
        }

        const data = snap.data();

        if (!cancelled) {
          setRoutine({
            id: snap.id,
            routineId: snap.id,
            ...data,
          });

          // reset session indices on load
          setCurrentBlockIndex(0);
          setCurrentExerciseIndex(0);
          setIsRunning(false);
        }
      } catch (e) {
        if (!cancelled) {
          setRoutine(fallbackRoutine);
          setLoadError(e?.message || "Failed to load routine from Firestore.");
          console.log("Error loading routine:", e);
        }
      } finally {
        if (!cancelled) setLoadingRoutine(false);
      }
    };

    loadRoutineById();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);


  // ------------------------
  // Normalisation helpers 
  // ------------------------
  const guessResourceType = (url = "") => {
    const u = String(url).toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.endsWith(".pdf")) return "pdf";
    if (u.endsWith(".mp3") || u.endsWith(".wav") || u.endsWith(".m4a")) return "audio";
    if (u.startsWith("http")) return "link";
    return "file";
  };

  const normalizeResource = (r) => {
    const url = r?.url ?? r?.link ?? r?.href ?? "";
    const inferred = guessResourceType(url);
    const type = inferred; // prefer inferred from URL

    const name =
      r?.name ??
      r?.title ??
      (type === "youtube"
        ? "YouTube video"
        : type === "pdf"
        ? "PDF"
        : type === "audio"
        ? "Audio"
        : "Link");

    return {
      resourceId: r?.resourceId,
      type,
      url,
      name,
      addedAt: r?.addedAt,
    };
  };

  const parseExerciseResources = (ex) => {
  const raw = ex?.resources;
  const items = [];

  const pushIfUrl = (r) => {
    const url = r?.url ?? r?.link ?? r?.href ?? "";
    if (!url) return;
    items.push(normalizeResource({ ...r, url }));
  };

  if (Array.isArray(raw)) {
    raw.forEach((r) => pushIfUrl(r));
  } else if (raw && typeof raw === "object") {
    pushIfUrl(raw);
  }

  return items; 
};


  const normalizeExercise = (ex) => {
    const durationNum = Number(ex?.duration);
    const durationMins = Number.isFinite(durationNum) && durationNum > 0 ? durationNum : 5;

    const resources = parseExerciseResources(ex);

    const tempoNum = Number(ex?.tempo);
    const tempo = Number.isFinite(tempoNum) && tempoNum > 0 ? tempoNum : null;

    return {
      id:
        ex?.exerciseId ??
        ex?.id ??
        `${ex?.name ?? "exercise"}-${Math.random().toString(16).slice(2)}`,
      name: ex?.name ?? "Exercise",
      category: ex?.category ?? "Technique",
      notes: ex?.notes ?? "",
      durationMins,
      resources, 
      tempo,     
    };
  };

  const getFocusBlocksFromRoutine = (r) => {
    const blocks = Array.isArray(r?.focusBlocks) ? r.focusBlocks : [];

    return blocks.map((b, i) => ({
      id: b?.blockId ?? String(i),
      name: b?.name ?? `Focus Block ${i + 1}`,
      description: b?.description ?? "",
      totalDuration: Number(b?.totalDuration ?? 0),
      exercises: Array.isArray(b?.exercises) ? b.exercises.map(normalizeExercise) : [],
    }));
  };

  const focusBlocks = useMemo(() => getFocusBlocksFromRoutine(routine), [routine]);

  // Totals + safe indices
  const totalBlocks = focusBlocks.length;
  const safeBlockIndex = Math.max(0, Math.min(currentBlockIndex, totalBlocks - 1));
  const currentBlock = focusBlocks[safeBlockIndex] ?? { name: "Practice", exercises: [] };

  const blockExercises = Array.isArray(currentBlock.exercises) ? currentBlock.exercises : [];
  const totalExercisesInBlock = blockExercises.length;
  const safeExerciseIndex = Math.max(0, Math.min(currentExerciseIndex, totalExercisesInBlock - 1));
  const currentExercise = blockExercises[safeExerciseIndex] ?? {};

  const totalExercisesAll = useMemo(
    () => focusBlocks.reduce((sum, b) => sum + (b?.exercises?.length || 0), 0),
    [focusBlocks]
  );

  const completedCount = useMemo(() => {
    const prev = focusBlocks
      .slice(0, safeBlockIndex)
      .reduce((sum, b) => sum + (b?.exercises?.length || 0), 0);
    return prev + safeExerciseIndex;
  }, [focusBlocks, safeBlockIndex, safeExerciseIndex]);

  const overallProgress = useMemo(() => {
    return Math.max(0, Math.min(1, completedCount / (totalExercisesAll - 1 || 1)));
  }, [completedCount, totalExercisesAll]);

  // Auto set BPM from exercise tempo when you land on an exercise (optional but matches your DB)
  useEffect(() => {
    const t = Number(currentExercise?.tempo);
    if (Number.isFinite(t) && t > 0) {
      setBpm(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeBlockIndex, safeExerciseIndex]);


  // ------------------------
  // Session controls (block-first)
  // ------------------------

  const durationMs = Math.round((currentExercise?.durationMins ?? 0) * 60 * 1000);

  const handlePrev = () => {
    if (isRunning) return;

    // within block
    if (safeExerciseIndex > 0) {
      setCurrentExerciseIndex((v) => Math.max(0, v - 1));
      setIsRunning(false);
      return;
    }

    // move to previous block last exercise
    if (safeBlockIndex > 0) {
      const prevBlock = focusBlocks[safeBlockIndex - 1];
      const prevLen = prevBlock?.exercises?.length || 0;

      setCurrentBlockIndex((b) => Math.max(0, b - 1));
      setCurrentExerciseIndex(Math.max(0, prevLen - 1));
      setIsRunning(false);
    }
  };

  const sessionKey = routineId ? `session:${routineId}` : null;
  const uid = auth.currentUser?.uid;

  const sessionDocRef = useMemo(() => {
    if (!uid || !routineId) return null;
    return doc(db, "users", uid, "activeSessions", routineId);
  }, [uid, routineId]);

  const clearSavedSession = useCallback(async () => {
  try {
    if (sessionKey) await AsyncStorage.removeItem(sessionKey);
  } catch (e) {
    console.log("Failed to clear local session:", e);
  }

  try {
    if (sessionDocRef) await deleteDoc(sessionDocRef);
  } catch (e) {
    console.log("Failed to delete cloud session:", e);
  }

  setRestoredRemainingMs(null);
}, [sessionKey, sessionDocRef]);

 const handleSkip = useCallback(async () => {
  // safety: no exercises in this block
  if (totalExercisesInBlock <= 0) return;

  const isLastExerciseInLastBlock =
    safeBlockIndex === totalBlocks - 1 &&
    safeExerciseIndex === totalExercisesInBlock - 1;

  if (isLastExerciseInLastBlock) {
    sessionCompletedRef.current = true; 
    setIsRunning(false);

     if (sessionDocRef) {
        try {
          await setDoc(sessionDocRef, { remainingMs: 0, completedAt: serverTimestamp(), updatedAtMs: Date.now() }, { merge: true });
        } catch (e) {
          console.log("Failed to mark completed:", e);
        }
      }

    await clearSavedSession();
    Alert.alert("Session complete", "Nice one 🎸");
    return;
  }

  // within block
  if (safeExerciseIndex < totalExercisesInBlock - 1) {
    setIsRunning(false);
    setCurrentExerciseIndex((v) => v + 1);
    return;
  }

  // move to next block
  if (safeBlockIndex < totalBlocks - 1) {
    setIsRunning(false);
    setCurrentBlockIndex((b) => b + 1);
    setCurrentExerciseIndex(0);
    return;
  }
}, [
  safeBlockIndex,
  safeExerciseIndex,
  totalBlocks,
  totalExercisesInBlock,
  clearSavedSession,
]);


  const handleToggleRun = () => setIsRunning((v) => !v);

  const { seconds, remainingMs} = useCountdownTimer({
    durationMs,
    initialRemainingMs: restoredRemainingMs ?? durationMs,
    isRunning,
    onFinish: handleSkip,
    exerciseId: currentExercise?.id, // ✅ Force reset when exercise changes
  });

  useEffect(() => {
  if (restoredRemainingMs !== null) setRestoredRemainingMs(null);
}, [safeBlockIndex, safeExerciseIndex, restoredRemainingMs]);

 
  
  const timerText = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const exerciseProgress = useMemo(() => {
    if (!durationMs) return 0;
    const done = 1 - remainingMs / durationMs;
    return Math.max(0, Math.min(1, done));
  }, [durationMs, remainingMs]);

  const buildSnapshot = useCallback(() => {
    if (!routineId) return null;
    return {
      routineId,
      blockIndex: safeBlockIndex,
      exerciseIndex: safeExerciseIndex,
      remainingMs,
      bpm,
      beats,
      localUpdatedAtMs: Date.now(),
      updatedAtMs: Date.now(),
      updatedAt: serverTimestamp(), // server-authoritative last update
    };
  }, [routineId, safeBlockIndex, safeExerciseIndex, remainingMs, bpm, beats]);

  const saveSession = useCallback(async () => {
    if (sessionCompletedRef.current) return;

    const snap = buildSnapshot();
    if (!snap || !sessionKey) return;

    // pause for safety
    setIsRunning(false);

    // local save (offline-first)
    await AsyncStorage.setItem(sessionKey, JSON.stringify(snap));

    // cloud save (best effort)
    if (sessionDocRef) {
      try {
        await setDoc(sessionDocRef, snap, { merge: true });
      } catch (e) {
        console.log("Cloud save failed:", e);
      }
    }
  }, [buildSnapshot, sessionKey, sessionDocRef]);

  const restoreSession = useCallback(async () => {
    if (!routineId || !sessionKey) return;

    // 1) local
    let local = null;
    const raw = await AsyncStorage.getItem(sessionKey);
    if (raw) local = JSON.parse(raw);

    // 2) cloud
    let cloud = null;
    if (sessionDocRef) {
      const cloudSnap = await getDoc(sessionDocRef);
      if (cloudSnap.exists()) cloud = cloudSnap.data();
    }

    // 3) choose newest
    const cloudMs = cloud?.updatedAt?.toMillis?.() ?? 0;
    const localMs = local?.localUpdatedAtMs ?? 0;
    const best = cloudMs > localMs ? cloud : local;
    if (!best) return;

    // apply (paused)
    setIsRunning(false);
    setCurrentBlockIndex(best.blockIndex ?? 0);
    setCurrentExerciseIndex(best.exerciseIndex ?? 0);

    // restore timer safely
    setRestoredRemainingMs(
      Number.isFinite(best.remainingMs) ? best.remainingMs : null
    );
  }, [routineId, sessionKey, sessionDocRef]);

  // save on app background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" ||  state === "inactive") saveSession();
    });
    return () => sub.remove();
  }, [saveSession]);

  // save on leaving screen
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
       if (skipBeforeRemoveSaveRef.current) {
        skipBeforeRemoveSaveRef.current = false; // reset for next time
      return;
    }
      saveSession();
    });
    return unsub;
  }, [navigation, saveSession]);

  // restore when routine is loaded
  useEffect(() => {
  if (loadingRoutine || loadError) return;

  if (startFresh) {
    // wipe any previous saved state, then stay at 0,0
    clearSavedSession();
    return;
  }

  restoreSession();
}, [loadingRoutine, loadError, startFresh, restoreSession, clearSavedSession]);

  

  // ------------------------
  // Loading / error / empty
  // ------------------------
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
        <Text style={styles.emptyTitle}>Couldn’t load routine</Text>
        <Text style={styles.emptyText}>{loadError}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (totalExercisesAll === 0) {
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

  // ------------------------
  // Navigation + paging
  // ------------------------
  const onScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    setPageIndex(idx);
  };

  const goToPage = (idx) => {
    setPageIndex(idx);
    pagesRef.current?.scrollTo({ x: idx * SCREEN_W, animated: true });
  };

  const handleExit = async () => {
    // stop beforeRemove from calling saveSession again
    skipBeforeRemoveSaveRef.current = true;

    setIsRunning(false);

    if (sessionCompletedRef.current) {
      // finished session => wipe it
      await clearSavedSession();
    } else {
      // unfinished session => keep it to resume later
      await saveSession();
    }
    navigation.goBack();
  };

  // ------------------------
  // Resources (ONLY openable ones)
  // ------------------------
  const resources = Array.isArray(currentExercise?.resources) ? currentExercise.resources : [];

  const openResource = async (url) => {
    if (!url) return;
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert("Can’t open link", "This resource link is not supported on this device.");
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Error", "Could not open the resource.");
      console.log("openResource error:", e);
    }
  };

  
  // ------------------------
  // Render
  // ------------------------
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
        {/* PAGE 1: Practice */}
        <ScrollView
            style={styles.page}
            contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
            showsVerticalScrollIndicator={false}
          >
          <OverallProgressCard
            progress={overallProgress}
            rightText={`${currentBlock.name} • Exercise ${safeExerciseIndex + 1} of ${totalExercisesInBlock}`}
          />

          <ExerciseCard
            isRunning={isRunning}
            focusBlockName={currentBlock.name}
            category={currentExercise?.category}
            title={currentExercise?.name}
            subtitle={currentExercise?.notes}
            durationMins={currentExercise?.durationMins}
            onPrev={handlePrev}
            onToggleRun={handleToggleRun}
            onSkip={handleSkip}
            timerText={timerText}
            progress={exerciseProgress}
          />

          <MetronomeCard
            bpm={bpm}
            setBpm={setBpm}
            beats={beats}
            setBeats={setBeats}
            isRunning={isRunning}
          />

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* PAGE 2: Overview (nested focus blocks) */}
        <ScrollView
            style={styles.page}
            contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
            showsVerticalScrollIndicator={false}
          >
          <SessionOverviewCard
            focusBlocks={focusBlocks}
            currentBlockIndex={safeBlockIndex}
            currentExerciseIndex={safeExerciseIndex}
            onSelect={(bIdx, eIdx) => {
              if (isRunning) return;
              setCurrentBlockIndex(bIdx);
              setCurrentExerciseIndex(eIdx);
            }}
          />
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* PAGE 3: Resources + Notes */}
        <ScrollView
            style={styles.page}
            contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 18 }}
            showsVerticalScrollIndicator={false}
          >
          <ResourcesCard
            isRunning={isRunning}
            resources={resources}
            onOpen={(url) => {
              if (isRunning) return;
              openResource(url);
            }}
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
          if (t === "Home") navigation.navigate("Home");
          if (t === "Create") navigation.navigate("CreateRoutine");
          if (t === "Community") navigation.navigate("Community");
          if (t === "Tools") navigation.navigate("Tools");
          if (t === "Profile") navigation.navigate("Profile");
        }}
      />
    </View>
  );
}

/* -------------------- UI COMPONENTS -------------------- */

function OverallProgressCard({ progress, rightText }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <Text style={styles.cardMeta}>{rightText}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

function ExerciseCard({
  focusBlockName,
  category,
  title,
  subtitle,
  durationMins,
  isRunning,
  onPrev,
  onToggleRun,
  onSkip,
  timerText,
  progress
}) {
  

  return (
    <View style={[styles.card, styles.exerciseCard]}>
      <Text style={styles.exerciseTag}>{focusBlockName}</Text>
      <Text style={styles.exerciseTitle}>{title ?? "Exercise"}</Text>
      {!!category && <Text style={styles.exerciseMini}>{category}</Text>}
      {!!subtitle && (
        <Text style={styles.exerciseSubtitle} numberOfLines={3} ellipsizeMode="tail">
          {subtitle}
        </Text>
      )}


      <Text style={styles.timerText}>{timerText}</Text>
      <Text style={styles.timerSub}>{durationMins ?? 5} Minutes</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((progress ?? 0) * 100)}%`, opacity: isRunning ? 1 : 0.7 }]} />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={onPrev}
          style={[styles.smallBtn, isRunning && styles.smallBtnDisabled]}
          disabled={isRunning}
        >
          <Text style={[styles.smallBtnText, isRunning && styles.smallBtnTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleRun} style={styles.primaryBtn}>
          <Ionicons name={isRunning ? "pause" : "play"} size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{isRunning ? "Pause" : "Resume"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetronomeCard({ bpm, setBpm, beats, setBeats, isRunning }) {
  const presets = [60, 80, 120, 160];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Metronome</Text>

      <View style={styles.beatRow}>
        {[1, 2, 3, 4].map((b) => {
          const active = b === beats;
          const disabled = isRunning;
          return (
            <TouchableOpacity
              key={b}
              onPress={() => setBeats(b)}
              disabled={disabled}
              style={[
                styles.beatPill,
                active && styles.beatPillActive,
                disabled && styles.beatPillDisabled,
              ]}
            >
              <Text
                style={[
                  styles.beatText,
                  active && styles.beatTextActive,
                  disabled && styles.beatTextDisabled,
                ]}
              >
                {b}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.bpmValue}>{bpm}</Text>
      <Text style={styles.bpmLabel}>BPM</Text>

      {!isRunning ? (
        <View style={styles.presetRow}>
          {presets.map((p) => (
            <TouchableOpacity key={p} onPress={() => setBpm(p)} style={styles.presetBtn}>
              <Text style={styles.presetText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.helperText}>Paused controls are hidden while practicing.</Text>
      )}

      <TouchableOpacity style={styles.stopBtn}>
        <Text style={styles.stopBtnText}>■ Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

function SessionOverviewCard({ focusBlocks, currentBlockIndex, currentExerciseIndex, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Focus blocks in this session</Text>

      {focusBlocks.map((block, bIdx) => {
        const isCurrentBlock = bIdx === currentBlockIndex;

        return (
          <View key={`block-${block.id ?? bIdx}`} style={styles.blockWrap}>
            <Text style={styles.blockTitle}>
              {bIdx + 1}. {block.name}{" "}
              {!!block.totalDuration ? <Text style={styles.blockMeta}>({block.totalDuration} mins)</Text> : null}
            </Text>

            {(block.exercises ?? []).map((ex, eIdx) => {
              const isCurrent = isCurrentBlock && eIdx === currentExerciseIndex;
              const done = bIdx < currentBlockIndex || (isCurrentBlock && eIdx < currentExerciseIndex);

              return (
                <TouchableOpacity
                  key={`ex-${ex.id ?? `${bIdx}-${eIdx}`}`}
                  onPress={() => onSelect(bIdx, eIdx)}
                  style={[
                    styles.exerciseRow,
                    done && styles.exerciseRowDone,
                    isCurrent && styles.exerciseRowCurrent,
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.rowIcon}>{done ? "✓" : isCurrent ? "▶" : ""}</Text>
                    <Text style={styles.rowText}>{ex?.name ?? "Exercise"}</Text>
                  </View>
                  <Text style={styles.rowMeta}>{ex?.durationMins ?? 5} Mins</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function ResourcesCard({ isRunning, resources, onOpen }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Resources</Text>
      <Text style={styles.helperText}>
        {isRunning ? "Pause to open resources." : "Tap a resource to open it."}
      </Text>

      {resources?.length ? (
        resources.map((r, i) => {
          const icon =
            r.type === "youtube"
              ? "logo-youtube"
              : r.type === "pdf"
              ? "document-text-outline"
              : r.type === "audio"
              ? "musical-notes-outline"
              : "link-outline";

          return (
            <TouchableOpacity
              key={`${r.url}-${i}`}
              onPress={() => onOpen(r.url)}
              disabled={isRunning}
              style={[styles.resourceRow, isRunning && { opacity: 0.6 }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <Ionicons name={icon} size={20} color="#0f172a" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.resourceUrl} numberOfLines={1}>
                    {r.url}
                  </Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color="#0f172a" />
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={[styles.helperText, { marginTop: 10 }]}>
          No openable links saved for this exercise.
        </Text>
      )}
    </View>
  );
}

function NotesCard({ notes, noteText, setNoteText, onSave, onDelete, onEdit, isRunning, saving }) {
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEdit = (note) => {
    const id = note?.routineNoteId ?? null;
    if (!id) return;
    setEditingId(id);
    setEditingText(note?.text ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    const clean = editingText.trim();
    if (!clean || !editingId) return;
    await onEdit(editingId, clean);
    cancelEdit();
  };

  const confirmDelete = (note) => {
    const id = note?.routineNoteId ?? null;
    if (!id) return;

    Alert.alert("Delete note?", "This will remove the note permanently.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Routine Notes</Text>
      <Text style={styles.helperText}>
        {isRunning ? "Pause to write notes." : "Write reflections for next time."}
      </Text>

      <View style={styles.notesBox}>
        {notes?.length ? (
          notes.map((n, i) => {
            const id = n?.routineNoteId ?? `${i}`;
            const isEditing = editingId === n?.routineNoteId;

            return (
              <View key={id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    {isEditing ? (
                      <TextInput
                        value={editingText}
                        onChangeText={setEditingText}
                        style={[styles.noteInput, { marginTop: 0, minHeight: 44 }]}
                        multiline
                      />
                    ) : (
                      <Text style={styles.noteLine}>• {n?.text ?? ""}</Text>
                    )}
                  </View>

                  {!isRunning && (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {isEditing ? (
                        <>
                          <TouchableOpacity onPress={saveEdit} style={{ padding: 6 }}>
                            <Ionicons name="checkmark" size={20} color="#0f172a" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={cancelEdit} style={{ padding: 6 }}>
                            <Ionicons name="close" size={20} color="#0f172a" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity onPress={() => startEdit(n)} style={{ padding: 6 }}>
                            <Ionicons name="create-outline" size={20} color="#0f172a" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => confirmDelete(n)} style={{ padding: 6 }}>
                            <Ionicons name="trash-outline" size={20} color="#8b3a3a" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noteLine}>• No notes yet.</Text>
        )}
      </View>

      {!isRunning && (
        <>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a new note..."
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />

          <TouchableOpacity
            style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
            onPress={onSave}
            disabled={!noteText.trim() || saving}
          >
            <Text style={styles.primaryBtnText}>{saving ? "Saving..." : "Save Note"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#11b5b0" },

  center: { justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  emptyText: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "700",
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
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
  dot: {
    width: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { backgroundColor: "rgba(255,255,255,0.95)" },

  page: { width: SCREEN_W, paddingHorizontal: 18 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  cardMeta: { fontSize: 13, fontWeight: "800", color: "#0f172a" },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#14b8a6" },

  exerciseCard: { backgroundColor: "#3b6ee0" },
  exerciseTag: { color: "rgba(255,255,255,0.95)", fontWeight: "900", fontSize: 14 },
  exerciseTitle: { color: "#fff", fontWeight: "900", fontSize: 22, marginTop: 6 },
  exerciseMini: { color: "rgba(255,255,255,0.9)", marginTop: 2, fontWeight: "800" },
  exerciseSubtitle: { color: "rgba(255,255,255,0.9)", marginTop: 6 },

  timerText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 44,
    textAlign: "center",
    marginTop: 16,
  },
  timerSub: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: -6,
    fontWeight: "800",
  },

  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
    alignItems: "center",
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
  },
  smallBtnDisabled: { opacity: 0.55 },
  smallBtnText: { fontWeight: "900", color: "#0f172a" },
  smallBtnTextDisabled: { color: "#475569" },

  primaryBtn: {
    flex: 1.25,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#14b8a6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  helperText: { color: "#475569", marginTop: 10, fontWeight: "700" },

  beatRow: { flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 12 },
  beatPill: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  beatPillActive: { backgroundColor: "#3b6ee0", borderColor: "#3b6ee0" },
  beatPillDisabled: { opacity: 0.55 },
  beatText: { fontWeight: "900", color: "#94a3b8", fontSize: 16 },
  beatTextActive: { color: "#fff" },
  beatTextDisabled: { color: "#94a3b8" },

  bpmValue: {
    fontSize: 40,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    color: "#0f172a",
  },
  bpmLabel: { textAlign: "center", color: "#334155", fontWeight: "800", marginTop: -6 },

  presetRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 14 },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    alignItems: "center",
  },
  presetText: { fontWeight: "900", color: "#0f172a" },

  stopBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#8b3a3a",
    alignItems: "center",
  },
  stopBtnText: { color: "#fff", fontWeight: "900", fontSize: 18 },

  blockWrap: { marginTop: 14 },
  blockTitle: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  blockMeta: { fontWeight: "800", color: "#475569", fontSize: 14 },

  exerciseRow: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseRowDone: { backgroundColor: "#bff3ea" },
  exerciseRowCurrent: { backgroundColor: "#b9c8f3" },
  rowIcon: { width: 18, fontWeight: "900", color: "#0f172a" },
  rowText: { fontWeight: "900", color: "#0f172a" },
  rowMeta: { fontWeight: "900", color: "#0f172a" },

  resourceRow: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resourceName: { fontWeight: "900", color: "#0f172a" },
  resourceUrl: { marginTop: 2, color: "#475569", fontWeight: "700" },

  notesBox: {
    marginTop: 14,
    minHeight: 160,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  noteLine: { color: "#0f172a", fontWeight: "700", marginBottom: 10 }
});