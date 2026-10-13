// pages/PLANT_B_REPAIR/dispatcher/dispatcher.js
Page({
  data: {
    userInfo: {
      name: '分配员',
      role: 'dispatcher'
    },
    loginTime: '',
    taskStats: {
      pending: 0,
      assigned: 0, // 新增：已分配任务统计
      inProgress: 0,
      completed: 0,
      unfinished: 0
    },
    storageKey: 'todos_PLANT_B_REPAIR'
  },

  onLoad: function(options) {
    this.loadUserInfo();
    this.setLoginTime();
    this.loadTaskStats();
  },

  onShow: function() {
    this.loadTaskStats();
  },

  // 加载用户信息
  loadUserInfo: function() {
    try {
      const userRole = wx.getStorageSync('userRole_PLANT_B_REPAIR');
      if (userRole !== 'dispatcher') {
        wx.showToast({
          title: '请以分配员身份登录',
          icon: 'none',
          success: () => {
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/PLANT_B_REPAIR/login/login'
              });
            }, 1500);
          }
        });
        return;
      }
      
      // 可以扩展获取更多用户信息
      const userInfo = wx.getStorageSync('userInfo_PLANT_B_REPAIR');
      if (userInfo && userInfo.name) {
        this.setData({
          'userInfo.name': userInfo.name
        });
      }
      
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 设置登录时间
  setLoginTime: function() {
    try {
      const loginTime = wx.getStorageSync('loginTime_PLANT_B_REPAIR');
      if (loginTime) {
        const date = new Date(loginTime);
        const timeStr = date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        this.setData({
          loginTime: timeStr
        });
      } else {
        // 如果没有存储的登录时间，使用当前时间
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        this.setData({
          loginTime: timeStr
        });
      }
    } catch (error) {
      console.error('设置登录时间失败:', error);
    }
  },

  // 加载任务统计数据
  loadTaskStats: function() {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      
      // 统计各种状态的任务数量
      // 待分配任务：没有分配人的pending任务
      const pendingTasks = todos.filter(task => 
        task.status === 'pending' && (!task.assignee || task.assignee === '')
      );
      
      // 已分配任务：有分配人但未开始（isStarted为false）
      const assignedTasks = todos.filter(task => 
        task.assignee && task.assignee !== '' && 
        task.status === 'pending' && 
        !task.isStarted
      );
      
      // 进行中任务：状态为in-progress或已开始但未完成
      const inProgressTasks = todos.filter(task => 
        task.status === 'in-progress' || 
        (task.assignee && task.assignee !== '' && task.isStarted && task.status !== 'completed' && task.status !== 'unfinished')
      );
      
      // 已完成任务
      const completedTasks = todos.filter(task => 
        task.status === 'completed'
      );
      
      // 未完成任务
      const unfinishedTasks = todos.filter(task => 
        task.status === 'unfinished'
      );

      const stats = {
        pending: pendingTasks.length,
        assigned: assignedTasks.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length,
        unfinished: unfinishedTasks.length  // 新增
      };

      this.setData({
        taskStats: stats
      });

    } catch (error) {
      console.error('加载任务统计数据失败:', error);
    }
  },

  // 跳转到任务分配中心
  goToTaskAssign: function() {
    wx.navigateTo({
      url: '/pages/PLANT_B_REPAIR/task-assign/task-assign'
    });
  },

  // 跳转到维修记录页面
  goToHistory: function() {
    wx.navigateTo({
      url: '/pages/PLANT_B_REPAIR/history/history'
    });
  },

  // 跳转到维修统计页面
  goToStatistics: function() {
    wx.navigateTo({
      url: '/pages/PLANT_B_REPAIR/statistics/statistics'
    });
  },

  // 刷新数据
  refreshData: function() {
    wx.showLoading({
      title: '刷新中...',
    });

    setTimeout(() => {
      this.loadTaskStats();
      wx.hideLoading();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除登录状态
            wx.removeStorageSync('userInfo_PLANT_B_REPAIR');
            wx.removeStorageSync('userRole_PLANT_B_REPAIR');
            wx.removeStorageSync('loginTime_PLANT_B_REPAIR');
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '/pages/PLANT_B_REPAIR/login/login'
                  });
                }, 1500);
              }
            });
          } catch (error) {
            console.error('退出登录失败:', error);
          }
        }
      }
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});