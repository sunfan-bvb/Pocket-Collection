// pages/cut/cut.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var image = JSON.parse(options.image)
    this.setData({
      image:image
    })
  },
  onTouchStart:function(e){
    var x=e.changedTouches[0].pageX
    this.setData({
      startX:x
    })
  },
  onTouchEnd:function(e){
    var x=e.changedTouches[0].pageX
    var winWidth=wx.getSystemInfoSync().windowWidth
    var maxw=this.data.viewWidth-winWidth
    var move=x-this.data.startX
    console.log("move:"+move);
    console.log("this.data.move:"+this.data.move);
    console.log(this.data.viewWidth);

    var setmove
    if(-move+this.data.move>this.data.viewWidth-700){
      setmove=this.data.viewWidth-700
    }
    else if(-move+this.data.move<0){
      setmove=0
    }else{
      setmove=-move+this.data.move
    }
    this.setData({
      move:setmove
    })
    console.log(setmove);
  },

  imageload(e){
    var h=30;
    var h1=65;
    var h2=35;
    var imgWidth=e.detail.width;
    var imgHeight=e.detail.height;
    var winHeight= wx.getSystemInfoSync().windowHeight
    var winWidth= wx.getSystemInfoSync().windowWidth
    var pxtorpx=750/winWidth
    var perHeight=winHeight*0.35/imgHeight
    var viewWidth=perHeight*imgWidth*pxtorpx
    var toshowh
    var toshoww
    if(winWidth/(winHeight*0.35)>imgWidth/imgHeight){
      toshowh=true;
      toshoww=false;
    }else{
      toshowh=false;
      toshoww=true;
    }
    this.setData({
      h:h,
      h1:h1,
      h2:h2,
      imgWidth:imgWidth,
      imgHeight:imgHeight,
      viewWidth:viewWidth,
      toshowh:toshowh,
      toshoww:toshoww
    })
  },
  onPageScroll:function(e){
    var query = wx.createSelectorQuery();
    query.select('.top').boundingClientRect((rect) => {
    let top = rect.top;
    this.setData({
      top:top
    })
    }).exec()
  },
  generate: function () {
    var _this = this;
    const ctx_A = wx.createCanvasContext('myCanvas_A');
    var winWidth= wx.getSystemInfoSync().windowWidth    
    var winHeight= wx.getSystemInfoSync().windowHeight
    if(this.data.toshowh){
      var trueH=(winHeight*0.35)/winWidth*this.data.imgWidth
      ctx_A.drawImage(this.data.image,0,-this.data.top*700/winWidth,this.data.imgWidth,trueH,0,0,winWidth, winHeight*0.35);
    }
    if(this.data.toshoww){
      var winWidth= wx.getSystemInfoSync().windowWidth    
      var winHeight= wx.getSystemInfoSync().windowHeight
      var h=this.data.imgHeight
      var per=winHeight*0.35/winWidth
      var w=h/per
      ctx_A.drawImage(this.data.image,this.data.move*700/winWidth,0,w,h,0,0,winWidth, winHeight*0.35);
    }
    ctx_A.draw();
     wx.showToast({
      title: '截取中...',
      icon: 'loading',
      duration: 10000
    });
    //if(this.data.src==0){
      //setTimeout(function(){//给延时是因为canvas画图需要时间
        wx.canvasToTempFilePath({//调用方法，开始截取
          x: 0,
          y: 0,
          width: winWidth,
          height: winHeight*0.35,
          destWidth: winWidth,
          destHeight: winHeight*0.35,
          canvasId: 'myCanvas_A',
          success: function (res) {
            var newImage=res.tempFilePath;
            var array = JSON.stringify(newImage)
            wx.hideLoading() //让提示框隐藏、消失
            wx.navigateTo({
              url: '/pages/add/add?cover='+array
            })
            /*wx.cloud.uploadFile({
              cloudPath: "img/" + new Date().getTime() +"-cover",//云储存的路径及文件名
              filePath : newImage, //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址
              success : (uploadres) => { //上传图片到云储存成功
                wx.showLoading({ //显示加载提示框 不会自动关闭 只能wx.hideLoading关闭
                  title : "图片上传中", //提示框显示的提示信息
                  mask : true, //显示透明蒙层，防止触摸。为true提示的时候不可以对屏幕进行操作，不写或为false时可以操作屏幕
                  success : function () {
                      wx.hideLoading() //让提示框隐藏、消失
                      wx.navigateTo({
                        url: '/pages/add/add?newImage='+array+"&newFileID="+uploadres.fileID
                      })
                  }
                });
              },
              fail : (err) => {
                console.log(err)
              }
            })*/
          }
        })
      //}, 1000)
    /*}
    if(this.data.src==1){
      //setTimeout(function(){//给延时是因为canvas画图需要时间
        wx.canvasToTempFilePath({//调用方法，开始截取
          x: 0,
          y: 0,
          width: winWidth,
          height: winHeight*0.35,
          destWidth: winWidth,
          destHeight: winHeight*0.35,
          canvasId: 'myCanvas_A',
          success: function (res) {
            var newImage=res.tempFilePath;
            var array = JSON.stringify(newImage)
            wx.cloud.uploadFile({
              cloudPath: "img/" + new Date().getTime() +"-cover",//云储存的路径及文件名
              filePath : newImage, //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址
              success : (uploadres) => { //上传图片到云储存成功
                wx.showLoading({ //显示加载提示框 不会自动关闭 只能wx.hideLoading关闭
                  title : "图片上传中", //提示框显示的提示信息
                  mask : true, //显示透明蒙层，防止触摸。为true提示的时候不可以对屏幕进行操作，不写或为false时可以操作屏幕
                  success : function () {
                      wx.hideLoading() //让提示框隐藏、消失
                      wx.navigateTo({
                        url: '/pages/updateItem/updateItem?newImage='+array+"&newFileID="+uploadres.fileID
                      })
                  }
                });
              },
              fail : (err) => {
                console.log(err)
              }
            })
          }
        })
      //}, 1000)
    }*/
    
  },
  onPageXScroll:function(e){
    var query = wx.createSelectorQuery();
    query.select('.ximage').boundingClientRect((rect) => {
    let left = rect.left;
    console.log(left);
    this.setData({
      top:left
    })
    }).exec()
  },
  confirm(){
    var cover = JSON.stringify("http://tmp/wxb222f7287eb22d81.o6zAJs96-kskqn0Qq-QkiC14_t5Y.0P04o1ShMCeK755c310acb01a85bb481f5ed051cd746.png")
    wx.navigateTo({
      url: '/pages/add/add?cover='+cover,
    })
  }
})