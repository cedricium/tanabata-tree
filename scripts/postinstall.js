#! /usr/bin/env node

const { copySync } = require('fs-extra');

const files = [
  copySync('node_modules/bulma/css/bulma.css', 'frontend/vendor/bulma.css'),
  copySync('node_modules/bulma/css/bulma.css.map', 'frontend/vendor/bulma.css.map'),
  copySync('node_modules/bulma/LICENSE', 'frontend/vendor/bulma.LICENSE')
];

Promise.all(files).catch(err => {
  console.error(err);
  process.exit(1);
});