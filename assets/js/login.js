console.log("login js connected");

function login(event) {
  event.preventDefault();

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
    alert("Invalid username/email or password");
    return;
  }

  // save current logged in user
  localStorage.setItem("currentUser", JSON.stringify(matchedUser));

  alert("Login successful");

  // role redirect
  if (matchedUser.role === "parent") {
    window.location.href = "../parent-page/index.html";
  } else if (matchedUser.role === "teacher") {
    window.location.href = "../teacher-page/index.html";
  } else if (matchedUser.role === "student") {
    // boy student
    if (matchedUser.gender === "boy") {
      window.location.href = "../student-page/boy.html";
    }

    // girl student
    else {
      window.location.href = "../student-page/girl.html";
    }
  }
}
