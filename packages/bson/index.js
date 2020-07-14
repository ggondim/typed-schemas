const { EJSON, ObjectId } = require('bson');
const AjvKeywords = require('ajv-keywords');
const AjvBsontype = require('ajv-bsontype');

const Schema = require('typed-schemas');

class BsonSchema extends Schema {
  constructor(schema, object = {}, {
    ajv = null,
    ajvPlugins = {},
    ajvAfterPluginInit = {},
  } = {}) {
    const plugins = {
      // ajv-bsontype enables `bsonType` keyword
      // https://github.com/BoLaMN/ajv-bsontype
      // https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#json-schema
      'ajv-bsontype': AjvBsontype,
      // add ajv-kewords specially enables `dynamicDefaults` and `instanceOf`
      // https://www.npmjs.com/package/ajv-keywords#dynamicdefaults
      'ajv-keywords': AjvKeywords,
    };

    const afterPluginInit = {
      'ajv-keywords': (ajvKeywords) => {
        // adds ObjectId definition to ajv-keywords
        // https://www.npmjs.com/package/ajv-keywords#instanceof
        const instanceofDefinition = ajvKeywords.get('instanceof').definition;
        if (!instanceofDefinition.CONSTRUCTORS.ObjectId) {
          instanceofDefinition.CONSTRUCTORS.ObjectId = ObjectId;
          instanceofDefinition.CONSTRUCTORS.ObjectID = ObjectId; // aliased as in bson
        }
      },
    };

    super(schema, object, {
      ajv,
      ajvPlugins: { ...ajvPlugins, ...plugins },
      ajvAfterPluginInit: { ...ajvAfterPluginInit, ...afterPluginInit },
    });

    if (this._$schema.additionalProperties === false) {
      // insert schema properties to ignore functions when additionalProperties is true
      // https://runkit.com/ggondim/runkit-npm-bson
      this._$schema.properties.toEJSONString = {};
      this._$schema.properties.toEJSON = {};
    }
  }

  toEJSON() {
    return EJSON.parse(this.stringifyEJSON());
  }

  toEJSONString() {
    return EJSON.stringify(this);
  }
}

module.exports = BsonSchema;
