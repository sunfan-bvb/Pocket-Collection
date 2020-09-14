// pages/add/add.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data:({
    images:[],
    hiddenmodalput:true,
    album:'选择专辑',
    newAlbum:true,
    isChecked:false,
    title:"",
    newImage:""
  }),
  onLoad: function (options) {   
    if(options.cover){
      var image = JSON.parse(options.cover)
      this.setData({
        newImage:image,
        title:wx.getStorageSync('title'),
        images:wx.getStorageSync('images'),
        isChecked:wx.getStorageSync('private'),
        albumId:wx.getStorageSync('albumId'),
        album:wx.getStorageSync('album')
      })
    }
  },

  chooseImage:function(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        var images = this.data.images.concat(res.tempFilePaths)
        this.setData({
          images:images
        })
      }
    })
  },
  removeImage(e) {
    const idx = e.target.dataset.idx
    var images=this.data.images
    images.splice(idx,1)
    this.setData({
      images:images,
    })
  },
  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },
  formTitle(e){
    this.setData({
      title:e.detail.value
    })
  },

  onAdd: function () {
    if(this.data.title==""){
      wx.showToast({
        title: '请输入标题',
      })
    }else if(this.data.album=="选择专辑"){
      wx.showToast({
        title: '请选择专辑',
      })
    }
    else if(this.data.images==[]){
      wx.showToast({
        title: '请添加图片',
      })
    }else if(this.data.newImage==""){
      wx.showToast({
        title: '请添加封面',
      })
    }else{
      this.uploadimg()
    }
  },
  crop(e){
    if(this.data.images.length==0){
      wx.showToast({
        icon: 'none',
        title:'请先添加图片！'
      })
    }
    else{
      wx.setStorage({
        key: 'title',
        data: this.data.title
      })
      wx.setStorage({
        key: 'images',
        data: this.data.images
      })
      wx.setStorage({
        key: 'private',
        data: this.data.isChecked,
      })
      wx.setStorage({
        data: this.data.albumId,
        key: 'albumId',
      })
      wx.setStorage({
        data: this.data.album,
        key: 'album',
      })
      if(this.data.images.length==1){
        var array = JSON.stringify(this.data.images[0])
        wx.navigateTo({
          url: '/pages/cut/cut?image='+array
        })
      }
      else{
        this.setData({
          hiddenmodalput:!this.data.hiddenmodalput
       })
      }
    }
  },
  changeSwitch(){
    this.setData({
      isChecked:!this.data.isChecked,
    })
  },
  cropthis(e){
    const idx = e.target.dataset.idx
    var array = JSON.stringify(this.data.images[idx])
    wx.navigateTo({
      url: '/pages/cut/cut?image='+array,
    })
  },
  cancel: function(){
    this.setData({
        hiddenmodalput: true,
        newAlbum:true
    });
  },
  handleNewImage(){
    wx.previewImage({
      current: this.data.newImage,
      urls: [this.data.newImage]
    })
  },
  removeNewImage(e) {
    this.setData({
      newImage:""
    })
  },
  chooseAlbum(){
    var that=this
    db.collection('album').where({
      _openid:app.globalData.openid
    }).get()
    .then(result => {
      let res = result.data.map(item =>{
        return item.name;
      })
      let ids = result.data.map(id=>{
        return id._id;
      })
      var arr = ['添加新专辑'].concat(res)
      wx.showActionSheet({  
        itemList: arr,  
        success: function(res) {  
            console.log(res.tapIndex)  
            if(res.tapIndex==0){
              that.setData({
                newAlbum:false
              })
            }else{
              that.setData({
                albumId:ids[res.tapIndex-1],
                album:arr[res.tapIndex]
              })
            }
        },  
        fail: function(res) {  
            console.log(res.errMsg)  
        }
    })  
    })
  },
  confirm(){
    this.setData({
      newAlbum:true
    })
    db.collection("album").add({
      data:{
        name:this.data.albumName
      }
    }).then(res=>{
      this.setData({
        albumId:res._id,
        album:this.data.albumName
      })
    })
  },
  inputAlbumName(e){
    this.setData({
      albumName:e.detail.value
    })
  },
  async uploadimg(){
    let result = [];
    for(let item of this.data.images){
      wx.showLoading({
        title: '图片上传中',
        mask: true
      })
      let file = await wx.cloud.uploadFile({
        cloudPath: `hole/${Date.now()}-${Math.floor(Math.random(0,1)*1000)}.png`,
        filePath: item,
      });
      result.push(file)
    }
    let cover = await wx.cloud.uploadFile({
      cloudPath: `hole/${Date.now()}-${Math.floor(Math.random(0,1)*1000)}.png`,
      filePath: this.data.newImage
    })
    const fileIDs = result.map(photo => photo.fileID);    
    this.setData({
      fileIDs:fileIDs,
      coverFileID:cover.fileID
    })
    this.done()
  },
  done(){
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y =date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();     
    db.collection('works').add({
      data: {
        title:this.data.title,
        images:this.data.fileIDs,
        date:Y+"-"+M+"-"+D,
        private:this.data.isChecked,
        album:this.data.album,
        cover:this.data.coverFileID,
        authorname:app.globalData.username,
        authorimg:app.globalData.userphoto,
        time:date.getTime()
      },
      success: res => {
        db.collection("album").where({
          _id:this.data.albumId,
        }).get().then(res=>{
          if((res.data[0].cover=="")||(!res.data[0].cover)){
            db.collection("album").doc(this.data.albumId).update({
              data:{
                cover:this.data.coverFileID
              }
            })
            console.log("ssss");
          }
        })
        db.collection('albuminfo').add({
          data:{
            wid:res._id,
            aid:this.data.albumId,
            time:date.getTime()
          },
          success : res=>{
            wx.hideLoading();
            wx.showToast({
              title: '添加成功',
            })
            wx.switchTab({
              url: '/pages/index/index', 
            })
          },
          fail : res=>{
            wx.hideLoading();
            wx.showToast({
              icon:"none",
              title: '添加失败',
            })
            wx.switchTab({
              url: '/pages/index/index', 
            })
          }
        })
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title:'添加失败'
        })
        wx.switchTab({
          url: '/pages/index/index', 
        })
      }
    })  
  }
})