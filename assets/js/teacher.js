console.log("teacher.js connected");
let selectedStudentId = null;
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");
  const searchStudentId = document.getElementById("searchStudentId");
  const searchStudentBtn = document.getElementById("searchStudentBtn");
  const studentResult = document.getElementById("studentResult");
  const scheduleSection = document.getElementById("scheduleSection");
  const scheduleForm = document.getElementById("scheduleForm");
  const scheduleSubject = document.getElementById("scheduleSubject");
  const scheduleDay = document.getElementById("scheduleDay");
  const scheduleTime = document.getElementById("scheduleTime");
  const scheduleDuration = document.getElementById("scheduleDuration");
  const scheduleMessage = document.getElementById("scheduleMessage");

  if (currentUser && welcomeMessage) {
    welcomeMessage.classList.remove("d-none");
    welcomeMessage.innerHTML = `
      <h3 class="fw-bold mb-0">
        Welcome Teacher ${currentUser.username}!
      </h3>
    `;
  }

  if (!searchStudentId || !searchStudentBtn || !studentResult) return;

  searchStudentBtn.addEventListener("click", searchStudent);

  searchStudentId.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchStudent();
    }
  });

  function searchStudent() {
    const enteredStudentId = searchStudentId.value.trim();

    if (enteredStudentId === "") {
      studentResult.innerHTML = `
        <div class="alert alert-warning rounded-3 mb-0">
          Please enter a Student ID.
        </div>
      `;
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const student = users.find(function (user) {
      return (
        user.role === "student" &&
        user.studentId &&
        user.studentId.toLowerCase() === enteredStudentId.toLowerCase()
      );
    });

    if (!student) {
      studentResult.innerHTML = `
    <div class="alert alert-danger rounded-3 mb-0">
      No student found with ID: <strong>${enteredStudentId}</strong>
    </div>
  `;
      return;
    }

    selectedStudentId = student.studentId;
    scheduleSection.classList.remove("d-none");

    studentResult.innerHTML = `
      <div class="card border-success rounded-4 shadow-sm">
        <div class="card-body">
          <h4 class="card-title text-success mb-3">
            Student Found
          </h4>

          <p class="mb-2">
            <strong>Name:</strong> ${student.username}
          </p>

          <p class="mb-2">
            <strong>Student ID:</strong> ${student.studentId}
          </p>

          <p class="mb-2">
            <strong>Email:</strong> ${student.email}
          </p>

          <p class="mb-0">
            <strong>Gender:</strong> ${student.gender || "Not selected"}
          </p>
        </div>
      </div>
    `;
  }
});

// schedule form updating
scheduleForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const subject = scheduleSubject.value.trim();
  const day = scheduleDay.value;
  const time = scheduleTime.value;
  const duration = scheduleDuration.value.trim();

  if (!selectedStudentId) {
    scheduleMessage.innerHTML = `
      <div class="alert alert-warning rounded-3">
        Please search for a student first.
      </div>
    `;
    return;
  }

  if (subject === "" || day === "" || time === "" || duration === "") {
    scheduleMessage.innerHTML = `
      <div class="alert alert-danger rounded-3">
        Please fill in all schedule fields.
      </div>
    `;
    return;
  }

  const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  const newSchedule = {
    id: Date.now(),
    studentId: selectedStudentId,
    subject: subject,
    day: day,
    time: time,
    duration: duration,
  };

  schedules.push(newSchedule);

  localStorage.setItem("schedules", JSON.stringify(schedules));

  scheduleMessage.innerHTML = `
    <div class="alert alert-success rounded-3">
      Schedule saved successfully.
    </div>
  `;

  scheduleForm.reset();
});
