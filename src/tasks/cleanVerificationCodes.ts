import { CronJob } from 'cron';
import { VerificationCodeService } from '../services/verificationCodeService';
import { logger } from '../utils/logger';

// 每小时清理一次过期验证码
export const cleanVerificationCodesJob = new CronJob('0 * * * *', async () => {
  try {
    await VerificationCodeService.cleanExpiredCodes();
    logger.info('成功清理过期验证码');
  } catch (error) {
    logger.error('清理验证码失败:', error);
  }
});
