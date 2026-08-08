"use strict";

const SAVE_VERSION=2;
const SAVE_KEYS={active:"sicil.active.v2",archive:"sicil.archive.v1",recovery:"sicil.recovery"};

function storageRead(key){
  try{return window.localStorage.getItem(key)}catch(_){return null}
}
function storageWrite(key,value){
  try{window.localStorage.setItem(key,value);return true}catch(_){return false}
}
function storageRemove(key){
  try{window.localStorage.removeItem(key);return true}catch(_){return false}
}
function serializableState(state){
  return {
    ...state,
    flags:Array.from(state.flags||[]),
    seen:Array.from(state.seen||[]),
    hist:Array.from(state.hist||[]),
    warnCd:{...(state.warnCd||{})},
    transitionAttempts:{...(state.transitionAttempts||{})},
    transitionQuestionHistory:{...(state.transitionQuestionHistory||{})},
    journal:Array.from(state.journal||[])
  };
}
function createSavePayload(state,reason){
  if(!state)return null;
  return {version:SAVE_VERSION,savedAt:new Date().toISOString(),reason:reason||"checkpoint",state:serializableState(state)};
}
function restoreSavePayload(payload){
  if(!payload||![1,SAVE_VERSION].includes(payload.version)||!payload.state)return null;
  const state=payload.state;
  if(!state.f||!state.career||!state.st||typeof state.r!=="number")return null;
  return {
    ...state,
    flags:new Set(state.flags||[]),
    seen:new Set(state.seen||[]),
    hist:Array.from(state.hist||[]),
    warnCd:{...(state.warnCd||{})},
    transitionAttempts:{...(state.transitionAttempts||{})},
    transitionQuestionHistory:{...(state.transitionQuestionHistory||{})},
    journal:Array.from(state.journal||[]),
    track:state.track||"command",
    grace:Number(state.grace)||0,
    cards:Number(state.cards)||0,
    months:Number(state.months)||0,
    age:Number(state.age)||18,
    ended:!!state.ended
  };
}
function saveActiveState(state,reason){
  const payload=createSavePayload(state,reason);
  return payload&&storageWrite(SAVE_KEYS.active,JSON.stringify(payload));
}
function loadActivePayload(){
  const raw=storageRead(SAVE_KEYS.active);
  if(!raw)return null;
  try{
    const payload=JSON.parse(raw);
    if(!restoreSavePayload(payload))throw new Error("invalid save");
    return payload;
  }catch(_){
    storageWrite(SAVE_KEYS.recovery,JSON.stringify({recoveredAt:new Date().toISOString(),raw}));
    storageRemove(SAVE_KEYS.active);
    return null;
  }
}
function loadActiveState(){
  const payload=loadActivePayload();
  return payload?restoreSavePayload(payload):null;
}
function clearActiveSave(){return storageRemove(SAVE_KEYS.active)}
function archiveCareer(state,ending){
  let archive=[];
  try{archive=JSON.parse(storageRead(SAVE_KEYS.archive)||"[]");if(!Array.isArray(archive))archive=[]}catch(_){archive=[]}
  archive.unshift({...createSavePayload(state,"career-ended"),ending:ending||null});
  storageWrite(SAVE_KEYS.archive,JSON.stringify(archive.slice(0,20)));
  clearActiveSave();
}
function getActiveSaveSummary(){
  const payload=loadActivePayload();
  if(!payload)return null;
  const state=payload.state;
  return {savedAt:payload.savedAt,f:state.f,career:state.career,track:state.track||"command",r:state.r,age:state.age||18,cards:state.cards||0,specialty:state.specialty||null};
}
