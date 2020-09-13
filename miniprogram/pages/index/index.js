//index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var skip = 20
Page({
  data: {
    works:[],
    test:false,
    isSearching:false
  },
  onLoad: function(options) {
    if(options.url){
      let url = decodeURIComponent(options.url);
      wx.navigateTo({
        url: url,
      })
    } 
    wx.showLoading({
      title: '加载中',
    })
    if(!app.globalData.openid){
      setTimeout(() => {
        console.log("wait 1s");
        this.init()        
      }, 1000);
    }
  },
  onShow:function(){    
    this.setData({
      isSearching:wx.getStorageSync('isSearching'),
    })
    if(!this.data.isSearching){
      this.init()
    }
  },
  init(){
    wx.showLoading({
      title: '加载中',
    })
    db.collection('follow').where({
      _openid:app.globalData.openid
    }).get().then(res=>{
      let follows = res.data;
      this.setData({
        follows:follows
      })
      follows.map(item=>{
        return item.followedId
      })
      db.collection('works').where(_.or([
        {
          _openid:_.in(follows),
          private:false
        },
        {
          _openid:app.globalData.openid
        }
      ])).orderBy('time','desc').get()
      .then(result => {
        let items = result.data.map(item =>{
          return item;
        })
        this.setData({
          works:items,
        })
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      })
    })
  },
  add(){
    wx.navigateTo({
      url: '../add/add',
    })
  },
  todetail(e){
    app.globalData.item=e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../detail/detail',
    })
    wx.setStorage({
      key: 'isSearching',
      data: this.data.isSearching
    })
  },
  tohomepage(e){
    app.globalData.item=e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../homepage/homepage',
    })
    wx.setStorage({
      key: 'isSearching',
      data: this.data.isSearching
    })
  },
  searchinput(e){
    this.setData({
      search:e.detail.value
    })
  },
  search(){
    skip = 20;
    db.collection("works").where(_.or([
      {
        title:db.RegExp({
          regexp: this.data.search,
          options: 'i',
        })
      },
      {
        authorname:db.RegExp({
          regexp: this.data.search,
          options: 'i',
        })
      }
    ])
    .and([{
      private:false
    }])).orderBy('time','desc').get().then(res=>{
      let items = res.data.map(item =>{
        return item;
      })
      this.setData({
        works:items
      })
    })
    this.setData({
      isSearching:true
    })
  },
  onReachBottom(){    
    if(this.data.isSearching){
      db.collection("works").where(_.or([
        {
          title:db.RegExp({
            regexp: this.data.search,
            options: 'i',
          })
        },
        {
          authorname:db.RegExp({
            regexp: this.data.search,
            options: 'i',
          })
        }
      ])
      .and([{
        private:false
      }])).orderBy('time','desc').skip(skip).get().then(res=>{
        if(res.data.length==0){
          wx.showToast({
            icon:"none",
            title: '无更多信息',
          })
        }
        let items = res.data.map(item =>{
          return item;
        })
        this.setData({
          works:this.data.works.concat(items)
        })
      })
    }else{
      db.collection("works").where(_.or([
        {
          _openid:_.in(this.data.follows),
          private:false
        },
        {
          _openid:app.globalData.openid
        }
      ])).orderBy('time','desc').skip(skip).get().then(res=>{
        if(res.data.length==0){
          wx.showToast({
            icon:"none",
            title: '无更多信息',
          })
        }
        let items = res.data.map(item =>{
          return item;
        })
        this.setData({
          works:this.data.works.concat(items),
        })
      })
    }
    skip+=20;
  },
  back(){
    skip = 20;
    this.setData({
      isSearching:false,
      search:""
    })
    wx.setStorage({
      key: 'isSearching',
      data: false
    })
    this.onShow();
  },
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/index/index');
    return {
      title: "口袋作品集",
      path:`/pages/index/index?url=${url}` 
    }
  }
})
