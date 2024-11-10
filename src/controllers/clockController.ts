import { Request, Response, NextFunction } from 'express';
import { ClockService } from '../services/clockService';

const clockService = new ClockService();

/**
 * 上班打卡控制器
 */
export const clockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const {
      clockInTime,
      ratedWorkStartTime,
      ratedWorkEndTime,
      ratedWorkHours,
      ratedDailySalary,
      ratedHourlyRate
    } = req.body;

    if (!clockInTime || !ratedWorkStartTime || !ratedWorkEndTime || !ratedWorkHours || !ratedDailySalary || !ratedHourlyRate) {
      res.status(400).json({ success: false, message: '缺少必要的参数' });
      return;
    }

    const result = await clockService.clockIn(userId, {
      clockInTime: Number(clockInTime),
      ratedWorkStartTime,
      ratedWorkEndTime,
      ratedWorkHours: Number(ratedWorkHours),
      ratedDailySalary: Number(ratedDailySalary),
      ratedHourlyRate: Number(ratedHourlyRate)
    });

    res.status(200).json({
      success: true,
      message: '上班打卡成功',
      data: {
        date: new Date(result.date).toISOString().split('T')[0],
        clockInTime: new Date(result.clockInTime).toISOString(),
        ratedWorkStartTime: result.ratedWorkStartTime,
        ratedWorkEndTime: result.ratedWorkEndTime,
        ratedHourlyRate: result.ratedHourlyRate,
        ratedWorkHours: result.ratedWorkHours,
        ratedDailySalary: result.ratedDailySalary,
      },
    });
  } catch (error) {
    console.error('上班打卡出错:', error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 下班打卡控制器
 */
export const clockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { clockOutTime } = req.body;

    if (!clockOutTime) {
      res.status(400).json({ success: false, message: '缺少必要的参数' });
      return;
    }

    const result = await clockService.clockOut(userId, Number(clockOutTime));

    res.status(200).json({
      success: true,
      message: '下班打卡成功',
      data: {
        clockOutTime: new Date(result.clockOutTime).toISOString(), // 转换为 Date 对象后调用 toISOString
        actualWorkHours: result.actualWorkHours,
        expectedDailySalary: result.expectedDailySalary,
        actualHourlyRate: result.actualHourlyRate,
      },
    });
  } catch (error) {
    console.error('下班打卡出错:', error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

/**
 * 获取今日打卡记录控制器
 */
export const getTodayClockRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const clockRecord = await clockService.getTodayClockRecord(userId);

    res.status(200).json({
      success: true,
      clockRecord: clockRecord ? {
        date: clockRecord.date, // 保持为时间戳
        clockInTime: clockRecord.clockInTime, // 保持为时间戳
        clockOutTime: clockRecord.clockOutTime || null, // 保持为时间戳
        ratedWorkStartTime: clockRecord.ratedWorkStartTime,
        ratedWorkEndTime: clockRecord.ratedWorkEndTime,
        ratedHourlyRate: clockRecord.ratedHourlyRate,
        actualHourlyRate: clockRecord.actualHourlyRate,
        ratedWorkHours: clockRecord.ratedWorkHours,
        actualWorkHours: clockRecord.actualWorkHours,
        expectedDailySalary: clockRecord.expectedDailySalary,
        ratedDailySalary: clockRecord.ratedDailySalary,
      } : null,
    });
  } catch (error) {
    console.error('获取今日打卡记录出错:', error);
    next(error);
  }
};
