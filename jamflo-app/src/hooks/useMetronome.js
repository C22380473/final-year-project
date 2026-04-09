import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import {
  clampBpm,
  getBeatIntervalMs,
  getBeatInBar,
  adjustStartTimeForBpmChange,
  getMissedTicks,
} from "../utils/metronomeUtils";

const MIN_BPM = 40;
const MAX_BPM = 240;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const nowMs = () =>
  typeof globalThis?.performance?.now === "function"
    ? globalThis.performance.now()
    : Date.now();

export function useMetronome({
  bpm,
  beatsPerBar = 4,
  enabled,
  isRunning,
  volume = 1,
  onBeat,
  debug = false,
}) {
  const appStateRef = useRef(AppState.currentState);
  const [audioReady, setAudioReady] = useState(false);

  // ─────────────────────────────────────────────
  // Load samples
  // ─────────────────────────────────────────────
  const clickSrc = useMemo(() => require("../../assets/sounds/click.wav"), []);
  const accentSrc = useMemo(
    () => require("../../assets/sounds/click_accent.wav"),
    []
  );

  const clickPlayer = useAudioPlayer(clickSrc);
  const accentPlayer = useAudioPlayer(accentSrc);

  const clickStatus = useAudioPlayerStatus(clickPlayer);
  const accentStatus = useAudioPlayerStatus(accentPlayer);

  // ─────────────────────────────────────────────
  // Audio mode
  // ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "duckOthers",
        });
      } finally {
        if (mounted) setAudioReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ─────────────────────────────────────────────
  // Volume
  // ─────────────────────────────────────────────
  useEffect(() => {
    const v = clamp(Number(volume) || 1, 0, 1);
    clickPlayer.volume = v;
    accentPlayer.volume = v;
  }, [volume, clickPlayer, accentPlayer]);

  // ─────────────────────────────────────────────
  // Refs to avoid rescheduling on renders
  // ─────────────────────────────────────────────
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beatsPerBar);
  const enabledRef = useRef(enabled);
  const runningRef = useRef(isRunning);
  const onBeatRef = useRef(onBeat);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsRef.current = beatsPerBar; }, [beatsPerBar]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { runningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { onBeatRef.current = onBeat; }, [onBeat]);

  // ─────────────────────────────────────────────
  // Click playback 
  // ─────────────────────────────────────────────
  const playClick = useCallback(
    (isAccent) => {
      if (!audioReady) return;
      if (!clickStatus?.isLoaded || !accentStatus?.isLoaded) return;

      const player = isAccent ? accentPlayer : clickPlayer;

      player
        .seekTo(0)
        .then(() => player.play())
        .catch((e) => {
          if (debug) console.log("Metronome play error:", e);
        });
    },
    [
      audioReady,
      clickStatus?.isLoaded,
      accentStatus?.isLoaded,
      accentPlayer,
      clickPlayer,
      debug,
    ]
  );

  // Make playback stable even if playClick identity changes
  const playClickRef = useRef((isAccent) => {});
  useEffect(() => {
    playClickRef.current = playClick;
  }, [playClick]);

  // ─────────────────────────────────────────────
  // Scheduler (monotonic tick)
  // ─────────────────────────────────────────────
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const tickRef = useRef(0);
  const lastIntervalRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    startTimeRef.current = 0;
    tickRef.current = 0;
    lastIntervalRef.current = 0;
  }, []);

  const startLoop = useCallback(() => {
    const loop = () => {
      if (!enabledRef.current || !runningRef.current) return;

      const bpmNow = clampBpm(Number(bpmRef.current) || 120);
      const beatsNow = Math.max(1, Number(beatsRef.current) || 4);
      const interval = getBeatIntervalMs(bpmNow);

      const t = nowMs();

      if (!startTimeRef.current) {
        startTimeRef.current = t;
        tickRef.current = 0;
        lastIntervalRef.current = interval;
      }

      // Preserve phase when BPM changes (prevents “stuck on beat 1”)
      const prevInterval = lastIntervalRef.current || interval;
      if (Math.abs(prevInterval - interval) > 0.001) {
        startTimeRef.current = adjustStartTimeForBpmChange({
          currentTime: t,
          startTime: startTimeRef.current,
          tick: tickRef.current,
          prevInterval,
          newInterval: interval,
        });
        lastIntervalRef.current = interval;
      }

      let nextTime = startTimeRef.current + (tickRef.current + 1) * interval;

      // Drop missed ticks without repeating
      const missed = getMissedTicks({
        currentTime: t,
        nextTime,
        interval,
      });

      if (missed > 0) {
        tickRef.current += missed;
        nextTime = startTimeRef.current + (tickRef.current + 1) * interval;
      }

      const timeUntil = nextTime - t;

      if (timeUntil <= 2) {
        const beatInBar = getBeatInBar(tickRef.current, beatsNow);
        const isAccent = beatInBar === 0;

        playClickRef.current(isAccent);
        onBeatRef.current?.(beatInBar);

        if (debug) {
          console.log(
            `tick=${tickRef.current} beat=${beatInBar + 1}/${beatsNow} bpm=${bpmNow}`
          );
        }

        tickRef.current += 1;
        timerRef.current = setTimeout(loop, 1);
        return;
      }

      timerRef.current = setTimeout(loop, Math.max(1, Math.floor(timeUntil)));
    };

    loop();
  }, []);

  // Start/Stop — depends only on primitives (prevents constant restarts)
  useEffect(() => {
    if (!audioReady) return;

    if (!enabled || !isRunning) {
      stop();
      return;
    }

    stop();
    startLoop();

    return stop;
  }, [audioReady, enabled, isRunning, stop, startLoop]);

  // Stop when backgrounding
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (prev === "active" && next.match(/inactive|background/)) {
        stop();
      }
    });

    return () => sub.remove();
  }, [stop]);

  return {
    isReady: audioReady && clickStatus?.isLoaded && accentStatus?.isLoaded,
    stop,
  };
}