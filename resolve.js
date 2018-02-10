const R = require('ramda')
const entryUtils = require('./entryUtils')

const resolveWithoutUpdates = object => {
  const tree = R.compose(
    // Sort tree
    R.sort((a, b) => {
      const order = entryUtils.getOrder(a) - entryUtils.getOrder(b)
      if (entryUtils.isSortable(order)) {
        return order
      }
      const epoch = entryUtils.getEpoch(a) - entryUtils.getEpoch(b)
      if (entryUtils.isSortable(epoch)) {
        return epoch
      }
      return entryUtils.getName(a).localeCompare(entryUtils.getName(b))
    }),
    // Extract & resolve tree
    R.map(pair => [pair[0], resolveWithoutUpdates(pair[1])]),
    R.toPairs,
    R.defaultTo({}),
    R.prop('tree')
  )(object)
  return R.compose(
    // Remove updates
    entry =>
      R.assoc(
        'tree',
        R.compose(
          R.filter(
            item => R.path(['meta', 'type'], item) !== 'update'
          ),
          R.fromPairs)
        (tree),
      entry
    ),
    // Compute activity
    entry =>
      R.assocPath(
        ['meta', 'activity'],
        R.any(pair => {
          const { type, activity } = pair[1].meta
          if (type !== 'update') {
            return activity || type === 'post'
          }
          return R.any(update => {
            // Status update
            if (update[0] === 'meta' && update[1] === 'status') {
              return true
            }
            // Form entry
            if (update[0] === 'data' && update[update.length - 2] === 'value') {
              return true
            }
            return false
          }, pair[1].data)
        }, tree),
        entry
      ),
    // Resolve status
    entry => {
      if (!entry.meta || entry.meta.type !== 'step' || !entry.meta.dependant) {
        return entry
      }
      const status = R.compose(
        R.reduce(entryUtils.statusPriority, null),
        R.map(pair => pair[1].meta.status),
        R.filter(pair => pair[1].meta.type === 'step'),
        R.reject(pair => pair[1].meta.deleted)
      )(tree)
      return R.assocPath(['meta', 'status'], status, entry)
    },
    // Handle non-existant entries
    R.defaultTo({
      meta: {},
      data: {}
    }),
    // Combine updates
    R.reduce((partial, update) => {
      const path = R.init(update)
      const value = R.last(update)
      return R.assocPath(path, value, partial)
    }, object),
    // Normalize updates
    R.chain(pair => pair[1].data),
    R.filter(pair => pair[1].meta.type === 'update')
  )(tree)
}

module.exports = resolveWithoutUpdates
