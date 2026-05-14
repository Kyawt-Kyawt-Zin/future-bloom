console.log("Student js connected");

window.onload = function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (!currentUser || !welcomeMessage) return;

  welcomeMessage.innerHTML = `
    <h3 class="fw-bold">
      Welcome ${currentUser.username}! 🌱
    </h3>

    <p class="mt-3">
      Please note that your Student ID is:
      <strong>${currentUser.studentId}</strong>
    </p>

    <p>
      Use this ID to connect efficiently
      with your parents and teachers.
    </p>

    <p class="fw-bold text-success">
      Wishing you a SUCCESS JOURNEY! ✨
    </p>
  `;
};
