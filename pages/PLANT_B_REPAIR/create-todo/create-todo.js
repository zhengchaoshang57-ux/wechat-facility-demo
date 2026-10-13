// pages/PLANT_B_REPAIR/create-todo/create-todo.js
Page({
  data: {
    title: '',
    description: '',
    // 图片数组
    images: [],
    
    // 来源相关
    sourceOptions: ["维修自查", "组内检查", "日常巡检", "设备巡检", "其他"],
    sourceIndex: 0,
    source: '维修自查',
    
    // 问题区域相关
    areaOptions: ["室外", "一楼", "二楼", "三楼", "其他"],
    areaIndex: 0,
    problemArea: '室外',
    
    // 问题相关
    problemOptions: ['地面', '屋顶', '墙面', '门', '窗', '家具', '标签类', '其他'],
    problemIndex: 0,
    problem: '地面',

    // 子区域数据
    subAreaOptions: [],
    subAreaIndex: 0,
    subArea: '',
    showSubArea: false, // 是否显示子区域下拉菜单

    // 门牌号相关
    doorNumber: '',
    showDoorInput: false, //是否显示门牌号输入框

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
      "三楼": [
            "示例仓储区",
            "示例设备区",
            "示例通道",
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

    // 其他区域描述相关
    otherAreaDescription: '',
    showOtherAreaInput: false,

    // 其他子区域描述相关
    otherSubAreaDescription: '',
    showOtherSubAreaInput: false
  },
  
  // 添加创建人输入方法
  onCreatorInput: function(e) {
    this.setData({
      creator: e.detail.value
    });
  },

  onLoad: function() {
    // 设置创建时间为当前时间
    const now = new Date();
    const dateString = this.formatDate(now);
    const timeString = this.formatTime(now);
    const createTime = `${dateString} ${timeString}`;
    
    this.setData({
      createTime: createTime,
      // 初始化子区域（根据默认选中的"室外"）
      subAreaOptions: this.data.subAreaMap['室外'],
      subArea: this.data.subAreaMap['室外'][0],
      showSubArea: true
    });
  },
  
  // 格式化日期为 YYYY-MM-DD 格式
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 格式化时间为 HH:mm 格式
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
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

      // 如果选择的是“其他”，显示其他区域描述输入框
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

    // 如果选择的是“其他”，显示其他子区域描述输入框
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

    // 如果问题不是“门”，清空门牌号
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
    const title = that.data.title;
    const description = that.data.description; // 问题描述
    const source = that.data.source; // 来源
    const problemArea = that.data.problemArea; // 问题区域
    const problem = that.data.problem; // 问题类型
    const subArea = that.data.subArea; // 子区域
    const doorNumber = that.data.doorNumber; // 门牌号
    const images = that.data.images; // 获取图片
    const createTime = that.data.createTime; // 创建时间
    const creator = that.data.creator; // 创建人
    const otherAreaDescription = that.data.otherAreaDescription;
    const otherSubAreaDescription = that.data.otherSubAreaDescription;
    
    // 验证
    if (!title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }
    
    if (!creator.trim()) {
      wx.showToast({
        title: '请输入创建人',
        icon: 'none'
      });
      return;
    }

    // 如果问题是“门”但门牌号为空
    if (problem === '门' && !doorNumber.trim()) {
      wx.showToast({
        title: '请输入门牌号或具体位置',
        icon: 'none'
      });
      return;
    }

    // 如果问题区域选择“其他”但其他区域描述为空
    if (problemArea === '其他' && !otherAreaDescription.trim()) {
      wx.showToast({
        title: '请输入其他区域描述',
        icon: 'none'
      });
      return;
    }

    // 如果显示子区域且选择了“其他”但其他子区域描述为空
    if (that.data.showSubArea && subArea === '其他' && !otherSubAreaDescription.trim()) {
      wx.showToast({
        title: '请输入其他具体位置描述',
        icon: 'none'
      });
      return;
    }

    // 如果显示子区域但未选择子区域
    if (that.data.showSubArea && !subArea.trim()) {
      wx.showToast({
        title: '请选择' + problemArea,
        icon: 'none'
      });
      return;
    }
    
    // 获取现有待办事项
    const todos = wx.getStorageSync('todos_PLANT_B_REPAIR') || [];
    
    // 生成新ID
    let newId = 1;
    if (todos.length > 0) {
      const maxId = Math.max.apply(null, todos.map(function(t) {
        return t.id;
      }));
      newId = maxId + 1;
    }
    
    // 创建新待办事项
    const newTodo = {
      id: newId,
      title: title,
      description: description,
      priority: 'normal', // 固定为普通优先级
      source: source,
      problemArea: problemArea,
      problem: problem,
      subArea: subArea, // 保存子区域
      doorNumber: doorNumber, // 保存门牌号
      otherAreaDescription: otherAreaDescription,
      otherSubAreaDescription: otherSubAreaDescription,
      images: images, // 保存图片
      status: 'pending',
      createTime: createTime, // 使用创建时间
      creator: creator,
      assignee: '', // 初始不分配负责人，由分配员分配
      date: createTime.split(' ')[0], // 保存日期部分用于筛选
      createTimestamp: new Date().getTime(), // 保存时间戳用于排序
      createdBy: 'admin',
      reviewStatus: 'pending'
    };
    
    // 添加到列表
    todos.push(newTodo);
    
    // 保存到本地存储
    wx.setStorageSync('todos_PLANT_B_REPAIR', todos);
    
    // 提示成功
    wx.showToast({
      title: '创建成功',
      icon: 'success',
      success: function() {
        // 延迟返回，确保数据已保存
        setTimeout(function() {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
});