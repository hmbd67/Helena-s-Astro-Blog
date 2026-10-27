import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

export interface EcsStackProps extends cdk.StackProps {
	repositoryName: string;
	imageTag: string;
}

export class EcsStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: EcsStackProps) {
		super(scope, id, props);

		const vpc = new ec2.Vpc(this, 'Vpc', {
			maxAzs: 2,
			natGateways: 0,
			subnetConfiguration: [
				{
					name: 'Public',
					subnetType: ec2.SubnetType.PUBLIC,
					cidrMask: 24,
				},
			],
		});
		const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
		const repository = ecr.Repository.fromRepositoryName(
			this,
			'ContainerRepository',
			props.repositoryName,
		);
		const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
			cluster,
			cpu: 256,
			memoryLimitMiB: 512,
			desiredCount: 1,
			circuitBreaker: { rollback: true },
			publicLoadBalancer: true,
			assignPublicIp: true,
			taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
			healthCheckGracePeriod: cdk.Duration.seconds(60),
			taskImageOptions: {
				image: ecs.ContainerImage.fromEcrRepository(repository, props.imageTag),
				containerPort: 4321,
				environment: {
					HOST: '0.0.0.0',
					NODE_ENV: 'production',
					PORT: '4321',
				},
				logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'astro-blog' }),
			},
		});

		service.targetGroup.configureHealthCheck({
			path: '/api/health',
			healthyHttpCodes: '200',
		});

		new cdk.CfnOutput(this, 'LoadBalancerUrl', {
			value: `http://${service.loadBalancer.loadBalancerDnsName}`,
		});
		new cdk.CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
		new cdk.CfnOutput(this, 'ServiceName', { value: service.service.serviceName });
	}
}
