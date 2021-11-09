var firebaseConfig = {
  apiKey: "AIzaSyCzWFqqY0iqx1eXd9uXLD2ELsoE-OiLvuw",
  authDomain: "feedback-2d8bd.firebaseapp.com",
  databaseURL: "https://feedback-2d8bd-default-rtdb.firebaseio.com",
  projectId: "feedback-2d8bd",
  storageBucket: "feedback-2d8bd.appspot.com",
  messagingSenderId: "85959730833",
  appId: "1:85959730833:web:56618073e1f6898c55c130"
};

firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();
var db = firebase.database();

// Registers the user through Firebase method "createUserWithEmailAndPassword()".
function register() {
  var email = document.getElementById("emailInput");
  var password = document.getElementById("passwordInput");
  var userID;

  //After creating the user, create a document with the user using the UID as the identifier and enter the email + pwd values as key-values
  const promise = auth.createUserWithEmailAndPassword(email.value, password.value).then(cred => {
    return firebase.firestore().collection("users").doc(cred.user.uid).set({
      username: email.value,
      password: password.value,
      imgLinks: []
    });
  });

  promise.catch(e => alert(e.message));

  // Timeout used to give the Firebase time to authenticate.
  setTimeout(() => {
    // Trys to log the newly registered user in.
    auth.signInWithEmailAndPassword(email.value, password.value);

    firebase.auth().onAuthStateChanged(function (user) {
      userID = user.uid;

      // If successful, navigates to login
      if (user) {
        alert("Proceed to login.");
        auth.signOut(); // Signs the user out to insure credential integrity. 
        toLogin();
      } else {
        alert("Registration unsuccessful.");
      }

      toLogin();
      auth.signOut();
    });
  }, 2000);
}

// logs the user in through Firebase method "signInWithEmailAndPassword()".
function login() {

  var email = document.getElementById('emailInput');
  var password = document.getElementById('passwordInput');

  const promise = auth.signInWithEmailAndPassword(email.value, password.value);
  promise.catch(e => alert(e.message));

  setTimeout(() => { // Timeout used to give time to the Firebase to authenticate
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) { // If login was successful, navigate to index.
        toIndex();
      } else {
        alert("Login unsuccessful.")
      }
    });
  }, 2000);

}

// Logout method to terminate user authorization.
function logout() {
  auth.signOut();
  alert("Logging out...");
}

// Constantly checks if and what user is currently signed in.
auth.onAuthStateChanged(function (user) {
  if (user) {
    var email = user.email;
    // alert("Active User " + email);
  } else {
    alert("No active user");
  }
});