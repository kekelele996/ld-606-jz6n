CREATE TABLE IF NOT EXISTS vessel (
  id INT PRIMARY KEY,
  vessel_name VARCHAR(128),
  imo_no VARCHAR(32),
  carrier VARCHAR(128),
  length_m DECIMAL(8,2),
  draft_m DECIMAL(6,2),
  eta VARCHAR(32),
  etd VARCHAR(32),
  status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS berth (
  id INT PRIMARY KEY,
  berth_code VARCHAR(32),
  length_m DECIMAL(8,2),
  water_depth_m DECIMAL(6,2),
  berth_type VARCHAR(32),
  current_status VARCHAR(32),
  safety_note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS berth_plan (
  id INT PRIMARY KEY,
  vessel_id INT,
  berth_id INT,
  planned_arrival VARCHAR(32),
  planned_departure VARCHAR(32),
  priority VARCHAR(16),
  status VARCHAR(32),
  dispatcher_id INT,
  conflict_plan_id INT NULL,
  conflict_severity VARCHAR(16) NULL,
  conflict_reason VARCHAR(255) NULL,
  reassigned_from_berth_id INT NULL,
  reassigned_at VARCHAR(32) NULL,
  reassigned_by INT NULL
);

CREATE TABLE IF NOT EXISTS yard_slot (
  id INT PRIMARY KEY,
  yard_area VARCHAR(32),
  row_no VARCHAR(8),
  bay_no VARCHAR(8),
  tier_no VARCHAR(8),
  container_no VARCHAR(32),
  slot_status VARCHAR(32),
  cargo_type VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS work_task (
  id INT PRIMARY KEY,
  berth_plan_id INT,
  yard_slot_id INT,
  task_type VARCHAR(32),
  team_id INT,
  status VARCHAR(32),
  planned_start VARCHAR(32),
  finished_at VARCHAR(32) NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor VARCHAR(64),
  action VARCHAR(64),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  created_at VARCHAR(32)
);
