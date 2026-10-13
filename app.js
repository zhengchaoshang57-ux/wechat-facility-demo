// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查用户选择的维修中心
    const selectedCenter = wx.getStorageSync('selectedCenter')
    
    if (!selectedCenter) {
      // 未选择维修中心，跳转到entry页面
      wx.reLaunch({
        url: '/pages/entry/index'
      })
    } else {
      // 设置当前维修中心到全局数据
      this.globalData.currentCenter = selectedCenter

      // 已选择维修中心，检查是否已登录
      const userRole = wx.getStorageSync(this.getStorageKey('userRole'))

      if (userRole) {
        // 已登录，根据角色跳转到不同页面
        let targetUrl = '';

        switch(userRole) {
          case 'admin':
            targetUrl = `/pages/${selectedCenter}/index/index`;
            break;
          case 'dispatcher':
            targetUrl = `/pages/${selectedCenter}/dispatcher/dispatcher`;
            break;
          case 'technician':
          case 'housekeeper':
            if (selectedCenter === 'PLANT_A_REPAIR' || selectedCenter === 'PLANT_B_REPAIR') {
              targetUrl = `/pages/${selectedCenter}/technician-todo/technician-todo`;
            } else {
              targetUrl = `/pages/${selectedCenter}/housekeeper-todo/housekeeper-todo`;
            }
            break;
          default:
            targetUrl = `/pages/${selectedCenter}/index/index`;
        }

        wx.reLaunch({
          url: targetUrl
        })
      } else {
        // 未登录，跳转到对应中心的登录页面
        wx.reLaunch({
          url: `/pages/${selectedCenter}/login/login`
        })
      }
    }
  },

  globalData: {
    userInfo: null,
    currentCenter: null, // 当前选择的中心：'PLANT_A_REPAIR' 或 'PLANT_B_REPAIR'

    // 维修中心配置
    centers: {
      'PLANT_A_REPAIR': {
        name: '示例厂区A维修中心',
        prefix: '_PLANT_A_REPAIR',
        config: {
          maxTodoCount: 100,
        }
      },
      'PLANT_B_REPAIR': {
        name: '示例厂区B维修中心',
        prefix: '_PLANT_B_REPAIR',
        config: {
          maxTodoCount: 100,
        },
        rolePages: {
          admin: 'index/index',
          dispatcher: 'dispatcher/dispatcher',
          technician: 'technician-todo/technician-todo'
        }
      },
      'PLANT_A_CLEANING': {
        name: '示例厂区A保洁中心',
        prefix: '_PLANT_A_CLEANING',
        config: {
          maxTodoCount: 100,
        },
        rolePages: {
          admin: 'index/index',
          dispatcher: 'dispatcher/dispatcher',
          housekeeper: 'housekeeper-todo/housekeeper-todo'
        }
      },
      'PLANT_B_CLEANING': {
        name: '示例厂区B保洁中心',
        prefix: '_PLANT_B_CLEANING',
        config: {
          maxTodoCount: 100,
        },
        rolePages: {
          admin: 'index/index',
          dispatcher: 'dispatcher/dispatcher',
          housekeeper: 'housekeeper-todo/housekeeper-todo'
        }
      }
    }
  },

  // 切换维修中心
  switchCenter(center) {
    if (this.globalData.centers[center]) {
      this.globalData.currentCenter = center
      wx.setStorageSync('selectedCenter', center)
      return true
    }
    return false
  },

  // 获取当前中心的后缀
  getCenterPrefix() {
    const center = this.globalData.currentCenter
    if (center && this.globalData.centers[center]) {
      return this.globalData.centers[center].prefix
    }
    return ''
  },

  // 获取带中心后缀的存储键名
  getStorageKey(baseKey) {
    const prefix = this.getCenterPrefix()
    return `${baseKey}${prefix}`
  },

  // 获取当前中心信息
  getCurrentCenterInfo() {
    const center = this.globalData.currentCenter
    if (center && this.globalData.centers[center]) {
      return this.globalData.centers[center]
    }
    return null
  },

  // 获取所有维修中心
  getAllCenters() {
    return this.globalData.centers
  },

  // 为中心特定的数据提供统一访问接口
  getCenterData(key,defaultValue = null) {
    const storageKey = this.getStorageKey(key)
    return wx.getStorageSync(storageKey) || defaultValue
  },

  setCenterData(key, data) {
    const storageKey = this.getStorageKey(key)
    wx.setStorageSync(storageKey, data)
  },

  removeCenterData(key) {
    const storageKey = this.getStorageKey(key)
    wx.removeStorageSync(storageKey)
  },

  // 判断用户是否已登录
  isLoggedIn() {
    const userRole = wx.getStorageSync(this.getStorageKey('userRole'))
    return !!userRole
  },

  // 获取当前用户角色
  getUserRole() {
    return wx.getStorageSync(this.getStorageKey('userRole')) || null
  },

  // 用户登录
  login(role) {
    const app = getApp()
    const loginTimeKey = app.getStorageKey('loginTime')
    const userRoleKey = app.getStorageKey('userRole')

    wx.setStorageSync(userRoleKey, role)
    wx.setStorageSync(loginTimeKey, new Date().getTime())
  },

  // 用户登出
  logout() {
    const app = getApp()
    const loginTimeKey = app.getStorageKey('loginTime')
    const userRoleKey = app.getStorageKey('userRole')

    wx.removeStorageSync(userRoleKey)
    wx.removeStorageSync(loginTimeKey)
  },

  // 获取角色对应的页面路径
  getRolePagePath(role) {
    const center = this.globalData.currentCenter
    const centerInfo = this.globalData.centers[center]

    if (centerInfo && centerInfo.rolePages && centerInfo.rolePages[role]) {
      return `/pages/${center}/${centerInfo.rolePages[role]}`
    }

    // 默认页面
    return `/pages/${center}/index/index`
  }
})