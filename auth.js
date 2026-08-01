import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const forgetPasswordBtn = document.getElementById("forgetPasswordBtn");

if (signupBtn) {
    signupBtn.addEventListener("click", async function () {
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (!fullName || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            alert("Account created successfully.");

            window.location.href = "login.html";
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    });
}

if (loginBtn) {
    loginBtn.addEventListener("click", async function () {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {

            const userCredential =
                await signInWithEmailAndPassword(auth, email, password);

const loggedInUser = userCredential.user;

alert("Login successful!");

if (loggedInUser.uid === "jkWOqyrnBlYYuaujSFZaSN2YtWy2") {
    window.location.href = "admin.html";
} else {
    window.location.href = "index.html";
}
        } catch (error) {
            alert("Incorrect email or password.");
            console.error(error);
        }
    });
}

const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, function (user) {
    if (userInfo && logoutBtn) {
        if (user) {
            const customerName =
                user.displayName || user.email.split("@")[0];

            userInfo.textContent = "Hello, " + customerName;
            logoutBtn.style.display = "inline";
        } else {
            userInfo.innerHTML =
                '<a href="login.html">Login</a>';

            logoutBtn.style.display = "none";
        }
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        try {
            await signOut(auth);
            alert("You have logged out successfully.");
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("Logout failed. Please try again.");
        }
    });
}

if (forgetPasswordBtn) {
    forgetPasswordBtn.addEventListener("click", async function () {
        const email = document.getElementById("email").value.trim();

        if (!email) {
            alert("Please enter your email address first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("A password reset link has been sent to your email.");
        } catch (error) {
            console.error(error);
            alert("could not send password reset email. please check the email address and try again.");
        }
    });
}