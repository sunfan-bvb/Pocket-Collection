// pages/follow/follow.js
const db = wx.cloud.database()
const app = getApp()
var skip = 20
Page({

  data: {
    
  },

  onLoad: function (options) {
    this.setData({
      openid:app.globalData.openid
    })
    db.collection("follow").where({
      _openid:this.data.openid
    }).get().then(res=>{
      this.setData({
        follows:res.data
      })
    })
  },
  tohomepage(e){
    var follow = this.data.follows[e.currentTarget.dataset.index];
    let item = {authorimg:follow.followedimage, authorname:follow.followedname, _openid:follow.followedId}
    app.globalData.item = item;
    wx.navigateTo({
      url: '/pages/homepage/homepage',
    })
  },
  onReachBottom(){
    db.collection("follow").where({
      _openid:this.data.openid
    }).skip(skip).get().then(res=>{
      this.setData({
        follows:this.data.follows.concat(res.data)
      })
    })
    skip +=20
  }
})