# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnets

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-${var.environment}-pg15"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-pg15"
  }
}

# RDS Instances for each database
locals {
  databases = {
    auth          = "finsight_auth"
    users         = "finsight_users"
    advisory      = "finsight_advisory"
    notifications = "finsight_notifications"
    subscriptions = "finsight_subscriptions"
    payments      = "finsight_payments"
  }
}

resource "aws_db_instance" "main" {
  for_each = local.databases

  identifier             = "${var.project_name}-${var.environment}-${each.key}"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_allocated_storage * 2
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = each.value
  username = "finsight_admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.db_security_group_id]
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  multi_az               = var.db_multi_az
  publicly_accessible    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-${each.key}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  deletion_protection             = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-${each.key}"
    Database    = each.value
    Service     = each.key
  }
}

# Data source for database password
data "aws_secretsmanager_secret" "db_password" {
  name = "${var.project_name}-${var.environment}-db-password"
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = data.aws_secretsmanager_secret.db_password.id
}

# Outputs
output "endpoints" {
  value = {
    for k, v in aws_db_instance.main : k => {
      endpoint = v.endpoint
      address  = v.address
      port     = v.port
      database = v.db_name
    }
  }
}

