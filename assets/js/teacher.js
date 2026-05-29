console.log("teacher.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const welcomeMessage = document.getElementById("welcomeMessage");
  const studentTableBody = document.getElementById("studentTableBody");
  const addStudentBtn = document.getElementById("addStudentBtn");
  const studentPagination = document.getElementById("studentPagination");

  const studentsPerPage = 5;
  let currentPage = 1;

  if (!currentUser || currentUser.role !== "teacher") {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">
          Please login as a teacher first.
        </td>
      </tr>
    `;
    return;
  }

  if (welcomeMessage) {
    welcomeMessage.classList.remove("d-none");
    welcomeMessage.innerHTML = `
      <h3 class="fw-bold mb-0">
        Welcome Teacher ${currentUser.username}!
      </h3>
    `;
  }

  renderStudents();

  addStudentBtn.addEventListener("click", function () {
    const enteredStudentId = prompt("Enter Student ID:");

    if (!enteredStudentId) return;

    addStudentToTeacher(enteredStudentId.trim());
  });

  function getTeacherStudents() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    const myLinks = links.filter(function (link) {
      return link.teacherId === currentUser.id;
    });

    return myLinks
      .map(function (link) {
        return users.find(function (user) {
          return user.role === "student" && user.studentId === link.studentId;
        });
      })
      .filter(Boolean);
  }

  function renderStudents() {
    const myStudents = getTeacherStudents();
    const totalPages = Math.ceil(myStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = myStudents.slice(startIndex, endIndex);

    studentTableBody.innerHTML = "";

    if (myStudents.length === 0) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">
            No students assigned yet.
          </td>
        </tr>
      `;
      studentPagination.innerHTML = "";
      return;
    }

    studentsToShow.forEach(function (student) {
      studentTableBody.innerHTML += `
        <tr>
          <td>${student.username}</td>
          <td>${student.studentId}</td>
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

  function addStudentToTeacher(studentId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    const student = users.find(function (user) {
      return (
        user.role === "student" &&
        user.studentId &&
        user.studentId.toLowerCase() === studentId.toLowerCase()
      );
    });

    if (!student) {
      alert("No student found with this ID.");
      return;
    }

    const alreadyAdded = links.some(function (link) {
      return (
        link.teacherId === currentUser.id &&
        link.studentId === student.studentId
      );
    });

    if (alreadyAdded) {
      alert("This student is already in your table.");
      return;
    }

    links.push({
      id: Date.now(),
      teacherId: currentUser.id,
      studentId: student.studentId,
    });

    localStorage.setItem("teacherStudentLinks", JSON.stringify(links));

    currentPage = Math.ceil(getTeacherStudents().length / studentsPerPage);
    renderStudents();
  }

  function deleteStudentFromTeacher(studentId) {
    const confirmed = confirm(
      "Are you sure you want to remove this student from your table?",
    );

    if (!confirmed) return;

    const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

    const updatedLinks = links.filter(function (link) {
      return !(
        link.teacherId === currentUser.id && link.studentId === studentId
      );
    });

    localStorage.setItem("teacherStudentLinks", JSON.stringify(updatedLinks));

    const totalPages = Math.ceil(getTeacherStudents().length / studentsPerPage);

    if (currentPage > totalPages) {
      currentPage = totalPages || 1;
    }

    renderStudents();
  }

  studentTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-student-btn")) {
      const studentId = event.target.dataset.studentId;
      deleteStudentFromTeacher(studentId);
    }

    if (event.target.classList.contains("access-btn")) {
      const studentId = event.target.dataset.studentId;
      window.location.href = `access.html?studentId=${studentId}`;
    }
  });

  studentPagination.addEventListener("click", function (event) {
    if (!event.target.classList.contains("page-btn")) return;

    currentPage = Number(event.target.dataset.page);
    renderStudents();
  });
});
