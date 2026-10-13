// pages/PLANT_B_CLEANING/statistics/statistics.js
Page({
  data: {
    scrollHeight: 0,
    currentTab: 'today', // 当前标签页
    
    // 总统计
    totalStats: {
      total: 0,        // 总工单数
      completed: 0,    // 已完成数
      urgent: 0,       // 紧急工单数
      unfinished: 0,   // 未完成数
      inProgress: 0    // 进行中数
    },
    
    // 今日统计
    todayStats: {
      data: {},        // 各来源数量
      areaData: {},    // 各区域数量
      problemData: {}, // 各问题数量
      subAreaData: {   // 子区域统计
        '室外': {},
        '地下室': {},
        '一楼': {},
        '二楼': {},
        '三楼': {},
        '楼顶': {},
        '其他': {}
      },
      total: 0,        // 今日总数
      areaTotal: 0,    // 区域总数
      problemTotal: 0  // 问题总数
    },
    
    // 本周统计
    weekStats: {
      data: {},        // 各来源数量
      areaData: {},    // 各区域数量
      problemData: {}, // 各问题数量
      subAreaData: {   // 新增：子区域统计
        '室外': {},
        '地下室': {},
        '一楼': {},
        '二楼': {},
        '三楼': {},
        '楼顶': {},
        '其他': {}
      },
      total: 0,        // 本周总数
      areaTotal: 0,    // 区域总数
      problemTotal: 0  // 问题总数
    },
    
    // 本月统计
    monthStats: {
      data: {},        // 各来源数量
      areaData: {},    // 各区域数量
      problemData: {}, // 各问题数量
      subAreaData: {   // 新增：子区域统计
        '室外': {},
        '地下室': {},
        '一楼': {},
        '二楼': {},
        '三楼': {},
        '楼顶': {},
        '其他': {}
      },
      total: 0,        // 本月总数
      areaTotal: 0,    // 区域总数
      problemTotal: 0  // 问题总数
    },
    
    // 定义所有选项
    sourceOptions: ["保洁自查", "组内检查", "日常巡检", "卫生检查", "其他"],
    areaOptions: ["室外", "一楼", "二楼", "三楼", "其他"],
    problemOptions: ['卫生间问题','地面', '屋顶', '墙面', '门', '窗', '家具', '标签类', '其他'],
    problemTypeOptions: ['清洁', '更换', '维修', '疏通', '其他'],

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
    
    // 存储键
    storageKey: 'todos_PLANT_B_CLEANING',

    // 新增：展开的子区域（用于折叠功能）
    expandedAreas: {
      "室外": false,
      "一楼": false,
      "二楼": false,
      "三楼": false,
      "其他": false
}
  },

  onLoad: function(options) {
    this.calculateScrollHeight();
    this.loadStatistics();
  },

  onShow: function() {
    this.loadStatistics();
  },

  onPullDownRefresh: function() {
    this.refreshData();
  },

  // 计算滚动区域高度
  calculateScrollHeight: function() {
    const systemInfo = wx.getSystemInfoSync();
    const windowHeight = systemInfo.windowHeight;
    
    // 计算高度：总高度减去各个固定元素的高度
    const headerHeight = 100; // 顶部标题栏
    const statsHeight = 120;  // 统计概览
    const tabsHeight = 90;    // 标签页高度
    
    this.setData({
      scrollHeight: windowHeight - headerHeight - statsHeight - tabsHeight - 60
    });
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    }, () => {
      this.calculateScrollHeight();
    });
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      // 从 PLANT_B_CLEANING 专用存储获取所有待办事项
      const todos = wx.getStorageSync(this.data.storageKey) || [];
      console.log('PLANT_B_CLEANING统计页面 - 所有任务：', todos);
      
      // 处理统计数据
      this.processStatistics(todos);
      
    } catch (error) {
      console.error('PLANT_B_CLEANING加载统计数据时出错:', error);
      wx.showToast({
        title: '加载统计失败',
        icon: 'none',
      });
    }
  },
  // 处理统计数据
  processStatistics: function(todos) {
    console.log('PLANT_B_CLEANING开始处理统计数据，任务数量:', todos.length);
    
    // 初始化统计对象
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000; // 明天开始时间
    
    // 计算本周开始时间（周一）
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTime = weekStart.getTime();
    const nextWeekStart = weekStartTime + 7 * 24 * 60 * 60 * 1000; // 下周开始时间
    
    // 计算本月开始时间（每月1号）
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime(); // 下月开始时间
    
    // 获取选项列表
    const sourceOptions = this.data.sourceOptions;
    const areaOptions = this.data.areaOptions;
    const problemOptions = this.data.problemOptions;
    const problemTypeOptions = this.data.problemTypeOptions;
    const subAreaMap = this.data.subAreaMap;
    
    // 初始化统计数据
    // 今日统计
    const todayData = {};
    const todayAreaData = {};
    const todayProblemData = {};
    const todayProblemTypeData = {};
    const todaySubAreaData = {
      '室外': {},
      '地下室': {},
      '一楼': {},
      '二楼': {},
      '三楼': {},
      '楼顶': {},
      '其他': {}
    };
    
    // 本周统计
    const weekData = {};
    const weekAreaData = {};
    const weekProblemData = {};
    const weekProblemTypeData = {};
    const weekSubAreaData = {
      '室外': {},
      '地下室': {},
      '一楼': {},
      '二楼': {},
      '三楼': {},
      '楼顶': {},
      '其他': {}
    };
    
    // 本月统计
    const monthData = {};
    const monthAreaData = {};
    const monthProblemData = {};
    const monthProblemTypeData = {};
    const monthSubAreaData = {
      '室外': {},
      '地下室': {},
      '一楼': {},
      '二楼': {},
      '三楼': {},
      '楼顶': {},
      '其他': {}
    };
    
    // 初始化所有分类为0
    sourceOptions.forEach(option => {
      todayData[option] = 0;
      weekData[option] = 0;
      monthData[option] = 0;
    });
    areaOptions.forEach(option => {
      todayAreaData[option] = 0;
      weekAreaData[option] = 0;
      monthAreaData[option] = 0;
    });
    problemOptions.forEach(option => {
      todayProblemData[option] = 0;
      weekProblemData[option] = 0;
      monthProblemData[option] = 0;
    });
    problemTypeOptions.forEach(option => {
      todayProblemTypeData[option] = 0;
      weekProblemTypeData[option] = 0;
      monthProblemTypeData[option] = 0;
    });

    // 初始化子区域统计为0
    areaOptions.forEach(area => {
      if (subAreaMap[area]) {
        subAreaMap[area].forEach(subArea => {
          todaySubAreaData[area][subArea] = 0;
          weekSubAreaData[area][subArea] = 0;
          monthSubAreaData[area][subArea] = 0;
        });
      }
    });

    // 总统计
    let totalCount = todos.length;
    let completedCount = 0;
    let urgentCount = 0;
    let unfinishedCount = 0;
    let inProgressCount = 0;
    
    // 遍历所有任务
    todos.forEach(item => {
      // 按状态统计
      switch(item.status) {
        case 'completed':
          completedCount++;
          break;
        case 'unfinished':
          unfinishedCount++;
          break;
        case 'in-progress':
          inProgressCount++;
          break;
      }

      // 按优先级统计
      if (item.priority === 'high') {
        urgentCount++;
      }

      // 获取任务的时间信息
      let taskTime = null;
      const timeFields = [
        'completedTime',    
        'unfinishedTime',   
        'startTime',       
        'createTime',    
        'estimatedTime',   
        'assignedTime'   
      ];
      
      for (const field of timeFields) {
        if (item[field]) {
          taskTime = this.parseTime(item[field]);
          if (taskTime) break; 
        }
      }
      
      if (!taskTime) {
        taskTime = new Date();
      }
      
      // 计算记录时间（只取日期部分）
      const recordTime = new Date(taskTime.getFullYear(), taskTime.getMonth(), taskTime.getDate()).getTime();
      
      // 按来源统计
      const source = item.source || '其他';
      // 按区域统计
      const area = item.problemArea || '其他';
      // 按问题类型统计
      const problem = item.problem || '其他';
      // 按问题分类统计
      const problemType = item.problemType || '其他';
      const subArea = item.subArea || '其他';
      
      // 今日统计 - 使用范围判断
      if (recordTime >= todayStart && recordTime < tomorrowStart) {
        todayData[source] = (todayData[source] || 0) + 1;
        todayAreaData[area] = (todayAreaData[area] || 0) + 1;
        todayProblemData[problem] = (todayProblemData[problem] || 0) + 1;
        todayProblemTypeData[problemType] = (todayProblemTypeData[problemType] || 0) + 1;

        // 子区域统计
        if (area in todaySubAreaData && subArea) {
          todaySubAreaData[area][subArea] = (todaySubAreaData[area][subArea] || 0) + 1;
        }
      }
      
      // 本周统计 - 包含今日
      if (recordTime >= weekStartTime && recordTime < nextWeekStart) {
        weekData[source] = (weekData[source] || 0) + 1;
        weekAreaData[area] = (weekAreaData[area] || 0) + 1;
        weekProblemData[problem] = (weekProblemData[problem] || 0) + 1;
        weekProblemTypeData[problemType] = (weekProblemTypeData[problemType] || 0) + 1;

        // 子区域统计
        if (area in weekSubAreaData && subArea) {
          weekSubAreaData[area][subArea] = (weekSubAreaData[area][subArea] || 0) + 1;
        }
      }
      
      // 本月统计 - 包含今日
      if (recordTime >= monthStart && recordTime < nextMonthStart) {
        monthData[source] = (monthData[source] || 0) + 1;
        monthAreaData[area] = (monthAreaData[area] || 0) + 1;
        monthProblemData[problem] = (monthProblemData[problem] || 0) + 1;
        monthProblemTypeData[problemType] = (monthProblemTypeData[problemType] || 0) + 1;

        // 子区域统计
        if (area in monthSubAreaData && subArea) {
          monthSubAreaData[area][subArea] = (monthSubAreaData[area][subArea] || 0) + 1;
        }
      }
    });
    
    // 计算各分类的总数
    const todaySourceTotal = sourceOptions.reduce((sum, option) => sum + (todayData[option] || 0), 0);
    const todayAreaTotal = areaOptions.reduce((sum, option) => sum + (todayAreaData[option] || 0), 0);
    const todayProblemTotal = problemOptions.reduce((sum, option) => sum + (todayProblemData[option] || 0), 0);
    const todayProblemTypeTotal = problemTypeOptions.reduce((sum, option) => sum + (todayProblemTypeData[option] || 0), 0);
    
    const weekSourceTotal = sourceOptions.reduce((sum, option) => sum + (weekData[option] || 0), 0);
    const weekAreaTotal = areaOptions.reduce((sum, option) => sum + (weekAreaData[option] || 0), 0);
    const weekProblemTotal = problemOptions.reduce((sum, option) => sum + (weekProblemData[option] || 0), 0);
    const weekProblemTypeTotal = problemTypeOptions.reduce((sum, option) => sum + (weekProblemTypeData[option] || 0), 0);
    
    const monthSourceTotal = sourceOptions.reduce((sum, option) => sum + (monthData[option] || 0), 0);
    const monthAreaTotal = areaOptions.reduce((sum, option) => sum + (monthAreaData[option] || 0), 0);
    const monthProblemTotal = problemOptions.reduce((sum, option) => sum + (monthProblemData[option] || 0), 0);
    const monthProblemTypeTotal = problemTypeOptions.reduce((sum, option) => sum + (monthProblemTypeData[option] || 0), 0);
    
    // 更新数据
    this.setData({
      // 总统计
      'totalStats': {
        total: totalCount,
        completed: completedCount,
        urgent: urgentCount,
        unfinished: unfinishedCount,
        inProgress: inProgressCount
      },
      // 今日统计
      'todayStats': {
        data: todayData,
        areaData: todayAreaData,
        problemData: todayProblemData,
        problemTypeData: todayProblemTypeData,
        subAreaData: todaySubAreaData,
        total: todaySourceTotal,
        areaTotal: todayAreaTotal,
        problemTotal: todayProblemTotal,
        problemTypeTotal: todayProblemTypeTotal
      },
      // 本周统计
      'weekStats': {
        data: weekData,
        areaData: weekAreaData,
        problemData: weekProblemData,
        problemTypeData: weekProblemTypeData,
        subAreaData: weekSubAreaData,
        total: weekSourceTotal,
        areaTotal: weekAreaTotal,
        problemTotal: weekProblemTotal,
        problemTypeTotal: weekProblemTypeTotal
      },
      // 本月统计
      'monthStats': {
        data: monthData,
        areaData: monthAreaData,
        problemData: monthProblemData,
        problemTypeData: monthProblemTypeData,
        subAreaData: monthSubAreaData,
        total: monthSourceTotal,
        areaTotal: monthAreaTotal,
        problemTotal: monthProblemTotal,
        problemTypeTotal: monthProblemTypeTotal
      }
    });
    
    console.log('PLANT_A_CLEANING统计数据更新完成', {
      totalStats: this.data.totalStats,
      todayTotal: todaySourceTotal,
      weekTotal: weekSourceTotal,
      monthTotal: monthSourceTotal,
      todayProblemTypeTotal: todayProblemTypeTotal,
      weekProblemTypeTotal: weekProblemTypeTotal,
      monthProblemTypeTotal: monthProblemTypeTotal,
    });
  },
  // 解析时间函数
  parseTime: function(timeString) {
    if (!timeString) return null;
    
    let date = null;
    
    try {
      // 如果已经是Date对象
      if (timeString instanceof Date) {
        return timeString;
      }
      
      // 如果是时间戳
      if (typeof timeString === 'number') {
        date = new Date(timeString);
      }
      // 格式1: YYYY-MM-DD HH:mm
      else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timeString)) {
        const [datePart, timePart] = timeString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hours, minutes);
      }
      // 格式2: YYYY/MM/DD HH:mm:ss
      else if (/^\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        date = new Date(timeString.replace(/\//g, '-'));
      }
      // 格式3: YYYY-MM-DDTHH:mm:ss (ISO格式)
      else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timeString)) {
        date = new Date(timeString);
      }
      // 其他格式，尝试直接解析
      else {
        date = new Date(timeString);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('无效的时间:', timeString);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('解析时间时出错:', error, '时间字符串:', timeString);
      return null;
    }
  },

  // 切换子区域展开状态
  toggleSubArea: function(e) {
    const area = e.currentTarget.dataset.area;
    const expandedAreas = this.data.expandedAreas;
    expandedAreas[area] = !expandedAreas[area];
    
    this.setData({
      expandedAreas: expandedAreas
    });
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
      try {
        this.loadStatistics();
        wx.hideLoading();
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      } catch (error) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '刷新失败',
          icon: 'error'
        });
      }
    }, 500);
  },

  // ========== 导出功能 ==========
  // 导出数据为Excel/CSV
  exportToExcel: function() {
    wx.showLoading({
      title: '准备导出...',
    });

    try {
      const { currentTab, todayStats, weekStats, monthStats, sourceOptions, areaOptions, problemOptions, subAreaMap } = this.data;

      let csvContent = '';
      let fileName = '';

      // 根据当前标签页选择数据
      let stats, tabName;
      if (currentTab === 'today') {
        stats = todayStats;
        tabName = '今日统计';
      } else if (currentTab === 'week') {
        stats = weekStats;
        tabName = '本周统计';
      } else {
        stats = monthStats;
        tabName = '本月统计';
      }

      fileName = `维修统计_${tabName}_${this.formatDate(new Date())}.csv`;

      // 添加总览信息
      csvContent += `保洁统计报表 - ${tabName}\n`;
      csvContent += `生成时间：${this.formatDateTime(new Date())}\n`;
      csvContent += `总工单数：${stats.total || 0}\n`;
      csvContent += `区域总数：${stats.areaTotal || 0}\n`;
      csvContent += `问题总数：${stats.problemTotal || 0}\n\n`;

      // 添加按来源统计
      csvContent += "按来源统计\n";
      csvContent += "来源，数量，占比\n";
      sourceOptions.forEach(option => {
        const count = stats.data[option] || 0;
        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
        csvContent += `${option},${count},${percentage}%\n`;
      });

      csvContent += "\n";

      // 添加按问题区域统计
      csvContent += "按问题区域统计\n";
      csvContent += "区域，数量，占比\n";
      areaOptions.forEach(option => {
        const count = stats.areaData[option] || 0;
        const percentage = stats.areaTotal > 0 ? ((count / stats.areaTotal) * 100).toFixed(1) : 0;
        csvContent += `${option},${count},${percentage}%\n`;
      });

      // 添加子区域统计
      csvContent += "子区域详细统计\n";
      areaOptions.forEach(area => {
        if (subAreaMap[area] && stats.subAreaData && stats.subAreaData[area]) {
          csvContent += `${area}子区域统计\n`;
          subAreaMap[area].forEach(subArea => {
            const count = stats.subAreaData[area][subArea] || 0;
            if (count > 0) {
              csvContent += `  ${subArea},${count}\n`;
            }
          });
        }
      });

      // 添加总体统计
      csvContent += "\n";
      csvContent += "总体统计\n";
      csvContent += "统计项，数量\n";
      csvContent += `总工单数，${this.data.totalStats.total}\n`;
      csvContent += `已完成数，${this.data.totalStats.completed}\n`;
      csvContent += `紧急工单，${this.data.totalStats.urgent}\n`;
      csvContent += `未完成数，${this.data.totalStats.unfinished}\n`;
      csvContent += `进行中数，${this.data.totalStats.inProgress}\n`;

      // 保存文件
      this.saveCSVFile(csvContent, fileName);

    } catch (error) {
      console.error('导出数据时出错：', error);
      wx.hideLoading();
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  // 保存CSV文件
  saveCSVFile: function(csvContent, fileName) {
    // 获取文件系统管理器
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

    try {
      // 写入文件
      fs.writeFileSync(filePath, csvContent, 'utf8');

      // 保存文件到用户设备
      wx.saveFileToDisk({
        filePath: filePath,
        success: (res) => {
          wx.hideLoading();
          wx.showToast({
            title: '已保存到下载文件夹',
            icon: 'success',
            duration: 3000
          });
        },
        fail: (err) => {
          // 如果微信版本不支持saveFileToDisk, 使用分享功能
          this.shareCSVFile(filePath, fileName);
        }
      });
    } catch (error) {
      console.error('保存文件失败：', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 分享CSV文件
  shareCSVFile: function(filePath, fileName) {
    wx.hideLoading();

    wx.showModal({
      title: '导出成功',
      content: '文件已生成，请选择分享方式',
      confirmText: '分享文件',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          wx.shareFileMessage({
            filePath: filePath,
            fileName: fileName,
            success: () => {
              wx.showToast({
                title: '分享成功',
                icon: 'success'
              });
            },
            fail: () => {
              wx.showToast({
                title: '分享失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 导出全部统计数据
  exportAllStatistics: function() {
    wx.showLoading({
      title: '正在生成完整报表...',
    });

    try {
      const { todayStats, weekStats, monthStats, sourceOptions, areaOptions, problemOptions, totalStats, subAreaMap } = this.data;

      let csvContent = '';
      const fileName = `保洁统计_完整报表_${this.formatDate(new Date())}.csv`;

      // 添加报表标题
      csvContent += `保洁统计完整报表\n`;
      csvContent += `生成时间：${this.formatDateTime(new Date())}\n\n`;

      // 添加总体统计
      csvContent += "===== 总体统计 =====\n";
      csvContent += "统计项，数量\n";
      csvContent += `总工单数，${totalStats.total}\n`;
      csvContent += `已完成数，${totalStats.completed}\n`;
      csvContent += `紧急工单，${totalStats.urgent}\n`;
      csvContent += `未完成数，${totalStats.unfinished}\n`;
      csvContent += `进行中数，${totalStats.inProgress}\n\n`;

      // 今日统计
      csvContent += "===== 今日统计 =====\n";
      csvContent += `总工单数：${todayStats.total || 0}\n\n`;

      csvContent += "按来源统计\n";
      sourceOptions.forEach(option => {
        csvContent += `${option},${todayStats.data[option] || 0}\n`;
      });

      csvContent += "\n按问题区域统计\n";
      areaOptions.forEach(option => {
        csvContent += `${option},${todayStats.areaData[option] || 0}\n`;
      });

      csvContent += "\n按问题类型统计\n";
      problemOptions.forEach(option => {
        csvContent += `${option},${todayStats.problemData[option] || 0}\n`;
      });

      // 添加今日子区域统计
      csvContent += "\n今日子区域详细统计\n";
      areaOptions.forEach(area => {
        if (subAreaMap[area] && todayStats.subAreaData && todayStats.subAreaData[area]) {
          csvContent += `${area}子区域统计\n`;
          subAreaMap[area].forEach(subArea => {
            const count = todayStats.subAreaData[area][subArea] || 0;
            if (count > 0) {
              csvContent += `  ${subArea},${count}\n`;
            }
          });
        }
      });

      csvContent += "\n\n";

      // 本周统计
      csvContent += "===== 本周统计 =====\n";
      csvContent += `总工单数：${weekStats.total || 0}\n\n`;

      csvContent += "按来源统计\n";
      sourceOptions.forEach(option => {
        csvContent += `${option},${weekStats.data[option] || 0}\n`;
      });

      csvContent += "\n按问题区域统计\n";
      areaOptions.forEach(option => {
        csvContent += `${option},${weekStats.areaData[option] || 0}\n`;
      });

      csvContent += "\n按问题类型统计\n";
      problemOptions.forEach(option => {
        csvContent += `${option},${weekStats.problemData[option] || 0}\n`;
      });

      // 添加本周子区域统计
      csvContent += "\n本周子区域详细统计\n";
      areaOptions.forEach(area => {
        if (subAreaMap[area] && weekStats.subAreaData && weekStats.subAreaData[area]) {
          csvContent += `${area}子区域统计\n`;
          subAreaMap[area].forEach(subArea => {
            const count = weekStats.subAreaData[area][subArea] || 0;
            if (count > 0) {
              csvContent += `  ${subArea},${count}\n`;
            }
          });
        }
      });

      csvContent += "\n\n";

      // 本月统计
      csvContent += "===== 本月统计 =====\n";
      csvContent += `总工单数:${monthStats.total || 0}\n\n`;

      csvContent += "按来源统计\n";
      sourceOptions.forEach(option => {
        csvContent += `${option},${monthStats.data[option] || 0}\n`;
      });

      csvContent += "\n按问题区域统计\n";
      areaOptions.forEach(option => {
        csvContent += `${option},${monthStats.areaData[option] || 0}\n`;
      });

      csvContent += "\n按问题类型统计\n";
      problemOptions.forEach(opiton => {
        csvContent += `${option},${monthStats.problemData[option] || 0}\n`;
      });

      // 添加本月子区域统计
      csvContent += "\n本月子区域详细统计\n";
      areaOptions.forEach(area => {
        if (subAreaMap[area] && monthStats.subAreaData && monthStats.subAreaData[area]) {
          csvContent += `${area}子区域统计\n`;
          subAreaMap[area].forEach(subArea => {
            const count = monthStats.subAreaData[area][subArea] || 0;
            if (count > 0) {
              csvContent += `  ${subArea},${count}\n`;
            }
          });
        }
      });

      // 保存文件
      this.saveCSVFile(csvContent, fileName);

    } catch (error) {
      console.error('导出全部数据时出错：', error);
      wx.hideLoading();
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  // 格式化日期时间
  formatDateTime: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
});