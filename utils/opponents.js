import _has from 'lodash/has'
import _keys from 'lodash/keys'

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

  // batch names
  if (names) {
    const keys = _keys(names)
    const obj = {}

    keys.forEach((name) => {
      obj[name] = {
        draft: {
          display: true,
          items: names[name].items
        }
      }
    })

    return obj
  }
  
  return current
}
