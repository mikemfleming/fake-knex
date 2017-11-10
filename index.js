'use strict';

const database = {}

module.exports = function (dataset) {
  if (!(Array.isArray(dataset))) throw new Error(`Expected dataset to be an array, got ${typeof dataset}`)
  let _id = 0;
  dataset.forEach(function (table) {
    database[table.name] = table.data.map(function (record) {
      record._id = ++_id
      return record
    })
  })
  return mock
}

function mock (tableName) {
  if (typeof tableName !== 'string') throw new Error(`Expected tableName to be a string, got ${typeof tableName}`)
  return new Query(tableName)
}

class Query {
  constructor (name) {
    this.name = name
    this.data = database[name].slice()
    this.returningColumns = []

    Promise.prototype.limit = this.limit.bind(this)
    Promise.prototype.update = this.update.bind(this)
    Promise.prototype.returning = this.returning.bind(this)
    Promise.prototype.insert = this.insert.bind(this)
  }

  where (query) {
    const context = this
    return new Promise(function (resolve, reject) {
      if (typeof query !== 'object' || query === null) throw new Error(`Expected query to be an object, got ${typeof query}`)
      const column = Object.keys(query)
      context.data = context.data.filter(function (datum) {
        return datum[column] === query[column]
      })
      resolve(context.data)
    })
  }

  limit (n) {
    const context = this
    return new Promise(function (resolve, reject) {
      if (typeof n !== 'number') throw new Error(`Expected n to be a number, got ${typeof n}`)
      resolve(context.data.slice(0,n))
    })
  }

  // TODO: ditch the context variable
  update (query) {
    const context = this
    return new Promise (function (resolve, reject) {
      if (typeof query !== 'object' || query === null) throw new Error(`Expected query to be an object, got ${typeof query}`)
      const columns = Object.keys(query)
      columns.forEach(function (column) {
        context.data.forEach(function (datum) {
          datum[column] = query[column]
        })
        const recordsToSync = context.data.map((record) => record._id)
        database[context.name] = database[context.name].map(function (record) {
          if (recordsToSync.includes(record._id)) {
            record[column] = query[column]
          }
          return record
        })
      })
      resolve([])
    })
  }

  // TODO: this just assumes that its tacked on at the end of the query
  returning (query) {
    const context = this
    return new Promise(function (resolve, reject) {
      if (!((typeof query === 'string') || Array.isArray(query))) throw new Error('Expected query to be an string or an array of strings')
      const returningColumns = Array.isArray(query) ? query.forEach((column) => returningColumns.push(column)) : new Array(query)
      context.returningColumns = returningColumns
      const returningColumnsResults = context.data.map(function (record) {
        const projection = {};
        context.returningColumns.forEach((column) => projection[column] = record[column])
        return projection
      })
      resolve(returningColumnsResults)
    })
  }

  // TODO: this basically expects that .insert is the end of the statement, ditch the context variable
  insert (query) {
    const context = this
    return new Promise(function (resolve, reject) {
      if (!((typeof query === 'object' && typeof query !== null) || Array.isArray(query))) throw new Error('Expected query to be an object or an array of objects')
      const indexes = []
      if (Array.isArray(query)) {
        query.forEach(function (record) {
          const _id = database[context.name].length + 1
          indexes.push(_id)
          record._id = _id
          database[context.name].push(record)
        })
      } else {
        const _id = database[context.name].length + 1
        indexes.push(_id)
        query._id = _id
        database[context.name].push(query)
      }
      resolve(indexes)
    })
  }
}
