// pages/PLANT_A_CLEANING/login/login.js
Page({
  data: {
    userRole: ''
  },

  onLoad: function(options) {
    console.log('示例厂区A保洁登录页面加载');
    this.checkLoginStatus();
  },

  // 返回按钮点击事件
  goBack: function() {
    console.log('返回按钮被点击，返回到入口页面');

    // 使用navigateTo跳转到指定页面
    wx.navigateTo({
      url: '/pages/entry/index'
    });
  },

  // 已选择角色时直接回到该角色的工作页面。
  autoRedirect: function(role) {
    const rolePages = {
      admin: '/pages/PLANT_A_CLEANING/index/index',
      dispatcher: '/pages/PLANT_A_CLEANING/dispatcher/dispatcher',
      housekeeper: '/pages/PLANT_A_CLEANING/housekeeper-todo/housekeeper-todo'
    };
    const page = rolePages[role];
    if (page) {
      wx.reLaunch({ url: page });
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    try {
      const userRole = wx.getStorageSync('userRole_PLANT_A_CLEANING');
      if (userRole) {
        console.log('检测到已登录用户：', userRole);
        this.setData({ userRole: userRole });
        this.autoRedirect(userRole);
      }
    } catch (error) {
      console.error('读取用户信息失败：', error);
    }
  },

  // 管理员登录
  loginAsAdmin: function() {
    this.login('admin');
  },

  // 分配员登录
  loginAsDispatcher: function() {
    this.login('dispatcher');
  },

  // 维修员登录
  loginAsTechnician: function() {
    this.login('housekeeper');
  },

  // 通用登录方法
  login: function(role) {
    const that = this;

    // 显示加载动画
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 模拟登录过程
    setTimeout(() => {
      wx.hideLoading();

      // 保存用户角色到本地存储
      try {
        wx.setStorageSync('userRole_PLANT_A_CLEANING', role);
        wx.setStorageSync('loginTime_PLANT_A_CLEANING', new Date().getTime());

        console.log('示例厂区A保洁用户登录成功，角色：', role);

        // 显示登录成功提示
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: function() {
            // 根据角色跳转到不同页面
            let targetUrl = '';

            switch(role) {
              case 'admin':
                // 管理员跳转到主页面
                targetUrl = '/pages/PLANT_A_CLEANING/index/index';
                break;
              case 'dispatcher':
                // 分配员跳转到分配中心
                targetUrl = '/pages/PLANT_A_CLEANING/dispatcher/dispatcher';
                break;
              case 'housekeeper':
                // 保洁员直接跳转到专属任务页面
                targetUrl = '/pages/PLANT_A_CLEANING/housekeeper-todo/housekeeper-todo';
                break;
              default:
                targetUrl = '/pages/PLANT_A_CLEANING/index/index';
            }
            // 跳转到目标页面
            setTimeout(() => {
              wx.reLaunch({
                url: targetUrl
              });
            }, 1500);
          }
        });

      } catch (error) {
        console.error('保存示例厂区A保洁用户信息失败：', error);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    }, 1000);
  },

  onShow: function() {
    // 检查是否已登录
    try {
      const userRole = wx.getStorageSync('userRole');
      if (userRole) {
        console.log('检测到已登录用户：', userRole);
      }
    } catch (error) {
      console.error('读取用户信息失败：', error);
    }
  }
});
