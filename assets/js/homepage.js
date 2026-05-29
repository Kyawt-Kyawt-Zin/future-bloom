console.log("homepage.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  seedUsers();
  seedTeacherStudentLinks();
  setupThemeControls();
});

function seedUsers() {
  const defaultUsers = [
    {
      id: 1779197744303,
      username: "Kyawt",
      email: "kyawt@gmail.com",
      password: "12345678",
      role: "parent",
      gender: null,
      studentId: null,
    },
    {
      id: 1779197776744,
      username: "Rozy",
      email: "rozy@gmail.com",
      password: "12345678",
      role: "teacher",
      gender: null,
      studentId: null,
    },
    {
      id: 1779197810119,
      username: "Sofia",
      email: "sofia@gmail.com",
      password: "12345678",
      role: "student",
      gender: "girl",
      studentId: "STU84817",
    },
    {
      id: 1779197851253,
      username: "Qasim",
      email: "qasim@gmail.com",
      password: "12345678",
      role: "teacher",
      gender: null,
      studentId: null,
    },
    {
      id: 1779197886054,
      username: "Hein",
      email: "hein@gmail.com",
      password: "12345678",
      role: "student",
      gender: "boy",
      studentId: "STU16217",
    },
    {
      id: 1779197938328,
      username: "Maria",
      email: "maria@gmail.com",
      password: "12345678",
      role: "teacher",
      gender: null,
      studentId: null,
    },
    {
      id: 1779197972091,
      username: "George",
      email: "george@gmail.com",
      password: "12345678",
      role: "parent",
      gender: null,
      studentId: null,
    },
    {
      id: 1779198015961,
      username: "Venus",
      email: "venus@gmail.com",
      password: "12345678",
      role: "student",
      gender: "girl",
      studentId: "STU76533",
    },
    {
      id: 1779198052272,
      username: "Zaw",
      email: "zaw@gmail.com",
      password: "12345678",
      role: "student",
      gender: "boy",
      studentId: "STU57465",
    },
  ];

  const users = JSON.parse(localStorage.getItem("users")) || [];

  defaultUsers.forEach(function (defaultUser) {
    const userAlreadyExists = users.some(function (user) {
      return user.email === defaultUser.email;
    });

    if (!userAlreadyExists) {
      users.push(defaultUser);
    }
  });

  localStorage.setItem("users", JSON.stringify(users));
}

function seedTeacherStudentLinks() {
  const defaultLinks = [
    {
      id: 1,
      teacherId: 1779197776744,
      studentId: "STU84817",
    },
    {
      id: 2,
      teacherId: 1779197776744,
      studentId: "STU76533",
    },
    {
      id: 3,
      teacherId: 1779197851253,
      studentId: "STU57465",
    },
    {
      id: 4,
      teacherId: 1779197851253,
      studentId: "STU16217",
    },
    {
      id: 5,
      teacherId: 1779197938328,
      studentId: "STU84817",
    },
  ];

  const links = JSON.parse(localStorage.getItem("teacherStudentLinks")) || [];

  defaultLinks.forEach(function (defaultLink) {
    const linkAlreadyExists = links.some(function (link) {
      return (
        link.teacherId === defaultLink.teacherId &&
        link.studentId === defaultLink.studentId
      );
    });

    if (!linkAlreadyExists) {
      links.push(defaultLink);
    }
  });

  localStorage.setItem("teacherStudentLinks", JSON.stringify(links));
}

function setupThemeControls() {
  const backgroundSelect = document.getElementById("backgroundSelect");
  const darkModeSwitch = document.getElementById("darkModeSwitch");
  const backgroundElement = document.querySelector(
    "#bg, #bg-parent, #bg-teacher, #bg-student-boy, #bg-student-girl",
  );

  if (!backgroundSelect && !darkModeSwitch) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const themeKey = currentUser ? `theme-${currentUser.id}` : "theme-guest";
  const savedTheme = JSON.parse(localStorage.getItem(themeKey)) || {};
  const backgroundClasses = [
    "bg-home",
    "bg-parent",
    "bg-teacher",
    "bg-student-boy",
    "bg-student-girl",
  ];

  if (savedTheme.background && backgroundSelect) {
    backgroundSelect.value = savedTheme.background;
    changeBackground(savedTheme.background);
  }

  if (savedTheme.darkMode) {
    document.body.classList.add("fb-dark-mode");

    if (darkModeSwitch) {
      darkModeSwitch.checked = true;
    }
  }

  if (backgroundSelect) {
    backgroundSelect.addEventListener("change", function () {
      savedTheme.background = backgroundSelect.value;
      saveTheme();
      changeBackground(backgroundSelect.value);
    });
  }

  if (darkModeSwitch) {
    darkModeSwitch.addEventListener("change", function () {
      savedTheme.darkMode = darkModeSwitch.checked;
      saveTheme();
      document.body.classList.toggle("fb-dark-mode", darkModeSwitch.checked);
    });
  }

  function changeBackground(backgroundClass) {
    if (!backgroundElement) return;

    backgroundClasses.forEach(function (className) {
      backgroundElement.classList.remove(className);
    });

    backgroundElement.classList.add(backgroundClass);
  }

  function saveTheme() {
    localStorage.setItem(themeKey, JSON.stringify(savedTheme));
  }
}
