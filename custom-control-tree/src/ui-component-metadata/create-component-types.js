const path = require('path');
const fs = require('fs');

const isFile = f => fs.statSync(f).isFile();


function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
}

function createDir(path) {
  if (!fs.existsSync(path)) {
    mkDirByPathSync(path);
  }
}

function findValidator(name, validators) {
  return validators.find(validator => validator.Name === name);
}

function findAction(type, actions) {
  return actions.find(action => action.Type === type);
}

function findEvent(event, generatedEvents) {
  const eventName = typeof event === 'string' ? event : event.Event;
  const eventInfo = generatedEvents.find(event => event.Event === eventName)

  return eventInfo
    ? { ...eventInfo, Payload: event.Payload || eventInfo.Payload }
    : eventInfo;
}

function createMetadata(conponentFile, actions, validators, generatedEvents) {
  const component = JSON.parse(fs.readFileSync(conponentFile, 'utf8'));

  return {
    ...component,
    AvailableValidators: component.AvailableValidators
      .map(name => findValidator(name, validators))
      .filter(availableValidator => !!availableValidator),
    AvailableActions: component.AvailableActions
      .map(type => findAction(type, actions))
      .filter(availableAction => !!availableAction),
    GenerateEvents: component.GenerateEvents
      .map(event => findEvent(event, generatedEvents))
      .filter(availableAction => !!availableAction),
  };
}

(function createComponentTypesJson() {
  const srvDir = path.join(__dirname, '../ui-component-metadata');
  const distDir = path.join(__dirname, '../../dist/custom-component-metadata');

  console.info('Create custom-component-metadata.json');

  const actions = JSON.parse(fs.readFileSync(path.join(srvDir, 'actions.json'), 'utf8'));
  const validators = JSON.parse(fs.readFileSync(path.join(srvDir, 'validators.json'), 'utf8'));
  const generatedEvents = JSON.parse(fs.readFileSync(path.join(srvDir, 'generated-events.json'), 'utf8'));

  const componentMetadata = createMetadata(
      path.join(srvDir, 'components', 'custom-component.json'),
      actions,
      validators,
      generatedEvents
    );

  const destFile = path.join(distDir, 'custom-component-metadata.json');
  createDir(distDir);
  fs.writeFileSync(
    destFile,
    JSON.stringify(componentMetadata, null, 2)
  );

  console.info(`file ${destFile} created`);
})();
