// pages/detail/detail.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
const date = new Date()
Page({
  data:{
    like:false,
    collect:false,
    likenumber:0,
    comment:""
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title:'详情'});
    if(options.itemId){
      db.collection("works").where({
        _id:options.itemId
      }).get().then(res=>{
        app.globalData.item=res.data[0];
        this.setData({
          work:res.data[0],
          openid:app.globalData.openid
        })
      })
      console.log("a:"+this.data.work);
    }else{
      this.setData({
        work:app.globalData.item,
        openid:app.globalData.openid
      })
    }
    db.collection("like").where({
      wid:this.data.work._id,
      _openid:this.data.openid
    }).get().then(res=>{
      if(res.data.length!=0){
        this.setData({
          like:true
        })
      }
    })
    db.collection("collect").where({
      wid:this.data.work._id,
      _openid:this.data.openid
    }).get().then(res=>{
      if(res.data.length!=0){
        this.setData({
          collect:true
        })
      }
    })
    wx.cloud.callFunction({
      name:'getlikenumber',
      data: {
        id:this.data.work._id
      }
    }).then(result => {
      this.setData({
        likenumber:result.result
      })
    })
    this.init()
  },
  init(){
    db.collection("comment").where({
      wid:this.data.work._id
    }).get().then(res=>{
      this.setData({
        comments:res.data
      })
    })
  },
  previewImage(e){
    var current = e.target.dataset.image;
    wx.previewImage({
      current: current,  
      urls: this.data.work.images
    })
  },
  like(){
    this.setData({
      like:!this.data.like
    })
    if(this.data.like){
      db.collection("like").add({
        data:{
          wid:this.data.work._id,
          time:date.getTime(),
          authorname:app.globalData.username,
          authorimg:app.globalData.userphoto
        }
      })
      this.setData({
        likenumber:this.data.likenumber+1
      })
      wx.cloud.callFunction({
        name:"updateUserLike",
        data:{
          openid:this.data.work._openid,
          like:true
        }
      })
    }else{
      db.collection("like").where({
        wid:this.data.work._id,
        _openid:app.globalData.openid
      }).remove()
      this.setData({
        likenumber:this.data.likenumber-1
      })
    }
  },
  collect(){
    this.setData({
      collect:!this.data.collect
    })
    if(this.data.collect){
      db.collection("collect").add({
        data:{
          wid:this.data.work._id,
        }
      })
    }else{
      db.collection("collect").where({
        wid:this.data.work._id,
        _openid:app.globalData.openid
      }).remove()
    }
  },
  commentinput(e){
    this.setData({
      comment:e.detail.value
    })
  },
  comment(){
    if(this.data.comment==""){
      wx.showToast({
        icon:"none",
        title: '评论不能为空！',
      })
    }else{
      db.collection("comment").add({
        data:{
          wid:this.data.work._id,
          comment:this.data.comment,
          authorname:app.globalData.username,
          time:date.getTime(),
          authorimg:app.globalData.userphoto,
        },
        success:res=>{
          this.setData({
            comment:""
          })
          db.collection("comment").where({
            wid:this.data.work._id
          }).get().then(res=>{
            this.setData({
              comments:res.data
            })
          })
          console.log(this.data.work._openid);
          wx.cloud.callFunction({
            name:"updateUserComment",
            data:{
              openid:this.data.work._openid,
              comment:true
            }
          }).then(res=>{
            console.log(res);
          })
        },
        fail:res=>{
          wx.showToast({
            icon:"none",
            title: '评论失败',
          })
        }
      })
    }
  },
  longtap(e){
    var that = this
    var list = []
    var author = this.data.comments[e.currentTarget.dataset.index]._openid
    if(author == app.globalData.openid){
      list = ["删除"];
    }
    wx.showActionSheet({  
      itemList: list,  
      success: function(res) {  
          if(res.tapIndex==0){
            that.deletecomment(e);
          }
      },  
      fail: function(res) {  
          console.log(res.errMsg)  
      }
  })  
  },
  deletecomment(e){
    db.collection("comment").where({
      _id:e.currentTarget.dataset.id
    }).remove()
    this.init()
  },
  delete(e){
    var that = this
    wx.showModal({
      title:"提示",
      content:"确定删除作品？",
      success:function(res){
        if(res.confirm){
          wx.showLoading({
            icon:"loading",
            title: '删除中',
          })
          var albumid = ""
          db.collection("albuminfo").where({
            wid:that.data.work._id,
          }).get().then(res=>{
            db.collection("album").where({
              _id:res.data[0].aid
            }).get().then(res=>{
              if(res.data[0].cover==that.data.work.cover){
                albumid = res.data[0]._id
                db.collection("albuminfo").where({
                  aid:res.data[0]._id
                }).get().then(res=>{
                  console.log(res);
                  if(res.data.length<=1){
                    db.collection("album").doc(albumid).update({
                      data:{
                        cover:""
                      }
                    })
                  }else{                    
                    db.collection("works").where({
                      _id:res.data[1].wid
                    }).get().then(res=>{
                      db.collection("album").doc(albumid).update({
                        data:{
                          cover:res.data[0].cover
                        }
                      })
                    })
                  }
                })
              }
            })
          })
          wx.cloud.callFunction({
            name:'remove',
            data: {
              id: that.data.work._id,
              openid: that.data.work._openid,
              cover:that.data.work.cover
            }
          }).then(result => {
            wx.hideLoading();
            if(result){
              wx.showToast({
                title: '删除成功',
              })
              wx.switchTab({
                url: '/pages/index/index',
              })
            }else{
              wx.showToast({
                icon:"none",
                title: '删除失败',
              })
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          });
        }
      }
    })
  },
  onReachBottom(){
    db.collection("comment").where({
      wid:this.data.work._id
    }).skip(skip).get().then(res=>{
      if(res.data.length==0){
        wx.showToast({
          icon:"none",
          title: '无更多评论',
        })
      }
      this.setData({
        comments:this.data.comments.concat(res.data)
      })
    })
    skip += 20;
  },
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/detail/detail?itemId='+this.data.work._id);
    return {
      title: "口袋作品集",
      path:`/pages/index/index?url=${url}` 
    }
  }
})