const { getLatestTaskByTeam } = require('../../services/taskService');
const { listSchedulesByTask } = require('../../services/scheduleService');
const { generateWeekDates, calculateRecommendedTrainingTimes } = require('../../utils/schedule');

Page({
  data: {
    task: null,
    list: []
  },

  onShow() {
    const team = getApp().globalData.currentTeam || wx.getStorageSync('currentTeam');
    if (!team) return;
    const task = getLatestTaskByTeam(team.id);
    if (!task) return;

    const schedules = listSchedulesByTask(task._id);
    const weekDates = generateWeekDates(task.week_start_date);
    const list = calculateRecommendedTrainingTimes(schedules, task.target_member_ids, weekDates);

    this.setData({ task, list });
  },

  onSelect(e) {
    const item = this.data.list[e.currentTarget.dataset.index];
    wx.setStorageSync('selectedRecommendation', item);
    wx.navigateTo({ url: '/pages/publishTraining/index' });
  }
});
