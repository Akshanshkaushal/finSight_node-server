variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnets" {
  type = list(string)
}

variable "cache_security_group_id" {
  type = string
}

variable "cache_node_type" {
  type    = string
  default = "cache.t3.medium"
}

