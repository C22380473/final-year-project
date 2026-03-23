import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

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

function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

function calculateLevelFromXp(xp = 0) {
  // Simple version for now
  // Level 1 at 0 XP, then +1 level every 100 XP
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function getUnlockedAchievements(stats) {
  const unlocked = new Set(
    Array.isArray(stats?.achievements) ? stats.achievements : [],
  );

  if (Number(stats?.totalSessionsCompleted || 0) >= 1) {
    unlocked.add("first_session");
  }

  if (Number(stats?.currentStreak || 0) >= 3) {
    unlocked.add("streak_3");
  }

  if (Number(stats?.currentStreak || 0) >= 7) {
    unlocked.add("streak_7");
  }

  if (Number(stats?.totalPracticeMinutes || 0) >= 100) {
    unlocked.add("minutes_100");
  }

  if (Number(stats?.xp || 0) >= 500) {
    unlocked.add("xp_500");
  }

  return Array.from(unlocked);
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay(); // Sun=0 ... Sat=6
  const diffToThursday = day === 0 ? -3 : 4 - day;
  d.setDate(d.getDate() + diffToThursday);

  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function prunePracticeHistory(history = {}, maxDays = 14) {
  const entries = Object.entries(history)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxDays);

  return Object.fromEntries(entries);
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
        stats: DEFAULT_STATS,
      };
    }

    return {
      success: true,
      stats: {
        ...DEFAULT_STATS,
        ...snap.data(),
      },
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
        stats: DEFAULT_STATS,
      };
    }

    return {
      success: true,
      stats: {
        ...DEFAULT_STATS,
        ...snap.data(),
      },
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
  const yesterday = getYesterdayDateKey(new Date());

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

      let nextStreak = current.currentStreak || 0;

      if (current.lastPracticeDate === today) {
      nextStreak = current.currentStreak || 1;
    } else if (current.lastPracticeDate === yesterday) {
      nextStreak = (current.currentStreak || 0) + 1;
    } else {
      nextStreak = 1;
    }

    const nextXp = Number(current.xp || 0) + xpFromSession;
    const nextLevel = calculateLevelFromXp(nextXp);
    const nextLongestStreak = Math.max(
      Number(current.longestStreak || 0),
      nextStreak
    );

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
