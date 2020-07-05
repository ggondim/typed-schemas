# typed-schemas
JavaScript classes with type validation using JSON Schema

## Using schema to instantiate defaults

```javascript
const personSchema = {
  properties: {
    order: {
      type: 'number',
      default: 123
    }
  }
};

const person = new Schema(personSchema, {});

console.log(person.order); // outputs 123
```

## Converting an object to a validated object

```javascript
const schema = { properties: { prop: { type: 'number' } } };

const object = { prop: 'value' };

const typedObject = new Schema(schema, object);

// now typedObject.isInvalid == true

console.log(typedObject.isInvalid) // outputs validation errors
```

## Building predefined types

```javascript
const userSchema = { /* ... */ };

class User extends Schema {
  constructor(user = {}) {
    super(userSchema, user);
  }
}

const newUser = new User(); // newUser has `isInvalid` property
```

## Extending AJV validator with options or plugins
```javascript
const Ajv = require('ajv');
const AjvErrors = require('ajv-errors');

class PowerfulSchema extends Schema {
  constructor(schema, object) {
  
    // editing options
    const Ajv = new Ajv({ coerceTypes: true });
    
    // adding plugins
    const ajvPlugins = {
      'ajv-errors': AjvErrors,
    };
    
    super(schema, object, {
      ajv,
      ajvPlugins,
    });
  }
}
```
