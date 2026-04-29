const { getLatestTaskByTeam } = require('../../services/taskService');
const { upsertSchedule, getSchedule } = require('../../services/scheduleService');
const { buildHourlySlots } = require('../../utils/time');

const DAYS = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' },
  { key: 'saturday', label: '周六' },
  { key: 'sunday', label: '周日' }
];

Page({
  data: {
    user: null,
    team: null,
    task: null,
    isTargeted: false,
    days: DAYS,
    hourSlots: [],
    selectedMap: {}
  },

  onShow() {
    const app = getApp();
    const user = app.globalData.currentUser || wx.getStorageSync('currentUser');
    const team = app.globalData.currentTeam || wx.getStorageSync('currentTeam');

    if (!user || !team) {
      this.setData({ user, team, task: null });
      return;
    }

    const task = getLatestTaskByTeam(team.id);
    if (!task) {
      this.setData({ user, team, task: null });
      return;
    }

    const isTargeted = task.target_member_ids.includes(user.id);
    const hourSlots = buildHourlySlots(task.daily_start_time, task.daily_end_time);
    const existing = getSchedule(task._id, user.id);

    this.setData({
      user,
      team,
      task,
      isTargeted,
      hourSlots,
      selectedMap: existing?.selected_map || {}
    });
  },

  toggleSlot(e) {
    const { day, slot } = e.currentTarget.dataset;
    const key = `${day}_${slot}`;
    const selectedMap = { ...this.data.selectedMap };
    selectedMap[key] = !selectedMap[key];
    this.setData({ selectedMap });
  },

  onSave() {
    const { user, task, isTargeted, selectedMap } = this.data;

    if (!task || !isTargeted) {
      wx.showToast({ title: '本周无需填写', icon: 'none' });
      return;
    }

    const availability = DAYS.reduce((acc, day) => {
      const slots = Object.keys(selectedMap)
        .filter((k) => k.startsWith(`${day.key}_`) && selectedMap[k])
        .map((k) => k.replace(`${day.key}_`, ''))
        .map((slotText) => {
          const [start, end] = slotText.split('-');
          return { start, end };
        });

      acc[day.key] = slots;
      return acc;
    }, {});

    upsertSchedule({
      task_id: task._id,
      team_id: task.team_id,
      user_id: user.id,
      user_name: user.name,
      week_start_date: task.week_start_date,
      status: 'available',
      source_type: 'manual',
      selected_map: selectedMap,
      availability,
      submitted_at: Date.now()
    });

    wx.showToast({ title: '已保存', icon: 'success' });
  }
});
