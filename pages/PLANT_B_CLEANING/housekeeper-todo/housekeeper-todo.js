// pages/PLANT_B_CLEANING/housekeeper-todo/housekeeper-todo.js
Page({
  // catchtap 拦截弹窗内部点击，避免触发外层关闭操作。
  stopPropagation: function() {},

  data: {
    scrollHeight: 0,
    refreshing: false,
    pendingTasks: [],
    inProgressTasks: [],
    completedTasks: [],
    unfinishedTasks: [],
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    unfinishedCount: 0,
    totalCount: 0,
    currentHousekeeper: '保洁员',
    userRole: '',

    // 新增：上传图片弹窗相关
    showUploadModal: false,
    currentTaskId: null,
    taskImages: [],
    uploadProgress: 0,
    isUploading: false,

    // 新增：存储键
    storageKey: 'todos_PLANT_B_CLEANING'
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
      const userRole = wx.getStorageSync('userRole_PLANT_B_CLEANING');
      this.setData({
        userRole: userRole
      });
      
      // 如果不是保洁员，跳转到登录页面
      if (userRole !== 'housekeeper') {
        wx.showToast({
          title: '请以保洁员身份登录',
          icon: 'none',
          success: () => {
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/PLANT_B_CLEANING/login/login'
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
      // 估算头部和概览区域高度
      const headerHeight = 100;
      const statsHeight = 120;
      const scrollHeight = windowHeight - headerHeight - statsHeight - 40;
      
      this.setData({
        scrollHeight: scrollHeight
      });
    } catch (error) {
      console.error('计算滚动高度失败:', error);
      // 设置默认高度
      this.setData({
        scrollHeight: 500
      });
    }
  },

  // 加载任务数据
  loadTasks: function() {
    // 如果不是保洁员，不加载数据
    if (this.data.userRole !== 'housekeeper') {
      return;
    }
    
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const currentHousekeeper = this.data.currentHousekeeper;
      
      console.log('=== PLANT_B_REPAIR保洁员任务加载调试信息 ===');
      console.log('所有待办事项数量:', todos.length);
      console.log('当前保洁人员:', currentHousekeeper);

      // 筛选出分配给当前保洁人员的任务
      const myTasks = todos.filter(task => {
        return task.assignee === currentHousekeeper && 
               (task.status === 'pending' || task.status === 'in-progress' || 
                task.status === 'completed' || task.status === 'unfinished');
      });

      console.log('我的任务数量:', myTasks.length);
      console.log('我的任务详情:', myTasks);

      // 按状态分类
      const pendingTasks = myTasks.filter(task => task.status === 'pending');
      const inProgressTasks = myTasks.filter(task => task.status === 'in-progress');
      const completedTasks = myTasks.filter(task => task.status === 'completed');
      const unfinishedTasks = myTasks.filter(task => task.status === 'unfinished');

      console.log('待处理任务:', pendingTasks);
      console.log('进行中任务:', inProgressTasks);
      console.log('已完成任务:', completedTasks);
      console.log('未完成任务:', unfinishedTasks);

      this.setData({
        pendingTasks: pendingTasks,
        inProgressTasks: inProgressTasks,
        completedTasks: completedTasks,
        unfinishedTasks: unfinishedTasks,
        pendingCount: pendingTasks.length,
        inProgressCount: inProgressTasks.length,
        completedCount: completedTasks.length,
        unfinishedCount: unfinishedTasks.length,
        totalCount: myTasks.length
      });

    } catch (error) {
      console.error('加载任务数据失败:', error);
      wx.showToast({
        title: '加载任务失败',
        icon: 'none'
      });
    }
  },
  // 开始处理任务
  startTask: function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认开始处理',
      content: '确定要开始处理这个任务吗？',
      confirmText: '开始处理',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.updateTaskStatus(taskId, 'in-progress', '任务已开始处理');
        }
      }
    });
  },

  // 标记任务完成
  completeTask: function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    // 保存当前任务ID
    this.setData({
      currentTaskId: taskId,
      taskImages: [], // 清空之前可能存在的图片
      uploadProgress: 0,
      isUploading: false
    });

    // 显示上传图片弹窗
    this.showUploadModalFunc();
  },

  // 显示上传图片弹窗
  showUploadModalFunc: function() {
    this.setData({
      showUploadModal: true
    });
  },

  // 隐藏上传图片弹窗
  hideUploadModalFunc: function() {
    this.setData({
      showUploadModal: false,
      currentTaskId: null,
      taskImages: [],
      uplaodProgress: 0,
      isUploading: false
    });
  },

  // 选择图片
  chooseImages: function() {
    const that = this;

    wx.chooseMedia({
      count: 9, // 最多可以选择9张图片
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log('选择的图片：', res.tempFiles);

        // 获取现有图片
        const currentImages = that.data.taskImages || [];

        // 添加新图片
        const newImages = res.tempFiles.map(file => {
          return {
            path: file.tempFilePath,
            size: file.size,
            type: file.type
          };
        });

        // 检查总数是否超过9张
        const totalImages = currentImages.concat(newImages);
        if (totalImages.length > 9) {
          wx.showToast({
            title: '最多只能上传9张图片',
            icon: 'none'
          });
          // 只保留前9张
          that.setData({
            taskImages: totalImages.slice(0, 9)
          });
        } else {
          that.setData({
            taskImages: totalImages
          });
        }
      },
      fail(err) {
        console.error('选择图片失败：', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.taskImages;

    images.splice(index, 1);

    this.setData({
      taskImages: images
    });

    wx.showToast({
      title: '已删除图片',
      icon: 'success',
      duration: 1000
    });
  },

  // 上传图片并完成任务
  uploadAndComplete: function() {
    const taskId = this.data.currentTaskId;
    const images = this.data.taskImages;

    if (!taskId) {
      wx.showToast({
        title: '任务ID不存在',
        icon: 'none'
      });
      return;
    }

    // 如果没有选择图片，询问用户是否继续
    if (images.length === 0) {
      wx.showModal({
        title: '未上传图片',
        content: '您没有上传任何图片，确定要完成任务吗？',
        confirmText: '确定完成',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.completeTaskWithoutImages(taskId);
          }
        }
      });
      return;
    }

    // 开始上传
    this.setData({
      isUploading: true,
      uploadProgress: 0
    });

    // 模拟上传进度
    const that = this;
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        // 上传完成，保存图片路径并完成任务
        const imagePaths = images.map(img => img.path);
        that.completeTaskWithImages(taskId, imagePaths);
      }

      that.setData({
        uploadProgress: progress
      });
    }, 200);
  },

  // 完成任务（不带图片）
  completeTaskWithoutImages: function(taskId) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const taskIndex = todos.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none'
        });
        return;
      }

      // 更新任务状态为已完成
      todos[taskIndex].status = 'completed';

      // 记录完成时间
      const now = new Date();
      const completedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      todos[taskIndex].completedTime = completedTime;

      // 记录完成人（保洁员）
      todos[taskIndex].completedBy = this.data.currentHousekeeper;

      // 清空完成图片（如果有的话）
      todos[taskIndex].completedImages = [];

      console.log('任务完成，状态更新：', todos[taskIndex]);

      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, todos);

      // 关闭弹窗
      this.hideUploadModalFunc();

      // 重新加载任务数据
      this.loadTasks();

      // 显示成功提示
      wx.showToast({
        title: '任务已完成',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('完成任务失败：', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
      this.setData({
        isUploading: false
      });
    }
  },

  // 完成任务（带图片）
  completeTaskWithImages: function(taskId, imagePaths) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const taskIndex = todos.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none'
        });
        return;
      }

      // 更新任务状态为已完成
      todos[taskIndex].status = 'completed';

      // 记录完成时间
      const now = new Date();
      const completedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      todos[taskIndex].completedTime = completedTime;

      // 记录完成人（保洁员）
      todos[taskIndex].completedBy = this.data.currentHousekeeper;

      // 保存完成时的图片
      todos[taskIndex].completedImages = imagePaths;

      console.log('任务完成，状态更新：', todos[taskIndex]);
      console.log('保存的完成图片：', imagePaths);

      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, todos);

      // 关闭弹窗
      this.hideUploadModalFunc();

      // 重新加载任务数据
      this.loadTasks();

      // 显示成功提示
      wx.showToast({
        title: '任务已完成',
        icon: 'success',
        duration: 2000
      });

    } catch (error) {
      console.error('完成任务失败：', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
      this.setData({
        isUploading: false
      });
    }
  },

  // 标记任务未完成 - 修复这个问题
  markAsUnfinished: function(e) {
    console.log('标记未完成按钮被点击，事件数据：', e.currentTarget.dataset);

    const taskId = e.currentTarget.dataset.id;
    const that = this;

    if(!taskId) {
      console.error('未获取到任务ID');
      wx.showToast({
        title: '操作失败，缺少任务ID',
        icon: 'none'
      });
      return;
    }
    // 先询问是否要标记为未完成
    wx.showModal({
      title: '标记未完成',
      content: '确定要将这个任务标记为未完成吗？',
      editable: true,
      placeholderText: '请输入未完成原因（可选）',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认后，询问未完成原因
          wx.showModal({
            title: '未完成原因',
            editable: true,
            placeholderText: '请输入未完成原因（可选）',
            confirmText: '确认',
            cancelText: '取消',
            success: (reasonRes) => {
              if (reasonRes.confirm) {
                const unfinishedReason = reasonRes.content || '未填写原因';
                that.markTaskUnfinished(taskId, unfinishedReason);
              } else {
                console.log('用户取消了标记未完成操作');
              }
            },
            fail: (err) => {
              console.error('弹窗显示失败：', err);
              wx.showToast({
                title: '弹窗打开失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 更新任务状态
  updateTaskStatus: function(taskId, newStatus, successMessage) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const taskIndex = todos.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none'
        });
        return;
      }

      console.log('更新任务状态前:', todos[taskIndex]);

      // 更新任务状态
      todos[taskIndex].status = newStatus;
      
      // 如果是开始处理，记录开始时间
      if (newStatus === 'in-progress') {
        const now = new Date();
        const startTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        todos[taskIndex].startTime = startTime;
      }

      console.log('更新任务状态后:', todos[taskIndex]);

      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, todos);

      // 重新加载任务数据
      this.loadTasks();

      // 显示成功提示
      wx.showToast({
        title: successMessage,
        icon: 'success'
      });

    } catch (error) {
      console.error('更新任务状态失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 标记任务为未完成
  markTaskUnfinished: function(taskId, unfinishedReason) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const taskIndex = todos.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none'
        });
        return;
      }

      // 更新任务状态为未完成
      todos[taskIndex].status = 'unfinished';
      
      // 记录未完成时间
      const now = new Date();
      const unfinishedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      todos[taskIndex].unfinishedTime = unfinishedTime;
      todos[taskIndex].unfinishedReason = unfinishedReason;
      
      console.log('任务标记为未完成，状态更新:', todos[taskIndex]);

      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, todos);

      // 重新加载任务数据
      this.loadTasks();

      // 显示成功提示
      wx.showToast({
        title: '已标记为未完成',
        icon: 'success'
      });

    } catch (error) {
      console.error('标记未完成任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 预览图片
  previewImage: function(e) {
    try {
      const id = parseInt(e.currentTarget.dataset.id);
      const index = parseInt(e.currentTarget.dataset.index);
      const imageType = e.currentTarget.dataset.type || 'images'; //images或completedImages
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const todo = todos.find(item => item.id === id);
      
      if (todo) {
        let images = [];
        if (imageType === 'completedImages' && todo.completedImages && todo.completedImages.length > 0) {
          images = todo.completedImages;
        } else if (todo.images && todo.images.length > 0) {
          images = todo.images;
        }

        if (images.length > 0) {
          wx.previewImage({
            current: images[index],
            urls: images
          });
        }
      }
    } catch (error) {
      console.error('预览图片时出错:', error);
    }
  },

  // 返回上一页
  goBack: function() {
    wx.reLaunch({
      url: '/pages/PLANT_B_CLEANING/login/login'
    });
  },

  // 刷新数据
  refreshData: function() {
    this.setData({ refreshing: true });
    
    wx.showLoading({
      title: '刷新中...',
    });

    setTimeout(() => {
      this.loadTasks();
      this.setData({ refreshing: false });
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
            // 清除用户信息
            wx.removeStorageSync('userRole_PLANT_B_CLEANING');
            wx.removeStorageSync('loginTime_PLANT_B_CLEANING');
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '/pages/PLANT_B_CLEANING/login/login'
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