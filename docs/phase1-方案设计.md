# 训练时间表—周次更新（阶段一：方案设计）

## 1. 产品功能拆解（按角色与流程）

### 1.1 学生端主流程
1. 微信登录并选择身份（学生）。
2. 通过邀请码加入训练组。
3. 在首页查看：
   - 本周是否被 @
   - 是否已提交
   - 已发布的最终训练安排
4. 被 @ 后进入「我的本周空闲时间」：
   - 手动勾选小时块
   -（二期）上传课表图识别并确认
5. 查看汇总表、共同空闲时间、推荐训练时间。

### 1.2 教练端主流程
1. 微信登录并选择身份（教练）。
2. 创建训练组并分享邀请码。
3. 每周创建填表任务：
   - 选择周次
   - 选择本周被 @ 成员
   - 配置可训练时间范围、最短时长
4. 追踪提交状态，提醒未提交成员。
5. 查看汇总表与推荐时间。
6. 选择推荐时间并发布最终训练安排。
7. 查看历史周次记录（不可覆盖历史数据）。

### 1.3 核心业务约束
- 只有被 @ 成员参与本周提交与计算。
- 每周任务独立存储，不覆盖历史。
- 所有图片识别结果必须先确认再写入周表。
- 学生仅可修改自己的时间，不能修改他人。

---

## 2. 页面路由设计

建议路由（`app.json` pages）：

1. `pages/login/index` 登录页
2. `pages/index/index` 首页（按角色渲染）
3. `pages/team/index` 创建/加入训练组
4. `pages/createTask/index` 创建本周任务
5. `pages/fillSchedule/index` 学生填表
6. `pages/timetableImage/index` 课表识别确认（二期）
7. `pages/chatImport/index` 聊天截图识别确认（二期）
8. `pages/summary/index` 本周汇总表
9. `pages/recommendations/index` 推荐训练时间
10. `pages/publishTraining/index` 发布最终训练时间
11. `pages/history/index` 历史周次
12. `pages/profile/index` 个人中心

页面跳转关系（V1核心）：
- 登录 -> 首页
- 首页 -> 团队页 / 创建任务 / 填表 / 汇总表 / 发布训练 / 历史
- 汇总表 -> 推荐页 -> 发布页

---

## 3. 数据库集合设计（微信云开发）

> 以下字段与需求对齐，并补充必要索引建议。

### 3.1 `users`
- `openid`（唯一索引）
- `name`, `avatar`, `role`, `team_id`
- `created_at`, `updated_at`

### 3.2 `teams`
- `team_name`, `coach_id`, `member_ids`, `invite_code`（唯一索引）
- `created_at`, `updated_at`

### 3.3 `weekly_tasks`
- `team_id`, `week_start_date`, `week_end_date`, `week_label`
- `target_member_ids`
- `time_granularity`, `daily_start_time`, `daily_end_time`, `min_training_duration`
- `status`, `created_by`, `created_at`, `updated_at`
- 索引建议：`team_id + week_start_date`（唯一，避免同队同周重复任务）

### 3.4 `weekly_schedules`
- `task_id`, `team_id`, `user_id`, `user_name`, `week_start_date`
- `availability`, `status`, `source_type`
- `raw_image_url`, `recognized_busy_time`, `recognized_free_time`
- `confidence`, `remark`, `submitted_at`, `updated_at`
- 索引建议：`task_id + user_id`（唯一，一人一周一条）

### 3.5 `training_sessions`
- `task_id`, `team_id`, `week_start_date`
- `date`, `weekday`, `start_time`, `end_time`, `location`, `note`
- `selected_member_ids`, `unavailable_member_ids`
- `created_by`, `published_at`, `updated_at`

### 3.6 `notifications`
- `task_id`, `team_id`, `receiver_id`
- `type`, `content`, `status`
- `created_at`, `updated_at`

### 3.7 `chat_import_records`
- `task_id`, `team_id`, `image_url`, `raw_ocr_text`
- `parsed_results`, `confirmed_results`, `status`
- `created_by`, `created_at`, `updated_at`

---

## 4. 核心算法设计

算法放在 `miniprogram/utils`：

1. `generateWeekDates(weekStartDate)`
   - 输入周一日期（`YYYY-MM-DD`）
   - 输出 7 天 `{ key, weekday, date }`

2. `splitTimeRangeToHourlySlots(start, end)`
   - 以 60 分钟切片，生成连续小时块

3. `mergeContinuousSlots(slots)`
   - 将 `end === next.start` 的块进行合并

4. `calculateCommonFreeTime(schedules)`
   - 仅处理已提交且被 @ 成员
   - 逻辑为按天按小时取交集

5. `calculateRecommendedTrainingTimes(schedules, targetMemberIds)`
   - 统计每个小时块可参与人数
   - 同人数块进行连续合并
   - 排序：人数 desc -> 时长 desc -> 日期 asc

6. `convertBusyTimeToFreeTime(busyTime, dailyStartTime, dailyEndTime)`
   - 先归一化忙碌时间并合并重叠
   - 对全天可训练窗口做区间补集

7. `parseChineseTimeText(text, taskWeek)`
   - 规则引擎 + 关键词字典：
     - 状态词（可训练/不可训练/疑问/低置信度）
     - 星期词（周一二三、下周一二三）
     - 时间词（上午/下午/晚上/全天/三点到五点）

8. `recognizeScheduleFromImage(imageUrl)`（Mock）
   - 返回结构化忙碌时间

9. `recognizeChatFromImage(imageUrl)`（Mock）
   - 返回 `[{ user_name, text, parsed_result }]`

---

## 5. 项目目录结构（建议落地）

```text
miniprogram/
  app.js
  app.json
  app.wxss
  pages/
    login/
    index/
    team/
    createTask/
    fillSchedule/
    timetableImage/
    chatImport/
    summary/
    recommendations/
    publishTraining/
    history/
    profile/
  components/
    WeekTable/
    TimeSlotSelector/
    MemberSelector/
    EmptyState/
    ConfirmResultCard/
  utils/
    date.js
    time.js
    schedule.js
    parser.js
    permission.js
  services/
    userService.js
    teamService.js
    taskService.js
    scheduleService.js
    recognitionService.js
    notificationService.js

cloudfunctions/
  login/
  createTeam/
  joinTeam/
  createWeeklyTask/
  saveWeeklySchedule/
  getWeeklySummary/
  importChatImage/
  importTimetableImage/
  publishTrainingSession/
  sendReminder/

tests/
  utils.date.test.js
  utils.time.test.js
  utils.schedule.test.js
  utils.parser.test.js
```

---

## 6. 开发步骤（按阶段推进）

### 阶段一：方案设计（当前）
- 产出：产品拆解、路由、数据结构、算法、目录、里程碑。

### 阶段二：基础项目
- 初始化小程序目录与路由。
- 完成登录页、首页、创建/加入训练组页。

### 阶段三：每周任务与手动填表
- 创建周任务与被 @ 成员。
- 学生手动填表并可修改。
- 保存 `weekly_schedules`。

### 阶段四：汇总与推荐
- 汇总表页面 + 横向滚动。
- 共同空闲时间与推荐算法接入。
- 展示未提交成员。

### 阶段五：发布最终训练
- 从推荐时间中选定。
- 填写地点备注并发布。
- 学生首页展示最终安排。

### 阶段六：课表识别（Mock）
- 上传图片 -> 识别 -> 确认 -> 写入。

### 阶段七：聊天截图识别（Mock）
- 上传 -> OCR/解析 -> 教练确认 -> 写入。

## 7. 第一版（V1）交付清单
- 登录、创建/加入训练组
- 创建周任务 + 选择被 @ 成员
- 手动填表
- 汇总表 + 共同空闲 + 推荐时间
- 发布最终训练时间
- 历史周次独立存储
