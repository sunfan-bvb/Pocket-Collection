//app.js
App({
  globalData: {
    openid:'',
    username:'',
    userphoto:'',
    item:{},
  },
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    wx.login({
      success:function(res){
        if(res.code){
          var appid='wx116d36e23c9650db';
          var secret='c5dfa21f984b22a8e087deafb1e6f9f7';
          var l='https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+res.code+'&grant_type=authorization_code';  
          wx.request({
            url: l,
            data:{},
            success:function(res){
              console.log(res)
              var app=getApp()
              app.globalData.openid=res.data.openid
            }
          })
        }else{
          console.log('登录失败！'+res.errMsg)
        }
      }
    })

    wx.getUserInfo({
      success: function(res) {
        var app=getApp()
        var db = wx.cloud.database()
        app.globalData.username=res.userInfo.nickName;
        app.globalData.userphoto=res.userInfo.avatarUrl;             
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
        })
      }
    })
  }
})
