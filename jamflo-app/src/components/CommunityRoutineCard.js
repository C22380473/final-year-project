import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CommunityRoutineCard = ({
  routine,
  onView,
  onSave,
  onPressAuthor,

  avgRating = 0,
  ratingCount = 0,

  userRating = 0,
  onRate,

  comments = [],
  newComment = "",
  onChangeComment,
  onPostComment,

  onLikeComment,
  onDislikeComment,

  currentUserId,
  onEditComment,     // (commentId, nextText) => Promise<void>
  onDeleteComment,   // (commentId) => Promise<void>
}) => {
  const focusBlocks = routine.focusBlocks || [];

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEdit = (c) => {
    const id = c.commentId || c.id;
    setEditingId(id);
    setEditingText(String(c.text || ""));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    const clean = editingText.trim();
    if (!editingId || !clean) return;
    await onEditComment?.(editingId, clean);
    cancelEdit();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{routine.name}</Text>

      <View style={styles.inlineRow}>
        <TouchableOpacity onPress={() => onPressAuthor?.(routine.authorId || routine.userId)}>
          <View style={styles.inlineItem}>
            <Ionicons name="person" size={16} color="#218ED5" />
            <Text style={styles.inlineText}>{routine.authorName || "Anonymous"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inlineItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.inlineText}>{routine.totalDuration || 0} mins</Text>
        </View>

        <View style={styles.inlineItem}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={styles.inlineText}>
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            {ratingCount > 0 ? ` (${ratingCount})` : ""}
          </Text>
        </View>
      </View>

      {!!routine.description && (
        <Text style={styles.description} numberOfLines={2}>
          {routine.description}
        </Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Focus Blocks</Text>
      <View style={styles.blocksList}>
        {focusBlocks?.length ? (
          focusBlocks.map((b, idx) => (
            <View key={b.blockId || `${idx}`} style={styles.blockPill}>
              <View style={styles.blockDot} />
              <Text style={styles.blockText} numberOfLines={1}>
                {b.name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noBlocksText}>No focus blocks</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.btnHalf, styles.btnLeft, styles.saveBtn]} onPress={onSave}>
          <Text style={styles.saveBtnText}>Save a Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnHalf, styles.btnRight, styles.viewDetailsBtn]} onPress={onView}>
          <Text style={styles.viewDetailsBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { marginTop: 16 }]} />

      <Text style={styles.sectionTitle}>Comments</Text>

      <View style={styles.commentsBox}>
        {comments?.length ? (
          <ScrollView style={styles.commentsScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {comments.slice(0, 6).map((c, idx) => {
              const id = c.commentId || c.id || `c-${idx}`;
              const isMine = currentUserId && c.authorId === currentUserId;
              const isEditing = editingId === id;

              return (
                <View key={id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.authorName || "User"}</Text>
                    {!!c.createdAtText && <Text style={styles.commentDate}>{c.createdAtText}</Text>}
                  </View>

                  {!isEditing ? (
                    <Text style={styles.commentText}>{c.text}</Text>
                  ) : (
                    <View style={{ marginTop: 6 }}>
                      <TextInput
                        value={editingText}
                        onChangeText={setEditingText}
                        style={styles.editInput}
                        multiline
                      />
                      <View style={styles.editActionsRow}>
                        <TouchableOpacity style={[styles.editBtn, styles.editCancel]} onPress={cancelEdit}>
                          <Text style={styles.editCancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.editBtn, styles.editSave]} onPress={saveEdit}>
                          <Text style={styles.editSaveText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.commentFooter}>
                    <TouchableOpacity style={styles.reactBtn} onPress={() => onLikeComment?.(id)}>
                      <Ionicons name="thumbs-up-outline" size={16} color="#218ED5" />
                      <Text style={styles.reactCount}>{Number(c.likeCount || 0)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.reactBtn} onPress={() => onDislikeComment?.(id)}>
                      <Ionicons name="thumbs-down-outline" size={16} color="#777" />
                      <Text style={styles.reactCount}>{Number(c.dislikeCount || 0)}</Text>
                    </TouchableOpacity>

                    {isMine && !isEditing && (
                      <View style={styles.ownerBtns}>
                        <TouchableOpacity onPress={() => startEdit(c)} style={styles.ownerBtn}>
                          <Text style={styles.ownerBtnTextBlue}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteComment?.(id)} style={styles.ownerBtn}>
                          <Text style={styles.ownerBtnTextRed}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.commentsEmpty}>No comments yet.</Text>
        )}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Add Comment..."
        value={newComment}
        onChangeText={onChangeComment}
      />

      <TouchableOpacity style={styles.postBtn} onPress={onPostComment}>
        <Text style={styles.postText}>Post Comment</Text>
      </TouchableOpacity>

      <View style={[styles.divider, { marginTop: 16 }]} />

      {typeof onRate === "function" && (
      <View style={styles.ratingRow}>
        <Text style={styles.rateLabel}>Rate:</Text>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => onRate?.(n)} style={styles.starBtn}>
            <Ionicons
              name={n <= (userRating || 0) ? "star" : "star-outline"}
              size={22}
              color="#FFC107"
            />
          </TouchableOpacity>
        ))}
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#111" },

  inlineRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  inlineItem: { flexDirection: "row", alignItems: "center", marginRight: 14 },
  inlineText: { marginLeft: 4, fontSize: 14, color: "#666", fontWeight: "600" },

  description: { marginTop: 6, fontSize: 14, color: "#666", lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#F1F1F1", marginVertical: 12 },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 6 },

  blocksList: { marginBottom: 4 },
  blockPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  blockDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: "#218ED5", marginRight: 8 },
  blockText: { fontSize: 15, fontWeight: "600", color: "#222" },
  noBlocksText: { color: "#999" },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btnHalf: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1 },
  btnLeft: { marginRight: 8 },
  btnRight: { marginLeft: 8 },

  saveBtn: { backgroundColor: "#1197E6", borderColor: "#1197E6" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  viewDetailsBtn: { backgroundColor: "#fff", borderColor: "#1197E6" },
  viewDetailsBtnText: { color: "#1197E6", fontSize: 15, fontWeight: "700" },

  commentsBox: { backgroundColor: "#F7F7F7", borderRadius: 12, padding: 10 },
  commentsScroll: { maxHeight: 160 },
  commentsEmpty: { color: "#999", fontSize: 14 },

  commentInput: {
    marginTop: 8,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  postBtn: {
    marginTop: 8,
    backgroundColor: "#13B4B0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  postText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  commentItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  commentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  commentAuthor: { fontSize: 14, fontWeight: "800", color: "#111" },
  commentDate: { fontSize: 12, color: "#777", fontWeight: "600" },

  commentText: { fontSize: 14, color: "#222", marginTop: 2 },

  commentFooter: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },

  reactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#F7F7F7",
  },
  reactCount: { fontSize: 13, fontWeight: "700", color: "#555" },

  ownerBtns: { flexDirection: "row", gap: 10, marginLeft: 6 },
  ownerBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  ownerBtnTextBlue: { color: "#1197E6", fontWeight: "800" },
  ownerBtnTextRed: { color: "#D11A2A", fontWeight: "800" },

  editInput: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    minHeight: 44,
  },
  editActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  editBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  editCancel: { backgroundColor: "#EDEDED" },
  editSave: { backgroundColor: "#1197E6" },
  editCancelText: { fontWeight: "800", color: "#333" },
  editSaveText: { fontWeight: "800", color: "#fff" },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  rateLabel: { fontSize: 14, fontWeight: "700", color: "#444", marginRight: 6 },
  starBtn: { paddingHorizontal: 1 },
});