// src/data/userManagementData.js
// 用户管理测试数据

export const userManagementData = {
  users: Array.from({length: 50}, (_, i) => ({
    id: `UID${i+1000}`,
    username: `用户${i+1}`,
    phone: `1381234567${(i % 10).toString().padStart(2, '0')}`,
    role: i % 4 === 0 ? '管理员' : i % 4 === 1 ? '版主' : '普通用户',
    status: i % 3 === 0 ? 'inactive' : 'active',
    registeredAt: new Date(Date.now() - Math.random() * 1000000000),
    activityScore: Math.floor(Math.random() * 1000),
    activityLogs: [
      `登录时间：${new Date().toLocaleString()}`,
      `最近发帖：Vue3新特性讨论`,
      `最后访问IP：192.168.1.${Math.floor(Math.random()*100)}`
    ]
  }))
}; 