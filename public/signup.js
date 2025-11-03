document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener to the signup button
    const signupBtn = document.querySelector("button[type='submit']");
    signupBtn.addEventListener("click", (event) => {
      event.preventDefault();
      registerUser();
    });
  
    // Attach event listener for Google sign-in
    const googleBtn = document.querySelector(".google-signin-button button");
    googleBtn.addEventListener("click", (event) => {
      event.preventDefault();
      googleSignIn();
    });
  });
  
  function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
  
    fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert("Sign-up successful! Please login.");
          window.location.href = "login.html";
        }
      })
      .catch(error => console.error("Error:", error));
  }
  
  function googleSignIn() {
    // Redirect to the Google OAuth endpoint
    window.location.href = "http://localhost:5000/auth/google";
  }
  