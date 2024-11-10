import dotenv from 'dotenv';

dotenv.config();

export const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  WECHAT_APP_ID: process.env.WECHAT_APP_ID,
  WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET
};
