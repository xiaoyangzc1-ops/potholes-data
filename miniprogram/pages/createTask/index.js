const { getMonday, toDateString, getWeekRange } = require('../../utils/date');
const { saveTask } = require('../../services/taskService');

Page({
  data: {
    isCoach: false,
    user: null,
    team: null,
    members: [],
    weekStartDate: '',
    dailyStartTime: '08:00',
    dailyEndTime: '23:00',
    minTrainingDuration: '60',
    selectedMemberIds: [],
    selectedMemberIdsMap: {}
  },

  onShow() {
    const app = getApp();
    const user = app.globalData.currentUser || wx.getStorageSync('currentUser');
    const team = app.globalData.currentTeam || wx.getStorageSync('currentTeam');
    const monday = toDateString(getMonday());
    const members = team?.members || [];
    const selectedMemberIds = members.map((item) => item.id);

    this.setData({
      user,
      team,
      isCoach: !!user && user.role === 'coach',
      members,
      weekStartDate: monday,
      selectedMemberIds,
      selectedMemberIdsMap: selectedMemberIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {})
    });
  },

  onWeekStartDateInput(e) {
    this.setData({ weekStartDate: e.detail.value.trim() });
  },

  onDailyStartInput(e) {
    this.setData({ dailyStartTime: e.detail.value.trim() });
  },

  onDailyEndInput(e) {
    this.setData({ dailyEndTime: e.detail.value.trim() });
  },

  onMinDurationInput(e) {
    this.setData({ minTrainingDuration: e.detail.value.trim() });
  },

  onTargetMembersChange(e) {
    const selectedMemberIds = e.detail.value;
    this.setData({
      selectedMemberIds,
      selectedMemberIdsMap: selectedMemberIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {})
    });
  },

  onCreateTask() {
    const {
      user,
      team,
      weekStartDate,
      dailyStartTime,
      dailyEndTime,
      minTrainingDuration,
      selectedMemberIds
    } = this.data;

    if (!user || user.role !== 'coach') {
      wx.showToast({ title: '仅教练可创建任务', icon: 'none' });
      return;
    }

    if (!team) {
      wx.showToast({ title: '请先创建训练组', icon: 'none' });
      return;
    }

    if (!weekStartDate || !selectedMemberIds.length) {
      wx.showToast({ title: '请完善周次和成员', icon: 'none' });
      return;
    }

    const weekRange = getWeekRange(weekStartDate);

    const task = {
      _id: `task_${Date.now()}`,
      team_id: team.id,
      ...weekRange,
      target_member_ids: selectedMemberIds,
      time_granularity: 60,
      daily_start_time: dailyStartTime,
      daily_end_time: dailyEndTime,
      min_training_duration: Number(minTrainingDuration) || 60,
      status: 'collecting',
      created_by: user.id,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    const result = saveTask(task);
    if (!result.ok) {
      wx.showToast({ title: result.message, icon: 'none' });
      return;
    }

    wx.showToast({ title: '任务创建成功', icon: 'success' });
    wx.navigateBack();
  }
});
