// ─────────────────────────────────────────────────────────────
//  AMML CDK Stack — Multi-Environment Infrastructure
//
//  Environments: dev | staging | production
//  Region: af-south-1 (AWS Cape Town — closest to Nigeria)
// ─────────────────────────────────────────────────────────────
import { Stack, StackProps, Duration, Tags } from 'aws-cdk-lib';
import { Vpc, SubnetType, InstanceClass, InstanceSize, InstancePlatform } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, Protocol } from 'aws-cdk-lib/aws-ecs';
import {
  Instance as RdsInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  MappedOVAPartitionGrant,
} from 'aws-cdk-lib/aws-rds';
import { CacheCluster, CacheNodeType } from 'aws-cdk-lib/aws-elasticache';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { Zone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export interface AMMLStackProps extends StackProps {
  /** Environment name: dev | staging | production */
  environment: 'dev' | 'staging' | 'production';
  /** Custom domain for this environment */
  domain: string;
  /** Zone in Route53 */
  hostedZoneId: string;
  /** Certificate ARN for HTTPS */
  certificateArn: string;
}

const ENV_SIZES = {
  dev: {
    appInstance: { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.MEDIUM },
    dbInstance:  { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.SMALL },
    redisNode:   CacheNodeType.T3_MICRO,
    replicas:    0,
    scaling:     { minCapacity: 1, maxCapacity: 2 },
  },
  staging: {
    appInstance: { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.MEDIUM },
    dbInstance:  { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.MEDIUM },
    redisNode:   CacheNodeType.T3_MICRO,
    replicas:    1,
    scaling:     { minCapacity: 1, maxCapacity: 4 },
  },
  production: {
    appInstance: { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.LARGE },
    dbInstance:  { instanceClass: InstanceClass.T3, instanceSize: InstanceSize.LARGE },
    redisNode:   CacheNodeType.T3_MEDIUM,
    replicas:    2,
    scaling:     { minCapacity: 2, maxCapacity: 8 },
  },
} as const;

export class AMMLStack extends Stack {
  public readonly vpc: Vpc;
  public readonly ecsCluster: Cluster;
  public readonly alb: ApplicationLoadBalancer;
  public readonly db: RdsInstance;
  public readonly redis: CacheCluster;

  constructor(scope: Construct, id: string, props: AMMLStackProps) {
    super(scope, `amml-${props.environment}`, props);

    const { environment, domain, hostedZoneId, certificateArn } = props;
    const cfg = ENV_SIZES[environment];

    // ── VPC ──────────────────────────────────────────────────
    this.vpc = new Vpc(this, 'AMMLVPC', {
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Isolated',
          subnetType: SubnetType.ISOLATED,
          cidrMask: 24,
        },
      ],
      // Enable NAT Gateway for private subnet outbound
      natGateways: environment === 'production' ? 2 : 1,
    });

    // ── ECS Cluster ──────────────────────────────────────────
    this.ecsCluster = new Cluster(this, 'AMMLCluster', {
      vpc: this.vpc,
      clusterName: `amml-${environment}`,
      containerInsights: true,
    });

    // ── RDS PostgreSQL ────────────────────────────────────────
    this.db = new RdsInstance(this, 'AMMLDB', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_16,
      }),
      instanceType: cfg.dbInstance.instanceClass !== undefined
        ? new InstanceClass(cfg.dbInstance.instanceClass)
        : InstanceClass.T3,
      instanceIdentifier: `amml-${environment}-db`,
      multiAz: environment === 'production',
      allocatedStorage: environment === 'production' ? 100 : 20,
      storageType: environment === 'production' ? 'gp3' : 'standard',
      backupRetention: Duration.days(environment === 'production' ? 30 : 7),
      deletionsRetention: Duration.days(7),
      vpc: this.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      publiclyAccessible: false,
    });

    // ── ElastiCache Redis ─────────────────────────────────────
    this.redis = new CacheCluster(this, 'AMMLRedis', {
      clusterName: `amml-${environment}`,
      nodeType: cfg.redisNode,
      numCacheNodes: 1,
      vpc: this.vpc,
      engine: 'redis',
      engineVersion: '7.0',
    });

    // ── Application Load Balancer ──────────────────────────────
    this.alb = new ApplicationLoadBalancer(this, 'AMLBALB', {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: `amml-${environment}-alb`,
    });

    // ── Tags for all resources ────────────────────────────────
    Tags.of(this).add('Project', 'AMML');
    Tags.of(this).add('Environment', environment);
    Tags.of(this).add('ManagedBy', 'CDK');
  }
}
