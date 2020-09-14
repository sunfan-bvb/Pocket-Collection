// pages/hide/hide.js
const db = wx.cloud.database()
Page({

  input(e){
    this.setData({
      input:e.detail.value
    })
  },
  submit(){
    db.collection("suggest").add({
      data:{
        content:this.data.input
      },
      success:res=>{
        wx.showToast({
          title: '我会看的！',
        })
        this.setData({
          input:""
        })
      }
    })
  }
})