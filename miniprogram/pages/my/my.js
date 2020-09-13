// miniprogram/pages/my.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
Page({
  data:{
    hidden:true,
    arr:[]
  },
  onLoad: function (options) {
    this.setData({
      username:app.globalData.username,
      userimage:app.globalData.userphoto,
      arr:[]
    })
    this.init()
  },
  onShow:function(){
    this.onLoad()
  },
  init(){
    db.collection('album').where({
      _openid:app.globalData.openid
    }).get().then(res=>{      
      let items = res.data
      items.map(item=>{
        item.cover=item.cover?(item.cover==""?"images/album.png":item.cover):"/images/album.png"
        return item
      })
      this.setData({
        albums:items
      })
    });
  },
  edit(e){
    var that = this
    wx.showActionSheet({  
      itemList: ["删除专辑","重命名"],  
      success: function(res) {  
          if(res.tapIndex==0){
            that.deleteAll(e);
            that.init();
          }else{
            that.setData({
              hidden:false,
              editId:that.data.albums[e.currentTarget.dataset.index]._id
            })
          }
      },  
      fail: function(res) {  
          console.log(res.errMsg)  
      }
  })  
  },
  deleteAll(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '删除专辑将删除其中所有作品，确定删除？',
      success: function (res) {
        if (res.confirm) {
          db.collection("album").where({
            _id:that.data.albums[e.currentTarget.dataset.index]._id
          }).remove();
          db.collection("albuminfo").where({
            aid:that.data.albums[e.currentTarget.dataset.index]._id
          }).get().then(res=>{
            for(var i=0;i<res.data.length;i++){
              wx.cloud.callFunction({
                name:'remove',
                data: {
                  id: res.data[i].wid,
                  openid: res.data[i]._openid
                }
              })
            }
          })
        }
      }
    })
  },
  inputAlbumName(e){
    this.setData({
      editname:e.detail.value
    })
  },
  cancel: function(){
    this.setData({
        hidden: true,
    });
  },
  confirm(){
    db.collection('album').doc(this.data.editId).update({
      data: {
        name:this.data.editname
      },
      success: res => {
        wx.showToast({
          title: '修改成功'
        })
        this.setData({
          hidden:true
        })
        this.init()
      },
      fail: err => {
        wx.showToast({
          title: '修改失败'
        })
        this.setData({
          hidden:true
        })
        this.init()
      }
    })
  },
  tofollow(){
    wx.navigateTo({
      url: '/pages/follow/follow',
    })
  },
  tofans(){
    wx.navigateTo({
      url: '/pages/fans/fans',
    })
  },
  tocollect(){
    wx.navigateTo({
      url: '/pages/collect/collect',
    })
  },
  toalbum(e){
    var albumId = this.data.albums[e.currentTarget.dataset.index]._id
    wx.navigateTo({
      url: '/pages/album/album?albumId='+albumId,
    })
  },
  onReachBottom(){
    db.collection('album').where({
      _openid:app.globalData.openid
    }).sikp(skip).get().then(res=>{      
      let items = res.data
      items.map(item=>{
        item.cover=item.cover?(item.cover==""?"images/album.png":item.cover):"/images/album.png"
        return item
      })
      this.setData({
        albums:this.data.albums.concat(items)
      })
    });
    skip += 20;
  },
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/homepage/homepage?openid='+app.globalData.openid);
    return {
      title: "口袋作品集",
      path:`/pages/index/index?url=${url}` 
    }
  }
})