const { getLatestTaskByTeam } = require('../../services/taskService');
const { saveSession, getSessionByTask } = require('../../services/trainingService');

Page({
  data: {
    task: null,
    selected: null,
    location: '',
    note: '',
    published: null
  },

  onShow() {
    const team = getApp().globalData.currentTeam || wx.getStorageSync('currentTeam');
    if (!team) return;
    const task = getLatestTaskByTeam(team.id);
    if (!task) return;
    const selected = wx.getStorageSync('selectedRecommendation') || null;
    const published = getSessionByTask(task._id);
    this.setData({ task, selected, published });
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value.trim() });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value.trim() });
  },

  onPublish() {
    const { task, selected, location, note } = this.data;
    if (!task || !selected) {
      wx.showToast({ title: '请先选择推荐时间', icon: 'none' });
      return;
    }

    const user = getApp().globalData.currentUser || wx.getStorageSync('currentUser');
    if (!user || user.role !== 'coach') {
      wx.showToast({ title: '仅教练可发布训练', icon: 'none' });
      return;
    }

    const session = {
      _id: `training_${Date.now()}`,
      task_id: task._id,
      team_id: task.team_id,
      week_start_date: task.week_start_date,
      date: selected.date,
      weekday: selected.weekday,
      start_time: selected.start,
      end_time: selected.end,
      location: location || '待定',
      note,
      selected_member_ids: selected.available_member_ids,
      unavailable_member_ids: selected.unavailable_member_ids,
      created_by: user?.id || 'unknown',
      published_at: Date.now(),
      updated_at: Date.now()
    };

    saveSession(session);
    wx.showToast({ title: '发布成功', icon: 'success' });
    this.setData({ published: session });
  }
});
