// pages/detail/detail.js
const app = getApp()
const db = wx.cloud.database()
var skip = 20
Page({
  data:{
    like:false,
    collect:false,
    likenumber:0
  },
  onLoad: function (options) {
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
    db.collection("like").where({
      wid:this.data.work._id
    }).count().then(res=>{
      this.setData({
        likenumber:res.total
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
    var current = e.target.dataset.src;
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
        }
      })
      this.setData({
        likenumber:this.data.likenumber+1
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
    db.collection("comment").add({
      data:{
        wid:this.data.work._id,
        comment:this.data.comment,
        authorname:app.globalData.username
      }
    })
    this.setData({
      comment:""
    })
    this.init()
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
          var albumid = ""
          db.collection("albuminfo").where({
            wid:that.data.work._id
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
                  if(res.data.length==0){
                    db.collection("album").doc(albumid).update({
                      data:{
                        cover:""
                      }
                    })
                  }else{
                    console.log("ssssss");
                    
                    db.collection("works").where({
                      _id:res.data[0].wid
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
              openid: that.data.work._openid
            }
          }).then(result => {
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