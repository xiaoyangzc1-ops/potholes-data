const { listTasks } = require('../../services/taskService');
const { listSessionsByTeam } = require('../../services/trainingService');

Page({
  data: {
    tasks: [],
    sessions: []
  },

  onShow() {
    const team = getApp().globalData.currentTeam || wx.getStorageSync('currentTeam');
    if (!team) return;
    const tasks = listTasks().filter((item) => item.team_id === team.id).sort((a, b) => b.created_at - a.created_at);
    const sessions = listSessionsByTeam(team.id);
    this.setData({ tasks, sessions });
  }
});
