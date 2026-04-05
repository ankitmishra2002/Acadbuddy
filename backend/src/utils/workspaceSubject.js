import Subject from '../models/Subject.model.js';

const DEFAULT_WORKSPACE_NAME = 'My workspace';

/**
 * Resolves a subject to attach GeneratedContent to.
 * Uses explicit subjectId when valid; otherwise the user's oldest subject;
 * otherwise creates a default "My workspace" subject.
 */
export async function resolveSubjectForGeneratedContent(userId, subjectId) {
  if (subjectId) {
    const s = await Subject.findOne({ _id: subjectId, userId });
    if (s) return s;
  }
  let subject = await Subject.findOne({ userId }).sort({ createdAt: 1 });
  if (subject) return subject;
  subject = new Subject({
    userId,
    name: DEFAULT_WORKSPACE_NAME,
    code: '',
  });
  await subject.save();
  return subject;
}
