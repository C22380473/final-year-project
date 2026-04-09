import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import {
  toDateKey,
  calculateLevelFromXp,
  getUnlockedAchievements,
  getWeekKey,
  prunePracticeHistory,
  calculateStreakFromHistory,
} from "../utils/userStatsUtils";

const DEFAULT_STATS = {
  totalPracticeMinutes: 0,
  totalSessionsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null, // YYYY-MM-DD
  xp: 0,
  level: 1,
  achievements: [],
  weeklyGoalMinutes: 300,
  todayMinutes: 0,
  weeklyMinutes: 0,
  weeklyMinutesWeekKey: null,
  practiceHistory: {},
  updatedAt: null,
};

function getStatsRef(uid) {
  return doc(db, "users", uid, "stats", "overview");
}

export async function updateWeeklyGoal(uid, weeklyGoalMinutes) {
  if (!uid) {
    return { success: false, message: "Missing uid" };
  }

  const safeGoal = Math.max(1, Number(weeklyGoalMinutes || 0));

  try {
    const ref = getStatsRef(uid);

    await setDoc(
      ref,
      {
        weeklyGoalMinutes: safeGoal,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { success: true };
  } catch (e) {
    console.log("updateWeeklyGoal error", e);
    return {
      success: false,
      message: e?.message || "Failed to update weekly goal",
    };
  }
}

function normalizeStats(stats) {
  const merged = { ...DEFAULT_STATS, ...stats };

  const today = toDateKey(new Date());
  const currentWeekKey = getWeekKey(new Date());

  const normalizedTodayMinutes =
    merged.lastPracticeDate === today ? Number(merged.todayMinutes || 0) : 0;

  const normalizedWeeklyMinutes =
    merged.weeklyMinutesWeekKey === currentWeekKey
      ? Number(merged.weeklyMinutes || 0)
      : 0;

  const normalizedCurrentStreak = calculateStreakFromHistory(
    merged.practiceHistory || {}
  );

  return {
    ...merged,
    todayMinutes: normalizedTodayMinutes,
    weeklyMinutes: normalizedWeeklyMinutes,
    currentStreak: normalizedCurrentStreak,
  };
}


export async function ensureUserStats(uid) {
  if (!uid) {
    return { success: false, message: "Missing uid" };
  }

  try {
    const ref = getStatsRef(uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        ...DEFAULT_STATS,
        updatedAt: serverTimestamp(),
      });
      return {
        success: true,
        stats: normalizeStats(DEFAULT_STATS),
      };
    }
    return {
      success: true,
      stats: normalizeStats(snap.data()),
    };
  } catch (e) {
    console.log("ensureUserStats error", e);
    return {
      success: false,
      message: e?.message || "Failed to initialise stats",
    };
  }
}

export async function getUserStats(uid) {
  if (!uid) {
    return { success: false, message: "Missing uid" };
  }

  try {
    const ref = getStatsRef(uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        ...DEFAULT_STATS,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        stats: normalizeStats(DEFAULT_STATS),
      };
    }

    return {
      success: true,
      stats: normalizeStats(snap.data()),
    };
  } catch (e) {
    console.log("getUserStats error", e);
    return {
      success: false,
      message: e?.message || "Failed to load stats",
    };
  }
}

export async function recordCompletedSession({
  uid,
  minutesPracticed = 0,
  completedExercises = 0,
}) {
  if (!uid) {
    return { success: false, message: "Missing uid" };
  }

  const safeMinutes = Math.max(0, Number(minutesPracticed || 0));
  const safeExercises = Math.max(0, Number(completedExercises || 0));

  const xpFromSession = safeExercises * 10 + (safeMinutes > 0 ? 20 : 0);

  const today = toDateKey(new Date());

  try {
    const ref = getStatsRef(uid);

    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists()
        ? { ...DEFAULT_STATS, ...snap.data() }
        : { ...DEFAULT_STATS };

      const currentWeekKey = getWeekKey(new Date());
      const previousWeekKey = current.weeklyMinutesWeekKey || null;

      const nextWeeklyMinutes =
        previousWeekKey === currentWeekKey
          ? Number(current.weeklyMinutes || 0) + safeMinutes
          : safeMinutes;

      const nextPracticeHistory = prunePracticeHistory({
        ...(current.practiceHistory || {}),
        [today]:
          current.lastPracticeDate === today
            ? Number(current.todayMinutes || 0) + safeMinutes
            : safeMinutes,
      });

      const nextStreak = calculateStreakFromHistory(nextPracticeHistory);
      const nextLongestStreak = Math.max(
        Number(current.longestStreak || 0),
        nextStreak
      );

      const nextXp = Number(current.xp || 0) + xpFromSession;
      const nextLevel = calculateLevelFromXp(nextXp);
    

      const baseUpdated = {
        totalPracticeMinutes:
          Number(current.totalPracticeMinutes || 0) + safeMinutes,
        totalSessionsCompleted: Number(current.totalSessionsCompleted || 0) + 1,
        currentStreak: nextStreak,
        longestStreak: nextLongestStreak,
        lastPracticeDate: today,
        xp: nextXp,
        level: nextLevel,
        todayMinutes:
          current.lastPracticeDate === today
            ? Number(current.todayMinutes || 0) + safeMinutes
            : safeMinutes,
        weeklyMinutes: nextWeeklyMinutes,
        weeklyMinutesWeekKey: currentWeekKey,
        practiceHistory: nextPracticeHistory,
      };

      const nextAchievements = getUnlockedAchievements({
        ...current,
        ...baseUpdated,
      });

      const previousAchievements = Array.isArray(current.achievements)
        ? current.achievements
        : [];

      const newlyUnlocked = nextAchievements.filter(
        (id) => !previousAchievements.includes(id),
      );

      const updated = {
        ...baseUpdated,
        achievements: nextAchievements,
        updatedAt: serverTimestamp(),
      };

      tx.set(ref, updated, { merge: true });

      return {
        ...current,
        ...updated,
        xpGained: xpFromSession,
        streakIncreased: current.lastPracticeDate !== today,
        leveledUp: nextLevel > Number(current.level || 1),
        newlyUnlockedAchievements: newlyUnlocked,
      };
    });

    return { success: true, stats: result };
  } catch (e) {
    console.log("recordCompletedSession error", e);
    return {
      success: false,
      message: e?.message || "Failed to record completed session",
    };
  }
}
