console.log("access.js connected");

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const lastTeacherUser = JSON.parse(localStorage.getItem("lastTeacherUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("studentId");

  const studentInfo = document.getElementById("studentInfo");
  const scheduleForm = document.getElementById("scheduleForm");
  const assignmentForm = document.getElementById("assignmentForm");
  const reportForm = document.getElementById("reportForm");
  const scheduleMessage = document.getElementById("scheduleMessage");
  const assignmentMessage = document.getElementById("assignmentMessage");
  const reportMessage = document.getElementById("reportMessage");
  const scheduleList = document.getElementById("scheduleList");
  const assignmentList = document.getElementById("assignmentList");
  const reportList = document.getElementById("reportList");
  const reportMarks = document.getElementById("reportMarks");
  const reportGrade = document.getElementById("reportGrade");
  const backToTeacherBtn = document.getElementById("backToTeacherBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!currentUser && lastTeacherUser) {
    currentUser = lastTeacherUser;
    localStorage.setItem("currentUser", JSON.stringify(lastTeacherUser));
  }

  const student = users.find(function (user) {
    return user.role === "student" && user.studentId === studentId;
  });

  if (!currentUser || currentUser.role !== "teacher") {
    studentInfo.innerHTML = "Please login as a teacher first.";
    return;
  }

  localStorage.setItem("lastTeacherUser", JSON.stringify(currentUser));

  backToTeacherBtn.addEventListener("click", function () {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    window.location.href = "index.html";
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("lastTeacherUser");
    window.location.href = "../index.html";
  });

  if (!student) {
    studentInfo.innerHTML = "Student not found.";
    return;
  }

  studentInfo.innerHTML = `
    <h3 class="fw-bold mb-2">Accessing ${student.username}</h3>
    <p class="mb-0"><strong>Student ID:</strong> ${student.studentId}</p>
  `;

  renderRecords();

  reportMarks.addEventListener("input", function () {
    reportGrade.value = calculateGrade(reportMarks.value);
  });

  scheduleForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("scheduleSubject").value.trim();
    const day = document.getElementById("scheduleDay").value;
    const startTime = document.getElementById("scheduleStartTime").value;
    const endTime = document.getElementById("scheduleEndTime").value;

    if (subject === "" || day === "" || startTime === "" || endTime === "") {
      scheduleMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          Please fill in all schedule fields.
        </div>
      `;
      return;
    }

    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

    schedules.push({
      id: Date.now(),
      studentId: student.studentId,
      subject,
      day,
      startTime,
      endTime,
    });

    localStorage.setItem("schedules", JSON.stringify(schedules));

    scheduleMessage.innerHTML = `
      <div class="alert alert-success rounded-3">
        Schedule saved successfully.
      </div>
    `;

    scheduleForm.reset();
    renderRecords();
  });

  assignmentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("assignmentTitle").value.trim();
    const subject = document.getElementById("assignmentSubject").value.trim();
    const deadline = document.getElementById("assignmentDeadline").value;
    const status = document.getElementById("assignmentStatus").value;

    if (title === "" || subject === "" || deadline === "") {
      assignmentMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          Please fill in all assignment fields.
        </div>
      `;
      return;
    }

    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

    assignments.push({
      id: Date.now(),
      studentId: student.studentId,
      title,
      subject,
      deadline,
      status,
    });

    localStorage.setItem("assignments", JSON.stringify(assignments));

    assignmentMessage.innerHTML = `
      <div class="alert alert-success rounded-3">
        Assignment saved successfully.
      </div>
    `;

    assignmentForm.reset();
    renderRecords();
  });

  reportForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("reportSubject").value.trim();
    const month = document.getElementById("reportMonth").value;
    const marks = reportMarks.value;
    const grade = calculateGrade(marks);
    const comment = document.getElementById("reportComment").value.trim();

    if (
      subject === "" ||
      month === "" ||
      marks === "" ||
      grade === "" ||
      comment === ""
    ) {
      reportMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          Please fill in all report card fields.
        </div>
      `;
      return;
    }

    if (Number(marks) < 0 || Number(marks) > 100) {
      reportMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          Marks must be between 0 and 100.
        </div>
      `;
      return;
    }

    const reportCards = JSON.parse(localStorage.getItem("reportCards")) || [];

    reportCards.push({
      id: Date.now(),
      studentId: student.studentId,
      subject,
      month,
      marks,
      grade,
      comment,
      teacherId: currentUser.id,
    });

    localStorage.setItem("reportCards", JSON.stringify(reportCards));

    reportMessage.innerHTML = `
      <div class="alert alert-success rounded-3">
        Report card saved successfully.
      </div>
    `;

    reportForm.reset();
    reportGrade.value = "";
    renderRecords();
  });

  function calculateGrade(marks) {
    const score = Number(marks);

    if (marks === "" || score < 0 || score > 100) return "";
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  }

  assignmentList.addEventListener("click", function (event) {
    if (!event.target.classList.contains("change-status-btn")) return;

    const assignmentId = Number(event.target.dataset.assignmentId);
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

    const updatedAssignments = assignments.map(function (assignment) {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          status: assignment.status === "complete" ? "pending" : "complete",
        };
      }

      return assignment;
    });

    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    renderRecords();
  });

  function renderRecords() {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const reportCards = JSON.parse(localStorage.getItem("reportCards")) || [];

    const mySchedules = schedules.filter(function (schedule) {
      return schedule.studentId === student.studentId;
    });

    const myAssignments = assignments.filter(function (assignment) {
      return assignment.studentId === student.studentId;
    });

    const myReportCards = reportCards.filter(function (reportCard) {
      return reportCard.studentId === student.studentId;
    });

    scheduleList.innerHTML = renderScheduleTable(mySchedules);
    assignmentList.innerHTML = renderAssignmentTable(myAssignments);
    reportList.innerHTML = renderReportCardTable(myReportCards);
  }

  function renderScheduleTable(schedules) {
    if (schedules.length === 0) {
      return `<p class="text-muted">No schedules added yet.</p>`;
    }

    let rows = "";

    schedules.forEach(function (schedule) {
      rows += `
        <tr>
          <td>${schedule.subject}</td>
          <td>${schedule.day}</td>
          <td>${schedule.startTime}</td>
          <td>${schedule.endTime}</td>
        </tr>
      `;
    });

    return `
      <div class="table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-success">
            <tr>
              <th>Subject</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderAssignmentTable(assignments) {
    if (assignments.length === 0) {
      return `<p class="text-muted">No assignments added yet.</p>`;
    }

    let rows = "";

    assignments.forEach(function (assignment) {
      const statusClass =
        assignment.status === "complete" ? "text-success" : "text-warning";
      const buttonText =
        assignment.status === "complete" ? "Mark Pending" : "Mark Complete";

      rows += `
        <tr>
          <td>${assignment.title}</td>
          <td>${assignment.subject}</td>
          <td>${assignment.deadline}</td>
          <td class="fw-bold ${statusClass}">${assignment.status}</td>
          <td>
            <button
              class="btn btn-sm btn-outline-success change-status-btn"
              data-assignment-id="${assignment.id}"
            >
              ${buttonText}
            </button>
          </td>
        </tr>
      `;
    });

    return `
      <div class="table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-success">
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderReportCardTable(reportCards) {
    if (reportCards.length === 0) {
      return `<p class="text-muted">No report cards added yet.</p>`;
    }

    let rows = "";

    reportCards.forEach(function (reportCard) {
      rows += `
        <tr>
          <td>${reportCard.month}</td>
          <td>${reportCard.subject}</td>
          <td>${reportCard.marks}</td>
          <td>${reportCard.grade}</td>
          <td>${reportCard.comment}</td>
        </tr>
      `;
    });

    return `
      <div class="table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-success">
            <tr>
              <th>Month</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }
});
