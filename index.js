import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification, signInWithEmailAndPassword,
  signOut, updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3-FNqv9qGmIFkpJlASZjGBWuafQSiI60",
  authDomain: "greenmark-7fd1c.firebaseapp.com",
  projectId: "greenmark-7fd1c",
  storageBucket: "greenmark-7fd1c.appspot.com",
  messagingSenderId: "274788546899",
  appId: "1:274788546899:web:160a8a2af08978e94d49a6",
};
// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
// Signing users up
const signupForm = document.querySelector(".signup");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = signupForm.email.value;
  const password = signupForm.password.value;
  const username = signupForm.username.value; // Capture username from the form

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("User created:", cred.user);

      // Update user profile with the username as displayName
      updateProfile(cred.user, {
        displayName: username
      }).then(() => {
        console.log("Profile updated with displayName:", username);
      }).catch((error) => {
        console.error("Error updating user profile:", error);
      });

      // Store the username in Firestore
      setDoc(doc(db, "users", cred.user.uid), {
        username: username,
        email: email
      }).then(() => {
        console.log("Username added to Firestore");
      });

      // Send email verification
      sendEmailVerification(auth.currentUser)
        .then(() => {
          console.log("Email verification link sent.");
          alert("A verification email has been sent. Please check your inbox.");
        }).finally(() => {
          signOut(auth); // Log out the user after sending the verification email
          console.log("User logged out after registration to enforce email verification");
        });

      signupForm.reset(); // Reset form after all actions are initiated
    })
    .catch((err) => {
      console.error(err.message);
      alert(err.message); // Display error messages from signup process
    });
});

// logging in and out
const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("user signed out");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

const navLoginButton = document.querySelector(".navLogin");
const loginForm = document.querySelector(".login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      if (cred.user.emailVerified) {
        console.log("User logged in:", cred.user);
        loginForm.reset();
        window.location.href = "/profile.html"; // Redirect to profile page or dashboard
      } else {
        alert("Please verify your email before logging in.");
        signOut(auth); // Log them out
      }
    })
    .catch((err) => {
      console.error(err.message);
      alert(err.message); // Display any other authentication errors
    });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    localStorage.setItem("user", JSON.stringify(user));
    navLoginButton.style.display = "none";
    logoutButton.style.display = "block";
  } else {
    // User is logged out
    localStorage.removeItem("user");
    navLoginButton.style.display = "block";
    logoutButton.style.display = "none";
  }
});