output "alb_arn" {
  value = aws_lb.main.arn
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "https_listener_arn" {
  value = var.certificate_arn != "" ? aws_lb_listener.https[0].arn : ""
}

output "http_listener_arn" {
  value = aws_lb_listener.http.arn
}

