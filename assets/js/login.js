console.log("login js connected");

function login(event) {
  event.preventDefault();

  const loginMessage = document.getElementById("loginMessage");

  // get input values
  const loginInput = document.getElementById("loginInput").value.trim();

  const password = document.getElementById("loginPassword").value.trim();

  // get users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // find matching user
  const matchedUser = users.find((user) => {
    return (
      (user.username === loginInput || user.email === loginInput) &&
      user.password === password
    );
  });

  // validation
  if (!matchedUser) {
    loginMessage.innerHTML = `
      <div class="alert alert-danger rounded-3">
        Invalid username/email or password.
      </div>
    `;
    return;
  }

  // save current logged in user
  localStorage.setItem("currentUser", JSON.stringify(matchedUser));

  loginMessage.innerHTML = `
    <div class="alert alert-success rounded-3">
      Login successful. Redirecting...
    </div>
  `;

  setTimeout(function () {
    window.location.href = getRedirectPath(matchedUser);
  }, 2000);
}

function getRedirectPath(user) {
  if (user.role === "parent") {
    return "parent-page/index.html";
  }

  if (user.role === "teacher") {
    return "teacher-page/index.html";
  }

  if (user.role === "student" && user.gender === "boy") {
    return "student-page/boy.html";
  }

  if (user.role === "student") {
    return "student-page/girl.html";
  }

  return "index.html";
}
