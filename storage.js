"use strict";

/* Save payload foundation. Persistence is enabled in a later phase. */
const SAVE_VERSION=1;

function createSavePayload(state){
  if(!state)return null;
  return {
    version:SAVE_VERSION,
    savedAt:new Date().toISOString(),
    state:{
      ...state,
      flags:Array.from(state.flags||[]),
      seen:Array.from(state.seen||[]),
      hist:Array.from(state.hist||[]),
      warnCd:{...(state.warnCd||{})}
    }
  };
}

function restoreSavePayload(payload){
  if(!payload||payload.version!==SAVE_VERSION||!payload.state)return null;
  const state=payload.state;
  return {
    ...state,
    flags:new Set(state.flags||[]),
    seen:new Set(state.seen||[]),
    hist:Array.from(state.hist||[]),
    warnCd:{...(state.warnCd||{})}
  };
}

