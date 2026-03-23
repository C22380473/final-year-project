import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const PRESETS = [60, 80, 120, 160];
const MIN_BPM = 40;
const MAX_BPM = 240;

export function MetronomeCard({
  bpm,
  setBpm,
  beatsPerBar,
  setBeatsPerBar,
  currentBeat0,
  isRunning,
  onStart,
  onStop,
  metronomeEnabled,
  setMetronomeEnabled,
}) {
  const bpmSafe = useMemo(
    () => clamp(Number(bpm) || 60, MIN_BPM, MAX_BPM),
    [bpm]
  );

  const currentBeatNumber = useMemo(() => {
    const bpb = Math.max(1, Number(beatsPerBar) || 4);
    return (((Number(currentBeat0) || 0) % bpb) + bpb) % bpb + 1;
  }, [currentBeat0, beatsPerBar]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Metronome</Text>

        <TouchableOpacity
          onPress={() => setMetronomeEnabled((v) => !v)}
          style={[
            styles.toggle,
            metronomeEnabled ? styles.toggleOn : styles.toggleOff,
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              metronomeEnabled ? styles.toggleTextOn : styles.toggleTextOff,
            ]}
          >
            {metronomeEnabled ? "On" : "Off"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.beatRow}>
        {[1, 2, 3, 4].map((n) => {
          const enabledBeat = n <= beatsPerBar;
          const active =
            metronomeEnabled &&
            isRunning &&
            enabledBeat &&
            n === currentBeatNumber;

          return (
            <View
              key={n}
              style={[
                styles.beatCircle,
                !enabledBeat && styles.beatCircleDisabled,
                active && styles.beatCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.beatText,
                  !enabledBeat && styles.beatTextDisabled,
                  active && styles.beatTextActive,
                ]}
              >
                {n}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.bpmValue}>{bpmSafe}</Text>
      <Text style={styles.bpmLabel}>BPM</Text>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderCap}>{MIN_BPM}</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_BPM}
          maximumValue={MAX_BPM}
          step={1}
          value={bpmSafe}
          onValueChange={(value) => setBpm(Math.round(value))}
          minimumTrackTintColor="#0ea5e9"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#0ea5e9"
        />
        <Text style={styles.sliderCap}>{MAX_BPM}</Text>
      </View>

      <View style={styles.presetRow}>
        {PRESETS.map((preset) => {
          const active = bpmSafe === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[styles.presetButton, active && styles.presetButtonActive]}
              onPress={() => setBpm(preset)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.presetText, active && styles.presetTextActive]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bpbRow}>
        <Text style={styles.bpbLabel}>Beats / bar</Text>
        <View style={styles.bpbOptions}>
          {[1, 2, 3, 4].map((b) => {
            const active = b === beatsPerBar;
            return (
              <TouchableOpacity
                key={b}
                style={[styles.bpbPill, active && styles.bpbPillActive]}
                onPress={() => setBeatsPerBar(b)}
                activeOpacity={0.8}
              >
                <Text style={[styles.bpbText, active && styles.bpbTextActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          isRunning ? styles.stopButton : styles.startButton,
          !metronomeEnabled && styles.disabledButton,
        ]}
        onPress={isRunning ? onStop : onStart}
        disabled={!metronomeEnabled}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>
          {isRunning ? "■ Stop" : "Start Metronome"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 6,
    marginTop: 8,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  toggle: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
  },
  toggleOn: {
    backgroundColor: "#eef9ff",
    borderColor: "#0ea5e9",
  },
  toggleOff: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextOn: {
    color: "#0ea5e9",
  },
  toggleTextOff: {
    color: "#64748b",
  },

  beatRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  beatCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  beatCircleDisabled: {
    opacity: 0.35,
  },
  beatCircleActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  beatText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  beatTextDisabled: {
    color: "#94a3b8",
  },
  beatTextActive: {
    color: "#fff",
  },

  bpmValue: {
    textAlign: "center",
    fontSize: 42,
    fontWeight: "800",
    color: "#0b1736",
    lineHeight: 46,
  },
  bpmLabel: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
    marginBottom: 8,
  },

  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  sliderCap: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },

  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  presetButtonActive: {
    borderColor: "#0ea5e9",
    backgroundColor: "#eef9ff",
  },
  presetText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  presetTextActive: {
    color: "#0ea5e9",
  },

  bpbRow: {
    marginBottom: 14,
  },
  bpbLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
  },
  bpbOptions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  bpbPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bpbPillActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  bpbText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94a3b8",
  },
  bpbTextActive: {
    color: "#fff",
  },

  actionButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#1669e8",
  },
  stopButton: {
    backgroundColor: "#a4373a",
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});