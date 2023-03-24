// Import the functions you need from the SDKs you need
const fetch = require('node-fetch');
const firebase = require('firebase/app');
require('firebase/storage');

// Firebase JS SDK v7.20.0
const firebaseConfig = {
  apiKey: "AIzaSyDkEUPbqQvDFGZgazor_jVc5uuGxbTN0W0",
  authDomain: "pitchdeck-d4b53.firebaseapp.com",
  projectId: "pitchdeck-d4b53",
  storageBucket: "pitchdeck-d4b53.appspot.com",
  messagingSenderId: "654967206298",
  appId: "1:654967206298:web:a073db2f61865add74ca23",
  measurementId: "G-0SLDQBK6PQ"
};

const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const bucket = storage.ref();

//const message4 = 'data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
//uploadString(storageRef, message4, 'data_url').then((snapshot) => {
//  console.log('Uploaded a data_url string!');
//});

module.exports = { firebaseConfig, app, storage, bucket };