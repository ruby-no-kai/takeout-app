local base = import './base.libsonnet';
local utils = import './utils.libsonnet';

base {
  scheduler+: utils.ecsSchedulerFargate {
    desired_count: 1,
  },
  app+: {
    command: ['bundle', 'exec', 'shoryuken', 'start', '-R', '-C', 'config/shoryuken.yml'],
  },
}
