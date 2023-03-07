// pages/collect/collect.js
const db = wx.cloud.database()
const app = getApp()
Page({

  onLoad: function (options) {
    wx.setNavigationBarTitle({ title:"收藏"})
    this.beforeinit()
  },
  beforeinit(){
    db.collection("collect").where({
      _openid:app.globalData.openid
    }).get().then(res=>{
      this.init(res)
      this.setData({
        collect:res.data
      })
    })
  },
  async init(works){
    let result = [];
    for(var i=0;i<works.data.length;i++){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let res = await db.collection("works").where({
        _id:works.data[i].wid
      }).get()
      result.push(res.data[0])
    }
    wx.hideLoading();
    let items = result.map(item =>{
      return item;
    })
    this.setData({
      works:items
    })
  },
  todetail(e){
    app.globalData.item=e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../detail/detail',
    })
  },
  delete(e){
    db.collection("collect").where({
      _id:this.data.collect[e.currentTarget.dataset.index]._id
    }).remove()
    this.beforeinit()
  }
})