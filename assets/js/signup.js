// form-validation
const errorElement = document.getElementById("error");
errorElement.style.display = "none";

const inputFormElement = document.getElementById("signUpForm");
const usernameElement = document.getElementById("username");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const confirmPasswordElement = document.getElementById("confirmPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const toggleConfirmPasswordBtn = document.getElementById(
  "toggleConfirmPassword",
);

togglePasswordBtn.addEventListener("click", function () {
  togglePasswordVisibility(passwordElement, document.getElementById("eye-icon"));
});

toggleConfirmPasswordBtn.addEventListener("click", function () {
  togglePasswordVisibility(
    confirmPasswordElement,
    document.getElementById("confirm-eye-icon"),
  );
});

inputFormElement.addEventListener("submit", function (event) {
  event.preventDefault();

  errorElement.innerHTML = "";
  errorElement.style.display = "none";

  const errorMessages = [];
  const username = usernameElement.value.trim();
  const email = emailElement.value.trim();
  const password = passwordElement.value.trim();
  const confirmPassword = confirmPasswordElement.value.trim();

  if (username === "") {
    errorMessages.push("Username is required");
  }

  if (email === "") {
    errorMessages.push("Email is required");
  }

  if (password === "") {
    errorMessages.push("Password is required");
  }

  if (confirmPassword === "") {
    errorMessages.push("Confirm password is required");
  }

  if (password && password.length < 6) {
    errorMessages.push("Password should be at least 6 characters!");
  }

  if (password.length > 20) {
    errorMessages.push("Password should be no more than 20 characters!");
  }

  if (password !== confirmPassword) {
    errorMessages.push("Password and confirm password must match");
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
    role: "teacher",
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

function togglePasswordVisibility(inputElement, iconElement) {
  const passwordType = inputElement.getAttribute("type");

  if (passwordType === "password") {
    inputElement.setAttribute("type", "text");
    iconElement.classList.remove("bi-eye-slash");
    iconElement.classList.add("bi-eye");
  } else {
    inputElement.setAttribute("type", "password");
    iconElement.classList.remove("bi-eye");
    iconElement.classList.add("bi-eye-slash");
  }
}
