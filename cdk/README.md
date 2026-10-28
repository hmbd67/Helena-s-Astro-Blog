# Deploy the Astro site to ECS

The `EcsStack` runs the Astro container as an ECS Fargate service behind a public
Application Load Balancer. It uses two public subnets and does not create NAT
gateways. Tasks receive public IPs for outbound image pulls and logging, but the
task security group only accepts application traffic from the load balancer.
The target group checks `/api/health` on port `4321`.
The `AstroBlog-ALB-5xx` CloudWatch alarm enters ALARM when either the load
balancer or its targets return one or more 5xx responses in a five-minute
period. No SNS notification action is configured; the alarm state is visible
in CloudWatch.

The existing `CdkStack` S3/CloudFront stack is kept separate and is not changed
by the container deployment workflow.

## Prerequisites

- An existing ECR repository for the image (default name: `astro-blog`).
- An AWS account and region with the CDK bootstrap stack installed:

  ```sh
  npx cdk bootstrap aws://ACCOUNT_ID/REGION
  ```

- GitHub Actions repository secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- Optional GitHub Actions repository variables:
  - `AWS_REGION` (defaults to `eu-west-1`)
  - `ECR_REPOSITORY` (defaults to `astro-blog`)

The workflow creates the ECR repository if it is missing. The deployment
identity therefore needs ECR permissions to describe and create repositories,
as well as push and describe images.

The AWS credentials need to push images to ECR and deploy the CDK stack,
including its IAM roles, VPC, ECS service, and load balancer resources.

## Deployment

On each push to `main`, the workflow builds the Docker image, pushes it to ECR
tagged with the commit SHA, then deploys `EcsStack` using that exact image tag.
ECR tags are immutable; if that commit's image already exists, the workflow
reuses it instead of attempting to overwrite it.
The stack output `LoadBalancerUrl` gives the public HTTP URL after deployment.

To deploy manually from `cdk/`, first push the image to the existing ECR
repository, then run:

```sh
npx cdk deploy EcsStack \
  --context ecsOnly=true \
  --context ecrRepositoryName=astro-blog \
  --context imageTag=IMAGE_TAG
```

`ecsOnly=true` prevents synthesis of the existing static-site stack and avoids
requiring its build assets during an ECS-only deployment.

Fargate tasks, the Application Load Balancer, and related networking incur AWS
charges while deployed. The default service runs one task.
