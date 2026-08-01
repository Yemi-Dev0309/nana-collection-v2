// Import the functions you need from the SDKs you need
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getDatabase } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

   import { getAuth } from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgYShENAQ6y-93_omWGbNnAiEMgbkLfvk",
  authDomain: "nana-collection-171c4.firebaseapp.com",
  databaseURL: "https://nana-collection-171c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nana-collection-171c4",
  storageBucket: "nana-collection-171c4.firebasestorage.app",
  messagingSenderId: "614510997618",
  appId: "1:614510997618:web:e75606ea9f114eee5f52eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = getAuth(app);

export { database, auth };