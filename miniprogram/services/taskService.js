const STORAGE_KEY = 'weeklyTasks';

function listTasks() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

function saveTask(task) {
  const tasks = listTasks();
  const duplicated = tasks.find(
    (item) => item.team_id === task.team_id && item.week_start_date === task.week_start_date
  );

  if (duplicated) {
    return { ok: false, message: '该周任务已存在，不能覆盖历史周次' };
  }

  tasks.push(task);
  wx.setStorageSync(STORAGE_KEY, tasks);
  return { ok: true, data: task };
}

function getLatestTaskByTeam(teamId) {
  const tasks = listTasks().filter((item) => item.team_id === teamId);
  if (!tasks.length) return null;
  return tasks.sort((a, b) => b.created_at - a.created_at)[0];
}

module.exports = {
  listTasks,
  saveTask,
  getLatestTaskByTeam
};
