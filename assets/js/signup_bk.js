// form-validation
const errorElement = document.getElementById("error");
errorElement.style.display = "none";

const inputFormElement = document.getElementById("signUpForm");
const usernameElement = document.getElementById("username");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");

inputFormElement.addEventListener("submit", (event) => {
  let errorMessages = [];

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

  if (passwordElement.value.lenght > 20) {
    errorMessages.push("Password should be no more than 20 characters!");
  }

  if (errorMessages.length > 0) {
    console.log(errorMessages, typeof errorMessages);
    let errors = errorMessages.join("<br/>");
    console.log(errors, typeof errors);
    errorElement.innerHTML = errors;
    errorElement.style.display = "block";
    event.preventDefault();
  }

  const togglePasswordBtn = document.getElementById("togglePassword");

  togglePasswordBtn.addEventListener("click", () => {
    const eyeIcon = document.getElementById("eye-icon");
    console.log("click toggle password");
    console.log(passwordElement.attributes);
    let passwordType = passwordElement.getAttribute("type");

    if (passwordType === "password") {
      passwordElement.setAttribute("type", "text");
    } else {
      passwordElement.setAttribute("type", "password");
    }
    eyeIcon.classList.toggle("bi-eye");
  });

  if (role === "") {
    alert("Please select a role");
    return;
  }
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

if (role === "parent") {
  window.location.href = "parent.html";
} else if (role === "teacher") {
  window.location.href = "teacher.html";
} else if (role === "student") {
  if (theme.geder === "boy") {
    window.location.href = "boy.html";
  } else theme.geder === "girl";
  {
    window.location.href = "girl.html";
  }
}

// creating user array
const user = {
  id: Date.now(),
  username,
  email,
  password,
  role,
  gender: role === "student" ? gender : null,
};

const users = JSON.parse(localStorage.getItem("users")) || [];
users.push(user);

localStorage.setItem("users", JSON.stringify(users));

localStorage.setItem(
  "userTheme",
  JSON.stringify({
    role: role,
    gender: role === "student" ? gender : null,
  }),
);
