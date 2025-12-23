variable "vpc_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alb_security_group_id" {
  type        = string
  description = "ALB security group ID (for reference)"
  default     = ""
}

