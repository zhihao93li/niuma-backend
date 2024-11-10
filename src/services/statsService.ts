// src/services/statsService.ts
import { getRepository, Between } from 'typeorm';
import { ClockRecord } from '../models/ClockRecord';

export class StatsService {
  async getHeatmapData(userId: string, startDate: Date, endDate: Date, type: 'hourlyRate' | 'workHours'): Promise<Array<{ date: string; value: number }>> {
    const clockRecordRepository = getRepository(ClockRecord);

    const records = await clockRecordRepository.find({
      where: {
        user: { id: userId },
        date: Between(startDate.getTime(), endDate.getTime()), // 确保传入的是时间戳
      },
      order: { date: 'ASC' },
    });

    return records
      .map(record => ({
        date: new Date(record.date).toISOString().split('T')[0], // 转换为 Date 对象后调用 toISOString
        value: type === 'hourlyRate' ? record.actualHourlyRate : record.actualWorkHours,
      }))
      .filter((item): item is { date: string; value: number } => item.value !== undefined);
  }
}
