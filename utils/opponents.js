import _has from 'lodash/has'

export const getOpponents = (current, payload) => {
  const { name, names } = payload

  // update single
  if (name) {
    const exists = current[name]
    const { picks } = payload || {}
    const opponent = picks[name]

    if (!exists) {
      return {
        ...current,
        [name]: {
          draft: {
            display: true,
            items: opponent.items,
          }
        }
      }
    }

    const obj = current[name]

    if (_has(payload, 'display')) {
      const { display } = payload
      return {
        ...current,
        [name]: {
          draft: {
            ...obj.draft,
            display,
          }
        }
      }
    }
    return current
  }

  console.log('* names', names);
  return current
}
