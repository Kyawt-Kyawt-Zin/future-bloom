// form-validation
const errorElement = document.getElementById("error");
errorElement.style.display = "none";

const inputFormElement = document.getElementById("signUpForm");
const usernameElement = document.getElementById("username");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");

togglePasswordBtn.addEventListener("click", function () {
  const eyeIcon = document.getElementById("eye-icon");
  const passwordType = passwordElement.getAttribute("type");

  if (passwordType === "password") {
    passwordElement.setAttribute("type", "text");
  } else {
    passwordElement.setAttribute("type", "password");
  }

  eyeIcon.classList.toggle("bi-eye");
});

inputFormElement.addEventListener("submit", function (event) {
  event.preventDefault();

  errorElement.innerHTML = "";
  errorElement.style.display = "none";

  const errorMessages = [];
  const username = usernameElement.value.trim();
  const email = emailElement.value.trim();
  const password = passwordElement.value.trim();
  const role = document.getElementById("role").value;

  if (username === "") {
    errorMessages.push("Username is required");
  }

  if (email === "") {
    errorMessages.push("Email is required");
  }

  if (password === "") {
    errorMessages.push("Password is required");
  }

  if (password && password.length < 6) {
    errorMessages.push("Password should be at least 6 characters!");
  }

  if (password.length > 20) {
    errorMessages.push("Password should be no more than 20 characters!");
  }

  if (role === "") {
    errorMessages.push("Role is required");
  }

  if (errorMessages.length > 0) {
    errorElement.classList.remove("alert-success");
    errorElement.classList.add("alert-danger");
    errorElement.innerHTML = errorMessages.join("<br/>");
    errorElement.style.display = "block";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const existingUser = users.find(function (user) {
    return user.email === email;
  });

  if (existingUser) {
    errorElement.classList.remove("alert-success");
    errorElement.classList.add("alert-danger");
    errorElement.innerHTML = "Email already registered";
    errorElement.style.display = "block";
    return;
  }

  const user = {
    id: Date.now(),
    username,
    email,
    password,
    role,
    gender: null,
    studentId: null,
  };

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  errorElement.classList.remove("alert-danger");
  errorElement.classList.add("alert-success");
  errorElement.innerHTML = "Signup successful! Redirecting to login page...";
  errorElement.style.display = "block";

  inputFormElement.reset();

  setTimeout(function () {
    window.location.href = "../login.html";
  }, 3000);
});

function handleRoleChange() {}
