# API Gateway REST API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"
  description   = "API Gateway for FinSight microservices"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 300
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }
}

# API Gateway Integration with ALB
resource "aws_apigatewayv2_integration" "alb" {
  api_id = aws_apigatewayv2_api.main.id

  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "https://${var.alb_dns_name}"
  connection_type    = "INTERNET"

  payload_format_version = "1.0"
}

# API Gateway Route - Catch All
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"

  target = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api-stage"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 30
}

# API Gateway Domain (optional - if you have a custom domain)
resource "aws_apigatewayv2_domain_name" "main" {
  count       = var.domain_name != "" ? 1 : 0
  domain_name = var.domain_name

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy  = "TLS_1_2"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api-domain"
  }
}

resource "aws_apigatewayv2_api_mapping" "main" {
  count       = var.domain_name != "" ? 1 : 0
  api_id      = aws_apigatewayv2_api.main.id
  domain_name = aws_apigatewayv2_domain_name.main[0].id
  stage       = aws_apigatewayv2_stage.main.id
}

# Outputs
output "api_gateway_id" {
  value = aws_apigatewayv2_api.main.id
}

output "api_gateway_url" {
  value = aws_apigatewayv2_api.main.api_endpoint
}

output "api_gateway_domain" {
  value = var.domain_name != "" ? aws_apigatewayv2_domain_name.main[0].domain_name : ""
}

