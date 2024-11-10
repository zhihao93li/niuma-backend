import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthResponse } from '../services/authService';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { VerificationCodeService } from '../services/verificationCodeService';

/**
 * 认证控制器类
 * 处理用户认证相关的请求,包括本地登录、注册、微信登录等
 */
export class AuthController {
  /**
   * 本地登录方法
   * 使用 passport local 策略进行用户名密码验证
   * @param req Express 请求对象
   * @param res Express 响应对象  
   * @param next Express 中间件链中的下一个函数
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    passport.authenticate('local', { session: false }, (err: Error | null, user: User | false, info: any) => {
      // 处理认证过程中的错误
      if (err) {
        return next(err);
      }
      
      // 认证失败的情况
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || '用户名或密码错误'
        });
      }

      // 生成 JWT token
      const token = jwt.sign({ 
        id: (user as User).id, 
        authType: 'local' 
      }, config.JWT_SECRET, { expiresIn: '1d' });

      // 返回认证成功的响应
      res.json({
        success: true,
        token,
        user
      });
    })(req, res, next);
  }

  /**
   * 本地用户注册方法
   * 创建新的本地用户账号
   * @param req Express 请求对象,包含用户名和密码
   * @param res Express 响应对象
   * @param next Express 中间件链中的下一个函数
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, password, code } = req.body;
      
      // 验证验证码
      const isValid = await VerificationCodeService.verifyCode(phone, code);
      if (!isValid) {
        res.status(400).json({ success: false, message: '验证码无效或已过期' });
        return;
      }

      const userRepository = getRepository(User);
      const existingUser = await userRepository.findOne({ where: { phone } });
      if (existingUser) {
        res.status(400).json({ success: false, message: '手机号已被注册' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        phone,
        password: hashedPassword,
        authType: 'local'
      });
      await userRepository.save(user);

      const token = jwt.sign({ id: user.id, authType: 'local' }, config.JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 微信登录回调方法
   * 处理微信认证完成后的回调
   * @param req Express 请求对象,包含微信认证后的用户信息
   * @param res Express 响应对象
   */
  wechatCallback = async (req: Request, res: Response): Promise<void> => {
    // 验证微信认证是否成功
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '微信认证失败'
      });
      return;
    }

    // 生成 JWT token
    const token = jwt.sign({ 
      id: (req.user as User).id, 
      authType: 'wechat' 
    }, config.JWT_SECRET, { expiresIn: '1d' });

    // 返回认证成功的响应
    res.json({
      success: true,
      token,
      user: req.user
    });
  }

  /**
   * 验证令牌方法
   * 验证用户提供的 JWT token 是否有效
   * @param req Express 请求对象,包含已验证的用户信息
   * @param res Express 响应对象
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      user: req.user
    });
  }

  /**
   * 发送验证码方法
   * 发送验证码到用户手机
   * @param req Express 请求对象,包含手机号
   * @param res Express 响应对象
   * @param next Express 中间件链中的下一个函数
   */
  sendVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = req.body;
      const code = await VerificationCodeService.sendCode(phone);
      res.json({ success: true, message: '验证码已发送' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码方法
   * 修改用户密码
   * @param req Express 请求对象,包含手机号、验证码和新密码
   * @param res Express 响应对象
   * @param next Express 中间件链中的下一个函数
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, code, newPassword } = req.body;
      
      // 验证验证码
      const isValid = await VerificationCodeService.verifyCode(phone, code);
      if (!isValid) {
        res.status(400).json({ success: false, message: '验证码无效或已过期' });
        return;
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { phone } });
      if (!user) {
        res.status(404).json({ success: false, message: '用户不存在' });
        return;
      }

      // 更新密码
      user.password = await bcrypt.hash(newPassword, 10);
      await userRepository.save(user);

      res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
      next(error);
    }
  }
}