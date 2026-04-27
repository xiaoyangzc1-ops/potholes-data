Page({
  data: {
    name: '',
    role: 'student'
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value.trim() });
  },

  onRoleChange(event) {
    this.setData({ role: event.detail.value });
  },

  onLogin() {
    const { name, role } = this.data;

    if (!name) {
      wx.showToast({ title: '请先输入昵称', icon: 'none' });
      return;
    }

    const user = {
      id: `mock_${Date.now()}`,
      name,
      role,
      openid: `openid_${Date.now()}`
    };

    wx.setStorageSync('currentUser', user);

    const app = getApp();
    app.globalData.currentUser = user;

    wx.reLaunch({ url: '/pages/index/index' });
  }
});
