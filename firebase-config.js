// Firebase Cloud Database Configuration & Initialization
// Terhubung ke Database Firebase: jastipkampus-6e345

const firebaseConfig = {
  apiKey: "AIzaSyDemoConfigKeyForJastipKampusApp",
  authDomain: "jastipkampus-6e345.firebaseapp.com",
  databaseURL: "https://jastipkampus-6e345-default-rtdb.firebaseio.com",
  projectId: "jastipkampus-6e345",
  storageBucket: "jastipkampus-6e345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase if SDK is loaded
let db = null;
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("🔥 Terhubung ke Firebase Cloud Database: https://jastipkampus-6e345-default-rtdb.firebaseio.com");
  } catch (e) {
    console.warn("⚠️ Running in hybrid mode with local fallback.", e);
  }
}
