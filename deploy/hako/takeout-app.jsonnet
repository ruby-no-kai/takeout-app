local base = import './base.libsonnet';
local utils = import './utils.libsonnet';

base {
  scheduler+: utils.ecsSchedulerFargate {
    desired_count: 1,
    elb_v2: utils.albInternetFacing {
      container_name: 'app',
      container_port: 3000,
    },
  },
  app+: {
    port_mappings: [
      {
        container_port: '3000',
        host_port: 3000,
        protocol: 'tcp',
      },
    ],
  },
}
