CREATE TABLE IF NOT EXISTS vessel (
  id INT PRIMARY KEY,
  vessel_name VARCHAR(128) NOT NULL,
  imo_no VARCHAR(32),
  carrier VARCHAR(128),
  length_m DECIMAL(8,1) NOT NULL,
  draft_m DECIMAL(6,1),
  eta VARCHAR(40),
  etd VARCHAR(40),
  status VARCHAR(20) NOT NULL DEFAULT 'EXPECTED'
);

CREATE TABLE IF NOT EXISTS berth (
  id INT PRIMARY KEY,
  berth_code VARCHAR(16) NOT NULL,
  length_m DECIMAL(8,1) NOT NULL,
  water_depth_m DECIMAL(6,1),
  berth_type VARCHAR(20),
  current_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  safety_note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS berth_plan (
  id INT PRIMARY KEY,
  vessel_id INT NOT NULL,
  berth_id INT NOT NULL,
  planned_arrival VARCHAR(40) NOT NULL,
  planned_departure VARCHAR(40) NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  dispatcher_id INT,
  conflict_reason VARCHAR(255) NULL,
  INDEX idx_berth_plan_berth (berth_id),
  INDEX idx_berth_plan_status (status)
);

CREATE TABLE IF NOT EXISTS yard_slot (
  id INT PRIMARY KEY,
  yard_area VARCHAR(16),
  row_no VARCHAR(8),
  bay_no VARCHAR(8),
  tier_no VARCHAR(8),
  container_no VARCHAR(32),
  slot_status VARCHAR(20) NOT NULL DEFAULT 'EMPTY',
  cargo_type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS work_task (
  id INT PRIMARY KEY,
  berth_plan_id INT,
  yard_slot_id INT,
  task_type VARCHAR(20),
  team_id INT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  planned_start VARCHAR(40),
  finished_at VARCHAR(40)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(64),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  created_at VARCHAR(40)
);
