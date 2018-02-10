const R = require('ramda')
const uuid = require('uuid/v4')

function chunk(id, entry, ancestors = []) {

  const newIds = R.compose(
    R.fromPairs,
    R.map(oldId => [oldId, uuid()]),
    R.keys,
    R.prop('tree')
  )(entry)

  const chunkedTree = R.compose(
    R.chain(([childKey, childEntry]) =>
      chunk(newIds[childKey], childEntry, [...ancestors, id])
    ),
    R.toPairs,
    R.prop('tree')
  )(entry)

  const chunkedEntry = R.compose(
    R.assoc('id', id),
    R.assoc('ancestors', [...ancestors]),
    R.assoc('tree', R.values(newIds))
  )(entry)

  return [chunkedEntry, ...chunkedTree]
}

module.exports = chunk
