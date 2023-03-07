// pages/message/message.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command
Page({
  data:{
    data:[],
    newlike:false,
    newcomment:false,
    like:false,
    comment:false,
    type:"like"
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    wx.setNavigationBarTitle({
      title: '消息',
    })
    db.collection("works").where({
      _openid:app.globalData.openid
    }).get().then(res=>{
      let items = res.data.map(item=>{return item._id})
      db.collection("like").where({
        wid:_.in(items)
      }).orderBy("time","desc").get().then(res=>{
        this.setData({
          likes:res.data
        })
        this.init("like")
      })
      db.collection("comment").where({
        wid:_.in(items)
      }).orderBy("time","desc").get().then(res=>{
        this.setData({
          comments:res.data
        })
        this.init("comment")
      })
      db.collection("users").where({
        _openid:app.globalData.openid
      }).get().then(res=>{
        this.setData({
          newlike:res.data[0].like,
          newcomment:res.data[0].comment
        })
      })
    })
  },
  async init(type){
    wx.showLoading({
      title: '加载中',
    })
    var result = [];
    var datas = type=="like"?this.data.likes:this.data.comments;    
    for(var i = 0;i<datas.length;i++){
      var cover = "";
      await db.collection("works").doc(datas[i].wid).get().then(res=>{
        cover = res.data.cover;
      })
      var comment = "";
      if(type=="comment"){
        comment = datas[i].comment.length<=15?datas[i].comment:datas[i].comment.substr(0,15)+"..."
      }
      var content = type=="like"?"点赞了你的作品":comment;
      var newdata = {"name":datas[i].authorname,"photo":datas[i].authorimg,"cover":cover,"content":content,"id":datas[i].wid}
      if(i==datas.length-1){
        type == "like"?this.setData({like:true}):this.setData({comment:true})
      }
      result.push(newdata);
    }
    if(type=="like"){
      this.setData({
        likes:result,
        data:result
      })
    }else{
      this.setData({
        comments:result
      })
    }
    wx.cloud.callFunction({
      name:"updateUserLike",
      data:{
        openid:app.globalData.openid,
        like:false
      }
    })
    if(this.data.like&&this.data.comment){
      wx.hideLoading()
    }
  },
  todetail(e){
    var wid = this.data.comments[e.currentTarget.dataset.index].id
    db.collection("works").doc(wid).get().then(res=>{
      app.globalData.item = res.data;
      wx.navigateTo({
        url: '/pages/detail/detail',
      })
    })
  },
  tolike(){
    this.setData({
      data:this.data.likes,
      type:"like"
    })
    wx.cloud.callFunction({
      name:"updateUserLike",
      data:{
        openid:app.globalData.openid,
        like:false
      }
    })
  },
  tocomment(){
    this.setData({
      data:this.data.comments,
      type:"comment"
    })
    wx.cloud.callFunction({
      name:"updateUserComment",
      data:{
        openid:app.globalData.openid,
        comment:false
      }
    })
  },
  onReachBottom(){
    if(this.data.type=="like"){

    }
  }
})