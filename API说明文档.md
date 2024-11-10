# RESTful API 文档

## 用户认证

### 登录

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录（支持微信登录和本地登录）
- **请求体**:
  ```json
  {
    "authType": "wechat" | "local",
    "code": "string", // 微信登录时使用
    "phone": "string", // 本地登录时使用
    "password": "string" // 本地登录时使用
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "string",
    "user": {
      "id": "uuid",
      "openId": "string",
      "phone": "string",
      "authType": "wechat" | "local",
      "ratedDailySalary": 300,
      "ratedWorkStartTime": "09:00",
      "ratedWorkEndTime": "18:00",
      "ratedWorkHours": 9,
      "ratedHourlyRate": 33.3333
    }
  }
  ```

### 注册

- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 用户注册（支持微信注册和本地注册）
- **请求体**:
  ```json
  {
    "authType": "wechat" | "local",
    "phone": "string", // 本地注册时使用
    "password": "string", // 本地注册时使用
    "code": "string" // 验证码或微信code
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "string",
    "user": {
      "id": "uuid",
      "openId": "string",
      "phone": "string",
      "authType": "wechat" | "local",
      "ratedDailySalary": 300,
      "ratedWorkStartTime": "09:00",
      "ratedWorkEndTime": "18:00",
      "ratedWorkHours": 9,
      "ratedHourlyRate": 33.3333
    }
  }
  ```

### 验证令牌

- **URL**: `/api/auth/verify`
- **方法**: `GET`
- **描述**: 验证用户的JWT令牌
- **请求头**: 
  - `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "openId": "string",
      "username": "string",
      "authType": "wechat" | "local"
    }
  }
  ```

### 微信登录

- **URL**: `/api/auth/wechat`
- **方法**: `GET`
- **描述**: 跳转到微信授权页面

### 微信登录回调

- **URL**: `/api/auth/wechat/callback`
- **方法**: `GET`
- **描述**: 微信授权回调接口
- **响应**:
  ```json
  {
    "success": true,
    "token": "string",
    "user": {
      "id": "uuid",
      "openId": "string",
      "username": "string",
      "authType": "wechat"
    }
  }
  ```

## 用户设置

### 设置工作参数

- **URL**: `/api/users/settings`
- **方法**: `POST`
- **描述**: 设置用户的工作参数
- **请求头**: 
  - `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "ratedDailySalary": 300,
    "ratedWorkStartTime": "09:00",
    "ratedWorkEndTime": "18:00"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "openId": "string",
      "username": "string",
      "authType": "wechat" | "local",
      "ratedDailySalary": 300,
      "ratedWorkStartTime": "09:00",
      "ratedWorkEndTime": "18:00",
      "ratedWorkHours": 9,
      "ratedHourlyRate": 33.3333
    }
  }
  ```

## 打卡功能

### 上班打卡

- **URL**: `/api/clock/clock-in`
- **方法**: `POST`
- **描述**: 用户上班打卡
- **请求头**: 
  - `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "clockInTime": 1684569600000, // 毫秒级时间戳
    "ratedWorkStartTime": "09:00",
    "ratedWorkEndTime": "18:00",
    "ratedWorkHours": 9,
    "ratedDailySalary": 300,
    "ratedHourlyRate": 33.3333
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "上班打卡成功",
    "data": {
      "date": "2023-05-20",
      "clockInTime": 1684569600000, // 毫秒级时间戳
      "ratedWorkStartTime": "09:00",
      "ratedWorkEndTime": "18:00",
      "ratedHourlyRate": 33.3333,
      "ratedWorkHours": 9,
      "ratedDailySalary": 300
    }
  }
  ```

### 下班打卡

- **URL**: `/api/clock/clock-out`
- **方法**: `POST`
- **描述**: 用户下班打卡
- **请求头**: 
  - `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "clockOutTime": 1684605600000 // 毫秒级时间戳
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "下班打卡成功",
    "data": {
      "clockOutTime": 1684605600000, // 毫秒级时间戳
      "actualWorkHours": 9,
      "expectedDailySalary": 300,
      "actualHourlyRate": 33.3333
    }
  }
  ```

### 获取今日打卡记录

- **URL**: `/api/clock/today`
- **方法**: `GET`
- **描述**: 获取用户当天的打卡记录
- **请求头**: 
  - `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "clockRecord": {
      "date": "2023-05-20",
      "clockInTime": 1684569600000, // 毫秒级时间戳
      "clockOutTime": 1684605600000, // 毫秒级时间戳
      "ratedWorkStartTime": "09:00",
      "ratedWorkEndTime": "18:00",
      "ratedHourlyRate": 33.3333,
      "actualHourlyRate": 33.3333,
      "ratedWorkHours": 9,
      "actualWorkHours": 9,
      "expectedDailySalary": 300,
      "ratedDailySalary": 300
    }
  }
  ```
  **注意**：如果当天没有打卡记录，`clockRecord` 将为 `null`。

## 数据展示

### 获取热力图数据

- **URL**: `/api/stats/heatmap`
- **方法**: `GET`
- **描述**: 获取用户的热力图数据
- **请求头**: 
  - `Authorization: Bearer <token>`
- **查询参数**:
  - `startDate`: 开始日期 (YYYY-MM-DD)
  - `endDate`: 结束日期 (YYYY-MM-DD)
  - `type`: 'hourlyRate' 或 'workHours'
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2023-05-20",
        "value": 33.3333
      },
      ...
    ]
  }
  ```

## 错误处理

所有接口在发生错误时，会返回如下格式的响应：

- **401**: 未授权访问
- **400**: 请求参数错误
- **404**: 资源不存在
- **500**: 服务器内部错误

```json
{
  "success": false,
  "message": "错误描述"
}
```

## 总结

- 时间戳字段 `clockInTime` 和 `clockOutTime` 使用毫秒级时间戳，以便在前端和后端之间进行准确的时间转换。
- 确保所有接口的请求和响应体中时间相关字段的一致性和准确性。
- 所有需要授权的接口均需在请求头中包含 `Authorization: Bearer <token>`。
