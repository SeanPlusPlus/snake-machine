import { log } from '../utils/logger'

export default (state, action) => {
  log('previous', 'rgb(229, 231, 235)', state);
  log('action', 'rgb(251, 189, 35)', action);
  switch (action.type) {
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'UPDATE_DRAFTS':
      return {
        ...state,
        drafts: action.payload,
      }
    default:
      return state;
  }
}