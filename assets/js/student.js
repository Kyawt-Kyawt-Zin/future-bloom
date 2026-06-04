console.log("student.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");
  const studentAlert = document.getElementById("studentAlert");
  const studentScheduleList = document.getElementById("studentScheduleList");
  const studentAssignmentList = document.getElementById("studentAssignmentList");
  const studentReportList = document.getElementById("studentReportList");
  const submitAssignmentDemoBtn = document.getElementById(
    "submitAssignmentDemoBtn",
  );
  const submitAssignmentMessage = document.getElementById(
    "submitAssignmentMessage",
  );
  const pendingAssignmentSelect = document.getElementById(
    "pendingAssignmentSelect",
  );

  if (!currentUser || !welcomeMessage) return;

  welcomeMessage.innerHTML = `
    <h3 class="fw-bold">
      Welcome ${currentUser.username}!
    </h3>

    <p class="mt-3">
      Please note that your Student ID is:
      <strong>${currentUser.studentId}</strong>
    </p>

    <p>
      Your current grade is:
      <strong>${currentUser.grade || "Not selected"}</strong>
    </p>

    <p>
      Use this ID to connect efficiently
      with your parents and teachers.
    </p>

    <p class="fw-bold text-success mb-0">
      Wishing you a SUCCESS JOURNEY!
    </p>
  `;

  renderStudentRecords();

  if (submitAssignmentDemoBtn) {
    submitAssignmentDemoBtn.addEventListener("click", function () {
      const selectedAssignmentTitle =
        pendingAssignmentSelect.options[pendingAssignmentSelect.selectedIndex]
          ?.text || "";

      if (!pendingAssignmentSelect.value) {
        submitAssignmentMessage.innerHTML = `
          <div class="alert alert-warning rounded-3 mb-0">
            Please choose a pending assignment first.
          </div>
        `;
        return;
      }

      submitAssignmentMessage.innerHTML = `
        <div class="alert alert-info rounded-3 mb-0">
          Demo feature: your selected file is marked for
          <strong>${selectedAssignmentTitle}</strong>.
          Real file upload will be available in a future version.
        </div>
      `;
    });
  }

  function renderStudentRecords() {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const reportCards = JSON.parse(localStorage.getItem("reportCards")) || [];

    const mySchedules = schedules.filter(function (schedule) {
      return schedule.studentId === currentUser.studentId;
    });

    const myAssignments = assignments.filter(function (assignment) {
      return assignment.studentId === currentUser.studentId;
    });

    const myReportCards = reportCards.filter(function (reportCard) {
      return reportCard.studentId === currentUser.studentId;
    });

    showDeadlineAlerts(myAssignments);

    studentScheduleList.innerHTML = renderScheduleTable(mySchedules);
    studentAssignmentList.innerHTML = renderAssignmentTable(myAssignments);
    studentReportList.innerHTML = renderReportCardTable(myReportCards);
    renderPendingAssignmentOptions(myAssignments);
  }

  function renderPendingAssignmentOptions(assignments) {
    const pendingAssignments = assignments.filter(function (assignment) {
      return assignment.status === "pending";
    });

    pendingAssignmentSelect.innerHTML = "";

    if (pendingAssignments.length === 0) {
      pendingAssignmentSelect.innerHTML = `
        <option value="">No pending assignments</option>
      `;
      submitAssignmentDemoBtn.disabled = true;
      return;
    }

    submitAssignmentDemoBtn.disabled = false;

    pendingAssignmentSelect.innerHTML = `
      <option value="">Choose assignment</option>
    `;

    pendingAssignments.forEach(function (assignment) {
      pendingAssignmentSelect.innerHTML += `
        <option value="${assignment.id}">
          ${assignment.title} - ${assignment.subject} - Due ${assignment.deadline}
        </option>
      `;
    });
  }

  function showDeadlineAlerts(assignments) {
    const today = new Date().toISOString().split("T")[0];

    const overdueAssignments = assignments.filter(function (assignment) {
      return assignment.status === "pending" && assignment.deadline < today;
    });

    if (!studentAlert) return;

    if (overdueAssignments.length === 0) {
      studentAlert.innerHTML = "";
      return;
    }

    const assignmentText =
      overdueAssignments.length === 1 ? "assignment is" : "assignments are";

    studentAlert.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm mt-4" role="alert">
        <strong>Deadline reminder:</strong>
        ${overdueAssignments.length} pending ${assignmentText} past the deadline.
        Please check your assignment list below.
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    `;
  }

  function renderScheduleTable(schedules) {
    if (schedules.length === 0) {
      return `<p class="text-muted mb-0">No schedules yet.</p>`;
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
        <table class="table table-bordered align-middle mb-0">
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
      return `<p class="text-muted mb-0">No assignments yet.</p>`;
    }

    let rows = "";

    assignments.forEach(function (assignment) {
      const today = new Date().toISOString().split("T")[0];
      const isOverdue =
        assignment.status === "pending" && assignment.deadline < today;
      const statusClass =
        assignment.status === "complete" ? "text-success" : "text-warning";

      rows += `
        <tr class="${isOverdue ? "table-danger" : ""}">
          <td>${assignment.title}</td>
          <td>${assignment.subject}</td>
          <td>${assignment.deadline}</td>
          <td class="fw-bold ${statusClass}">
            ${assignment.status}
            ${isOverdue ? "<span class='text-danger'>(Overdue)</span>" : ""}
          </td>
        </tr>
      `;
    });

    return `
      <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderReportCardTable(reportCards) {
    if (reportCards.length === 0) {
      return `<p class="text-muted mb-0">No report cards yet.</p>`;
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
        <table class="table table-bordered align-middle mb-0">
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
