// pages/homepage/homepage.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
Page({
  data:{
    follow:false
  },
  onLoad: function (options) {
    if(options.openid){
      db.collection("users").where({
        _openid:options.openid
      }).get().then(res=>{
        this.setData({
          openid:options.openid,
          useropenid:app.globalData.openid,
          image:res.data[0].userphoto,
          name:res.data[0].username
        })
      })
    }else{
      var item = app.globalData.item;      
      this.setData({
        image:item.authorimg,
        name:item.authorname,
        openid:item._openid,
        useropenid:app.globalData.openid
      })
      console.log(this.data.openid);
      console.log(this.data.useropenid);
      
    }
    db.collection("album").where({
      _openid:this.data.openid
    }).get().then(res=>{
      let items = res.data
      items.map(item=>{
        item.cover=item.cover?(item.cover==""?"images/album.png":item.cover):"/images/album.png"
        return item
      })
      this.setData({
        albums:items
      })
    })
    db.collection("follow").where({
      _openid:this.data.useropenid,
      followedId:this.data.openid
    }).get().then(res=>{
      if(res.data.length!=0){
        this.setData({
          follow:true
        })
      }
    })
    console.log(this.data.follow);
  },
  follow(){
    db.collection("follow").add({
      data:{
        followedId:this.data.openid,
        followedname:this.data.name,
        followedimage:this.data.image,
        followername:app.globalData.username,
        followerimage:app.globalData.userphoto,
      },
      success : res=>{
        wx.showToast({
          title: '关注成功',
        })
        this.setData({
          follow:true
        })
      },
      fail : res=>{
        wx.showToast({
          icon:"none",
          title: '关注失败',
        })
      }
    })
  },
  toalbum(e){
    var albumId = this.data.albums[e.currentTarget.dataset.index]._id
    wx.navigateTo({
      url: '/pages/album/album?albumId='+albumId,
    })
  },
  unfollow(e){
    db.collection("follow").where({
      _openid:this.data.useropenid,
      followedId:this.data.openid
    }).remove({
      success:res=>{
        wx.showToast({
          title: '取消关注成功',
        })
        this.setData({
          follow:false
        })
      },
      fail:res=>{
        wx.showToast({
          icon:"none",
          title: '取消关注失败',
        })
      }
    })
  },
  onReachBottom(){
    db.collection("album").where({
      _openid:this.data.openid
    }).skip(skip).get().then(res=>{
      let items = res.data
      items.map(item=>{
        item.cover=item.cover?(item.cover==""?"images/album.png":item.cover):"/images/album.png"
        return item
      })
      this.setData({
        albums:this.data.albums.concat(items)
      })
    })
    skip += 20;
  },
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/homepage/homepage?openid='+this.data.openid);
    return {
      title: "口袋作品集",
      path:`/pages/index/index?url=${url}` 
    }
  }
})