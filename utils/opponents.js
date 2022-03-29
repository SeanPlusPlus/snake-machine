import _has from 'lodash/has'

export const getOpponents = (current, payload) => {
  const { name } = payload
  const exists = current[name]

  if (!exists) {
    return {
      ...current,
      [name]: {
        draft: {
          display: false,
          items: [],
        }
      }
    }
  }

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
