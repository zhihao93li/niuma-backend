// 导入必要的依赖包
import express from 'express'; // Express框架
import dotenv from 'dotenv'; // 环境变量配置
import cors from 'cors'; // 跨域中间件
import helmet from 'helmet'; // 安全中间件
import passport from 'passport'; // 身份验证中间件
import { errorHandler } from './middleware/errorHandler'; // 错误处理中间件
import authRoutes from './routes/authRoutes'; // 认证相关路由
import userRoutes from './routes/userRoutes'; // 用户相关路由
import clockRoutes from './routes/clockRoutes'; // 打卡相关路由
import statsRoutes from './routes/statsRoutes'; // 统计相关路由
import { connectDatabase } from './config/database'; // 数据库连接配置
import { initializePassport } from './config/passport'; // Passport配置
import { CronJob } from 'cron'; // 定时任务
import { VerificationCodeService } from './services/verificationCodeService'; // 验证码服务
import { logger } from './utils/logger'; // 日志工具

// 加载环境变量
dotenv.config();

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000; // 设置服务器端口,默认3000

// 配置中间件
app.use(express.json()); // 解析JSON请求体
app.use(cors()); // 启用跨域请求
app.use(helmet()); // 添加安全相关HTTP头
app.use(passport.initialize()); // 初始化passport
initializePassport(); // 配置passport策略

// 注册路由
app.use('/api/auth', authRoutes); // 认证相关路由
app.use('/api/users', userRoutes); // 用户相关路由
app.use('/api/clock', clockRoutes); // 打卡相关路由
app.use('/api/stats', statsRoutes); // 统计相关路由

// 注册错误处理中间件
app.use(errorHandler);

// 连接数据库并启动服务器
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // 创建定时任务清理过期验证码
      // 每小时执行一次 (0 * * * *)
      const cleanVerificationCodesJob = new CronJob('0 * * * *', async () => {
        try {
          await VerificationCodeService.cleanExpiredCodes();
          logger.info('Successfully cleaned expired verification codes');
        } catch (error) {
          logger.error('Failed to clean expired verification codes:', error);
        }
      }, null, true);
      
      cleanVerificationCodesJob.start(); // 启动定时清理任务
    });
  })
  .catch((err) => logger.error('Database connection error:', err)); // 数据库连接错误处理
