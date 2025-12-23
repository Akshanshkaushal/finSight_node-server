# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# CloudWatch Log Groups for each service
resource "aws_cloudwatch_log_group" "services" {
  for_each = toset(var.services)
  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = 30
}

# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.project_name}-${var.environment}-ecs-secrets-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ]
        Resource = [
          var.jwt_secret_arn,
          var.db_password_arn
        ]
      }
    ]
  })
}

# IAM Role for ECS Tasks (application role)
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  }
}

# Task Definitions for each service
locals {
  service_configs = {
    "api-gateway" = {
      port = 3000
      cpu  = 512
      memory = 1024
      desired_count = 2
      health_check_path = "/health"
    }
    "auth-service" = {
      port = 3001
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "user-service" = {
      port = 3002
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "news-service" = {
      port = 3003
      cpu  = 512
      memory = 1024
      desired_count = 2
      health_check_path = "/health"
    }
    "finance-engine" = {
      port = 3004
      cpu  = 512
      memory = 1024
      desired_count = 2
      health_check_path = "/health"
    }
    "advisory-service" = {
      port = 3005
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "notification-service" = {
      port = 3006
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "subscription-service" = {
      port = 3007
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "payment-service" = {
      port = 3008
      cpu  = 256
      memory = 512
      desired_count = 2
      health_check_path = "/health"
    }
    "ml-service" = {
      port = 3009
      cpu  = 512
      memory = 1024
      desired_count = 1
      health_check_path = "/health"
    }
  }
}

resource "aws_ecs_task_definition" "services" {
  for_each = local.service_configs

  family                   = "${var.project_name}-${var.environment}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = each.key
      image = var.ecr_repositories[each.key]

      portMappings = [
        {
          containerPort = each.value.port
          protocol      = "tcp"
        }
      ]

      environment = local.service_environments[each.key]

      secrets = local.service_secrets[each.key]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services[each.key].name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix"  = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${each.value.port}${each.value.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}"
    Service = each.key
  }
}

# Environment variables for each service
locals {
  service_environments = {
    "api-gateway" = [
      { name = "PORT", value = "3000" },
      { name = "NODE_ENV", value = "production" },
      { name = "AUTH_SERVICE_URL", value = "http://auth-service.${var.project_name}.local:3001" },
      { name = "USER_SERVICE_URL", value = "http://user-service.${var.project_name}.local:3002" },
      { name = "NEWS_SERVICE_URL", value = "http://news-service.${var.project_name}.local:3003" },
      { name = "ADVISORY_SERVICE_URL", value = "http://advisory-service.${var.project_name}.local:3005" },
      { name = "SUBSCRIPTION_SERVICE_URL", value = "http://subscription-service.${var.project_name}.local:3007" },
      { name = "PAYMENT_SERVICE_URL", value = "http://payment-service.${var.project_name}.local:3008" },
    ]
    "auth-service" = [
      { name = "PORT", value = "3001" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["auth"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["auth"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["auth"].database },
      { name = "DB_USER", value = "finsight_admin" },
    ]
    "user-service" = [
      { name = "PORT", value = "3002" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["users"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["users"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["users"].database },
      { name = "DB_USER", value = "finsight_admin" },
      { name = "REDIS_HOST", value = var.redis_endpoint.primary_endpoint },
      { name = "REDIS_PORT", value = tostring(var.redis_endpoint.port) },
    ]
    "news-service" = [
      { name = "PORT", value = "3003" },
      { name = "NODE_ENV", value = "production" },
      { name = "MONGO_URI", value = var.mongo_uri },
      { name = "REDIS_HOST", value = var.redis_endpoint.primary_endpoint },
      { name = "REDIS_PORT", value = tostring(var.redis_endpoint.port) },
      { name = "KAFKA_BROKERS", value = join(",", var.kafka_brokers) },
    ]
    "finance-engine" = [
      { name = "PORT", value = "3004" },
      { name = "NODE_ENV", value = "production" },
      { name = "USER_SERVICE_URL", value = "http://user-service.${var.project_name}.local:3002" },
      { name = "REDIS_HOST", value = var.redis_endpoint.primary_endpoint },
      { name = "REDIS_PORT", value = tostring(var.redis_endpoint.port) },
      { name = "KAFKA_BROKERS", value = join(",", var.kafka_brokers) },
    ]
    "advisory-service" = [
      { name = "PORT", value = "3005" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["advisory"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["advisory"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["advisory"].database },
      { name = "DB_USER", value = "finsight_admin" },
      { name = "KAFKA_BROKERS", value = join(",", var.kafka_brokers) },
      { name = "SUBSCRIPTION_SERVICE_URL", value = "http://subscription-service.${var.project_name}.local:3007" },
    ]
    "notification-service" = [
      { name = "PORT", value = "3006" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["notifications"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["notifications"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["notifications"].database },
      { name = "DB_USER", value = "finsight_admin" },
      { name = "KAFKA_BROKERS", value = join(",", var.kafka_brokers) },
    ]
    "subscription-service" = [
      { name = "PORT", value = "3007" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["subscriptions"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["subscriptions"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["subscriptions"].database },
      { name = "DB_USER", value = "finsight_admin" },
      { name = "KAFKA_BROKERS", value = join(",", var.kafka_brokers) },
    ]
    "payment-service" = [
      { name = "PORT", value = "3008" },
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = var.rds_endpoints["payments"].address },
      { name = "DB_PORT", value = tostring(var.rds_endpoints["payments"].port) },
      { name = "DB_NAME", value = var.rds_endpoints["payments"].database },
      { name = "DB_USER", value = "finsight_admin" },
      { name = "SUBSCRIPTION_SERVICE_URL", value = "http://subscription-service.${var.project_name}.local:3007" },
    ]
    "ml-service" = [
      { name = "PORT", value = "3009" },
      { name = "NODE_ENV", value = "production" },
    ]
  }

  service_secrets = {
    "api-gateway" = [
      { name = "JWT_SECRET", valueFrom = "${var.jwt_secret_arn}:jwt_secret::" }
    ]
    "auth-service" = [
      { name = "JWT_SECRET", valueFrom = "${var.jwt_secret_arn}:jwt_secret::" },
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "user-service" = [
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "advisory-service" = [
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "notification-service" = [
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "subscription-service" = [
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "payment-service" = [
      { name = "DB_PASSWORD", valueFrom = "${var.db_password_arn}:password::" }
    ]
    "news-service" = []
    "finance-engine" = []
    "ml-service" = []
  }
}

# ECS Services
resource "aws_ecs_service" "services" {
  for_each = local.service_configs

  name            = "${var.project_name}-${var.environment}-${each.key}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = each.value.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [var.app_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  service_registries {
    registry_arn = aws_service_discovery_service.services[each.key].arn
  }

  depends_on = [
    aws_lb_listener_rule.services,
    aws_service_discovery_service.services
  ]

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}"
    Service = each.key
  }
}

# Service Discovery (Private DNS)
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.project_name}.local"
  description = "Service discovery namespace for ${var.project_name}"
  vpc         = var.vpc_id
}

resource "aws_service_discovery_service" "services" {
  for_each = local.service_configs

  name = each.key

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_grace_period_seconds = 30
}

# Target Groups for ALB
resource "aws_lb_target_group" "services" {
  for_each = local.service_configs

  name        = "${var.project_name}-${var.environment}-${each.key}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = each.value.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}-tg"
    Service = each.key
  }
}

# ALB Listener Rules
resource "aws_lb_listener_rule" "services" {
  for_each     = local.service_configs
  listener_arn = var.https_listener_arn != "" ? var.https_listener_arn : var.http_listener_arn
  priority     = each.key == "api-gateway" ? 1 : 100 + index(keys(local.service_configs), each.key)

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = each.key == "api-gateway" ? ["/*"] : ["/${each.key}/*"]
    }
  }
}

# Data sources
data "aws_region" "current" {}

# Outputs
output "cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_names" {
  value = {
    for k, v in aws_ecs_service.services : k => v.name
  }
}

