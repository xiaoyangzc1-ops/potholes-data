const STORAGE_KEY = 'trainingSessions';

function listSessions() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

function saveSession(session) {
  const sessions = listSessions().filter((item) => item.task_id !== session.task_id);
  sessions.push(session);
  wx.setStorageSync(STORAGE_KEY, sessions);
  return { ok: true, data: session };
}

function getSessionByTask(taskId) {
  return listSessions().find((item) => item.task_id === taskId) || null;
}

function listSessionsByTeam(teamId) {
  return listSessions().filter((item) => item.team_id === teamId).sort((a, b) => b.published_at - a.published_at);
}

module.exports = {
  saveSession,
  getSessionByTask,
  listSessionsByTeam
};
