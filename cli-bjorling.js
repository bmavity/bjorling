#!/usr/bin/env node

var argv = require('argp')
    .description('Bjorling: Projecting events like a boss')
    .body()
      .group('Arguments')
      .argument('filename', { description: 'Projection you are working with' })
      .group('Options')
      .option({ short: 's', long: 'storage', description: 'Storage engine' })
      .help()
      .version('Bjorling ' + require('./package').version)
      .end()
    .argv()