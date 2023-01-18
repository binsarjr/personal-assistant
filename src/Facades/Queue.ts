import pLimit from 'p-limit'

const Queue = pLimit(5)

export default Queue
