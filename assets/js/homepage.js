console.log("homepage.js connected");

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();
});

const savedUsers = JSON.parse(localStorage.getItem("users"));

if (!savedUsers || savedUsers.length === 0) {
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
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}
