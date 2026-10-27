import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { EcsStack } from '../lib/ecs-stack';

describe('ECS service stack', () => {
	const app = new cdk.App();
	const stack = new EcsStack(app, 'TestEcsStack', {
		repositoryName: 'astro-blog',
		imageTag: 'test-image',
		env: { account: '123456789012', region: 'us-east-1' },
	});
	const template = Template.fromStack(stack);

	test('creates a Fargate service and an internet-facing application load balancer', () => {
		template.resourceCountIs('AWS::ECS::Cluster', 1);
		template.resourceCountIs('AWS::ECS::Service', 1);
		template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
		template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
			Scheme: 'internet-facing',
			Type: 'application',
		});
		template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
			Port: 80,
			Protocol: 'HTTP',
		});
		template.hasResourceProperties('AWS::ECS::Service', {
			DeploymentConfiguration: {
				DeploymentCircuitBreaker: { Enable: true, Rollback: true },
			},
		});
	});

	test('runs the image on the Astro port and health-checks the application route', () => {
		template.hasResourceProperties('AWS::ECS::TaskDefinition', {
			RequiresCompatibilities: ['FARGATE'],
			NetworkMode: 'awsvpc',
			ContainerDefinitions: Match.arrayWith([
				Match.objectLike({
					Image: Match.objectLike({
						'Fn::Join': Match.arrayWith([
							Match.arrayWith([Match.stringLikeRegexp('.*astro-blog:test-image')]),
						]),
					}),
					PortMappings: Match.arrayWith([
						Match.objectLike({ ContainerPort: 4321 }),
					]),
					Environment: Match.arrayWith([
						{ Name: 'HOST', Value: '0.0.0.0' },
						{ Name: 'PORT', Value: '4321' },
					]),
				}),
			]),
		});
		template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
			HealthCheckPath: '/api/health',
			Matcher: { HttpCode: '200' },
		});
	});

	test('alarms when the load balancer or its targets return 5xx responses', () => {
		template.resourceCountIs('AWS::CloudWatch::Alarm', 1);
		template.hasResourceProperties('AWS::CloudWatch::Alarm', {
			AlarmName: 'AstroBlog-ALB-5xx',
			AlarmDescription:
				'Triggers when the Application Load Balancer or its targets return any 5xx responses in five minutes.',
			ComparisonOperator: 'GreaterThanThreshold',
			Threshold: 0,
			EvaluationPeriods: 1,
			DatapointsToAlarm: 1,
			TreatMissingData: 'notBreaching',
			Metrics: Match.arrayWith([
				Match.objectLike({ Expression: 'alb5xx + target5xx' }),
				Match.objectLike({
					MetricStat: Match.objectLike({
						Metric: Match.objectLike({ MetricName: 'HTTPCode_ELB_5XX_Count' }),
						Period: 300,
						Stat: 'Sum',
					}),
				}),
				Match.objectLike({
					MetricStat: Match.objectLike({
						Metric: Match.objectLike({ MetricName: 'HTTPCode_Target_5XX_Count' }),
						Period: 300,
						Stat: 'Sum',
					}),
				}),
			]),
		});
	});
});
