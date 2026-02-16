import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../../styles/common";

export function NotesCard({ notes, noteText, setNoteText, onSave, onDelete, onEdit, saving }) {
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
    <View style={commonStyles.card}>
      <Text style={commonStyles.sectionTitle}>Routine Notes</Text>
      <Text style={commonStyles.helperText}>
        {"Write reflections for next time."}
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
             
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noteLine}>• No notes yet.</Text>
        )}
      </View>
  
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
  
    </View>
  );
}

const styles = StyleSheet.create({
  notesBox: {
    marginTop: 14,
    minHeight: 160,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  noteLine: { color: "#0f172a", fontWeight: "700", marginBottom: 10 },

  noteInput: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontWeight: "700",
    color: "#0f172a",
  },

  primaryBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#14b8a6",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
