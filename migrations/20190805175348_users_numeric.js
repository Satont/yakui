
exports.up = function (knex) {
  return Promise.all([
    knex.raw('alter TABLE users ALTER COLUMN watched TYPE numeric'),
    knex.raw('alter TABLE users ALTER COLUMN tips TYPE numeric')
  ])
}

exports.down = function (knex) {

}
