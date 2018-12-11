const fs = require('fs')
require('colors')

class Model {
  static factory(name) {
    class DocumentModel extends Model {}

    Object.defineProperty(DocumentModel, 'name', {
      value: name
    })

    return DocumentModel
  }

  static _qb(method, data) {
    return new QueryBuilder({
      method,
      model: this.name,
      data
    })
  }

  static return(value) {
    return new Return({
      value
    })
  }

  static find() {
    return this._qb('find').return()
  }

  static insert(data = {}) {
    return this._qb('insert', data)
  }

  static update(data = {}) {
    return this._qb('update', data)
  }

  static replace(data = {}) {
    return this._qb('replace', data)
  }

  static remove() {
    return this._qb('remove', data)
  }

  static count() {
    return this._qb('count').return()
  }

  static upsert(insertData = {}, updateData = {}) {
    return this._qb('upsert', {
      insert: insertData,
      update: updateData
    })
  }

  static link(from, to, data = {}) {
    return this._qb('link', {
      ...data,
      from,
      to
    })
  }

  static unlink(from, to) {
    return this._qb('unlink', {
      from,
      to
    })
  }

  static import(items) {
    return this._qb('import', { data: items })
  }

  toJSON() {
    let json = {}
    let keys = Object.keys(this)
    let key
    for (let i = 0; i < keys.length; i++) {
      key = keys[i]
      json[key] = this[key]
    }
    return json
  }
}

class QueryBuilder {
  constructor(query = {}) {
    this._query = query
    this._query.version = 1
    this._query.queries = []
  }

  _ensureReturn() {
    if (!this._query.return) {
      this._query.return = {}
    }
  }

  name(val) {
    this._query.name = val
    return this
  }

  where(val) {
    this._query.where = val
    return this
  }

  offset(val = 0) {
    this._query.offset = val
    return this
  }

  limit(val = 10) {
    this._query.limit = val
    return this
  }

  one() {
    this._query.one = true
    return this
  }

  let(key, value) {
    if (!this._query.lets) {
      this._query.lets = {}
    }
    this._query.lets[key] = value
    return this
  }

  select(val = '') {
    if (val) {
      this._query.select = val
    } else {
      delete this._query.select
    }
    return this
  }

  query(...opts) {
    if (typeof opts[0] === 'string') {
      this._query.queries.push({
        id: opts[0],
        query: opts[1].toJSON()
      })
    } else {
      this._query.queries.push({
        query: opts[0].toJSON()
      })
    }
    return this
  }

  return(value) {
    this._query.return = value || Model.return()
    return this
  }

  toJSON() {
    let returnOptions = this._query.return
    if (returnOptions && returnOptions.options) {
      returnOptions = returnOptions.options
    }
    return Object.assign({}, this._query, { return: returnOptions })
  }
}

class Return {
  constructor(options = {}) {
    this.options = options
    this.options.actions = this.options.actions || []
  }

  value(val) {
    this.options.value = val
    return this
  }

  id(val = true) {
    this.options.id = val
    return this
  }

  computed(val = true) {
    this.options.computed = val
    return this
  }

  model(val = true) {
    this.options.model = val
    return this
  }

  append(target, as) {
    this.options.actions.push({
      action: 'append',
      target,
      as
    })
    return this
  }

  merge(target) {
    this.options.actions.push({
      action: 'merge',
      target
    })
    return this
  }
}

// let Tweet = new Model('Tweet')
let Identity = Model.factory('Identity')
let User = Model.factory('User')
let Like = Model.factory('Like')
let UserQuery = User.update({ firstName: 'John' })
  .one()
  .where({ _key: '@{^.user}' }) // .name('u')
  .return()

// var u = new User()
// u.firstName = 'Rob'
// u.lastName = 'Taylor'

// console.log(u.toJSON())

function test1() {
  let result = Identity.update({ verified: true, bogus: true })
    .one()
    .where({ _key: '217388' })
    .name('ident')
    .query('user', UserQuery)
    .select('name')
    .return(Model.return('ident').append('user', 'myUser').append('user', 'myUser2').merge('user').id().computed())

  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test2() {
  let result = User.insert({ firstName: 'John', lastName: 'Smith' })
    .query('id1', Identity.update({ provider: 'hello', verified: true }).where({ _key: '123' }))
    .return()
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test3() {
  let result = User.remove().one().where({ active: true }).return()
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test4() {
  let result = User.find().one().where({ active: true }).return()
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test5() {
  let result = User.count().where({ active: true }).return()
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test6() {
  let result = User.upsert({ name: 'user', firstName: 'John' }, { lastName: 'Smith' })
    .one()
    .where({ name: 'user' })
    .return()
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test7() {
  let result = User.find()
    .one()
    .let('num', 1)
    .let('str', 'Hello')
    .let('bool', true)
    .let('arr', [ 1, 'two', true ])
    .let('obj', { foo: 'bar' })
    .return(Model.return().append('num', 'num1').append('bool').merge('arr').id().computed())
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test8() {
  let result = User.import([ { firstName: 'Jane', lastName: 'Doe' }, { firstName: 'Fred', lastName: 'Flintstone' } ])
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

function test9() {
  let result = Like.link('a', 'b', { more: 'data' })
  let str = JSON.stringify(result)
  console.log(str.green)
  fs.writeFileSync('query.json', str, 'utf-8')
}

test1()
// test2()
// test3()
// test4()
// test5()
// test6()
// test7()
// test8() // TODO: implement parser
// test9()
