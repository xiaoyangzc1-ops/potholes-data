App({
  globalData: {
    currentUser: null,
    currentTeam: null
  },

  onLaunch() {
    const savedUser = wx.getStorageSync('currentUser');
    const savedTeam = wx.getStorageSync('currentTeam');

    if (savedUser) {
      this.globalData.currentUser = savedUser;
    }

    if (savedTeam) {
      this.globalData.currentTeam = savedTeam;
    }
  }
});
