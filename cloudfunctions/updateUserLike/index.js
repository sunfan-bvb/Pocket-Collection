// 云函数入口文件
const tcb = require('@cloudbase/node-sdk');
const cloud = tcb.init();
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("users").where({
    _openid:event.openid
  }).update({
    like:event.like,
  })
}