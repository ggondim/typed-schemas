const Ajv = require('ajv');

function injectPluginsToAjv(ajvInstance, plugins, { afterPluginInit } = {}) {
  const _plugins = Object.keys(plugins);
  if (_plugins.length) {
    _plugins.forEach(pluginName => {
      const plugin = _plugins[pluginName];
      plugin(ajvInstance);
      if (afterPluginInit[pluginName]) {
        afterPluginInit[pluginName](plugin);
      }
    });
  }
}

class Schema {
  constructor(schema, object = {}, {
    ajv = new Ajv(),
    ajvPlugins = {},
    ajvAfterPluginInit = {},
  } = {}) {
    Object.assign(this, object);

    injectPluginsToAjv(ajv, ajvPlugins, { afterPluginInit: ajvAfterPluginInit });

    // performs initialization of defaults
    ajv.validate(schema, this);
    // eslint-disable-next-line no-param-reassign
    ajv.errors = [];

    // set private values to functions to be not serialized with toEJSON
    this._$schema = () => schema;
    this._$validator = () => ajv;

    if (this._$schema.additionalProperties === false) {
      // insert schema properties to ignore functions when additionalProperties is true
      this._$schema.properties._$schema = {};
      this._$schema.properties._$validator = {};
      // this._$schema.properties.isValid = {}; // is not needed, because...
      // AJV does not validate getters, only if explicity specified
      // https://runkit.com/ggondim/runkit-npm-ajv
    }
  }

  get isInvalid() {
    /*
     * it's better to have an `isInvalid` prop than hack $async into
     * schemas to get single way of returning errors
     * reference: https://github.com/ajv-validator/ajv#asynchronous-validation
     * async example: https://runkit.com/ggondim/runkit-npm-ajv
     */
    const isValid = this._$validator().validate(this._$schema(), this);
    if (!isValid) {
      return this._$validator().errors;
    }
    return false;
  }
}

module.exports = Schema;
