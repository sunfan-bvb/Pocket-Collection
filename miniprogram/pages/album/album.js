// pages/album/album.js
const db = wx.cloud.database()
const app = getApp()
var skip = 20
Page({
  data:{
    works:[]
  },
  onLoad: function (options) {
    var albumId = options.albumId;
    this.setData({
      albumId:albumId
    })
    db.collection("albuminfo").where({
      aid:albumId
    }).orderBy("time","desc").get().then(res=>{
      this.init(res)
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
      if(!(app.globalData.openid!=res.data[0]._openid&&res.data[0].private)){
        result.push(res.data[0])
      }
    }
    wx.hideLoading();
    let items = result.map(item =>{
      return item;
    })
    this.setData({
      works:this.data.works.concat(items)
    })
  },
  todetail(e){
    app.globalData.item=e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../detail/detail',
    })
  },
  onReachBottom(){
    db.collection("albuminfo").where({
      aid:albumId
    }).orderBy("time","desc").skip(skip).get().then(res=>{
      this.init(res)
    })
    skip += 20;
  },
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/album/album?albumId='+this.data.albumId);
    return {
      title: "口袋作品集",
      path:`/pages/index/index?url=${url}` 
    }
  }
})