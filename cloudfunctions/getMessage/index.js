// 云函数入口文件
const tcb = require('@cloudbase/node-sdk');
const cloud = tcb.init();
const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let res = await db.collection('comment').aggregate()
  .lookup({
    from: 'like',
    let:{
      like_wid:'$wid'
    },
    pipeline:$.pipeline().
    match(_.expr($.or([
      $.eq(['$$like_wid', event.wid]),
      $.eq(['$wid', event.wid])
    ]))).done(),
    as: 'msglist',
  }).replaceRoot({
    newRoot: $.mergeObjects([ $.arrayElemAt(['$msglist', 0]), '$$ROOT' ])
  })
  .project({
    msglist: 0
  })
  .skip(event.skip)
  .end()
  return res
}