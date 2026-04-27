const STORAGE_KEY = 'weeklySchedules';

function listSchedules() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

function listSchedulesByTask(taskId) {
  return listSchedules().filter((item) => item.task_id === taskId);
}

function upsertSchedule(payload) {
  const schedules = listSchedules();
  const index = schedules.findIndex(
    (item) => item.task_id === payload.task_id && item.user_id === payload.user_id
  );

  if (index >= 0) {
    schedules[index] = {
      ...schedules[index],
      ...payload,
      updated_at: Date.now()
    };
  } else {
    schedules.push({
      ...payload,
      created_at: Date.now(),
      updated_at: Date.now()
    });
  }

  wx.setStorageSync(STORAGE_KEY, schedules);
  return { ok: true };
}

function getSchedule(taskId, userId) {
  return listSchedules().find((item) => item.task_id === taskId && item.user_id === userId) || null;
}

module.exports = {
  upsertSchedule,
  getSchedule,
  listSchedulesByTask
};
