// pages/front/front.js
const app = getApp()
const db = wx.cloud.database()
Page({
  getUserInfo(e){
    console.log(e.detail.userInfo);
    if(e.detail.userInfo){
      var authorname = e.detail.userInfo.nickName;
      var authorimg = e.detail.userInfo.avatarUrl;
      app.globalData.username = authorname;
      app.globalData.userphoto = authorimg;
      db.collection("users").where({
        _openid:app.globalData.openid
      }).get().then(res=>{
        if(res.data.length==0){
          db.collection("users").add({
            data:{
              username:app.globalData.username,
              userphoto:app.globalData.userphoto
            }
          })
        }else{
          db.collection("users").where({
            _openid:app.globalData.openid
          }).update({
            data:{
              username:app.globalData.username,
              userphoto:app.globalData.userphoto
            }
          })
        }
        wx.switchTab({
          url: '/pages/index/index', 
        })
      })
    }else{
      wx.showToast({
        icon:"none",
        title: '授权后才能使用',
      })
    }
  }
})