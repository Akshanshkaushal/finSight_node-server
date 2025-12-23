# MSK Configuration
resource "aws_msk_configuration" "main" {
  kafka_versions = ["3.5.1"]
  name           = "${var.project_name}-${var.environment}-kafka-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=true
default.replication.factor=2
min.insync.replicas=2
num.partitions=3
log.retention.hours=168
PROPERTIES
}

# MSK Cluster
resource "aws_msk_cluster" "main" {
  cluster_name           = "${var.project_name}-${var.environment}-kafka"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = length(var.private_subnets)

  broker_node_group_info {
    instance_type   = var.kafka_instance_type
    ebs_volume_size = var.kafka_storage_size
    client_subnets  = var.private_subnets
    security_groups = [var.kafka_security_group_id]

    storage_info {
      ebs_storage_info {
        provisioned_throughput {
          enabled           = true
          volume_throughput = 250
        }
        volume_size = var.kafka_storage_size
      }
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.main.arn
    revision = aws_msk_configuration.main.latest_revision
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
    encryption_at_rest_kms_key_id = aws_kms_key.msk.arn
  }

  client_authentication {
    sasl {
      iam = true
    }
    tls {
      certificate_authority_arns = []
    }
  }

  enhanced_monitoring = "PER_TOPIC_PER_PARTITION"

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk.name
      }
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-kafka"
  }
}

# KMS Key for MSK encryption
resource "aws_kms_key" "msk" {
  description             = "KMS key for MSK encryption"
  deletion_window_in_days = 10
  enable_key_rotation    = true

  tags = {
    Name = "${var.project_name}-${var.environment}-msk-kms"
  }
}

resource "aws_kms_alias" "msk" {
  name          = "alias/${var.project_name}-${var.environment}-msk"
  target_key_id = aws_kms_key.msk.key_id
}

# CloudWatch Log Group for MSK
resource "aws_cloudwatch_log_group" "msk" {
  name              = "/aws/msk/${var.project_name}-${var.environment}"
  retention_in_days = 7
}

# Outputs
output "cluster_arn" {
  value = aws_msk_cluster.main.arn
}

output "broker_endpoints" {
  value = aws_msk_cluster.main.bootstrap_brokers_tls
}

output "zookeeper_connect_string" {
  value = aws_msk_cluster.main.zookeeper_connect_string
}

