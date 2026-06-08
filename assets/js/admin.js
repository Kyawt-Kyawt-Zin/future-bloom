console.log("admin.js connected");

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(sessionStorage.getItem("adminCurrentUser"));
  const adminLoginView = document.getElementById("adminLoginView");
  const adminDashboardView = document.getElementById("adminDashboardView");
  const adminFooter = document.getElementById("adminFooter");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminLoginMessage = document.getElementById("adminLoginMessage");
  const adminLoginInput = document.getElementById("adminLoginInput");
  const adminLoginPassword = document.getElementById("adminLoginPassword");
  const toggleAdminPassword = document.getElementById("toggleAdminPassword");
  const adminWelcome = document.getElementById("adminWelcome");
  const adminPageTitle = document.getElementById("adminPageTitle");
  const adminSectionLabel = document.getElementById("adminSectionLabel");
  const adminSectionTitle = document.getElementById("adminSectionTitle");
  const adminTotalBadge = document.getElementById("adminTotalBadge");
  const adminQuickStats = document.getElementById("adminQuickStats");
  const adminDataView = document.getElementById("adminDataView");
  const adminTabBtns = document.querySelectorAll(".admin-tab-btn");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const mainSubjects = [
    "English",
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "Economics",
  ];
  const studentsPerPage = 5;
  let studentCurrentPage = 1;

  setupAdminLogin();

  if (currentUser && currentUser.role === "admin") {
    showAdminDashboard();
  } else {
    showAdminLogin();
  }

  adminTabBtns.forEach(function (button) {
    button.addEventListener("click", function () {
      adminTabBtns.forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      if (button.dataset.adminTab === "students") {
        studentCurrentPage = 1;
      }

      renderAdminTab(button.dataset.adminTab);
    });
  });

  document.addEventListener("demoDataReady", function () {
    if (!currentUser || currentUser.role !== "admin") return;

    const activeButton = document.querySelector(".admin-tab-btn.active");
    renderAdminTab(activeButton?.dataset.adminTab || "dashboard");
  });

  function setupAdminLogin() {
    adminLoginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const loginInput = adminLoginInput.value.trim();
      const password = adminLoginPassword.value.trim();
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const matchedAdmin = users.find(function (user) {
        return (
          user.role === "admin" &&
          (user.username === loginInput || user.email === loginInput) &&
          user.password === password
        );
      });

      if (!matchedAdmin) {
        adminLoginMessage.innerHTML = `
          <div class="alert alert-danger rounded-3">
            Invalid admin username/email or password.
          </div>
        `;
        return;
      }

      currentUser = matchedAdmin;
      sessionStorage.setItem("adminCurrentUser", JSON.stringify(matchedAdmin));
      adminLoginForm.reset();
      adminLoginMessage.innerHTML = "";
      showAdminDashboard();
    });

    adminLogoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("adminCurrentUser");
      currentUser = null;
      showAdminLogin();
    });

    toggleAdminPassword.addEventListener("click", function () {
      if (adminLoginPassword.type === "password") {
        adminLoginPassword.type = "text";
        document
          .getElementById("adminPasswordIcon")
          .classList.replace("bi-eye-slash", "bi-eye");
        return;
      }

      adminLoginPassword.type = "password";
      document
        .getElementById("adminPasswordIcon")
        .classList.replace("bi-eye", "bi-eye-slash");
    });
  }

  function showAdminLogin() {
    adminLoginView.classList.remove("d-none");
    adminDashboardView.classList.add("d-none");
    adminFooter.classList.add("d-none");
  }

  function showAdminDashboard() {
    adminLoginView.classList.add("d-none");
    adminDashboardView.classList.remove("d-none");
    adminFooter.classList.remove("d-none");

    adminWelcome.innerHTML = `
      <strong>Welcome ${currentUser.username}.</strong>
      View school records by choosing a control from the left side.
    `;

    renderAdminTab("dashboard");
  }

  function getAdminData() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const reportCards = JSON.parse(localStorage.getItem("reportCards")) || [];
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];
    const customSubjects =
      JSON.parse(localStorage.getItem("customSubjects")) || [];
    const teachers = users.filter(function (user) {
      return user.role === "teacher";
    });
    const students = users.filter(function (user) {
      return user.role === "student";
    });
    const subjects = getSubjects(schedules, assignments, reportCards, customSubjects);

    return {
      users,
      teachers,
      students,
      subjects,
      schedules,
      assignments,
      reportCards,
      links,
    };
  }

  function renderAdminTab(tabName) {
    const data = getAdminData();
    const renderers = {
      dashboard: renderDashboard,
      teachers: renderTeachers,
      students: renderStudents,
      subjects: renderSubjects,
      additionalSubjects: renderAdditionalSubjects,
      schedules: renderSchedules,
      assignments: renderAssignments,
      reports: renderReports,
    };

    renderers[tabName](data);
  }

  function setHeader(title, label, totalText) {
    adminPageTitle.textContent = title;
    adminSectionTitle.textContent = title;
    adminSectionLabel.textContent = label;
    adminTotalBadge.innerHTML = `
      <span class="badge text-bg-success rounded-pill px-3 py-2">
        ${totalText}
      </span>
    `;
  }

  function renderDashboard(data) {
    const families = new Set(
      data.students
        .map(function (student) {
          return student.parentEmail;
        })
        .filter(Boolean),
    );
    const submittedAssignments = data.assignments.filter(function (assignment) {
      return assignment.status === "submitted";
    });

    setHeader("Dashboard", "Overview", "School summary");
    renderStats([
      ["Teachers", data.teachers.length, "bi-person-workspace"],
      ["Student Count", data.students.length, "bi-mortarboard"],
      ["Main Subjects", mainSubjects.length, "bi-journal-bookmark"],
      ["Families", families.size, "bi-people"],
      ["Schedules", data.schedules.length, "bi-calendar-week"],
      ["Submitted Work", submittedAssignments.length, "bi-upload"],
    ]);

    adminDataView.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-xl-6">
          <h3 class="fs-5 mb-3">Classes By Day</h3>
          ${renderClassesByDayTable(data.schedules)}
        </div>
        <div class="col-12 col-xl-6">
          <h3 class="fs-5 mb-3">Teachers And Student Counts</h3>
          ${renderTeacherStudentSummary(data.teachers, data.students, data.links)}
        </div>
      </div>
    `;
  }

  function renderTeachers(data) {
    setHeader("Teachers", "Staff Records", `Total teachers: ${data.teachers.length}`);
    renderStats([
      ["Teachers", data.teachers.length, "bi-person-workspace"],
      ["Student Count", data.links.length, "bi-diagram-3"],
    ]);

    const rows = data.teachers
      .map(function (teacher) {
        const studentCount = data.links.filter(function (link) {
          return link.teacherId === teacher.id;
        }).length;

        return `
          <tr>
            <td>${teacher.username}</td>
            <td>${teacher.email}</td>
            <td>${studentCount}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Teacher Name", "Email", "Student Count"],
      rows,
      "No teachers found.",
    );
  }

  function renderStudents(data) {
    setHeader("Students", "Student Records", `Total students: ${data.students.length}`);
    renderStats([
      ["Students", data.students.length, "bi-mortarboard"],
      ["Grades", countUnique(data.students, "grade"), "bi-layers"],
      ["Parent Emails", countUnique(data.students, "parentEmail"), "bi-envelope"],
    ]);

    const totalPages = Math.ceil(data.students.length / studentsPerPage);
    const startIndex = (studentCurrentPage - 1) * studentsPerPage;
    const studentsToShow = data.students.slice(
      startIndex,
      startIndex + studentsPerPage,
    );
    const rows = studentsToShow
      .map(function (student) {
        return `
          <tr>
            <td>${student.username}</td>
            <td>${student.studentId}</td>
            <td>${student.grade || "Not selected"}</td>
            <td>${student.email}</td>
            <td>${student.parentEmail || "Not selected"}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML =
      renderTable(
      ["Student Name", "Student ID", "Grade", "Email", "Parent Email"],
      rows,
      "No students found.",
      ) + renderStudentPagination(totalPages);

    setupStudentPagination();
  }

  function renderSubjects(data) {
    setHeader("Main Subjects", "Academic Records", `Total main subjects: ${mainSubjects.length}`);
    renderStats([
      ["Main Subjects", mainSubjects.length, "bi-journal-bookmark"],
      ["Schedules", data.schedules.length, "bi-calendar-week"],
      ["Assignments", data.assignments.length, "bi-clipboard-check"],
    ]);

    const rows = mainSubjects
      .map(function (subject) {
        const scheduleCount = data.schedules.filter(function (schedule) {
          return schedule.subject === subject;
        }).length;
        const assignmentCount = data.assignments.filter(function (assignment) {
          return assignment.subject === subject;
        }).length;

        return `
          <tr>
            <td>${subject}</td>
            <td>${scheduleCount}</td>
            <td>${assignmentCount}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Subject", "Schedules", "Assignments"],
      rows,
      "No subjects found.",
    );
  }

  function renderAdditionalSubjects(data) {
    const customSubjects = JSON.parse(localStorage.getItem("customSubjects")) || [];
    const additionalSubjects = [...new Set(customSubjects)].filter(function (
      subject,
    ) {
      return !isMainSubject(subject);
    });
    const additionalSchedules = data.schedules.filter(function (schedule) {
      return additionalSubjects.includes(schedule.subject);
    });
    const additionalAssignments = data.assignments.filter(function (
      assignment,
    ) {
      return additionalSubjects.includes(assignment.subject);
    });

    setHeader(
      "Additional Subjects",
      "Teacher Added Records",
      `Total additional subjects: ${additionalSubjects.length}`,
    );
    renderStats([
      ["Additional Subjects", additionalSubjects.length, "bi-plus-square"],
      ["Schedules", additionalSchedules.length, "bi-calendar-week"],
      ["Assignments", additionalAssignments.length, "bi-clipboard-check"],
    ]);

    const rows = additionalSubjects
      .map(function (subject) {
        const scheduleCount = data.schedules.filter(function (schedule) {
          return schedule.subject === subject;
        }).length;
        const assignmentCount = data.assignments.filter(function (assignment) {
          return assignment.subject === subject;
        }).length;

        return `
          <tr>
            <td>${subject}</td>
            <td>${scheduleCount}</td>
            <td>${assignmentCount}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Additional Subject", "Schedules", "Assignments"],
      rows,
      "No additional subjects added yet.",
    );
  }

  function renderSchedules(data) {
    setHeader("Schedules", "Class Time Records", `Total schedules: ${data.schedules.length}`);
    renderStats([
      ["Schedules", data.schedules.length, "bi-calendar-week"],
      ["Class Days", countUnique(data.schedules, "day"), "bi-calendar-day"],
    ]);

    const rows = data.schedules
      .map(function (schedule) {
        return `
          <tr>
            <td>${schedule.subject}</td>
            <td>${schedule.day}</td>
            <td>${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</td>
            <td>${getStudentDisplay(schedule.studentId, data.students)}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Subject", "Day", "Class Hours", "Student"],
      rows,
      "No schedules found.",
    );
  }

  function renderAssignments(data) {
    setHeader(
      "Assignments",
      "Assignment Records",
      `Total assignments: ${data.assignments.length}`,
    );
    renderStats([
      ["Pending", countByStatus(data.assignments, "pending"), "bi-hourglass-split"],
      ["Submitted", countByStatus(data.assignments, "submitted"), "bi-upload"],
      ["Completed", countByStatus(data.assignments, "complete"), "bi-check-circle"],
    ]);

    const rows = data.assignments
      .map(function (assignment) {
        return `
          <tr>
            <td>${assignment.title}</td>
            <td>${assignment.subject}</td>
            <td>${getStudentDisplay(assignment.studentId, data.students)}</td>
            <td>${formatDate(assignment.deadline)}</td>
            <td>${assignment.status}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Title", "Subject", "Student", "Deadline", "Status"],
      rows,
      "No assignments found.",
    );
  }

  function renderReports(data) {
    setHeader("Report Cards", "Progress Records", `Total reports: ${data.reportCards.length}`);
    renderStats([
      ["Report Cards", data.reportCards.length, "bi-card-checklist"],
      ["Subjects", countUnique(data.reportCards, "subject"), "bi-book"],
    ]);

    const rows = data.reportCards
      .map(function (reportCard) {
        return `
          <tr>
            <td>${getStudentDisplay(reportCard.studentId, data.students)}</td>
            <td>${reportCard.month}</td>
            <td>${reportCard.subject}</td>
            <td>${reportCard.marks}</td>
            <td>${reportCard.grade}</td>
          </tr>
        `;
      })
      .join("");

    adminDataView.innerHTML = renderTable(
      ["Student", "Month", "Subject", "Marks", "Grade"],
      rows,
      "No report cards found.",
    );
  }

  function renderStats(stats) {
    adminQuickStats.innerHTML = stats
      .map(function (stat) {
        return `
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="admin-stat-card border rounded-3 p-3 h-100 bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted mb-1">${stat[0]}</p>
                  <h3 class="mb-0">${stat[1]}</h3>
                </div>
                <i class="bi ${stat[2]} fs-2 text-success"></i>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderStudentPagination(totalPages) {
    if (totalPages <= 1) return "";

    let buttons = "";

    if (studentCurrentPage > 1) {
      buttons += `
        <button class="btn btn-outline-success btn-sm admin-student-page-btn" data-page="${
          studentCurrentPage - 1
        }">
          Previous
        </button>
      `;
    }

    for (let page = 1; page <= totalPages; page++) {
      buttons += `
        <button
          class="btn btn-sm ${
            page === studentCurrentPage ? "btn-success" : "btn-outline-success"
          } admin-student-page-btn"
          data-page="${page}"
        >
          ${page}
        </button>
      `;
    }

    if (studentCurrentPage < totalPages) {
      buttons += `
        <button class="btn btn-outline-success btn-sm admin-student-page-btn" data-page="${
          studentCurrentPage + 1
        }">
          Next
        </button>
      `;
    }

    return `
      <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
        ${buttons}
      </div>
    `;
  }

  function setupStudentPagination() {
    const pageButtons = document.querySelectorAll(".admin-student-page-btn");

    pageButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        studentCurrentPage = Number(button.dataset.page);
        renderStudents(getAdminData());
      });
    });
  }

  function getStudentDisplay(studentId, students) {
    const student = students.find(function (item) {
      return item.studentId === studentId;
    });

    if (!student) return studentId || "Not selected";

    return `${student.username} - ${student.studentId}`;
  }

  function renderTable(headers, rows, emptyMessage) {
    if (!rows) {
      return `<p class="text-muted mb-0">${emptyMessage}</p>`;
    }

    const headerHtml = headers
      .map(function (header) {
        return `<th>${header}</th>`;
      })
      .join("");

    return `
      <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-success">
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderClassesByDayTable(schedules) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const rows = days
      .map(function (day) {
        const count = schedules.filter(function (schedule) {
          return schedule.day === day;
        }).length;

        return `
          <tr>
            <td>${day}</td>
            <td>${count}</td>
          </tr>
        `;
      })
      .join("");

    return renderTable(["Day", "Classes"], rows, "No classes found.");
  }

  function renderTeacherStudentSummary(teachers, students, links) {
    const rows = teachers
      .map(function (teacher) {
        const teacherLinks = links.filter(function (link) {
          return link.teacherId === teacher.id;
        });
        const studentNames = teacherLinks
          .map(function (link) {
            const student = students.find(function (item) {
              return item.studentId === link.studentId;
            });

            return student ? student.username : link.studentId;
          })
          .join(", ");

        return `
          <tr>
            <td>${teacher.username}</td>
            <td>${teacherLinks.length}</td>
            <td>${studentNames || "No students"}</td>
          </tr>
        `;
      })
      .join("");

    return renderTable(
      ["Teacher", "Student Count", "Students"],
      rows,
      "No teachers found.",
    );
  }

  function getSubjects(schedules, assignments, reportCards, customSubjects) {
    const subjectSet = new Set([
      "English",
      "Mathematics",
      "Science",
      "History",
      "Geography",
      "Economics",
      ...customSubjects,
    ]);

    schedules.forEach(function (schedule) {
      if (schedule.subject) subjectSet.add(schedule.subject);
    });

    assignments.forEach(function (assignment) {
      if (assignment.subject) subjectSet.add(assignment.subject);
    });

    reportCards.forEach(function (reportCard) {
      if (reportCard.subject) subjectSet.add(reportCard.subject);
    });

    return [...subjectSet];
  }

  function isMainSubject(subject) {
    return mainSubjects.some(function (mainSubject) {
      return normalizeText(mainSubject) === normalizeText(subject);
    });
  }

  function normalizeText(value) {
    return String(value).toLowerCase().replace(/\s+/g, "");
  }

  function countUnique(items, key) {
    return new Set(
      items
        .map(function (item) {
          return item[key];
        })
        .filter(Boolean),
    ).size;
  }

  function countByStatus(assignments, status) {
    return assignments.filter(function (assignment) {
      return assignment.status === status;
    }).length;
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

  function formatDate(dateValue) {
    if (!dateValue) return "-";

    const dateParts = dateValue.split("-");

    if (dateParts.length !== 3) return dateValue;

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }
});
