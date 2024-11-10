import passport from 'passport';
// @ts-ignore
import { Strategy as WechatStrategy } from 'passport-wechat';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { config } from './config';
import bcrypt from 'bcrypt';

/**
 * 初始化 Passport 认证配置
 * 配置用户序列化、反序列化以及各种认证策略
 */
export function initializePassport() {
  // 序列化用户对象,只保存用户ID到session中
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // 反序列化用户,根据session中的用户ID获取完整的用户信息
  passport.deserializeUser(async (id: string, done) => {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  /**
   * 本地登录策略配置
   * 使用手机号和密码进行认证
   */
  passport.use('local', new LocalStrategy({
    usernameField: 'phone', // 改为使用手机号字段
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, phone, password, done) => {
    try {
      const userRepository = getRepository(User);
      // 使用手机号查找用户
      const user = await userRepository.findOne({ where: { phone, authType: 'local' } });
      
      if (!user) {
        return done(null, false, { message: '用户不存在' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password!);
      if (!isValidPassword) {
        return done(null, false, { message: '密码错误' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  /**
   * 微信登录策略配置
   * 使用微信OAuth进行第三方认证
   */
  passport.use('wechat', new WechatStrategy({
    appID: config.WECHAT_APP_ID, // 微信应用ID
    appSecret: config.WECHAT_APP_SECRET, // 微信应用密钥
    callbackURL: '/api/auth/wechat/callback', // 回调URL
    scope: 'snsapi_userinfo', // 请求用户信息的权限范围
    state: true // 启用CSRF保护
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const userRepository = getRepository(User);
      // 查找是否存在使用该微信账号登录的用户
      let user = await userRepository.findOne({ where: { openId: profile.id } });
      
      // 如果用户不存在,创建新用户
      if (!user) {
        user = userRepository.create({
          openId: profile.id,
          username: profile.displayName,
          authType: 'wechat'
        });
        await userRepository.save(user);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  /**
   * JWT认证策略配置
   * 用于验证API请求中的JWT令牌
   */
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头中提取Bearer token
    secretOrKey: config.JWT_SECRET // 用于验证token的密钥
  }, async (payload, done) => {
    try {
      const userRepository = getRepository(User);
      // 根据token中的用户ID查找用户
      const user = await userRepository.findOne(payload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}