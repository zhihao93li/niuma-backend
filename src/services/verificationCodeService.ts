import { getRepository } from 'typeorm';
import { VerificationCode } from '../models/VerificationCode';
import { User } from '../models/User';

export class VerificationCodeService {
  // 生成6位数字验证码
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 发送验证码
  static async sendCode(phone: string): Promise<string> {
    const repository = getRepository(VerificationCode);
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

    // 删除该手机号的旧验证码
    await repository.delete({ phone });

    // 创建新验证码记录
    const verificationCode = repository.create({
      phone,
      code,
      expiresAt
    });
    await repository.save(verificationCode);

    // TODO: 调用短信服务发送验证码
    return code;
  }

  // 验证验证码
  static async verifyCode(phone: string, code: string): Promise<boolean> {
    const repository = getRepository(VerificationCode);
    const verificationCode = await repository.findOne({
      where: { phone, code }
    });

    if (!verificationCode) return false;

    const now = new Date();
    return verificationCode.expiresAt > now;
  }

  // 清理过期验证码
  static async cleanExpiredCodes(): Promise<void> {
    const repository = getRepository(VerificationCode);
    await repository.createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }
}
