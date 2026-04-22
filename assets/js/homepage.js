console.log("homepage.js connected");

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();
});
