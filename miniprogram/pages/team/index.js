function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

Page({
  data: {
    user: null,
    team: null,
    teamName: '',
    inviteCode: ''
  },

  onShow() {
    const app = getApp();
    const user = app.globalData.currentUser || wx.getStorageSync('currentUser');
    const team = app.globalData.currentTeam || wx.getStorageSync('currentTeam');

    this.setData({ user, team: team || null });
  },

  onTeamNameInput(event) {
    this.setData({ teamName: event.detail.value.trim() });
  },

  onInviteCodeInput(event) {
    this.setData({ inviteCode: event.detail.value.trim().toUpperCase() });
  },

  createTeam() {
    const { user, teamName } = this.data;

    if (!user || user.role !== 'coach') {
      wx.showToast({ title: '仅教练可创建训练组', icon: 'none' });
      return;
    }

    if (!teamName) {
      wx.showToast({ title: '请先输入训练组名称', icon: 'none' });
      return;
    }

    const team = {
      id: `team_${Date.now()}`,
      team_name: teamName,
      coach_id: user.id,
      member_ids: [user.id],
      members: [{ id: user.id, name: user.name, role: user.role }],
      invite_code: generateInviteCode()
    };

    wx.setStorageSync('currentTeam', team);

    const app = getApp();
    app.globalData.currentTeam = team;

    wx.showToast({ title: '训练组创建成功', icon: 'success' });
    this.setData({ team, inviteCode: team.invite_code });
  },

  joinTeam() {
    const { user, inviteCode } = this.data;
    const currentTeam = wx.getStorageSync('currentTeam');

    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!inviteCode) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }

    if (!currentTeam || currentTeam.invite_code !== inviteCode) {
      wx.showToast({ title: '邀请码无效（当前为模拟）', icon: 'none' });
      return;
    }

    const memberSet = new Set(currentTeam.member_ids);
    memberSet.add(user.id);

    const members = currentTeam.members || [];
    const exists = members.find((m) => m.id === user.id);
    const nextMembers = exists ? members : [...members, { id: user.id, name: user.name, role: user.role }];

    const team = {
      ...currentTeam,
      member_ids: Array.from(memberSet),
      members: nextMembers
    };

    wx.setStorageSync('currentTeam', team);
    const app = getApp();
    app.globalData.currentTeam = team;

    wx.showToast({ title: '加入成功', icon: 'success' });
    this.setData({ team });
  }
});
