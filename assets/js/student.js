console.log("student.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");
  const studentScheduleList = document.getElementById("studentScheduleList");
  const studentAssignmentList = document.getElementById("studentAssignmentList");
  const studentReportList = document.getElementById("studentReportList");

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
      Use this ID to connect efficiently
      with your parents and teachers.
    </p>

    <p class="fw-bold text-success mb-0">
      Wishing you a SUCCESS JOURNEY!
    </p>
  `;

  renderStudentRecords();

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
  }

  function showDeadlineAlerts(assignments) {
    const today = new Date().toISOString().split("T")[0];

    const overdueAssignments = assignments.filter(function (assignment) {
      return assignment.status === "pending" && assignment.deadline < today;
    });

    if (overdueAssignments.length > 0) {
      alert("You have pending assignment(s) past the deadline.");
    }
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
