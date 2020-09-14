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
          wx.cloud.callFunction({
            name:'getopenid',
            data: {
              code:res.code
            }
          }).then(result => {
            var app = getApp()
            app.globalData.openid = result.result.openid;
          })
        }else{
          console.log('登录失败！'+res.errMsg)
        }
      }
    })

    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              var app=getApp()
              var db = wx.cloud.database()
              app.globalData.username=res.userInfo.nickName;
              app.globalData.userphoto=res.userInfo.avatarUrl;             
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
        }else{
          wx.navigateTo({
            url: '/pages/front/front',
          }) 
        }
      }
    })

  }
})
