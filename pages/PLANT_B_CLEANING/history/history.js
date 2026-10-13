// pages/PLANT_B_CLEANING/history/history.js
Page({
  data: {
    records: [],
    todayRecords: [],
    weekRecords: [],
    olderRecords: [],
    todayCompletedRecords: [],
    todayUnfinishedRecords: [],
    weekCompletedRecords: [],
    weekUnfinishedRecords: [],
    olderCompletedRecords: [],
    olderUnfinishedRecords: [],
    totalCount: 0,
    todayCount: 0,
    weekCount: 0,
    completedCount: 0,
    unfinishedCount: 0,
    scrollHeight: 0,
    storageKey: 'todos_PLANT_B_CLEANING'
  },
  
  onLoad: function() {
    this.calculateScrollHeight();
    this.loadRecords();
  },
  
  onShow: function() {
    this.loadRecords();
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
  
  loadRecords: function() {
    try {
      // 从本地存储获取所有待办事项
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      console.log('PLANT_B_CLEANING所有待办事项:', todos);
      
      // 筛选出已完成和未完成的事项
      const historyRecords = todos.filter(item => {
        return item.status === 'completed' || item.status === 'unfinished';
      });
      
      console.log('PLANT_B_CLEANING历史记录（已完成+未完成）:', historyRecords);

      // 验证和补充数据
      const validatedRecords = this.validateRecords(historyRecords);
      
      // 按时间分类
      this.classifyRecords(validatedRecords);
      
    } catch (error) {
      console.error('PLANT_B_CLEANING加载历史记录时出错:', error);
      wx.showToast({
        title: '加载记录失败',
        icon: 'none'
      });
    }
  },

  // 验证和补充历史记录数据
  validateRecords: function(records) {
    if (!Array.isArray(records)) {
      return [];
    }

    return records.map((item, index) => {
      // 格式化时间数据
      const createTime = item.createTime ? this.formatDateTime(item.createTime) : '';
      const startTime = item.startTime ? this.formatDateTime(item.startTime) : '';
      const completedTime = item.completedTime ? this.formatDateTime(item.completedTime) : '';
      const unfinishedTime = item.unfinishedTime ? this.formatDateTime(item.unfinishedTime) : '';

      // 确保所有必要字段都有值
      return {
        id: item.id || index + 1,
        title: item.title && item.title.toString().trim() ? item.title.toString().trim() : '无标题',
        description: item.description && item.description.toString().trim() ? item.description.toString().trim() : '无描述',
        priority: item.priority || 'normal',
        status: item.status || 'completed',
        source: item.source || '未选择',
        problemArea: item.problemArea || '未选择',
        problem: item.problem || '未选择',
        problemType: item.problemType || '未选择',
        subArea: item.subArea || '', //子区域
        doorNumber: item.doorNumber || '', // 门牌号
        otherAreaDescription: item.otherAreaDescription || '', // 其他区域描述
        otherSubAreaDescription: item.otherSubAreaDescription || '', // 其他子区域描述
        images: item.images || [], // 原始问题图片
        completedImages: item.completedImages || [], // 维修员完成任务后上传的图片
        creator: item.creator || '未知', // 创建人
        assignee: item.assignee || '未分配', //维修员
        createTime: createTime, // 格式化后的创建时间
        startTime: startTime, // 格式化后的开始时间
        completedTime: completedTime, // 格式化后的完成时间
        unfinishedTime: unfinishedTime, // 格式化后的未完成时间
        unfinishedReason: item.unfinishedReason || '', // 未完成原因
        date: item.date || new Date().toISOString().split('T')[0], // 日期
        completedBy: item.completedBy || '未知' // 完成任务的人
      };
    });
  },

  // 统一的日期时间格式化函数
  formatDateTime: function(dateTimeString) {
    if (!dateTimeString) return '';
    
    try {
      let date;
      
      // 尝试不同的日期格式
      if (typeof dateTimeString === 'string') {
        // 格式1: YYYY-MM-DD HH:mm
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTimeString)) {
          date = new Date(dateTimeString.replace(' ', 'T') + ':00');
        }
        // 格式2: YYYY/MM/DD HH:mm:ss 或 YYYY/MM/DD 下午HH:mm:ss
        else if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(dateTimeString)) {
          // 处理中文上午/下午格式
          let normalizedString = dateTimeString
            .replace('上午', ' AM')
            .replace('下午', ' PM')
            .replace('凌晨', ' AM')
            .replace('晚上', ' PM');
          date = new Date(normalizedString);
        }
        // 格式3: ISO格式
        else if (dateTimeString.includes('T')) {
          date = new Date(dateTimeString);
        }
        // 其他格式，尝试直接解析
        else {
          date = new Date(dateTimeString);
        }
      } else {
        date = new Date(dateTimeString);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('无效的时间格式:', dateTimeString);
        return dateTimeString; // 返回原始字符串
      }
      
      // 格式化日期时间为统一格式：YYYY-MM-DD HH:mm
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
      
    } catch (error) {
      console.error('格式化时间出错:', error, dateTimeString);
      return dateTimeString; // 出错时返回原始字符串
    }
  },
  
  classifyRecords: function(records) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    // 计算本周开始时间（周一）
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTime = weekStart.getTime();
    
    console.log('PLANT_B_CLEANING今天开始时间:', new Date(todayStart));
    console.log('PLANT_B_CLEANING本周开始时间:', weekStart);
    console.log('PLANT_B_CLEANING需要分类的记录:', records);
    
    // 初始化数组
    const todayCompleted = [];
    const todayUnfinished = [];
    const weekCompleted = [];
    const weekUnfinished = [];
    const olderCompleted = [];
    const olderUnfinished = [];
    
    // 分类记录
    records.forEach(item => {
      let recordTime = null;
      
      if (item.status === 'completed' && item.completedTime) {
        // 解析完成时间
        const completedDate = this.parseCompletedTime(item.completedTime);
        if (completedDate) {
          recordTime = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate()).getTime();
        }
      } else if (item.status === 'unfinished' && item.unfinishedTime) {
        // 解析未完成时间
        const unfinishedDate = this.parseCompletedTime(item.unfinishedTime);
        if (unfinishedDate) {
          recordTime = new Date(unfinishedDate.getFullYear(), unfinishedDate.getMonth(), unfinishedDate.getDate()).getTime();
        }
      }
      
      if (!recordTime) return;
      
      // 按时间分类
      if (recordTime === todayStart) {
        // 今日记录
        if (item.status === 'completed') {
          todayCompleted.push(item);
        } else {
          todayUnfinished.push(item);
        }
      } else if (recordTime >= weekStartTime && recordTime < todayStart) {
        // 本周记录
        if (item.status === 'completed') {
          weekCompleted.push(item);
        } else {
          weekUnfinished.push(item);
        }
      } else {
        // 更早记录
        if (item.status === 'completed') {
          olderCompleted.push(item);
        } else {
          olderUnfinished.push(item);
        }
      }
    });
    
    // 合并今日记录
    const todayRecords = [...todayCompleted, ...todayUnfinished];
    const weekRecords = [...weekCompleted, ...weekUnfinished];
    const olderRecords = [...olderCompleted, ...olderUnfinished];
    
    // 统计数量
    const totalCount = records.length;
    const todayCount = todayRecords.length;
    const weekCount = weekRecords.length;
    const completedCount = todayCompleted.length + weekCompleted.length + olderCompleted.length;
    const unfinishedCount = todayUnfinished.length + weekUnfinished.length + olderUnfinished.length;
    
    console.log('PLANT_B_CLEANING分类后的记录:', {
      totalCount: totalCount,
      todayCount: todayCount,
      weekCount: weekCount,
      completedCount: completedCount,
      unfinishedCount: unfinishedCount,
      todayCompleted: todayCompleted,
      todayUnfinished: todayUnfinished,
      weekCompleted: weekCompleted,
      weekUnfinished: weekUnfinished,
      olderCompleted: olderCompleted,
      olderUnfinished: olderUnfinished
    });
    
    this.setData({
      records: records,
      todayRecords: todayRecords,
      weekRecords: weekRecords,
      olderRecords: olderRecords,
      todayCompletedRecords: todayCompleted,
      todayUnfinishedRecords: todayUnfinished,
      weekCompletedRecords: weekCompleted,
      weekUnfinishedRecords: weekUnfinished,
      olderCompletedRecords: olderCompleted,
      olderUnfinishedRecords: olderUnfinished,
      totalCount: totalCount,
      todayCount: todayCount,
      weekCount: weekCount,
      completedCount: completedCount,
      unfinishedCount: unfinishedCount
    });
  },
  
  // 解析时间，处理不同格式
  parseCompletedTime: function(timeString) {
    if (!timeString) return null;
    
    // 现在所有时间都已经格式化为 YYYY-MM-DD HH:mm 格式
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timeString)) {
      const [datePart] = timeString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      console.log('PLANT_B_REPAIR成功解析时间:', timeString, '->', date);
      return date;
    }
    
    // 尝试其他格式
    console.warn('PLANT_B_REPAIR无法解析的时间格式:', timeString);
    
    // 尝试直接解析
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        console.log('PLANT_B_REPAIR直接解析时间:', timeString, '->', date);
        return date;
      }
    } catch (error) {
      console.error('PLANT_B_REPAIR解析时间出错:', error);
    }
    
    return null;
  },
  
  goBack: function() {
    wx.navigateBack();
  },
  
  // 预览图片
  previewImage: function(e) {
    try {
      const id = parseInt(e.currentTarget.dataset.id);
      const index = parseInt(e.currentTarget.dataset.index);
      const imageType = e.currentTarget.dataset.type || 'images'; // images 或 completedImages
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
  
  showFilter: function() {
    const that = this;
    wx.showActionSheet({
      itemList: ['全部', '已完成', '未完成', '今日记录', '本周记录', '更早记录'],
      success: function(res) {
        that.filterRecords(res.tapIndex);
      },
      fail: function(res) {
        console.log('筛选取消');
      }
    });
  },

  filterRecords: function(filterIndex) {
    const todos = wx.getStorageSync(this.data.storageKey) || [];
    let filteredRecords = [];

    switch(filterIndex) {
      case 0: // 全部
        filteredRecords = todos.filter(item => item.status === 'completed' || item.status === 'unfinished');
        break;
      case 1: // 已完成
        filteredRecords = todos.filter(item => item.status === 'completed');
        break;
      case 2: // 未完成
        filteredRecords = todos.filter(item => item.status === 'unfinished');
        break;
      case 3: // 今日记录
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        filteredRecords = todos.filter(item => {
          if ((item.status === 'completed' && item.completedTime) ||
              (item.status === 'unfinished' && item.unfinishedTime)) {
            const timeString = item.status === 'completed' ? item.completedTime : item.unfinishedTime;
            const recordDate = this.parseCompletedTime(timeString);
            if (recordDate) {
              const recordTime = new Date(recordDate.getFullYear(), recordDate.getMonth(),recordDate.getDate()).getTime();
              return recordTime === todayStart;
            }
          }
          return false;
        });
        break;
        case 4: // 本周记录
        const today2 = new Date();
        const todayStart2 = new Date(today2.getFullYear(), today2.getMonth(), today2.getDate()).getTime();
        const dayOfWeek = today2.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(today2);
        weekStart.setDate(today2.getDate() - diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        const weekStartTime = weekStart.getTime();
        
        filteredRecords = todos.filter(item => {
          if ((item.status === 'completed' && item.completedTime) || 
              (item.status === 'unfinished' && item.unfinishedTime)) {
            const timeString = item.status === 'completed' ? item.completedTime : item.unfinishedTime;
            const recordDate = this.parseCompletedTime(timeString);
            if (recordDate) {
              const recordTime = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
              return recordTime >= weekStartTime && recordTime < todayStart2;
            }
          }
          return false;
        });
        break;
      case 5: // 更早记录
        const today3 = new Date();
        const todayStart3 = new Date(today3.getFullYear(), today3.getMonth(), today3.getDate()).getTime();
        const dayOfWeek3 = today3.getDay();
        const diffToMonday3 = dayOfWeek3 === 0 ? 6 : dayOfWeek3 - 1;
        const weekStart3 = new Date(today3);
        weekStart3.setDate(today3.getDate() - diffToMonday3);
        weekStart3.setHours(0, 0, 0, 0);
        const weekStartTime3 = weekStart3.getTime();
        
        filteredRecords = todos.filter(item => {
          if ((item.status === 'completed' && item.completedTime) || 
              (item.status === 'unfinished' && item.unfinishedTime)) {
            const timeString = item.status === 'completed' ? item.completedTime : item.unfinishedTime;
            const recordDate = this.parseCompletedTime(timeString);
            if (recordDate) {
              const recordTime = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
              return recordTime < weekStartTime3;
            }
          }
          return false;
        });
        break;
      default:
        filteredRecords = todos.filter(item => item.status === 'completed' || item.status === 'unfinished');
    }

    // 验证和格式胡记录
    const validatedRecords = this.validateRecords(filteredRecords);
    
    // 重新分类
    this.classifyRecords(filteredRecords);
  }
});