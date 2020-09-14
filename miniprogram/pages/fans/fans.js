// pages/fans/fans.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
Page({

  onLoad: function (options) {
    this.setData({
      openid:app.globalData.openid
    })
    wx.cloud.callFunction({
      name:"getfollower",
      data:{
        openid:this.data.openid
      }
    }).then(res=>{
      this.setData({
        follows:res.result.data
      })
    })
  },
  tohomepage(e){
    var follow = this.data.follows[e.currentTarget.dataset.index];
    let item = {authorimg:follow.followerimage, authorname:follow.followername, _openid:follow._openid}
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