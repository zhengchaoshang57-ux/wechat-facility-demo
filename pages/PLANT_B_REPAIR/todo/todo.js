// pages/PLANT_B_REPAIR/todo/todo.js
Page({
  data: {
    todos: [],
    todayTodos: [],
    tomorrowTodos: [],
    otherTodos: [],
    pendingCount: 0,
    inProgressCount: 0,
    scrollHeight: 0,
    // 存储键
    storageKey: 'todos_PLANT_B_REPAIR'
  },
  
  onLoad: function() {
    this.calculateScrollHeight();
    this.loadTodos();
  },
  
  onShow: function() {
    this.loadTodos();
  },
  
  onReady: function() {
    this.calculateScrollHeight();
  },
  
  calculateScrollHeight: function() {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        const windowHeight = res.windowHeight;
        const headerHeight = 80;
        const statsHeight = 80;
        const scrollHeight = windowHeight - headerHeight - statsHeight;
        
        that.setData({
          scrollHeight: scrollHeight
        });
      }
    });
  },
  
  loadTodos: function() {
    try {
      // 从本地存储获取待办事项
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      console.log('从示例厂区B维修存储加载的待办事项:', todos);
      
      // 只筛选未完成的事项（pending和in-progress），移除已完成的事项
      const activeTodos = todos.filter(item => 
        item.status === 'pending' || item.status === 'in-progress'
      );
      
      // 验证数据
      const validatedTodos = this.validateTodos(activeTodos);
      
      // 分类待办事项
      this.classifyTodos(validatedTodos);
      
    } catch (error) {
      console.error('加载示例厂区B维修待办事项时出错:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },
  
  validateTodos: function(todos) {
    if (!Array.isArray(todos)) {
      return [];
    }
    
    return todos.map((item, index) => {
      const id = item.id || index + 1;
      const title = item.title && item.title.toString().trim() ? item.title.toString().trim() : '无标题';
      const description = item.description && item.description.toString().trim() ? item.description.toString().trim() : '无描述';
      const status = (item.status === 'pending' || item.status === 'in-progress') ? item.status : 'pending';
      
      // 字段验证
      const source = item.source || '未选择';
      const problemArea = item.problemArea || '未选择';
      const problem = item.problem || '未选择';
      const subArea = item.subArea || '未选择'; // 子区域
      const doorNumber = item.doorNumber || ''; // 门牌号
      const images = item.images || []; // 确保图片数组存在

      // 处理其他描述字段
      const otherAreaDescription = item.otherAreaDescription || '';
      const otherSubAreaDescription = item.otherSubAreaDescription || '';
      
      // 处理开始时间
      let startTime = item.startTime || '';
      
      // 处理创建时间（从createTime字段获取）
      let createTime = item.createTime || '';
      
      // 为了兼容旧数据，如果createTime不存在，使用estimatedTime
      if (!createTime && item.estimatedTime) {
        createTime = item.estimatedTime;
      }
      
      // 如果没有时间数据，使用默认值
      if (!createTime) {
        createTime = '未设置';
      }
      
      const assignee = item.assignee && item.assignee.toString().trim() ? item.assignee.toString().trim() : '未分配';
      const creator = item.creator && item.creator.toString().trim() ? item.creator.toString().trim() : '未知'; // 创建人
      
      // 提取日期用于分类（如果有createTime）
      let date = item.date || '';
      if (createTime && createTime !== '未设置') {
        const parts = createTime.split(' ');
        if (parts.length > 0) {
          date = parts[0];
        }
      }
      
      // 如果还是没有日期，使用今天
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        date = new Date().toISOString().split('T')[0];
      }
      
      return {
        id: id,
        title: title,
        description: description,
        status: status,
        source: source,
        problemArea: problemArea,
        problem: problem,
        subArea: subArea, // 包含子区域
        doorNumber: doorNumber, // 包含门牌号
        images: images, // 确保包含图片数组
        startTime: startTime, // 开始时间
        createTime: createTime, // 创建时间
        assignee: assignee,
        creator: creator, // 包含创建人
        otherAreaDescription: otherAreaDescription,
        otherSubAreaDescription: otherSubAreaDescription,
        date: date
      };
    }).filter(item => item !== null);
  },
  
  classifyTodos: function(todos) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    // 今日待办
    const todayTodos = todos.filter(item => {
      return item.date === today;
    });
    
    // 明日待办
    const tomorrowTodos = todos.filter(item => {
      return item.date === tomorrow;
    });
    
    // 其他待办
    const otherTodos = todos.filter(item => {
      return item.date !== today && item.date !== tomorrow;
    });
    
    // 统计数量（只统计待处理和进行中）
    const pendingCount = todos.filter(item => {
      return item.status === 'pending';
    }).length;
    
    const inProgressCount = todos.filter(item => {
      return item.status === 'in-progress';
    }).length;
    
    console.log('分类后的示例厂区B维修待办事项:', {
      pendingCount: pendingCount,
      inProgressCount: inProgressCount,
      todayTodos: todayTodos,
      tomorrowTodos: tomorrowTodos,
      otherTodos: otherTodos
    });
    
    this.setData({
      todos: todos,
      todayTodos: todayTodos,
      tomorrowTodos: tomorrowTodos,
      otherTodos: otherTodos,
      pendingCount: pendingCount,
      inProgressCount: inProgressCount
    });
  },
  
  goBack: function() {
    wx.navigateBack();
  },
  
  showFilter: function() {
    const that = this;
    
    // 只显示全部、待处理、进行中
    wx.showActionSheet({
      itemList: ['全部', '待处理', '进行中'],
      success: function(res) {
        that.filterTodos(res.tapIndex);
      },
      fail: function(res) {
        console.log('筛选取消');
      }
    });
  },
  
  filterTodos: function(filterIndex) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      // 只筛选未完成的事项
      const activeTodos = todos.filter(item => 
        item.status === 'pending' || item.status === 'in-progress'
      );
      const validatedTodos = this.validateTodos(activeTodos);
      
      let filteredTodos = [];
      
      switch(filterIndex) {
        case 0: // 全部
          filteredTodos = validatedTodos;
          break;
        case 1: // 待处理
          filteredTodos = validatedTodos.filter(item => item.status === 'pending');
          break;
        case 2: // 进行中
          filteredTodos = validatedTodos.filter(item => item.status === 'in-progress');
          break;
        default:
          filteredTodos = validatedTodos;
      }
      
      // 重新分类筛选后的待办事项
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const todayTodos = filteredTodos.filter(item => {
        return item.date === today;
      });
      
      const tomorrowTodos = filteredTodos.filter(item => {
        return item.date === tomorrow;
      });
      
      const otherTodos = filteredTodos.filter(item => {
        return item.date !== today && item.date !== tomorrow;
      });
      
      this.setData({
        todayTodos: todayTodos,
        tomorrowTodos: tomorrowTodos,
        otherTodos: otherTodos
      });
    } catch (error) {
      console.error('筛选示例厂区B维修待办事项时出错:', error);
      wx.showToast({
        title: '筛选失败',
        icon: 'none'
      });
    }
  },
  
  editTodo: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/PLANT_B_REPAIR/edit-todo/edit-todo?id=' + id
    });
  },

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

  // 删除待办事项函数
  deleteTodo: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const that = this;
    
    wx.showModal ({
      title: '确认删除',
      content: '确定要删除这个待办事项吗？删除后无法恢复',
      confirmText: '删除',
      confirmColor: '#ff4444',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          try {
            const todos = wx.getStorageSync(that.data.storageKey) || [];

            // 过滤掉要删除的待办事项
            const updatedTodos = todos.filter(item => item.id !== id);

            // 保存更新后的数据
            wx.setStorageSync(that.data.storageKey, updatedTodos);

            // 重新加载数据
            that.loadTodos();

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('删除示例厂区B维修待办事项时出错：', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});

