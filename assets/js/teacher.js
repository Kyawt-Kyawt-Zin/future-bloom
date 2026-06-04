console.log("teacher.js connected");

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const lastTeacherUser = JSON.parse(localStorage.getItem("lastTeacherUser"));

  if (!currentUser && lastTeacherUser) {
    currentUser = lastTeacherUser;
    localStorage.setItem("currentUser", JSON.stringify(lastTeacherUser));
  }

  const welcomeMessage = document.getElementById("welcomeMessage");
  const teacherAlert = document.getElementById("teacherAlert");
  const studentSearchInput = document.getElementById("studentSearchInput");
  const studentTableBody = document.getElementById("studentTableBody");
  const studentCount = document.getElementById("studentCount");
  const studentPagination = document.getElementById("studentPagination");
  const availableStudentSelect = document.getElementById("availableStudentSelect");
  const confirmAddExistingStudentBtn = document.getElementById(
    "confirmAddExistingStudentBtn",
  );
  const confirmCreateStudentBtn = document.getElementById(
    "confirmCreateStudentBtn",
  );
  const existingStudentTab = document.getElementById("existingStudentTab");
  const newStudentTab = document.getElementById("newStudentTab");
  const newStudentName = document.getElementById("newStudentName");
  const newStudentEmail = document.getElementById("newStudentEmail");
  const newStudentParentEmail = document.getElementById(
    "newStudentParentEmail",
  );
  const newStudentGender = document.getElementById("newStudentGender");
  const newStudentGrade = document.getElementById("newStudentGrade");
  const confirmDeleteStudentBtn = document.getElementById(
    "confirmDeleteStudentBtn",
  );
  const deleteStudentMessage = document.getElementById("deleteStudentMessage");
  const teacherChangePasswordForm = document.getElementById(
    "teacherChangePasswordForm",
  );
  const teacherPasswordMessage = document.getElementById(
    "teacherPasswordMessage",
  );
  const logoutBtn = document.getElementById("logoutBtn");

  const addStudentModal = new bootstrap.Modal(
    document.getElementById("addStudentModal"),
  );
  const deleteStudentModal = new bootstrap.Modal(
    document.getElementById("deleteStudentModal"),
  );

  const studentsPerPage = 5;
  let currentPage = 1;
  let searchValue = "";
  let studentIdToDelete = null;

  if (!currentUser || currentUser.role !== "teacher") {
      studentTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          Please login as a teacher first.
        </td>
      </tr>
    `;
    return;
  }

  currentUser = getFreshCurrentTeacher();
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("lastTeacherUser", JSON.stringify(currentUser));

  if (welcomeMessage) {
    welcomeMessage.classList.remove("d-none");
    welcomeMessage.innerHTML = `
      <h3 class="fw-bold mb-0">
        Welcome Teacher ${currentUser.username}!
      </h3>
    `;
  }

  renderStudents();
  renderAvailableStudentOptions();
  setupTeacherPasswordToggles();

  document.addEventListener("demoDataReady", function () {
    renderStudents();
    renderAvailableStudentOptions();
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("lastTeacherUser");
    window.location.href = "../index.html";
  });

  studentSearchInput.addEventListener("input", function () {
    searchValue = studentSearchInput.value;
    currentPage = 1;
    renderStudents();
  });

  existingStudentTab.addEventListener("shown.bs.tab", function () {
    confirmAddExistingStudentBtn.classList.remove("d-none");
    confirmCreateStudentBtn.classList.add("d-none");
  });

  newStudentTab.addEventListener("shown.bs.tab", function () {
    confirmAddExistingStudentBtn.classList.add("d-none");
    confirmCreateStudentBtn.classList.remove("d-none");
  });

  confirmAddExistingStudentBtn.addEventListener("click", function () {
    const selectedStudentId = availableStudentSelect.value;

    if (!selectedStudentId) {
      showBootstrapAlert("Please choose a student first.", "warning");
      return;
    }

    addStudentToTeacher(selectedStudentId);
    addStudentModal.hide();
  });

  confirmCreateStudentBtn.addEventListener("click", function () {
    createStudentAndConnect();
  });

  confirmDeleteStudentBtn.addEventListener("click", function () {
    if (!studentIdToDelete) return;

    removeStudentFromTeacher(studentIdToDelete);
    studentIdToDelete = null;
    deleteStudentModal.hide();
  });

  if (teacherChangePasswordForm) {
    teacherChangePasswordForm.addEventListener("submit", function (event) {
      event.preventDefault();
      changeTeacherPassword();
    });
  }

  studentTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-student-btn")) {
      studentIdToDelete = event.target.dataset.studentId;
      openDeleteModal(studentIdToDelete);
    }

    if (event.target.classList.contains("access-btn")) {
      const studentId = event.target.dataset.studentId;
      localStorage.setItem("lastTeacherUser", JSON.stringify(currentUser));
      window.location.href = `access.html?studentId=${studentId}`;
    }
  });

  studentPagination.addEventListener("click", function (event) {
    if (!event.target.classList.contains("page-btn")) return;

    currentPage = Number(event.target.dataset.page);
    renderStudents();
  });

  function getFreshCurrentTeacher() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const freshTeacher = users.find(function (user) {
      return (
        user.id === currentUser.id ||
        user.email === currentUser.email ||
        user.username === currentUser.username
      );
    });

    return freshTeacher || currentUser;
  }

  function setupTeacherPasswordToggles() {
    const toggleButtons = document.querySelectorAll(
      ".teacher-password-toggle-btn",
    );

    toggleButtons.forEach(function (button) {
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

  function changeTeacherPassword() {
    const currentPassword = document
      .getElementById("teacherCurrentPassword")
      .value.trim();
    const newPassword = document
      .getElementById("teacherNewPassword")
      .value.trim();
    const confirmNewPassword = document
      .getElementById("teacherConfirmNewPassword")
      .value.trim();
    const errorMessages = [];

    teacherPasswordMessage.innerHTML = "";

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
      teacherPasswordMessage.innerHTML = `
        <div class="alert alert-danger rounded-3">
          ${errorMessages.join("<br />")}
        </div>
      `;
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map(function (user) {
      if (user.id === currentUser.id || user.email === currentUser.email) {
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
    localStorage.setItem("lastTeacherUser", JSON.stringify(currentUser));

    teacherPasswordMessage.innerHTML = `
      <div class="alert alert-success rounded-3">
        Password changed successfully.
      </div>
    `;

    teacherChangePasswordForm.reset();
  }

  function getAllStudents() {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    return users.filter(function (user) {
      return user.role === "student";
    });
  }

  function getTeacherLinks() {
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    return links.filter(function (link) {
      return link.teacherId === currentUser.id;
    });
  }

  function getTeacherStudents() {
    const students = getAllStudents();
    const myLinks = getTeacherLinks();

    return myLinks
      .map(function (link) {
        return students.find(function (student) {
          return student.studentId === link.studentId;
        });
      })
      .filter(Boolean);
  }

  function getFilteredStudents() {
    const normalizedSearch = normalizeText(searchValue);

    if (normalizedSearch === "") {
      return getTeacherStudents();
    }

    return getTeacherStudents().filter(function (student) {
      const normalizedName = normalizeText(student.username);
      const normalizedStudentId = normalizeText(student.studentId);

      return (
        normalizedName.includes(normalizedSearch) ||
        normalizedStudentId.includes(normalizedSearch)
      );
    });
  }

  function renderStudents() {
    const filteredStudents = getFilteredStudents();
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);

    studentTableBody.innerHTML = "";

    if (filteredStudents.length === 0) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">
            No students found.
          </td>
        </tr>
      `;
      studentCount.textContent = "Total students: 0";
      studentPagination.innerHTML = "";
      return;
    }

    studentsToShow.forEach(function (student) {
      studentTableBody.innerHTML += `
        <tr>
          <td>${student.username}</td>
          <td>${student.studentId}</td>
          <td>${student.grade || "Not selected"}</td>
          <td>
            <button
              class="btn btn-primary btn-sm access-btn"
              data-student-id="${student.studentId}"
            >
              Access
            </button>

            <button
              class="btn btn-danger btn-sm delete-student-btn"
              data-student-id="${student.studentId}"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    });

    renderPagination(totalPages);
    renderStudentCount(filteredStudents.length, startIndex, studentsToShow.length);
  }

  function renderStudentCount(totalStudents, startIndex, showingCount) {
    const firstStudentNumber = startIndex + 1;
    const lastStudentNumber = startIndex + showingCount;

    studentCount.textContent = `Showing ${firstStudentNumber}-${lastStudentNumber} of ${totalStudents} student(s).`;
  }

  function renderPagination(totalPages) {
    studentPagination.innerHTML = "";

    if (totalPages <= 1) return;

    if (currentPage > 1) {
      studentPagination.innerHTML += `
        <button class="btn btn-outline-success btn-sm page-btn" data-page="${
          currentPage - 1
        }">
          Previous
        </button>
      `;
    }

    for (let page = 1; page <= totalPages; page++) {
      studentPagination.innerHTML += `
        <button
          class="btn btn-sm ${
            page === currentPage ? "btn-success" : "btn-outline-success"
          } page-btn"
          data-page="${page}"
        >
          ${page}
        </button>
      `;
    }

    if (currentPage < totalPages) {
      studentPagination.innerHTML += `
        <button class="btn btn-outline-success btn-sm page-btn" data-page="${
          currentPage + 1
        }">
          Next
        </button>
      `;
    }
  }

  function renderAvailableStudentOptions() {
    const connectedStudentIds = getTeacherLinks().map(function (link) {
      return link.studentId;
    });

    const availableStudents = getAllStudents().filter(function (student) {
      return !connectedStudentIds.includes(student.studentId);
    });

    availableStudentSelect.innerHTML = "";

    if (availableStudents.length === 0) {
      availableStudentSelect.innerHTML = `
        <option value="">No available students</option>
      `;
      confirmAddExistingStudentBtn.disabled = true;
      return;
    }

    confirmAddExistingStudentBtn.disabled = false;

    availableStudentSelect.innerHTML = `
      <option value="">Choose student</option>
    `;

    availableStudents.forEach(function (student) {
      availableStudentSelect.innerHTML += `
        <option value="${student.studentId}">
          ${student.studentId} - ${student.username} - ${
            student.grade || "No grade"
          }
        </option>
      `;
    });
  }

  function addStudentToTeacher(studentId) {
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    const alreadyAdded = links.some(function (link) {
      return link.teacherId === currentUser.id && link.studentId === studentId;
    });

    if (alreadyAdded) {
      showBootstrapAlert("This student is already connected to you.", "warning");
      return;
    }

    links.push({
      id: Date.now(),
      teacherId: currentUser.id,
      studentId,
    });

    localStorage.setItem("teacherStudentLinks", JSON.stringify(links));

    showBootstrapAlert("Student added successfully.", "success");
    currentPage = Math.ceil(getTeacherStudents().length / studentsPerPage);
    renderStudents();
    renderAvailableStudentOptions();
  }

  function createStudentAndConnect() {
    const username = newStudentName.value.trim();
    const email = newStudentEmail.value.trim();
    const parentEmail = newStudentParentEmail.value.trim();
    const gender = newStudentGender.value;
    const grade = newStudentGrade.value;

    if (
      username === "" ||
      email === "" ||
      parentEmail === "" ||
      gender === "" ||
      grade === ""
    ) {
      showBootstrapAlert("Please fill in all new student fields.", "danger");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const emailAlreadyExists = users.some(function (user) {
      return normalizeText(user.email) === normalizeText(email);
    });

    if (emailAlreadyExists) {
      showBootstrapAlert("This email is already registered.", "warning");
      return;
    }

    const newStudent = {
      id: Date.now(),
      username,
      email,
      parentEmail,
      password: "12345678",
      role: "student",
      gender,
      grade,
      studentId: createUniqueStudentId(users),
    };

    users.push(newStudent);
    localStorage.setItem("users", JSON.stringify(users));

    addStudentToTeacher(newStudent.studentId);
    newStudentName.value = "";
    newStudentEmail.value = "";
    newStudentParentEmail.value = "";
    newStudentGender.value = "";
    newStudentGrade.value = "";
    addStudentModal.hide();

    showBootstrapAlert(
      `New student created. Student ID: <strong>${newStudent.studentId}</strong>. Grade: <strong>${newStudent.grade}</strong>. Default password: <strong>12345678</strong>.`,
      "success",
    );
  }

  function createUniqueStudentId(users) {
    let studentId = "";
    let alreadyExists = true;

    while (alreadyExists) {
      studentId = "STU" + Math.floor(10000 + Math.random() * 90000);

      alreadyExists = users.some(function (user) {
        return user.studentId === studentId;
      });
    }

    return studentId;
  }

  function openDeleteModal(studentId) {
    const hasExistingRecords = studentHasExistingRecords(studentId);

    deleteStudentMessage.innerHTML = hasExistingRecords
      ? `
        This student already has schedules, assignments, or report cards.
        Removing the student will only remove them from your table.
        Existing records will stay saved for future access.
      `
      : `
        Are you sure you want to remove this student from your table?
      `;

    deleteStudentModal.show();
  }

  function removeStudentFromTeacher(studentId) {
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    const updatedLinks = links.filter(function (link) {
      return !(
        link.teacherId === currentUser.id && link.studentId === studentId
      );
    });

    localStorage.setItem("teacherStudentLinks", JSON.stringify(updatedLinks));

    const totalPages = Math.ceil(getFilteredStudents().length / studentsPerPage);

    if (currentPage > totalPages) {
      currentPage = totalPages || 1;
    }

    showBootstrapAlert("Student removed from your table.", "success");
    renderStudents();
    renderAvailableStudentOptions();
  }

  function studentHasExistingRecords(studentId) {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const reportCards = JSON.parse(localStorage.getItem("reportCards")) || [];

    return (
      schedules.some(function (schedule) {
        return schedule.studentId === studentId;
      }) ||
      assignments.some(function (assignment) {
        return assignment.studentId === studentId;
      }) ||
      reportCards.some(function (reportCard) {
        return reportCard.studentId === studentId;
      })
    );
  }

  function showBootstrapAlert(message, type) {
    teacherAlert.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm mt-3" role="alert">
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
});
