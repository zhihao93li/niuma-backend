import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// 创建一个高阶函数来生成认证中间件
export const authenticate = (strategy: string) => {
  return passport.authenticate(strategy, { 
    session: false,
    failWithError: true 
  });
};

export const authenticateJWT = passport.authenticate('jwt', { session: false });

export const authenticateWechat = passport.authenticate('wechat', {
  session: false,
  failureRedirect: '/login'
});

export const handleAuthError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      message: '未授权的访问'
    });
    return;
  }
  next(err);
};