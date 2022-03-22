import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.CF_TOKEN,
    authDomain: "fredrik-studio.firebaseapp.com",
    projectId: "fredrik-studio",
    storageBucket: "fredrik-studio.appspot.com",
    messagingSenderId: "494755942998",
    appId: "1:494755942998:web:f9847fc68561dfcfd0e1f7",
    databaseURL: 'https://fredrik-studio.europe-west1.firebasedatabase.app',
}

var firebaseApp;

const apps = getApps()
if (!apps.length) {
    firebaseApp = initializeApp(firebaseConfig)
} else {
    firebaseApp = apps[0]
}
const db = getFirestore(firebaseApp, {})
export { db }