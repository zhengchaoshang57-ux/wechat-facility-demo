// pages/entry/index.js
Page({
  goToPlantARepair() {
    // 跳转到示例厂区A维修
    wx.navigateTo({
      url: '/pages/PLANT_A_REPAIR/login/login'
    })
  },

  goToPlantBRepair() {
    // 跳转到示例厂区B维修
    wx.navigateTo({
      url: '/pages/PLANT_B_REPAIR/login/login'
    })
  },

  goToPlantACleaning() {
    // 跳转到示例厂区A保洁
    wx.navigateTo({
      url: '/pages/PLANT_A_CLEANING/login/login'
    })
  },

  goToPlantBCleaning() {
    // 跳转到示例厂区B保洁
    wx.navigateTo({
      url: '/pages/PLANT_B_CLEANING/login/login'
    })
  },
})