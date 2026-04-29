const { getLatestTaskByTeam } = require('../../services/taskService');
const { getSessionByTask } = require('../../services/trainingService');

Page({
  data: {
    user: null,
    team: null,
    task: null,
    publishedSession: null
  },

  onShow() {
    const app = getApp();
    const user = app.globalData.currentUser || wx.getStorageSync('currentUser');
    const team = app.globalData.currentTeam || wx.getStorageSync('currentTeam');
    const task = team ? getLatestTaskByTeam(team.id) : null;
    const publishedSession = task ? getSessionByTask(task._id) : null;

    this.setData({ user, team: team || null, task, publishedSession });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  goTeam() {
    wx.navigateTo({ url: '/pages/team/index' });
  },

  goCreateTask() {
    wx.navigateTo({ url: '/pages/createTask/index' });
  },

  goFillSchedule() {
    wx.navigateTo({ url: '/pages/fillSchedule/index' });
  },

  goSummary() {
    wx.navigateTo({ url: '/pages/summary/index' });
  },

  goRecommendations() {
    wx.navigateTo({ url: '/pages/recommendations/index' });
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/publishTraining/index' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' });
  }
});
