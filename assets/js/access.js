console.log("access.js connected");

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const lastTeacherUser = JSON.parse(localStorage.getItem("lastTeacherUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const params = new URLSearchParams(window.location.search);
  const studentId =
    params.get("studentId") || localStorage.getItem("selectedStudentId");

  const studentInfo = document.getElementById("studentInfo");
  const scheduleForm = document.getElementById("scheduleForm");
  const assignmentForm = document.getElementById("assignmentForm");
  const reportForm = document.getElementById("reportForm");
  const accessAlert = document.getElementById("accessAlert");
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
  const scheduleSubject = document.getElementById("scheduleSubject");
  const assignmentSubject = document.getElementById("assignmentSubject");
  const scheduleDay = document.getElementById("scheduleDay");
  const scheduleStartTime = document.getElementById("scheduleStartTime");
  const scheduleEndTime = document.getElementById("scheduleEndTime");
  const scheduleSaveBtn = scheduleForm.querySelector('button[type="submit"]');
  const newSubjectName = document.getElementById("newSubjectName");
  const confirmAddSubjectBtn = document.getElementById("confirmAddSubjectBtn");
  let editingScheduleId = null;
  const addSubjectModal = new bootstrap.Modal(
    document.getElementById("addSubjectModal"),
  );

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

  setupAccessFormButtons();
  renderSubjectOptions();

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
    <p class="mb-1"><strong>Student ID:</strong> ${student.studentId}</p>
    <p class="mb-1">
      <strong>Parent Email:</strong> ${student.parentEmail || "Not selected"}
    </p>
    <p class="mb-0"><strong>Grade:</strong> ${
      student.grade || "Not selected"
    }</p>
  `;

  renderRecords();

  reportMarks.addEventListener("input", function () {
    reportGrade.value = calculateGrade(reportMarks.value);
  });

  confirmAddSubjectBtn.addEventListener("click", function () {
    addCustomSubject();
  });

  function getSubjects() {
    const syllabusSubjects = [
      "English",
      "Mathematics",
      "Science",
      "History",
      "Geography",
      "Economics",
    ];
    const customSubjects =
      JSON.parse(localStorage.getItem("customSubjects")) || [];

    return [...syllabusSubjects, ...customSubjects];
  }

  function renderSubjectOptions() {
    const subjects = getSubjects();
    const options = subjects
      .map(function (subject) {
        return `<option value="${subject}">${subject}</option>`;
      })
      .join("");

    scheduleSubject.innerHTML = `
      <option value="">Choose subject</option>
      ${options}
    `;

    assignmentSubject.innerHTML = `
      <option value="">Choose subject</option>
      ${options}
    `;
  }

  function addCustomSubject() {
    const subject = newSubjectName.value.trim();

    if (subject === "") {
      showAccessAlert("Please enter a subject name.", "warning");
      return;
    }

    const normalizedSubject = normalizeText(subject);
    const subjectAlreadyExists = getSubjects().some(function (existingSubject) {
      return normalizeText(existingSubject) === normalizedSubject;
    });

    if (subjectAlreadyExists) {
      showAccessAlert("This subject already exists.", "warning");
      return;
    }

    const customSubjects =
      JSON.parse(localStorage.getItem("customSubjects")) || [];

    customSubjects.push(subject);
    localStorage.setItem("customSubjects", JSON.stringify(customSubjects));

    renderSubjectOptions();
    scheduleSubject.value = subject;
    assignmentSubject.value = subject;
    newSubjectName.value = "";
    addSubjectModal.hide();
    showAccessAlert("Subject added successfully.", "success");
  }

  function showAccessAlert(message, type) {
    accessAlert.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm" role="alert">
        ${message}
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    `;
  }

  function normalizeText(value) {
    return String(value).toLowerCase().replace(/\s+/g, "");
  }

  function setupAccessFormButtons() {
    const formButtons = document.querySelectorAll(".access-form-btn");
    const collapseItems = [
      {
        collapse: document.getElementById("scheduleCollapse"),
        button: document.getElementById("scheduleToggleBtn"),
      },
      {
        collapse: document.getElementById("assignmentCollapse"),
        button: document.getElementById("assignmentToggleBtn"),
      },
      {
        collapse: document.getElementById("reportCollapse"),
        button: document.getElementById("reportToggleBtn"),
      },
    ];

    collapseItems.forEach(function (item) {
      item.collapse.addEventListener("show.bs.collapse", function () {
        formButtons.forEach(function (button) {
          button.classList.remove("btn-warning");
          button.classList.add("btn-success");
        });

        item.button.classList.remove("btn-success");
        item.button.classList.add("btn-warning");
      });

      item.collapse.addEventListener("hidden.bs.collapse", function () {
        if (!item.collapse.classList.contains("show")) {
          item.button.classList.remove("btn-warning");
          item.button.classList.add("btn-success");
        }
      });
    });
  }

  scheduleForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = scheduleSubject.value;
    const day = scheduleDay.value;
    const startTime = scheduleStartTime.value;
    const endTime = scheduleEndTime.value;

    if (subject === "" || day === "" || startTime === "" || endTime === "") {
      scheduleMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          Please fill in all schedule fields.
        </div>
      `;
      return;
    }

    if (startTime >= endTime) {
      scheduleMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          End time must be later than start time.
        </div>
      `;
      return;
    }

    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

    if (editingScheduleId) {
      const updatedSchedules = schedules.map(function (schedule) {
        if (schedule.id === editingScheduleId) {
          return {
            ...schedule,
            subject,
            day,
            startTime,
            endTime,
          };
        }

        return schedule;
      });

      localStorage.setItem("schedules", JSON.stringify(updatedSchedules));
      scheduleMessage.innerHTML = `
        <div class="alert alert-success rounded-3">
          Schedule updated successfully.
        </div>
      `;
    } else {
      schedules.push({
        id: Date.now(),
        studentId: student.studentId,
        subject,
        day,
        startTime,
        endTime,
        teacherId: currentUser.id,
      });

      localStorage.setItem("schedules", JSON.stringify(schedules));
      scheduleMessage.innerHTML = `
        <div class="alert alert-success rounded-3">
          Schedule saved successfully.
        </div>
      `;
    }

    resetScheduleForm();
    renderRecords();
  });

  assignmentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("assignmentTitle").value.trim();
    const subject = assignmentSubject.value;
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
      teacherId: currentUser.id,
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
        if (!isOwnedByCurrentTeacher(assignment)) {
          return assignment;
        }

        return {
          ...assignment,
          status: assignment.status === "complete" ? "submitted" : "complete",
        };
      }

      return assignment;
    });

    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    renderRecords();
  });

  scheduleList.addEventListener("click", function (event) {
    if (!event.target.classList.contains("edit-schedule-btn")) return;

    const scheduleId = Number(event.target.dataset.scheduleId);
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const schedule = schedules.find(function (item) {
      return item.id === scheduleId;
    });

    if (!schedule) return;

    if (!isOwnedByCurrentTeacher(schedule)) {
      scheduleMessage.innerHTML = `
        <div class="alert alert-warning rounded-3">
          This schedule was added by another teacher, so you can view it but cannot edit it.
        </div>
      `;
      return;
    }

    editingScheduleId = schedule.id;
    scheduleSubject.value = schedule.subject;
    scheduleDay.value = schedule.day;
    scheduleStartTime.value = schedule.startTime;
    scheduleEndTime.value = schedule.endTime;
    scheduleSaveBtn.textContent = "Update Schedule";

    const scheduleCollapse = bootstrap.Collapse.getOrCreateInstance(
      document.getElementById("scheduleCollapse"),
    );
    scheduleCollapse.show();

    scheduleMessage.innerHTML = `
      <div class="alert alert-info rounded-3">
        You are editing this schedule. Change the details and click Update Schedule.
      </div>
    `;
  });

  function resetScheduleForm() {
    scheduleForm.reset();
    editingScheduleId = null;
    scheduleSaveBtn.textContent = "Save Schedule";
  }

  function isOwnedByCurrentTeacher(record) {
    return String(record.teacherId) === String(currentUser.id);
  }

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
      const scheduleAction = isOwnedByCurrentTeacher(schedule)
        ? `
            <button
              class="btn btn-sm btn-outline-success edit-schedule-btn"
              data-schedule-id="${schedule.id}"
            >
              Edit
            </button>
          `
        : `<span class="badge text-bg-secondary">View only</span>`;

      rows += `
        <tr>
          <td>${schedule.subject}</td>
          <td>${schedule.day}</td>
          <td>${formatTime(schedule.startTime)}</td>
          <td>${formatTime(schedule.endTime)}</td>
          <td>${scheduleAction}</td>
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
              <th>Action</th>
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
      return `<p class="text-muted">No assignments added yet.</p>`;
    }

    let rows = "";

    assignments.forEach(function (assignment) {
      const statusClass = getAssignmentStatusClass(assignment.status);
      const buttonText =
        assignment.status === "complete" ? "Mark Submitted" : "Mark Complete";
      const submittedFile = assignment.submittedFileName || "Not submitted";
      const submittedAt = assignment.submittedAt || "-";
      let assignmentAction = `<span class="badge text-bg-secondary">View only</span>`;

      if (isOwnedByCurrentTeacher(assignment)) {
        assignmentAction =
          assignment.status === "pending"
            ? `<span class="badge text-bg-warning">Waiting</span>`
            : `
                <button
                  class="btn btn-sm btn-outline-success change-status-btn"
                  data-assignment-id="${assignment.id}"
                >
                  ${buttonText}
                </button>
              `;
      }

      rows += `
        <tr>
          <td>${assignment.title}</td>
          <td>${assignment.subject}</td>
          <td>${assignment.deadline}</td>
          <td class="fw-bold ${statusClass}">${assignment.status}</td>
          <td>${submittedFile}</td>
          <td>${submittedAt}</td>
          <td>${assignmentAction}</td>
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
              <th>Submitted File</th>
              <th>Submitted Date</th>
              <th>Action</th>
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
