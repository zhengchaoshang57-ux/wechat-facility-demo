// pages/PLANT_A_REPAIR/task-assign/task-assign.js
Page({
  data: {
    scrollHeight: 0,
    currentTab: 'unassigned',
    unassignedTasks: [],
    assignedTasks: [],
    inProgressTasks: [],
    completedTasks: [],
    selectedTasks: [],
    selectAll: false,
    showTechnicianModal: false,
    showPriorityModal: false, // 优先级选择弹窗
    currentTaskId: null, // 当前操作的任务ID
    stats: {
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0
    },
    technicianStats: {},
    userRole: '',
    availableTechnicians: ['维修员'],
    storageKey: 'todos_PLANT_A_REPAIR',
    
    // 优先级选项
    priorityOptions: [
      { value: 'normal', label: '普通', color: '#1a73e8' },
      { value: 'high', label: '紧急', color: '#ff6b35' }
    ]
  },

  onLoad: function(options) {
    this.calculateScrollHeight();
    this.loadUserInfo();
    this.loadTasks();
  },

  onShow: function() {
    this.loadTasks();
  },

  onPullDownRefresh: function() {
    this.refreshData();
  },

  // 加载用户信息
  loadUserInfo: function() {
    try {
      const userRole = wx.getStorageSync('userRole_PLANT_A_REPAIR');
      this.setData({
        userRole: userRole
      });
      
      if (userRole !== 'dispatcher') {
        wx.showToast({
          title: '请以分配员身份登录',
          icon: 'none',
          success: () => {
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/PLANT_A_REPAIR/login/login'
              });
            }, 1500);
          }
        });
        return;
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 计算滚动区域高度
  calculateScrollHeight: function() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const headerHeight = 100;
      const statsHeight = 120;
      const tabsHeight = 160;
      let extraHeight = 0;

      if (this.data.currentTab === 'unassigned' && this.data.unassignedTasks.length > 0) {
        extraHeight = 100; // 批量操作栏高度
      } else if (this.data.currentTab === 'assigned') {
        extraHeight = 80; // 已分配标题高度
      } else if (this.data.currentTab === 'inProgress') {
        extraHeight = 80; // 进行中标题高度
      } else if (this.data.currentTab === 'completed') {
        extraHeight = 80; // 已完成标题高度
      }

      const scrollHeight = windowHeight - headerHeight - statsHeight - tabsHeight - extraHeight - 60;

      this.setData({
        scrollHeight: Math.max(scrollHeight, 200)
      });
    } catch (error) {
      console.error('计算滚动高度失败:', error);
      this.setData({
        scrollHeight: 500
      });
    }
  },

  // 加载任务数据
  loadTasks: function() {
    if (this.data.userRole !== 'dispatcher') {
      return;
    }
    
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      
      // 重新定义任务分类逻辑
      const unassignedTasks = todos.filter(task => 
        task.status === 'pending' && (!task.assignee || task.assignee === '')
      );
      
      // 已分配任务：有分配人但尚未开始
      const assignedTasks = todos.filter(task => 
        task.assignee && task.assignee !== '' && 
        task.status === 'pending' && 
        !task.isStarted
      );
      
      // 进行中任务：状态为'in-progress'
      const inProgressTasks = todos.filter(task => 
        task.status === 'in-progress'
      );
      
      const completedTasks = todos.filter(task => 
        task.status === 'completed'
      );

      // 计算维修员任务统计
      const technicianStats = {};
      todos.forEach(task => {
        if (task.assignee && task.assignee !== '') {
          if (!technicianStats[task.assignee]) {
            technicianStats[task.assignee] = {
              total: 0,
              assigned: 0,
              inProgress: 0,
              completed: 0
            };
          }
          
          technicianStats[task.assignee].total += 1;
          
          if (task.assignee && !task.isStarted && task.status !== 'completed') {
            technicianStats[task.assignee].assigned += 1;
          } else if (task.status === 'in-progress') {
            technicianStats[task.assignee].inProgress += 1;
          } else if (task.status === 'completed') {
            technicianStats[task.assignee].completed += 1;
          }
        }
      });

      // 更新统计数据
      const stats = {
        pending: unassignedTasks.length,
        assigned: assignedTasks.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length
      };

      this.setData({
        unassignedTasks: unassignedTasks,
        assignedTasks: assignedTasks,
        inProgressTasks: inProgressTasks,
        completedTasks: completedTasks,
        stats: stats,
        technicianStats: technicianStats,
        selectedTasks: [],
        selectAll: false
      }, () => {
        // 数据更新后重新计算滚动高度
        this.calculateScrollHeight();
      });

    } catch (error) {
      console.error('加载任务数据失败:', error);
      wx.showToast({
        title: '加载任务失败',
        icon: 'none'
      });
    }
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    }, () => {
      // 切换标签页后重新计算滚动高度
      this.calculateScrollHeight();
    });
  },

  // 切换任务选中状态
  toggleTaskSelect: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const selectedTasks = [...this.data.selectedTasks];
    const index = selectedTasks.indexOf(taskId);
    
    if (index === -1) {
      selectedTasks.push(taskId);
    } else {
      selectedTasks.splice(index, 1);
    }
    
    this.setData({
      selectedTasks: selectedTasks,
      selectAll: selectedTasks.length === this.data.unassignedTasks.length
    });
  },

  // 全选/取消全选
  toggleSelectAll: function() {
    const selectAll = !this.data.selectAll;
    const selectedTasks = selectAll ? 
      this.data.unassignedTasks.map(task => task.id) : [];
    
    this.setData({
      selectAll: selectAll,
      selectedTasks: selectedTasks
    });
  },

  // 显示优先级选择弹窗
  showPriorityModal: function(e) {
    const task = e.currentTarget.dataset.task;
    this.setData({
      showPriorityModal: true,
      currentTaskId: task.id
    });
  },

  // 隐藏优先级选择弹窗
  hidePriorityModal: function() {
    this.setData({
      showPriorityModal: false,
      currentTaskId: null
    });
  },

  // 设置优先级
  setPriority: function(e) {
    const priority = e.currentTarget.dataset.priority;
    const taskId = this.data.currentTaskId;
    
    this.hidePriorityModal();
    this.updateTaskPriority(taskId, priority);
  },

  // 更新任务优先级
  updateTaskPriority: function(taskId, priority) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      
      const updatedTodos = todos.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            priority: priority
          };
        }
        return task;
      });
      
      wx.setStorageSync(this.data.storageKey, updatedTodos);
      
      // 重新加载数据
      this.loadTasks();
      
      wx.showToast({
        title: '优先级已设置',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('设置优先级失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      });
    }
  },

  // 显示维修员选择弹窗
  showTechnicianList: function() {
    if (this.data.selectedTasks.length === 0) {
      wx.showToast({
        title: '请先选择任务',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showTechnicianModal: true
    });
  },

  // 隐藏维修员选择弹窗
  hideTechnicianModal: function() {
    this.setData({
      showTechnicianModal: false
    });
  },

  // 分配任务给维修员
  assignToTechnician: function(e) {
    const technician = e.currentTarget.dataset.technician;
    const selectedTaskIds = this.data.selectedTasks;
    
    this.hideTechnicianModal();
    this.batchAssignTasks(selectedTaskIds, technician);
  },

  // 单个任务分配
  assignSingleTask: function(e) {
    const task = e.currentTarget.dataset.task;
    const that = this;
    
    wx.showModal({
      title: '分配任务',
      content: `确定要将"${task.title}"分配给维修员吗？`,
      success: function(res) {
        if (res.confirm) {
          that.batchAssignTasks([task.id], '维修员');
        }
      }
    });
  },

  // 批量分配任务
  batchAssignTasks: function(taskIds, technician) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      let assignedCount = 0;
      
      // 更新任务状态
      const updatedTodos = todos.map(task => {
        if (taskIds.includes(task.id)) {
          assignedCount++;
          const updatedTask = {
            ...task,
            assignee: technician,
            status: 'pending',
            isStarted: false,
            assignedTime: new Date().toLocaleString('zh-CN'),
          };
          return updatedTask;
        }
        return task;
      });
      
      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, updatedTodos);
      
      // 重新加载数据
      this.loadTasks();
      
      // 显示成功提示
      wx.showToast({
        title: `已分配 ${assignedCount} 个任务给${technician}`,
        icon: 'success'
      });
      
    } catch (error) {
      console.error('分配任务失败:', error);
      wx.showToast({
        title: '分配失败',
        icon: 'none'
      });
    }
  },

  // 预览图片
  previewImage: function(e) {
    try {
      const id = parseInt(e.currentTarget.dataset.id);
      const index = parseInt(e.currentTarget.dataset.index);
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const todo = todos.find(item => item.id === id);

      if (todo && todo.images && todo.images.length > 0) {
        wx.previewImage({
          current: todo.images[index],
          urls: todo.images
        });
      }
    } catch (error) {
      console.error('预览图片时出错：', error);
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 刷新数据
  refreshData: function() {
    wx.showLoading({
      title: '刷新中...',
    });

    setTimeout(() => {
      this.loadTasks();
      wx.hideLoading();
      wx.stopPullDownRefresh();
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
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('userRole_PLANT_A_REPAIR');
            wx.removeStorageSync('loginTime_PLANT_A_REPAIR');
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '/pages/PLANT_A_REPAIR/login/login'
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
  }
});