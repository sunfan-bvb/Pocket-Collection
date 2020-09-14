// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //const wxContext = cloud.getWXContext()
  var appid='wx116d36e23c9650db';
  var secret='c5dfa21f984b22a8e087deafb1e6f9f7';
  var l='https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+event.code+'&grant_type=authorization_code';  
  wx.request({
    url: l,
    data:{},
    success:function(res){
      return res.data.openid
    }
  })
}