import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";import Slider from "@react-native-community/slider";
import { commonStyles } from "../../styles/common";

const clamp   = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const PRESETS = [60, 80, 120, 160];
const MIN_BPM = 40;
const MAX_BPM = 240;

export function MetronomeCard({
  bpm,
  setBpm,
  beatsPerBar,
  setBeatsPerBar,
  currentBeat0,        // 0-based beat index from useMetronome
  isRunning,
  onStop,
  metronomeEnabled,
  setMetronomeEnabled,
}) {
  const bpmSafe = useMemo(
    () => clamp(Number(bpm) || 120, MIN_BPM, MAX_BPM),
    [bpm],
  );

  // 0-based → 1-based, wrapped to beatsPerBar
  const currentBeatNumber = useMemo(() => {
    const bpb = Math.max(1, Number(beatsPerBar) || 4);
    return (((Number(currentBeat0) || 0) % bpb) + bpb) % bpb + 1;
  }, [currentBeat0, beatsPerBar]);

  return (
    <View style={commonStyles.card}>

      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <Text style={commonStyles.sectionTitle}>Metronome</Text>
        <TouchableOpacity
          onPress={() => setMetronomeEnabled((v) => !v)}
          style={[styles.toggle, metronomeEnabled ? styles.toggleOn : styles.toggleOff]}
        >
          <Text style={[styles.toggleText, metronomeEnabled && styles.toggleTextOn]}>
            {metronomeEnabled ? "On" : "Off"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Beat indicators ── */}
      <View style={styles.beatRow}>
        {[1, 2, 3, 4].map((n) => {
          const withinBar = n <= (beatsPerBar ?? 4);
          const active    = metronomeEnabled && isRunning && withinBar && n === currentBeatNumber;
          return (
            <View
              key={n}
              style={[
                styles.beatCircle,
                !withinBar && styles.beatCircleOut,
                active     && styles.beatCircleActive,
              ]}
            >
              <Text style={[
                styles.beatLabel,
                !withinBar && styles.beatLabelOut,
                active     && styles.beatLabelActive,
              ]}>
                {n}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ── BPM display ── */}
      <Text style={styles.bpmValue}>{bpmSafe}</Text>
      <Text style={styles.bpmUnit}>BPM</Text>

      {/* ── Slider ── */}
      <View style={styles.sliderRow}>
        <Text style={styles.sliderCap}>{MIN_BPM}</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_BPM}
          maximumValue={MAX_BPM}
          step={1}
          value={bpmSafe}
          onValueChange={(v) => setBpm(Math.round(v))}
          disabled={false}
          minimumTrackTintColor="#0ea5e9"
          maximumTrackTintColor="#e2e8f0"
          thumbTintColor="#0ea5e9"
        />
        <Text style={styles.sliderCap}>{MAX_BPM}</Text>
      </View>

      {/* ── Presets ── */}
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setBpm(p)}
              style={[styles.presetBtn, bpmSafe === p && styles.presetBtnActive]}
            >
              <Text style={[styles.presetText, bpmSafe === p && styles.presetTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* ── Beats-per-bar (hidden while running to reduce clutter) ── */}
      {!isRunning && (
        <View style={styles.bpbRow}>
          <Text style={styles.bpbLabel}>Beats / bar</Text>
          {[1, 2, 3, 4].map((b) => {
            const active = b === beatsPerBar;
            return (
              <TouchableOpacity
                key={b}
                onPress={() => setBeatsPerBar(b)}
                style={[styles.bpbPill, active && styles.bpbPillActive]}
              >
                <Text style={[styles.bpbText, active && styles.bpbTextActive]}>{b}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Stop button ── */}
      <TouchableOpacity style={styles.stopBtn} onPress={onStop} activeOpacity={0.8}>
        <Text style={styles.stopBtnText}>■  Stop</Text>
      </TouchableOpacity>

    </View>
  );
}

/* ─────────────────────────── styles ─────────────────────────────────────── */
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  // Toggle
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  toggleOn:      { borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.10)" },
  toggleOff:     { borderColor: "#94a3b8", backgroundColor: "rgba(148,163,184,0.10)" },
  toggleText:    { fontWeight: "700", fontSize: 13, color: "#64748b" },
  toggleTextOn:  { color: "#0ea5e9" },

  // Beat circles
  beatRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 18,
  },
  beatCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  beatCircleOut:    { opacity: 0.28 },
  beatCircleActive: { backgroundColor: "#3b6ee0", borderColor: "#3b6ee0" },
  beatLabel:        { fontWeight: "800", fontSize: 16, color: "#334155" },
  beatLabelOut:     { color: "#94a3b8" },
  beatLabelActive:  { color: "#fff" },

  // BPM
  bpmValue: {
    textAlign: "center",
    fontSize: 60,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -2,
    lineHeight: 66,
  },
  bpmUnit: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 10,
  },

  // Slider
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  slider:     { flex: 1, height: 40 },
  sliderCap:  { fontSize: 12, color: "#94a3b8", fontWeight: "700", minWidth: 28, textAlign: "center" },

  lockHint: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },

  // Presets
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  presetBtnActive:  { borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.07)" },
  presetText:       { fontWeight: "700", color: "#334155", fontSize: 14 },
  presetTextActive: { color: "#0ea5e9" },

  // Beats-per-bar
  bpbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  bpbLabel: { flex: 1, fontWeight: "700", color: "#64748b", fontSize: 13 },
  bpbPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  bpbPillActive: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  bpbText:       { fontWeight: "800", fontSize: 14, color: "#94a3b8" },
  bpbTextActive: { color: "#fff" },

  // Stop
  stopBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#8b3a3a",
    alignItems: "center",
  },
  stopBtnText: { color: "#fff", fontWeight: "900", fontSize: 17, letterSpacing: 0.5 },
});