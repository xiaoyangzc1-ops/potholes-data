const { getLatestTaskByTeam } = require('../../services/taskService');
const { listSchedulesByTask } = require('../../services/scheduleService');
const {
  WEEK_DAYS,
  generateWeekDates,
  calculateCommonFreeTime,
  calculateRecommendedTrainingTimes
} = require('../../utils/schedule');

function slotText(slots) {
  if (!slots || !slots.length) return '无';
  return slots.map((s) => `${s.start}-${s.end}`).join('，');
}

Page({
  data: {
    task: null,
    weekDates: [],
    rows: [],
    commonCells: [],
    recommendCells: [],
    submittedCount: 0,
    targetCount: 0,
    unsubmittedNames: []
  },

  onShow() {
    const team = getApp().globalData.currentTeam || wx.getStorageSync('currentTeam');
    if (!team) return;
    const task = getLatestTaskByTeam(team.id);
    if (!task) {
      this.setData({ task: null });
      return;
    }

    const weekDates = generateWeekDates(task.week_start_date);
    const schedules = listSchedulesByTask(task._id);
    const targetMembers = (team.members || []).filter((m) => task.target_member_ids.includes(m.id));

    const byUser = schedules.reduce((acc, s) => ({ ...acc, [s.user_id]: s }), {});
    const rows = targetMembers.map((member) => {
      const schedule = byUser[member.id];
      const cells = WEEK_DAYS.map((d) => {
        if (!schedule) return '未填写';
        return slotText(schedule.availability?.[d.key]);
      });
      return { name: member.name, cells };
    });

    const common = calculateCommonFreeTime(schedules);
    const recommended = calculateRecommendedTrainingTimes(schedules, task.target_member_ids, weekDates);

    const commonCells = WEEK_DAYS.map((d) => slotText(common[d.key]));

    const recommendCells = WEEK_DAYS.map((d) => {
      const item = recommended.find((x) => x.day_key === d.key);
      return item ? `${item.start}-${item.end}，${item.available_count}/${item.total_count}人` : '无';
    });

    const submittedIds = schedules.map((s) => s.user_id);
    const unsubmittedNames = targetMembers
      .filter((m) => !submittedIds.includes(m.id))
      .map((m) => m.name);

    this.setData({
      task,
      weekDates,
      rows,
      commonCells,
      recommendCells,
      submittedCount: schedules.length,
      targetCount: task.target_member_ids.length,
      unsubmittedNames
    });
  },

  goRecommendations() {
    wx.navigateTo({ url: '/pages/recommendations/index' });
  }
});
