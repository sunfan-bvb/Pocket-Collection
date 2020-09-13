// pages/fans/fans.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
Page({

  onLoad: function (options) {
    this.setData({
      openid:app.globalData.openid
    })
    db.collection("follow").where({
      followedId:this.data.openid
    }).get().then(res=>{
      this.setData({
        follows:res.data
      })
    })
  },
  tohomepage(e){
    var follow = this.data.follows[e.currentTarget.dataset.index];
    let item = {authorimg:follow.followerimage, authorname:follow.followername, openid:follow._openid}
    app.globalData.item = item;
    console.log(item);
    wx.navigateTo({
      url: '/pages/homepage/homepage',
    })
  },
  onReachBottom(){
    db.collection("follow").where({
      followedId:this.data.openid
    }).skip(skip).get().then(res=>{
      this.setData({
        follows:res.data
      })
    })
    skip += 20
  }
})