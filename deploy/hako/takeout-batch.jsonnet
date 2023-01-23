local base = import './base.libsonnet';
local utils = import './utils.libsonnet';

base {
  scheduler+: utils.ecsSchedulerFargate {
    desired_count: 1,
    capacity_provider_strategy: [
      { capacity_provider: 'FARGATE', weight: 1 },
    ],
  },
}
