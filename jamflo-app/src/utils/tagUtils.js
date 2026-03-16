export function normalizeTag(tag) {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ");
}

function uniqueTags(tags = []) {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

export function buildRoutineAutoTags(focusBlocks = []) {
  const tags = [];

  for (const block of focusBlocks || []) {
    for (const ex of block?.exercises || []) {
      if (ex?.category) tags.push(ex.category);

      const tempo = Number(ex?.tempo);
      if (Number.isFinite(tempo) && tempo > 0) tags.push("tempo");

    }
  }

  return uniqueTags(tags);
}

export function buildRoutineTags({ focusBlocks = [], userTags = [] }) {
  const autoTags = buildRoutineAutoTags(focusBlocks);
  const cleanUserTags = uniqueTags(userTags);
  const tags = uniqueTags([...autoTags, ...cleanUserTags]);

  return {
    autoTags,
    userTags: cleanUserTags,
    tags,
  };
}