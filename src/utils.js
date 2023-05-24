import { LOCAL_STORAGE_FLOCK_KEY } from "./constants";

export function isNil(obj) {
    return obj === null || obj === undefined;
}

export function selectRecordingsForBird(recordings, birdId) {
    const recs = recordings.filter((rec) => rec.birdId === birdId);
    return recs;
}

export function getMyFlock() {
    return getLocalStorage(LOCAL_STORAGE_FLOCK_KEY)
}

export function getLocalStorage(key){
    const likesString = localStorage.getItem(key) || "[]"
    const likesArray = JSON.parse(likesString)
    return likesArray
}

export function initLocalStorage(){
    const likesArray = getLocalStorage(LOCAL_STORAGE_FLOCK_KEY)
    if (likesArray === null){
      localStorage.setItem('likedFromStorage', JSON.stringify([]))
    }
}
