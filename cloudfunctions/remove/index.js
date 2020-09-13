const tcb = require('@cloudbase/node-sdk');

const cloud = tcb.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  let result = {};
  let res = (await db.collection('works').where({
    _id:event.id,
    _openid:event.openid
  }).get()).data;
  if(res.length!=0){
    result.main = await db.collection('works').where({
      _id:event.id,
      _openid:event.openid
    }).remove();
    result.img = await cloud.deleteFile({
      fileList:res[0].images.concat(res[0].cover).concat(res[0].authorimg)
    })
    await db.collection('comment').where({
      wid:event.id
    }).remove();
    await db.collection('like').where({
      wid:event.id
    }).remove()
    await db.collection('albuminfo').where({
      wid:event.id
    }).remove()
  }
  return result;
}