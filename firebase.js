import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAPcHOzT6HcfSf0FYajyr5q2Sc6EcOgzr8",
    authDomain: "todo-list-515d1.firebaseapp.com",
    projectId: "todo-list-515d1",
    storageBucket: "todo-list-515d1.firebasestorage.app",
    messagingSenderId: "661812012102",
    appId: "1:661812012102:web:48a7c7c9f89b3624981647"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };