import { User } from '../models/User';

// 认证类型定义
export type AuthType = 'wechat' | 'local';

// 认证请求参数接口
export interface AuthCredentials {
  authType: AuthType;
  code?: string;        // 微信认证时的code
  phone?: string;       // 本地认证时的手机号
  password?: string;    // 本地认证时的密码
}

// 认证响应接口
export interface AuthResponse {
  success: boolean;     // 认证是否成功
  token: string;        // JWT token
  user: User;          // 用户信息
  message?: string;    // 错误信息
}
