// src/data/violationData.js
// 违规处理测试数据

export const userViolationData = [
  {
    id: 1,
    user_id: 1001,
    username: '张三',
    reporter: '李四',
    reporter_id: 2001,
    reason: '冒充他人',
    ctime: 1716979200,
    status: 0,
    processor: null
  },
  {
    id: 2,
    user_id: 1002,
    username: '王五',
    reporter: '赵六',
    reporter_id: 2002,
    reason: '传播虚假信息',
    ctime: 1716975600,
    status: 1,
    processor: '管理员A'
  },
  {
    id: 3,
    user_id: 1003,
    username: '铁七',
    reporter: '孙八',
    reporter_id: 2003,
    reason: '辱骂他人',
    ctime: 1716964800,
    status: 0,
    processor: null
  },
  {
    id: 4,
    user_id: 1004,
    username: '肌凡',
    reporter: '管理员B',
    reporter_id: 2004,
    reason: '垃圾信息',
    ctime: 1716948000,
    status: 1,
    processor: '管理员B'
  },
  {
    id: 5,
    user_id: 1005,
    username: '周十一',
    reporter: '王十二',
    reporter_id: 2005,
    reason: '引战内容',
    ctime: 1716937200,
    status: 1,
    processor: '管理员C'
  }
];

export const postViolationData = [
  { 
    id: 1, 
    post_id: 101, 
    post_title: '关于最新政策的讨论', 
    reporter_name: '张三', 
    reason_text: '政治敏感内容',
    status: 0,
    processor_name: null,
    ctime: 1716892800
  },
  { 
    id: 2, 
    post_id: 205, 
    post_title: '产品促销活动', 
    reporter_name: '李四', 
    reason_text: '垃圾广告',
    status: 1,
    processor_name: '管理员小王',
    ctime: 1716871200
  },
  { 
    id: 3, 
    post_id: 178, 
    post_title: '用户个人体验分享', 
    reporter_name: '王五', 
    reason_text: '不实信息',
    status: 0,
    processor_name: null,
    ctime: 1716859600
  }
];

export const commentViolationData = [
  {
    id: 1,
    user_id: 101,
    username: '用户A',
    content: '这是一个冒犯性评论',
    reporter: '用户X',
    reporter_id: 301,
    reason: '辱骂他人',
    ctime: 1716979200,
    status: 0,
    processor: null
  },
  {
    id: 2,
    user_id: 102,
    username: '用户B',
    content: '恶意灌水内容',
    reporter: '用户Y',
    reporter_id: 302,
    reason: '垃圾信息',
    ctime: 1716975600,
    status: 1,
    processor: '管理员A'
  }
]; 