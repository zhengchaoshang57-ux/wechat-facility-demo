// pages/PLANT_A_CLEANING/index/index.js
Page({
  data: {
    todoCount: 0,
    recentTodos: [],
    storageKey: 'todos_PLANT_A_CLEANING'
  },
  
  onLoad: function() {
    this.loadTodoData();
  },
  
  onShow: function() {
    this.loadTodoData();
  },
  
  loadTodoData: function() {
    // 从本地存储获取待办事项
    const todos = wx.getStorageSync(this.data.storageKey) || [];
    
    // 过滤出待处理和进行中的事项
    const pendingTodos = todos.filter(todo => 
      todo.status === 'pending' || 
      todo.status === 'in-progress' ||
      todo.status === 'pending_review'
    );
    
    // 获取最近3条
    const recentTodos = pendingTodos.slice(0, 3);
    
    this.setData({
      todoCount: pendingTodos.length,
      recentTodos: recentTodos
    });
  },
  
  goToTodoPage: function() {
    wx.navigateTo({
      url: '/pages/PLANT_A_CLEANING/todo/todo'
    });
  },
  
  // 维修申请 - 跳转到新建待办事项
  goToCreateTodo: function() {
    wx.navigateTo({
      url: '/pages/PLANT_A_CLEANING/create-todo/create-todo'
    });
  },
  
  // 返回登录界面
  goToLogin: function() {
    // 清除用户登录状态
    try {
      wx.removeStorageSync('userInfo_PLANT_A_CLEANING');
      wx.removeStorageSync('token_PLANT_A_CLEANING');
      wx.removeStorageSync('userRole_PLANT_A_CLEANING');
      wx.removeStorageSync('loginTime_PLANT_A_CLEANING');
    } catch (e) {
      console.log('清除PLANT_A_CLEANING登录状态失败：', e);
    }

    // 显示确认对话框
    wx.showModal({
      title: '确认退出',
      content: '确定要返回登录界面吗？',
      success: (res) => {
        if (res.confirm) {
          //跳转到登录页面
          wx.reLaunch({
            url: '/pages/PLANT_A_CLEANING/login/login'
          });
        }
      }
    });
  }
});