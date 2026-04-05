import Session from '../models/Session.model.js';

/** Map GeneratedContent.type (and URL segment) to Session.mode enum */
const SESSION_MODE_MAP = {
  notes: 'notes',
  report: 'notes',
  ppt: 'notes',
  revision_sheet: 'revision',
  mock_paper: 'exam',
  quiz: 'quiz',
  exam: 'exam',
  revision: 'revision'
};

export const startSession = async (req, res) => {
  try {
    const { subjectId, mode, contentId } = req.body;
    const raw = mode || 'notes';
    const sessionMode = SESSION_MODE_MAP[raw] || 'notes';

    const session = new Session({
      userId: req.userId,
      subjectId: subjectId || undefined,
      mode: sessionMode,
      startTime: new Date(),
      contentId: contentId || undefined
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.endTime = new Date();
    session.duration = session.endTime - session.startTime;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const { subjectId, limit = 50 } = req.query;
    const query = { userId: req.userId };
    if (subjectId) query.subjectId = subjectId;

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit, 10))
      .populate('subjectId', 'name')
      .populate('contentId', 'title type');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

