# Fake-Knex

### Usage
* Get your test dataset handy, formatted by tablename and data of course
* Initialize the mock database with your dataset
* Run those queries! ✨👟

```
const dataset = [{ name: 'people', data: [ { name: 'mike', age: 29 }, { name: 'olaf', age: 13 }, { name: 'sarah', age: 29 }, { name: 'joey', age: 28 } ] }]
const db = require('./index')(dataset)
 
db('people').where({ age: 29 }).update({ age: 2000 }).returning('_id').then(data => console.log('Here\'s my data!', data))
// outputs: Here's my data! [ { _id: 1 }, { _id: 3 } ]
 
db('people').where({ age: 2000 }).then(data => console.log('Here\'s my data!', data))
// outputs: Here's my data! [ { name: 'mike', age: 2000, _id: 1 }, { name: 'sarah', age: 2000, _id: 3 } ]
```