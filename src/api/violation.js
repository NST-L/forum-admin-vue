import apiClient from './http';

// 通用举报列表接口 - 适配后端接口格式
export const getViolationList = (params = {}) => {
  const { componentType, ...queryParams } = params;
  
  // 后端要求的必填参数
  const defaultParams = {
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    pageNum: 1,
    pageSize: 20,
    ...queryParams
  };
  
  // 使用后端实际的接口路径 - 修复路径错误
  return apiClient.get(`/report/report_post/${componentType}/list`, { 
    params: defaultParams 
  });
};

// 获取举报原因列表
export const getReportReasons = (componentType) => {
  return apiClient.get('/report/reason', {
    params: { component_type: componentType }
  });
};

// ReportReasonsEnum中文映射
export const REPORT_REASON_TEXT_MAP = {
  // 用户举报 1xx
  'USER_IMPERSONATE': '冒充他人',
  'USER_HARASSMENT': '恶意骚扰',
  'USER_SEXY_PROFILE': '色情头像',
  'USER_FRAUD': '虚假信息',
  'USER_POLITICAL': '涉政内容',
  'USER_ILLEGAL_CONTENT': '违法内容',
  'USER_ATTACK': '人身攻击',
  'USER_PROVOKE': '引战言论',
  'USER_OTHER': '其他',

  // 帖子举报 2xx
  'POST_ILLEGAL': '违法内容',
  'POST_FRAUD': '虚假信息',
  'POST_POLITICAL': '涉政内容',
  'POST_RUMOR_EVENT': '传播谣言',
  'POST_MISINFO': '误导信息',
  'POST_ILLEGAL_LINK': '违法链接',
  'POST_PORN': '色情内容',
  'POST_DANGEROUS': '危险内容',
  'POST_VIOLENCE': '暴力内容',
  'POST_YOUTH_HARM': '青少年有害',
  'POST_AD': '垃圾广告',
  'POST_PROMOTION': '推广营销',
  'POST_PROVOKE': '引战言论',
  'POST_FORMAT_ISSUE': '格式问题',
  'POST_PLAGIARISM': '抄袭内容',
  'POST_COPYRIGHT': '版权侵犯',
  'POST_DISCOMFORT': '令人不适',
  'POST_OTHER': '其他',

  // 评论举报 3xx
  'COMMENT_ILLEGAL': '违法内容',
  'COMMENT_PORN': '色情内容',
  'COMMENT_FRAUD': '虚假信息',
  'COMMENT_POLITICAL': '涉政内容',
  'COMMENT_MISINFO': '误导信息',
  'COMMENT_RUMOR_EVENT': '传播谣言',
  'COMMENT_AD': '垃圾广告',
  'COMMENT_PROVOKE': '引战言论',
  'COMMENT_SPOILER': '剧透内容',
  'COMMENT_SPAM': '垃圾信息',
  'COMMENT_OFF_TOPIC': '偏离主题',
  'COMMENT_ATTACK': '人身攻击',
  'COMMENT_PRIVACY': '侵犯隐私',
  'COMMENT_LOTTERY': '违规抽奖',
  'COMMENT_YOUTH_HARM': '青少年有害',
  'COMMENT_OTHER': '其他'
};

// 根据举报原因获取中文文本
export const getReasonText = (reasonType) => {
  return REPORT_REASON_TEXT_MAP[reasonType] || '其他';
};

// 处理违规举报 - 调用真实后端接口
export const handleViolation = (type, reportId, action, processOpinion) => {
  const params = {
    process: action === 'ban' ? 'RESOLVED' : 'REJECTED',
    report_id: reportId,
    processor_id: 'ADMIN_USER', // 后续可以从用户登录信息获取
    process_result: processOpinion
  };
  
  console.log('[Violation] 处理违规举报:', { type, reportId, action, processOpinion, params });
  
  return apiClient.post('/report/report_process', params).then(response => {
    // 适配前端期望的响应格式
    return {
      data: {
        success: response.data.code === 0,
        message: response.data.code === 0 
          ? `${action === 'ban' ? '封禁' : '驳回'}处理成功` 
          : response.data.message || '处理失败'
      }
    };
  }).catch(error => {
    console.error('[Violation] 处理失败:', error);
    return {
      data: {
        success: false,
        message: '网络错误，请稍后重试'
      }
    };
  });
}; 