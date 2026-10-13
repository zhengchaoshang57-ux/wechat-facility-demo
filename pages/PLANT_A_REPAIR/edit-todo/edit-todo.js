// pages/PLANT_A_REPAIR/edit-todo/edit-todo.js
Page({
  data: {
    id: null,
    title: '',
    description: '',
    // 图片数组
    images: [],
    
    // 来源相关
    sourceOptions: ["维修自查", "组内检查", "日常巡检", "设备巡检", "其他"],
    sourceIndex: 0,
    source: '',
    
    // 问题区域相关
    areaOptions: ["室外", "一楼", "二楼", "其他"],
    areaIndex: 0,
    problemArea: '',
    
    // 问题相关
    problemOptions: ['地面', '屋顶', '墙面', '门', '窗', '家具', '标签类', '其他'],
    problemIndex: 0,
    problem: '',

    // 子区域数据
    subAreaOptions: [],
    subAreaIndex: 0,
    subArea: '',
    showSubArea: false,

    // 门牌号相关
    doorNumber: '',
    showDoorInput: false,

    // 子区域映射表
    subAreaMap: {
      "室外": [
            "示例停车区",
            "示例道路",
            "示例绿化区",
            "其他"
      ],
      "一楼": [
            "示例大厅",
            "示例办公区",
            "示例通道",
            "其他"
      ],
      "二楼": [
            "示例会议室",
            "示例休息区",
            "示例卫生间",
            "其他"
      ],
      "其他": [
            "其他"
      ]
},
    
    // 创建时间
    createTime: '',
    
    // 创建人
    creator: '',
    
    // 负责人
    assignee: '',
    
    // 存储键
    storageKey: 'todos_PLANT_A_REPAIR',

    // 其他区域描述相关
    otherAreaDescription: '',
    showOtherAreaInput: false,
  
    // 其他子区域描述相关
    otherSubAreaDescription: '',
    showOtherSubAreaInput: false
  },
  
  onLoad: function(options) {
    // 获取传递过来的待办事项ID
    const id = parseInt(options.id);
    if (!id) {
      wx.showToast({
        title: '无效的待办事项',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ id: id });
    this.loadTodoData(id);
  },
  
  // 加载待办事项数据
  loadTodoData: function(id) {
    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const todo = todos.find(item => item.id === id);
      
      if (!todo) {
        wx.showToast({
          title: '待办事项不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }
      
      // 计算下拉菜单的索引值
      const sourceIndex = this.data.sourceOptions.indexOf(todo.source || '维修自查');
      const areaIndex = this.data.areaOptions.indexOf(todo.problemArea || '室外');
      const problemIndex = this.data.problemOptions.indexOf(todo.problem || '地面');

      // 获取子区域数据
      const subAreaMap = this.data.subAreaMap;
      const problemArea = todo.problemArea || '室外';
      let subAreaOptions = [];
      let subAreaIndex = 0;
      let showSubArea = false;

      if (subAreaMap[problemArea]) {
        subAreaOptions = subAreaMap[problemArea];
        showSubArea = true;
        // 计算子区域索引
        const subAreaFromTodo = todo.subArea || '';
        subAreaIndex = subAreaOptions.indexOf(subAreaFromTodo);
        if (subAreaIndex === -1) subAreaIndex = 0;
      }

      // 检查是否需要显示门牌号输入框
      const showDoorInput = todo.problem === '门';

      // 检查是否需要显示其他区域描述输入框
      const showOtherAreaInput = problemArea === '其他';

      // 检查是否需要显示其他子区域描述输入框
      const showOtherSubAreaInput = todo.subArea === '其他';
      
      // 设置数据到页面
      this.setData({
        title: todo.title || '',
        description: todo.description || '',
        source: todo.source || '维修自查',
        sourceIndex: sourceIndex >= 0 ? sourceIndex : 0,
        problemArea: problemArea,
        areaIndex: areaIndex >= 0 ? areaIndex : 0,
        problem: todo.problem || '地面',
        problemIndex: problemIndex >= 0 ? problemIndex : 0,
        images: todo.images || [], // 加载图片
        creator: todo.creator || '', // 加载创建人
        assignee: todo.assignee || '',
        createTime: todo.createTime || this.getCurrentTime(), // 显示创建时间

        // 子区域相关
        subAreaOptions: subAreaOptions,
        subAreaIndex: subAreaIndex,
        subArea: todo.subArea || (subAreaOptions.length > 0 ? subAreaOptions[0] : ''),
        showSubArea: showSubArea,
        doorNumber: todo.doorNumber || '',
        showDoorInput: showDoorInput,

        // 其他区域描述相关
        otherAreaDescription: todo.otherAreaDescription || '',
        showOtherAreaInput: showOtherAreaInput,
        otherSubAreaDescription: todo.otherSubAreaDescription || '',
        showOtherSubAreaInput: showOtherSubAreaInput
      });
      
    } catch (error) {
      console.error('加载待办数据时出错:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },
  
  // 获取当前时间
  getCurrentTime: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  
  goBack: function() {
    wx.navigateBack();
  },
  
  onTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  },
  
  onDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    });
  },
  
  // 来源选择变化
  onSourceChange: function(e) {
    const index = e.detail.value;
    this.setData({
      sourceIndex: index,
      source: this.data.sourceOptions[index]
    });
  },
  
  // 问题区域选择变化
  onAreaChange: function(e) {
    const index = e.detail.value;
    const selectedArea = this.data.areaOptions[index];
    const subAreaMap = this.data.subAreaMap;

    this.setData({
      areaIndex: index,
      problemArea: selectedArea,
      // 重置其他输入框
      otherAreaDescription: '',
      otherSubAreaDescription: '',
      showOtherAreaInput: false,
      showOtherSubAreaInput: false
    });

    // 检查是否需要显示子区域
    if (subAreaMap[selectedArea]) {
      const subOptions = subAreaMap[selectedArea];
      this.setData({
        showSubArea: true,
        subAreaOptions: subOptions,
        subAreaIndex: 0,
        subArea: subOptions[0]
      });
    } else {
      this.setData({
        showSubArea: false,
        subAreaOptions: [],
        subAreaIndex: 0,
        subArea: ''
      });

      // 如果选择的是"其他"，显示其他区域描述输入框
      if (selectedArea === '其他') {
        this.setData({
          showOtherAreaInput: true
        });
      }
    }
  },

  // 子区域选择变化
  onSubAreaChange: function(e) {
    const index = e.detail.value;
    const selectedSubArea = this.data.subAreaOptions[index];

    this.setData({
      subAreaIndex: index,
      subArea: selectedSubArea,
      // 重置其他子区域描述
      otherSubAreaDescription: ''
    });

    // 如果选择的是"其他"，显示其他子区域描述输入框
    if (selectedSubArea === '其他') {
      this.setData({
        showOtherSubAreaInput: true
      });
    } else {
      this.setData({
        showOtherSubAreaInput: false
      });
    }
  },

  // 其他区域描述输入
  onOtherAreaDescriptionInput: function(e) {
    this.setData({
      otherAreaDescription: e.detail.value
    });
  },

  // 其他子区域描述输入
  onOtherSubAreaDescriptionInput: function(e) {
    this.setData({
      otherSubAreaDescription: e.detail.value
    });
  },
  
  // 问题选择变化
  onProblemChange: function(e) {
    const index = e.detail.value;
    const selectedProblem = this.data.problemOptions[index];

    this.setData({
      problemIndex: index,
      problem: selectedProblem,
      // 检查是否需要显示门牌号输入框
      showDoorInput: selectedProblem === '门'
    });

    // 如果问题不是"门"，清空门牌号
    if (selectedProblem !== '门') {
      this.setData({
        doorNumber: ''
      });
    }
  },
  

  // 门牌号输入
  onDoorNumberInput: function(e) {
    this.setData({
      doorNumber: e.detail.value
    });
  },
  
  onAssigneeInput: function(e) {
    this.setData({
      assignee: e.detail.value
    });
  },

  // 创建人输入
  onCreatorInput: function(e) {
    this.setData({
      creator: e.detail.value
    });
  },
  
  // 选择图片
  chooseImage: function() {
    const that = this;
    const remaining = 3 - that.data.images.length;
    
    wx.chooseImage({
      count: remaining, // 最多选择 remaining 张
      sizeType: ['compressed'], // 压缩图
      sourceType: ['album', 'camera'], // 相册和相机
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        const newImages = that.data.images.concat(tempFilePaths);
        
        that.setData({
          images: newImages
        });
      },
      fail: function(res) {
        console.error('选择图片失败:', res);
      }
    });
  },
  
  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    
    images.splice(index, 1);
    
    this.setData({
      images: images
    });
  },
  
  // 预览图片
  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },
  
  // 阻止事件冒泡
  stopPropagation: function(e) {
    // 阻止事件冒泡
  },
  
  saveTodo: function() {
    const that = this;
    const id = that.data.id;
    
    // 表单验证
    if (!that.data.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }
    
    if (!that.data.creator.trim()) {
      wx.showToast({
        title: '请输入创建人',
        icon: 'none'
      });
      return;
    }
    
    // 如果问题是"门"但门牌号为空
    if (that.data.problem === '门' && !that.data.doorNumber.trim()) {
      wx.showToast({
        title: '请输入门牌号或具体位置',
        icon: 'none'
      });
      return;
    }

    // 如果问题区域选择"其他"但其他区域描述为空
    if (that.data.problemArea === '其他' && !that.data.otherAreaDescription.trim()) {
      wx.showToast({
        title: '请输入其他区域描述',
        icon: 'none'
      });
      return;
    }

    // 如果显示子区域且选择了"其他"但其他子区域描述为空
    if (that.data.showSubArea && that.data.subArea === '其他' && !that.data.otherSubAreaDescription.trim()) {
      wx.showToast({
        title: '请输入其他具体位置描述',
        icon: 'none'
      });
      return;
    }

    // 如果显示子区域但未选择子区域
    if (that.data.showSubArea && !that.data.subArea.trim()) {
      wx.showToast({
        title: '请选择' + that.data.problemArea,
        icon: 'none'
      });
      return;
    }

    try {
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      const todoIndex = todos.findIndex(item => item.id === id);
      
      if (todoIndex === -1) {
        wx.showToast({
          title: '待办事项不存在',
          icon: 'none'
        });
        return;
      }
      
      // 获取原始待办事项以保留某些字段
      const originalTodo = todos[todoIndex];
      
      // 更新待办事项，保留开始时间和状态
      const updatedTodo = {
        ...originalTodo, // 保留原有字段
        title: that.data.title,
        description: that.data.description,
        priority: 'normal', // 固定为普通优先级
        source: that.data.source,
        problemArea: that.data.problemArea,
        problem: that.data.problem,
        subArea: that.data.subArea, // 保存子区域
        doorNumber: that.data.doorNumber, // 保存门牌号
        otherAreaDescription: that.data.otherAreaDescription,
        otherSubAreaDescription: that.data.otherSubAreaDescription,
        images: that.data.images, // 保存图片
        creator: that.data.creator, // 更新创建人
        lastModifiedTime: new Date().getTime() // 更新最后修改时间
      };
      
      // 替换原待办事项
      todos[todoIndex] = updatedTodo;
      
      // 保存到本地存储
      wx.setStorageSync(this.data.storageKey, todos);
      
      // 提示成功
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        success: function() {
          // 延迟返回
          setTimeout(function() {
            wx.navigateBack();
          }, 1500);
        }
      });
      
    } catch (error) {
      console.error('更新待办事项时出错:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  }
});