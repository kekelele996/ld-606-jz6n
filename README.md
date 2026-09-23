# 港口泊位与堆场协同系统

面向中小港口的船舶靠泊计划、泊位资源、堆场箱位和作业任务协同平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

前端：<http://localhost:20106>

后端健康检查：<http://localhost:21106/health>

## 冲突处置功能说明（泊位计划）

同一泊位上两条未完结计划的时间窗口重叠即构成冲突。系统前后端共用同一套检测规则：
已取消（CANCELLED）/已离港（DEPARTED）的计划不参与检测；严重程度按重叠时长占较短计划窗口的比例
划分为轻度（LOW，<20%）、中度（MEDIUM，20%~50%）、严重（HIGH，≥50%）。

- **港口运行总览 `/dashboard`**：顶部展示泊位总数、当前占用泊位、泊位占用率、受影响计划数；
  下方“受影响靠泊计划”表逐条列出冲突对象、严重程度、重叠时长与原因；并展示当前占用泊位的实时窗口。
- **泊位计划 `/berths`**：按泊位展示计划卡片，冲突卡片用 ConflictBadge 标出冲突对象
  （计划号 + 船名）、严重程度、重叠小时数及冲突原因。
- **改派流程**：调度员对冲突计划点击“改派泊位”，下拉只列出**当前空闲且长度 ≥ 船长**的泊位；
  若候选泊位的计划窗口内仍有其他计划，会提示将与哪些计划重叠。提交后后端重新检测：
  - 仍有时间重叠：计划保持 **CONFLICT**，并把冲突对象与时间段写入 `conflict_reason`；
  - 不再重叠：计划状态进入 **APPROVED（已批准）**。
  - 泊位长度不足返回 `BERTH_TOO_SHORT`（400）；只读角色调用改派接口返回 `RBAC_DENIED`（403）。
- **结果保留**：改派由后端内存数据仓储接收（`POST /api/berth-plan/:id/reassign`），
  离开页面再回来会重新拉取计划、冲突与总览占用数字，改派结果与占用率均持续保留（重启后端进程后回到种子状态）。

相关接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/berth-plan` | 靠泊计划列表（含 `conflict_reason`） |
| GET | `/api/berth-plan/conflicts` | 全部冲突条目（计划↔计划、泊位、严重程度、原因） |
| GET | `/api/berth-plan/overview` | 泊位占用统计 + 冲突条目（总览页） |
| POST | `/api/berth-plan/:id/reassign` | 改派泊位（需 dispatcher/admin 角色，`x-role` 头） |

## 本地开发方式

- 前端：`cd frontend && npm install && npm start`（端口 20106，`proxy.conf.json` 把 `/api` 代理到本地 3000）
- 后端：`cd backend && npm install && npm run dev`（接口统一挂在 `/api`）
- 后端不可达时前端使用 `src/mocks/seedData.ts` 离线兜底浏览；改派为写操作，离线时会提示无法保留。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Angular 17 + TypeScript + RxJS + NG-ZORRO + ECharts |
| 后端 | Express + TypeScript（TypeORM/NestJS 依赖预留） |
| 数据库 | MySQL 8.0（`database/init.sql` 建表；运行期由仓储层在内存中持有种子数据） |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `port-yard`
- `FRONTEND_PORT`: 前端端口，默认 `20106`
- `BACKEND_PORT`: 后端端口，默认 `21106`
- `DB_PORT`: 数据库宿主机端口，默认 `33060`
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `JWT_SECRET`: JWT 密钥（本地开发默认值）

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: port-yard`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-port-yard}` 前缀。
- 数据库使用命名卷，避免绑定中文路径；`db` 带 healthcheck，后端 `depends_on: condition: service_healthy`。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- **BerthPlanStatus**（DRAFT/CONFLICT/APPROVED/BERTHING/DEPARTED/CANCELLED）：
  `constants/BerthPlanStatus.ts`（前后端，含中文文案）、`types/BerthPlanStatus.ts`、
  前后端 `constructors/*BerthPlan*`、`constants/logTemplates.ts`（冲突检测/改派日志）、
  `constants/errorMessages.ts`、`components/common/StatusBadge.ts`、总览表与泊位计划卡片、
  `utils/berthConflicts.*`（活动状态过滤）、后端 service 的状态对账。
- **ConflictSeverity**（LOW/MEDIUM/HIGH，新增）：
  `backend/src/constants/ConflictSeverity.ts` 与 `frontend/src/constants/ConflictSeverity.ts`、
  前后端 `utils/berthConflicts.*` 的严重程度计算、`components/common/ConflictBadge.ts`、
  总览冲突表、类型 `types/Conflict.ts` / `PlanConflictEntry`。
- **YardSlotStatus**（EMPTY/RESERVED/OCCUPIED/LOCKED）：constants/types、构造器、日志、错误消息、堆场页筛选与展示。
- **WorkTaskType**（LOAD/DISCHARGE/SHIFT/INSPECTION）：constants/types、构造器、日志、错误消息、作业派工页展示。
- 改派相关错误码：`PLAN_NOT_FOUND`、`BERTH_NOT_FOUND`、`BERTH_TOO_SHORT`、`REASSIGN_STILL_CONFLICT`
  分布在前后端 `constants/errorCodes.ts` 与 `errorMessages.ts`，由后端 service 抛出、controller 包装、前端 API 层展示。

## 为什么会牵一发动全身

实体字段（如本次新增的 `conflict_reason`）、枚举、日志模板、错误码、构造器、筛选器和展示组件被刻意拆散到多个目录；
本次冲突处置改动同时触达数据库 DDL、后端模型/常量/工具/仓储/服务/控制器/路由/中间件，
以及前端类型/常量/构造器/API/Store/hook/共享组件/两个页面与路由。

## License

MIT
