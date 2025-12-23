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

variable "kafka_security_group_id" {
  type = string
}

variable "kafka_instance_type" {
  type    = string
  default = "kafka.t3.small"
}

variable "kafka_storage_size" {
  type    = number
  default = 100
}

