const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './projects/inka-ui-viewer/src/assets/web-components/runtime.js',
    './projects/inka-ui-viewer/src/assets/web-components/polyfills.js',
    './projects/inka-ui-viewer/src/assets/web-components/main.js',
  ];

  await fs.ensureDir('projects/inka-ui-viewer/src/assets/web-components');
  await concat(files, 'projects/inka-ui-viewer/src/assets/web-components/custom-control-components.js');
})();
