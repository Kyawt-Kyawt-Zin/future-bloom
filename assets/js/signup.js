// form-validation
const errorElement = document.getElementById("error");
errorElement.style.display = "none";

const inputFormElement = document.getElementById("signUpForm");
const usernameElement = document.getElementById("username");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const role = document.getElementById("role").value;

const togglePasswordBtn = document.getElementById("togglePassword");

togglePasswordBtn.addEventListener("click", () => {
  const eyeIcon = document.getElementById("eye-icon");

  let passwordType = passwordElement.getAttribute("type");

  if (passwordType === "password") {
    passwordElement.setAttribute("type", "text");
  } else {
    passwordElement.setAttribute("type", "password");
  }

  eyeIcon.classList.toggle("bi-eye");
});

// submit event
inputFormElement.addEventListener("submit", (event) => {
  event.preventDefault();

  //  clear previous errors
  errorElement.innerHTML = "";
  errorElement.style.display = "none";

  let errorMessages = [];
  const username = usernameElement.value.trim();

  const email = emailElement.value.trim();

  const password = passwordElement.value.trim();

  const role = document.getElementById("role").value;

  const gender = document.getElementById("gender").value;

  if (usernameElement.value === "") {
    errorMessages.push("Username is required");
  }

  if (emailElement.value === "") {
    errorMessages.push("Email is required");
  }

  if (passwordElement.value === "") {
    errorMessages.push("Password is required");
  }

  if (passwordElement.value && passwordElement.value.length < 6) {
    errorMessages.push("Password should be at least 6 characters!");
  }

  if (passwordElement.value.length > 20) {
    errorMessages.push("Password should be no more than 20 characters!");
  }

  if (role === "") {
    errorMessages.push("Role is required");
  }

  if (errorMessages.length > 0) {
    console.log(errorMessages, typeof errorMessages);
    let errors = errorMessages.join("<br/>");
    console.log(errors, typeof errors);
    errorElement.innerHTML = errors;
    errorElement.style.display = "block";
    return;
  }

  // get users array
  const users = JSON.parse(localStorage.getItem("users")) || [];
  // for checking duplicate email registration
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    errorElement.innerHTML = "Email already registered";

    errorElement.style.display = "block";

    return;
  }

  // create user
  const user = {
    id: Date.now(),
    username,
    email,
    password,
    role,
    gender: role === "student" ? gender : null,
    studentId:
      role === "student" ? "STU" + Math.floor(Math.random() * 100000) : null,
  };

  // add new user
  users.push(user);

  // save
  localStorage.setItem("users", JSON.stringify(users));

  // success message
  errorElement.classList.remove("alert-danger");

  errorElement.classList.add("alert-success");

  errorElement.innerHTML = "Signup successful! Redirecting to login page...";

  errorElement.style.display = "block";

  // reset all
  inputFormElement.reset();
  genderBox.classList.add("d-none");

  // redirect after 3 seconds
  setTimeout(() => {
    window.location.href = "../login.html";
  }, 3000);
});

const gender = document.getElementById("gender").value;
const genderBox = document.getElementById("genderBox");

function handleRoleChange() {
  const role = document.getElementById("role").value;
  console.log("Current User Role:", role);

  if (role === "student") {
    genderBox.classList.remove("d-none");
  } else {
    genderBox.classList.add("d-none");
  }
}
