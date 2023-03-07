// pages/album/album.js
const db = wx.cloud.database()
const app = getApp()
var skip = 20
Page({
  data:{
    works:[],
    hidden:true
  },
  onLoad: function (options) {
    var albumId = options.albumId;
    this.setData({
      albumId:albumId,
      useropenid:app.globalData.openid
    })
    db.collection("albuminfo").where({
      aid:albumId
    }).orderBy("time","desc").get().then(res=>{
      this.init(res)
    })
    db.collection("album").doc(albumId).get().then(res=>{
      wx.setNavigationBarTitle({ title:res.data.name})
      this.setData({
        openid:res.data._openid
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
      aid:this.data.albumId
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
  },
  rename(){
    this.setData({
      hidden:false
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
    db.collection('album').doc(this.data.albumId).update({
      data: {
        name:this.data.editname
      },
      success: res => {
        wx.showToast({
          title: '修改成功'
        })
        this.setData({
          hidden:true,
          editname:""
        })
        db.collection("album").doc(this.data.albumId).get().then(res=>{
          wx.setNavigationBarTitle({ title:res.data.name})
        })
      },
      fail: err => {
        wx.showToast({
          title: '修改失败'
        })
        this.setData({
          hidden:true,
          editname:""
        })
        db.collection("album").doc(this.data.albumId).get().then(res=>{
          wx.setNavigationBarTitle({ title:res.data.name})
        })      
      }
    })
  },
  delete(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '删除专辑将删除其中所有作品，确定删除？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          db.collection("album").where({
            _id:that.data.albumId
          }).remove();
          db.collection("albuminfo").where({
            aid:that.data.albumId
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
            wx.hideLoading();
            wx.switchTab({
              url: '/pages/my/my',
            })
          })
        }
      }
    })
  },
})