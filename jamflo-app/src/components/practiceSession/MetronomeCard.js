import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";

export function MetronomeCard({ bpm, setBpm, beats, setBeats, isRunning, onStop }) {
  const presets = [60, 80, 120, 160];

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.sectionTitle}>Metronome</Text>

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
        <Text style={commonStyles.helperText}>Paused controls are hidden while practicing.</Text>
      )}

      <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
        <Text style={styles.stopBtnText}>■ Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
