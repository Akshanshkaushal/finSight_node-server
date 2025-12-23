# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnets

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-subnet-group"
  }
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis7"
  }
}

# ElastiCache Replication Group (Redis Cluster)
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  description                = "Redis cluster for FinSight"

  engine                     = "redis"
  engine_version              = "7.0"
  node_type                   = var.cache_node_type
  port                        = 6379
  parameter_group_name        = aws_elasticache_parameter_group.main.name

  num_cache_clusters          = 2
  automatic_failover_enabled  = true
  multi_az_enabled            = true
  at_rest_encryption_enabled   = true
  transit_encryption_enabled  = false

  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = [var.cache_security_group_id]

  snapshot_retention_limit    = 5
  snapshot_window             = "03:00-05:00"

  maintenance_window          = "mon:05:00-mon:07:00"

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}

# Outputs
output "redis_endpoint" {
  value = {
    primary_endpoint = aws_elasticache_replication_group.main.primary_endpoint_address
    reader_endpoint  = aws_elasticache_replication_group.main.reader_endpoint_address
    port             = aws_elasticache_replication_group.main.port
  }
}

