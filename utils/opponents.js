import _has from 'lodash/has'
import _keys from 'lodash/keys'

export const getOpponents = (current, payload) => {
  const { name, names, picks } = payload

  // update single
  if (name) {
    const exists = current[name]
    const { picks } = payload || {}
    const opponent = picks[name] || { items: [] }

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

  // update on inital data fetch
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

  // update on picks http poll
  if (picks) {
    const keys = _keys(picks)
    const obj = {}

    console.log(current);
    console.log(current[name]);

    keys.forEach((name) => {
      const draft_display = current[name] && current[name].draft.display
      const display = draft_display === undefined ? true : draft_display
      obj[name] = {
        draft: {
          display,
          items: picks[name].items
        }
      }
    })

    return obj
  }
  
  return current
}
