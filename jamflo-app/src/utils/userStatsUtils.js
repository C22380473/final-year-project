
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

export function calculateLevelFromXp(xp = 0) {
  // Simple version for now
  // Level 1 at 0 XP, then +1 level every 100 XP
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function getUnlockedAchievements(stats) {
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

export function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay(); // Sun=0 ... Sat=6
  const diffToThursday = day === 0 ? -3 : 4 - day;
  d.setDate(d.getDate() + diffToThursday);

  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function prunePracticeHistory(history = {}, maxDays = 14) {
  const entries = Object.entries(history)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxDays);

  return Object.fromEntries(entries);
}


export function calculateStreakFromHistory(practiceHistory = {}) {
  const keys = Object.keys(practiceHistory)
    .filter((key) => Number(practiceHistory[key] || 0) > 0)
    .sort();

  if (keys.length === 0) return 0;

  const todayKey = toDateKey(new Date());
  const yesterdayKey = getYesterdayDateKey(new Date());
  const lastKey = keys[keys.length - 1];

  // A current streak only counts if the most recent practice
  // happened today or yesterday.
  if (lastKey !== todayKey && lastKey !== yesterdayKey) {
    return 0;
  }

  let streak = 1;

  for (let i = keys.length - 1; i > 0; i -= 1) {
    const current = new Date(`${keys[i]}T00:00:00`);
    const previous = new Date(`${keys[i - 1]}T00:00:00`);

    const diffDays = (current - previous) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}