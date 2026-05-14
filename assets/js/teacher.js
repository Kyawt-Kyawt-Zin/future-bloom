console.log("teacher.js connected");
document.getElementById("welcomeMessage").innerHTML =
  "Welcome, " + localStorage.getItem("currentUser") + "!";
