import express from 'express';
import { authenticate, authenticateJWT } from '../middleware/auth';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

// 本地认证路由
router.post('/login', authenticate('local'), authController.login);
router.post('/register', authController.register);

// 微信登录路由
router.get('/wechat', authenticate('wechat'));
router.get('/wechat/callback', authenticate('wechat'), authController.wechatCallback);

// 验证令牌
router.get('/verify', authenticateJWT, authController.verifyToken);

export default router;