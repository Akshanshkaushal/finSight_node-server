output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_gateway_url
}

output "rds_endpoints" {
  description = "RDS database endpoints"
  value       = module.rds.endpoints
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.redis_endpoint
  sensitive   = true
}

output "kafka_brokers" {
  description = "MSK Kafka broker endpoints"
  value       = module.msk.broker_endpoints
  sensitive   = true
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

