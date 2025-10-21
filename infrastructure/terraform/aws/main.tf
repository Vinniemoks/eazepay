terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "afripay-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
  project_name       = var.project_name
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  cluster_name = "${var.project_name}-${var.environment}"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
  environment  = var.environment
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"
  
  identifier          = "${var.project_name}-${var.environment}"
  engine_version      = "15.4"
  instance_class      = var.db_instance_class
  allocated_storage   = 100
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  database_name       = "afripay_prod"
  master_username     = var.db_master_username
  master_password     = var.db_master_password
}

# ElastiCache Redis
module "redis" {
  source = "./modules/elasticache"
  
  cluster_id      = "${var.project_name}-${var.environment}"
  node_type       = var.redis_node_type
  num_cache_nodes = 2
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name            = "${var.project_name}-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnet_ids
  certificate_arn = var.ssl_certificate_arn
}

# Microservices
module "identity_service" {
  source = "./modules/ecs-service"
  
  service_name   = "identity-service"
  cluster_id     = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.identity_service.arn
  desired_count  = 2
  subnet_ids     = module.vpc.private_subnet_ids
  target_group_arn = module.alb.identity_target_group_arn
}

module "customer_portal" {
  source = "./modules/ecs-service"
  
  service_name   = "customer-portal"
  cluster_id     = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.customer_portal.arn
  desired_count  = 2
  subnet_ids     = module.vpc.private_subnet_ids
  target_group_arn = module.alb.customer_portal_target_group_arn
}

# CloudFront for static assets
module "cloudfront" {
  source = "./modules/cloudfront"
  
  origin_domain_name = module.alb.dns_name
  certificate_arn    = var.cloudfront_certificate_arn
  environment        = var.environment
}
