# 港口泊位与堆场协同系统

面向中小港口的船舶靠泊计划、泊位资源、堆场箱位和作业任务协同平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20106>

后端健康检查：<http://localhost:21106/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Angular 17 + TypeScript + RxJS + NG-ZORRO + ECharts |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | MySQL 8.0 |
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
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: port-yard`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-port-yard}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- BerthPlanStatus: constants/BerthPlanStatus、types/BerthPlanStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- YardSlotStatus: constants/YardSlotStatus、types/YardSlotStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- WorkTaskType: constants/WorkTaskType、types/WorkTaskType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ConflictSeverity（MEDIUM/HIGH/CRITICAL）:
  - 后端：`backend/src/constants/ConflictSeverity.ts`、`backend/src/utils/berthConflict.ts`（分级计算）、`backend/src/models/BerthPlan.ts`（conflict_severity 字段）、`backend/src/services/BerthPlanService.ts`（改派后写回）、`backend/src/seed.ts`、`database/init.sql`。
  - 前端：`frontend/src/types/ConflictSeverity.ts`、`frontend/src/constants/ConflictSeverity.ts`（文案/提示）、`frontend/src/utils/berthConflict.ts`、`frontend/src/hooks/useBerthConflict.ts`、`frontend/src/components/common/ConflictBadge.ts`、`frontend/src/components/common/PlanCard.html`、`frontend/src/pages/DashboardPage.*`。

## 靠泊冲突处置流程

1. 后端 `GET /api/berth-plan` 每次按“同一泊位 + 时间区间半开半闭重叠”重算冲突，严重程度按重叠时长占较短计划比例分级（≥70% 严重、≥30% 明显、其余轻度）。
2. 总览页 `/dashboard` 列出全部受影响计划（冲突对象、严重程度），并展示各泊位占用计划数；数字随改派实时更新。
3. 泊位页 `/berths` 按泊位分组，计划卡片标注冲突对象、严重程度与冲突原因；展开卡片可改派。
4. `GET /api/berth-plan/:id/candidates` 给出候选泊位并标注 `suitable/free`（长度、水深与时间窗）。
5. `PATCH /api/berth-plan/:id/reassign` 提交改派：泊位短于船舶返回 `BERTH_LENGTH_UNSUITABLE`；仍有时间重叠则保持 `CONFLICT` 并写回 `conflict_plan_id/conflict_severity/conflict_reason`；无重叠则进入 `APPROVED`。
6. 改派结果保存在后端内存数据中；前端同步写入 `localStorage`（`port-yard:berthPlan`），离开页面或刷新后再回来，改派结果与总览占用数字都会保留。


## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
