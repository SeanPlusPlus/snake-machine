import React, {
  createContext,
  useReducer,
  useEffect,
} from 'react';
import AppReducer from '../reducers/AppReducer';
import { log } from '../utils/logger'

const initialState = {
  user: { authenticated: null },
  drafts: null,
  league: null,
  leagues: null,
  selection: null,
  opponents: {},
}

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({
  children
}) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions for changing state

  function setUser(data) {
    dispatch({
      type: 'UPDATE_USER',
      payload: data 
    });
  }

  function setDrafts(data) {
    dispatch({
      type: 'UPDATE_DRAFTS',
      payload: data 
    });
  }

  function setLeague(data) {
    dispatch({
      type: 'UPDATE_LEAGUE',
      payload: data 
    });
  }

  function setLeagues(data) {
    dispatch({
      type: 'UPDATE_LEAGUES',
      payload: data 
    });
  }

  function setSelection(data) {
    dispatch({
      type: 'UPDATE_SELECTION',
      payload: data 
    });
  }
  
  function setOpponents(data) {
    dispatch({
      type: 'UPDATE_OPPONENTS',
      payload: data 
    });
  }

  useEffect(() => {
    log('state', 'rgb(217, 38, 169)', state);
  }, [state])

  return ( <GlobalContext.Provider value = {
      {
        user: state.user,
        setUser,
        drafts: state.drafts,
        setDrafts,
        league: state.league,
        setLeague,
        leagues: state.leagues,
        setLeagues,
        selection: state.selection,
        setSelection,
        opponents: state.opponents,
        setOpponents,
      }
    } > {
      children
    } </GlobalContext.Provider>
  )
}