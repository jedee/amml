#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  AMML CDK — Deploy Script
//  Usage: bun run infrastructure/bin/deploy.ts [dev|staging|prod]
// ─────────────────────────────────────────────────────────────
import { App } from 'aws-cdk-lib';
import { AMMLStack } from '../lib/amml-stack';

const VALID_ENVS = ['dev', 'staging', 'production'] as const;
const target = process.argv[2]?.toLowerCase() ?? 'dev';

if (!VALID_ENVS.includes(target as (typeof VALID_ENVS)[number])) {
  console.error(`Usage: deploy.ts [${VALID_ENVS.join('|')}]`);
  process.exit(1);
}

const env = target as (typeof VALID_ENVS)[number];

const DOMAIN_BY_ENV = {
  dev: 'dev.amml.zo-computer.io',
  staging: 'staging.amml.zo-computer.io',
  production: 'amml.zo-computer.io',
} as const;

// ── Per-environment configuration ───────────────────────────
const ENV_CONFIG = {
  dev: {
    appMemory: 512,
    appCpu: 256,
    desiredCount: 1,
    scaleOnRequestCount: 100,
    dbAllocatedStorage: 20,
  },
  staging: {
    appMemory: 1024,
    appCpu: 512,
    desiredCount: 2,
    scaleOnRequestCount: 200,
    dbAllocatedStorage: 50,
  },
  production: {
    appMemory: 2048,
    appCpu: 1024,
    desiredCount: 3,
    scaleOnRequestCount: 500,
    dbAllocatedStorage: 100,
  },
} as const;

const app = new App();

new AMMLStack(app, `amml-${env}`, {
  environment: env,
  domain: DOMAIN_BY_ENV[env],
  // These values are set via CDK context or environment variables
  hostedZoneId: process.env.CDK_HOSTED_ZONE_ID ?? 'placeholder',
  certificateArn: process.env.CDK_CERTIFICATE_ARN ?? 'placeholder',
  env: {
    account: process.env.CDK_AWS_ACCOUNT ?? process.env.AWS_ACCOUNT ?? '123456789012',
    region: process.env.CDK_AWS_REGION ?? 'af-south-1',
  },
});

app.synth();

console.log(`[deploy] synthesised AMML ${env} stack`);
console.log(`         domain: ${DOMAIN_BY_ENV[env]}`);
console.log(`         region: ${process.env.CDK_AWS_REGION ?? 'af-south-1'}`);
console.log(`         run 'cdk deploy amml-${env}' to apply`);
