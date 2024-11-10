import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { ClockRecord } from '../models/ClockRecord';

/**
 * ClockService 类用于处理用户打卡相关的业务逻辑
 */
export class ClockService {
    
  /**
   * 用户上班打卡
   * @param userId 用户的 ID
   * @param clockInData 打卡数据，包括打卡时间戳、额定工作开始时间、额定工作结束时间、额定小时工资、额定工作时长和额定日薪
   * @returns 打卡信息，包括日期、打卡时间戳、额定工作参数
   */
  async clockIn(userId: string, clockInData: {
    clockInTime: number;
    ratedWorkStartTime: string;
    ratedWorkEndTime: string;
    ratedWorkHours: number;
    ratedDailySalary: number;
    ratedHourlyRate: number;
  }): Promise<{
    date: number;
    clockInTime: number;
    ratedWorkStartTime: string;
    ratedWorkEndTime: string;
    ratedHourlyRate: number;
    ratedWorkHours: number;
    ratedDailySalary: number;
  }> {
    const userRepository = getRepository(User);
    const clockRecordRepository = getRepository(ClockRecord);

    const user = await userRepository.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const todayTimestamp = Math.floor(clockInData.clockInTime / 86400000) * 86400000;
    const today = todayTimestamp;

    const existingClockRecord = await clockRecordRepository.findOne({ where: { user, date: today } });
    if (existingClockRecord) {
      throw new Error('Already clocked in today');
    }

    // 创建打卡记录
    const clockRecord = clockRecordRepository.create({
      user,
      date: today,
      clockInTime: clockInData.clockInTime,
      ratedWorkStartTime: clockInData.ratedWorkStartTime,
      ratedWorkEndTime: clockInData.ratedWorkEndTime,
      ratedWorkHours: clockInData.ratedWorkHours,
      ratedDailySalary: clockInData.ratedDailySalary,
      ratedHourlyRate: clockInData.ratedHourlyRate,
    });

    await clockRecordRepository.save(clockRecord);

    return {
      date: clockRecord.date,
      clockInTime: clockRecord.clockInTime,
      ratedWorkStartTime: clockRecord.ratedWorkStartTime,
      ratedWorkEndTime: clockRecord.ratedWorkEndTime,
      ratedHourlyRate: clockRecord.ratedHourlyRate,
      ratedWorkHours: clockRecord.ratedWorkHours,
      ratedDailySalary: clockRecord.ratedDailySalary,
    };
  }

  /**
   * 用户下班打卡
   * @param userId 用户的 ID
   * @param clockOutTime 下班打卡时间戳
   * @returns 打卡信息，包括下班时间戳、总工作时长、预期日薪和实际时薪
   */
  async clockOut(userId: string, clockOutTime: number): Promise<{
    clockOutTime: number;
    actualWorkHours: number;
    expectedDailySalary: number;
    actualHourlyRate: number;
  }> {
    const userRepository = getRepository(User);
    const clockRecordRepository = getRepository(ClockRecord);
    const user = await userRepository.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const todayTimestamp = Math.floor(clockOutTime / 86400000) * 86400000;
    const today = todayTimestamp;

    const clockRecord = await clockRecordRepository.findOne({ where: { user, date: today } });
    if (!clockRecord) {
      throw new Error('No clock-in record found for today');
    }

    if (clockRecord.clockOutTime) {
      throw new Error('Already clocked out today');
    }

    const workStats = this.calculateWorkStats(clockRecord.clockInTime, clockOutTime, user.ratedDailySalary || 0, user.ratedWorkHours || 0);

    clockRecord.clockOutTime = clockOutTime;
    clockRecord.actualWorkHours = workStats.actualWorkHours;
    clockRecord.actualHourlyRate = workStats.actualHourlyRate;
    clockRecord.expectedDailySalary = workStats.expectedDailySalary;

    await clockRecordRepository.save(clockRecord);

    return {
      clockOutTime: clockRecord.clockOutTime,
      actualWorkHours: clockRecord.actualWorkHours,
      expectedDailySalary: clockRecord.expectedDailySalary,
      actualHourlyRate: clockRecord.actualHourlyRate,
    };
  }

  /**
   * 计算工作统计数据
   * @param clockInTime 上班打卡时间戳
   * @param clockOutTime 下班打卡时间戳
   * @param ratedDailySalary 额定日薪
   * @param ratedWorkHours 额定工作时长
   * @returns 工作时长、预期日薪和实际时薪
   */
  private calculateWorkStats(clockInTime: number, clockOutTime: number, ratedDailySalary: number, ratedWorkHours: number): {
    actualWorkHours: number;
    expectedDailySalary: number;
    actualHourlyRate: number;
  } {
    const actualWorkHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    const expectedDailySalary = parseFloat(((actualWorkHours / ratedWorkHours) * ratedDailySalary).toFixed(2));
    const actualHourlyRate = parseFloat((ratedDailySalary / actualWorkHours).toFixed(2));

    return {
      actualWorkHours,
      expectedDailySalary,
      actualHourlyRate,
    };
  }

  /**
   * 获取今日打卡记录
   * @param userId 用户的 ID
   * @returns 今日的打卡记录或 null
   */
  async getTodayClockRecord(userId: string): Promise<ClockRecord | null> {
    const userRepository = getRepository(User);
    const clockRecordRepository = getRepository(ClockRecord);

    const user = await userRepository.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const todayTimestamp = Math.floor(Date.now() / 86400000) * 86400000;

    const clockRecord = await clockRecordRepository.findOne({
      where: { user, date: todayTimestamp },
    });

    return clockRecord || null;
  }
}
