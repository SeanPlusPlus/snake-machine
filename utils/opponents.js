import _has from 'lodash/has'

export const getOpponents = (current, payload) => {
  const { name } = payload
  const exists = current[name]
  const { picks } = payload || {}
  const opponent = picks[name]

  console.log('name', name);
  console.log('oppo', opponent);

  if (!exists) {
    return {
      ...current,
      [name]: {
        draft: {
          display: true,
          items: picks[name].items,
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
