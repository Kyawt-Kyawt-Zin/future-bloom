console.log("student.js connected");

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");
  const studentAlert = document.getElementById("studentAlert");
  const studentProfileDetails = document.getElementById(
    "studentProfileDetails",
  );
  const changePasswordForm = document.getElementById("changePasswordForm");
  const changePasswordMessage = document.getElementById(
    "changePasswordMessage",
  );
  const studentScheduleList = document.getElementById("studentScheduleList");
  const studentAssignmentList = document.getElementById("studentAssignmentList");
  const studentReportList = document.getElementById("studentReportList");
  const submitAssignmentDemoBtn = document.getElementById(
    "submitAssignmentDemoBtn",
  );
  const submitAssignmentSection = document.getElementById(
    "submitAssignmentSection",
  );
  const submitAssignmentMessage = document.getElementById(
    "submitAssignmentMessage",
  );
  const pendingAssignmentSelect = document.getElementById(
    "pendingAssignmentSelect",
  );
  const assignmentFile = document.getElementById("assignmentFile");

  if (!currentUser || !welcomeMessage) return;

  currentUser = getFreshCurrentUser();
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

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
  renderStudentProfile();
  setupPasswordToggles();

  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", function (event) {
      event.preventDefault();
      changeStudentPassword();
    });
  }

  if (submitAssignmentDemoBtn) {
    submitAssignmentDemoBtn.addEventListener("click", function () {
      if (!pendingAssignmentSelect.value) {
        submitAssignmentMessage.innerHTML = `
          <div class="alert alert-warning rounded-3 mb-0">
            Please choose a pending assignment first.
          </div>
        `;
        return;
      }

      if (!assignmentFile.files.length) {
        submitAssignmentMessage.innerHTML = `
          <div class="alert alert-warning rounded-3 mb-0">
            Please choose an assignment file first.
          </div>
        `;
        return;
      }

      const assignmentId = Number(pendingAssignmentSelect.value);
      const fileName = assignmentFile.files[0].name;
      const submittedAt = new Date().toISOString().split("T")[0];
      const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

      const updatedAssignments = assignments.map(function (assignment) {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            status: "submitted",
            submitted: true,
            submittedFileName: fileName,
            submittedAt,
          };
        }

        return assignment;
      });

      localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

      submitAssignmentMessage.innerHTML = `
        <div class="alert alert-success rounded-3 mb-0">
          Assignment submitted successfully with file:
          <strong>${fileName}</strong>.
          Your teacher can now review it.
        </div>
      `;

      assignmentFile.value = "";
      renderStudentRecords();
    });
  }

  function getFreshCurrentUser() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const freshUser = users.find(function (user) {
      return (
        user.id === currentUser.id ||
        (user.studentId && user.studentId === currentUser.studentId) ||
        user.email === currentUser.email
      );
    });

    return freshUser || currentUser;
  }

  function renderStudentProfile() {
    if (!studentProfileDetails) return;

    studentProfileDetails.innerHTML = `
      <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0">
          <tbody>
            <tr>
              <th class="table-success">Name</th>
              <td>${currentUser.username || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Email</th>
              <td>${currentUser.email || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Student ID</th>
              <td>${currentUser.studentId || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Parent Email</th>
              <td>${currentUser.parentEmail || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Grade</th>
              <td>${currentUser.grade || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Gender</th>
              <td>${currentUser.gender || "Not selected"}</td>
            </tr>
            <tr>
              <th class="table-success">Role</th>
              <td>${currentUser.role || "student"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function setupPasswordToggles() {
    const passwordToggleBtns = document.querySelectorAll(
      ".password-toggle-btn",
    );

    passwordToggleBtns.forEach(function (button) {
      button.addEventListener("click", function () {
        const inputElement = document.getElementById(
          button.dataset.passwordTarget,
        );
        const iconElement = document.getElementById(button.dataset.iconTarget);

        togglePasswordVisibility(inputElement, iconElement);
      });
    });
  }

  function togglePasswordVisibility(inputElement, iconElement) {
    if (!inputElement || !iconElement) return;

    if (inputElement.type === "password") {
      inputElement.type = "text";
      iconElement.classList.remove("bi-eye-slash");
      iconElement.classList.add("bi-eye");
      return;
    }

    inputElement.type = "password";
    iconElement.classList.remove("bi-eye");
    iconElement.classList.add("bi-eye-slash");
  }

  function changeStudentPassword() {
    const currentPassword = document
      .getElementById("currentPassword")
      .value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document
      .getElementById("confirmNewPassword")
      .value.trim();
    const errorMessages = [];

    changePasswordMessage.innerHTML = "";

    if (currentPassword === "") {
      errorMessages.push("Current password is required.");
    }

    if (newPassword === "") {
      errorMessages.push("New password is required.");
    }

    if (confirmNewPassword === "") {
      errorMessages.push("Confirm password is required.");
    }

    if (newPassword && newPassword.length < 6) {
      errorMessages.push("New password should be at least 6 characters.");
    }

    if (newPassword.length > 20) {
      errorMessages.push("New password should be no more than 20 characters.");
    }

    if (newPassword !== confirmNewPassword) {
      errorMessages.push("New password and confirm password must match.");
    }

    if (currentPassword !== currentUser.password) {
      errorMessages.push("Current password is incorrect.");
    }

    if (errorMessages.length > 0) {
      changePasswordMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          ${errorMessages.join("<br />")}
        </div>
      `;
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map(function (user) {
      if (
        user.id === currentUser.id ||
        (user.studentId && user.studentId === currentUser.studentId)
      ) {
        return {
          ...user,
          password: newPassword,
        };
      }

      return user;
    });

    currentUser = {
      ...currentUser,
      password: newPassword,
    };

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    changePasswordMessage.innerHTML = `
      <div class="alert alert-success rounded-3">
        Password changed successfully.
      </div>
    `;

    changePasswordForm.reset();
    hideBootstrapModal("changePasswordModal");
  }

  function hideBootstrapModal(modalId) {
    const modalElement = document.getElementById(modalId);

    if (!modalElement) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
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
      submitAssignmentSection.classList.add("d-none");
      pendingAssignmentSelect.innerHTML = `
        <option value="">No pending assignments</option>
      `;
      submitAssignmentDemoBtn.disabled = true;
      return;
    }

    submitAssignmentSection.classList.remove("d-none");
    submitAssignmentDemoBtn.disabled = false;

    pendingAssignmentSelect.innerHTML = `
      <option value="">Choose assignment</option>
    `;

    pendingAssignments.forEach(function (assignment) {
      pendingAssignmentSelect.innerHTML += `
        <option value="${assignment.id}">
          ${assignment.title} - ${assignment.subject} - Due ${formatDate(assignment.deadline)}
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
          <td>${formatTime(schedule.startTime)}</td>
          <td>${formatTime(schedule.endTime)}</td>
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

  function formatTime(timeValue) {
    if (!timeValue) return "-";

    const timeParts = timeValue.split(":");
    const hour = Number(timeParts[0]);
    const minute = timeParts[1];
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minute} ${period}`;
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
      const statusClass = getAssignmentStatusClass(assignment.status);
      const submittedFile = assignment.submittedFileName || "Not submitted";
      const submittedAt = assignment.submittedAt || "-";

      rows += `
        <tr class="${isOverdue ? "table-danger" : ""}">
          <td>${assignment.title}</td>
          <td>${assignment.subject}</td>
          <td>${formatDate(assignment.deadline)}</td>
          <td class="fw-bold ${statusClass}">
            ${assignment.status}
            ${isOverdue ? "<span class='text-danger'>(Overdue)</span>" : ""}
          </td>
          <td>${submittedFile}</td>
          <td>${submittedAt}</td>
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
              <th>Submitted File</th>
              <th>Submitted Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function getAssignmentStatusClass(status) {
    if (status === "complete") return "text-success";
    if (status === "submitted") return "text-primary";
    return "text-warning";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";

    const dateParts = dateValue.split("-");

    if (dateParts.length !== 3) return dateValue;

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
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
