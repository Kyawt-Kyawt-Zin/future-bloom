console.log("homepage.js connected");

document.addEventListener("DOMContentLoaded", function () {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  loadDemoDataFromJson();
  setupThemeControls();
  setupLogoutButton();
  setupBackToTopButton();
});

async function loadDemoDataFromJson() {
  try {
    const response = await fetch(getDemoDataPath());
    const data = await response.json();

    seedUsers(data.users || []);
    seedTeacherStudentLinks(
      data.teacher_students_links || data.teacherStudentLinks || [],
    );
    document.dispatchEvent(new Event("demoDataReady"));
  } catch (error) {
    console.log("Demo JSON data could not be loaded", error);
  }
}

function seedUsers(defaultUsers) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  defaultUsers.forEach(function (defaultUser) {
    const existingUserIndex = users.findIndex(function (user) {
      return user.email === defaultUser.email;
    });

    if (existingUserIndex === -1) {
      users.push(defaultUser);
      return;
    }

    users[existingUserIndex] = fillMissingUserData(
      users[existingUserIndex],
      defaultUser,
    );
  });

  localStorage.setItem("users", JSON.stringify(users));
}

function fillMissingUserData(existingUser, defaultUser) {
  const updatedUser = { ...existingUser };

  Object.keys(defaultUser).forEach(function (key) {
    const currentValue = updatedUser[key];

    if (
      currentValue === undefined ||
      currentValue === null ||
      currentValue === ""
    ) {
      updatedUser[key] = defaultUser[key];
    }
  });

  return updatedUser;
}

function seedTeacherStudentLinks(defaultLinks) {
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

function getDemoDataPath() {
  const path = window.location.pathname;

  if (
    path.includes("/teacher-page/") ||
    path.includes("/student-page/") ||
    path.includes("/parent-page/") ||
    path.includes("/signup-page/")
  ) {
    return "../assets/data/users.json";
  }

  return "assets/data/users.json";
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

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("lastTeacherUser");
    window.location.href = getHomePath();
  });
}

function getHomePath() {
  const path = window.location.pathname;

  if (
    path.includes("/teacher-page/") ||
    path.includes("/student-page/") ||
    path.includes("/parent-page/") ||
    path.includes("/signup-page/")
  ) {
    return "../index.html";
  }

  return "index.html";
}

function setupBackToTopButton() {
  const backToTopBtn = document.createElement("button");

  backToTopBtn.type = "button";
  backToTopBtn.className = "btn btn-success back-to-top-btn";
  backToTopBtn.innerHTML = `<i class="bi bi-arrow-up"></i>`;
  backToTopBtn.setAttribute("aria-label", "Back to top");

  document.body.appendChild(backToTopBtn);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 250) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
