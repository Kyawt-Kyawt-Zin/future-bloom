console.log("parent.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const parentWelcome = document.getElementById("parentWelcome");

  if (!currentUser || !parentWelcome) return;

  parentWelcome.textContent = `Welcome, ${currentUser.username}!`;
});
