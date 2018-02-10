
// Status priority
const priority = status => {
  switch (status) {
    case null:
      return -1;
    case 'fail':
      return 3;
    case 'pass':
      return 1;
    case 'ignore':
      return 0;
    case 'wip':
    default:
      return 2;
  }
};
const statusPriority = (a, b) => priority(a) > priority(b) ? a : b;

const getName = pair => {
  const { name = '' } = pair[1].meta;
  return '' + name;
};

const getOrder = pair => {
  const { order = Infinity } = pair[1].meta;
  return order;
};

const getEpoch = pair => {
  const { inst = 0 } = pair[1].meta;
  return new Date(inst).getTime() / 1000 // Unix
};

const isSortable = diff => diff !== 0 && !isNaN(diff);

module.exports = {
  isSortable,
  getEpoch,
  getOrder,
  getName,
  statusPriority,
  priority
}
