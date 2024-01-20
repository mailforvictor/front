const BASE_DIR = "http://mvc/";
const headers = {
  "X-Requested-With": "XMLHttpRequest",
  // "Content-Type": "application/json",
  "Accept": "application/json"

};
let tmpId = 0;
let modal = document.querySelector(".modal");
document.addEventListener("DOMContentLoaded", function () {
  showUserList();
});
document.getElementById("add-user-button").addEventListener("click", () => {
  modal.style.display = "block";
  document.body.classList.add("no-scroll");
});
document.querySelectorAll(".close").forEach(el => {
  let id = el.parentNode.parentNode.id;
  document.getElementById(id).querySelector("span").addEventListener("click", () => {
    el.parentNode.parentNode.style.display = "none";
    document.body.classList.remove("no-scroll");
  });
});
document.getElementById("user-list").addEventListener("click", showUserData);

function showUserList() {
  getUserList()
    .then(response => {
      if (response["data"]) {
        localStorage.setItem("token", response["token"]);
        let userListBody = document.getElementById("user-list-body");
        document.querySelector(".user-list").style.display = "block";
        Object.values(response["data"]).forEach(user => {
          let row = document.createElement("tr");
          row.setAttribute("data-id", user.id);
          let cellId = document.createElement("td");
          cellId.textContent = user.id;
          row.appendChild(cellId);
          let cellUsername = document.createElement("td");
          cellUsername.textContent = user.username;
          row.appendChild(cellUsername);
          let cellEmail = document.createElement("td");
          cellEmail.textContent = user.email;
          row.appendChild(cellEmail);
          userListBody.appendChild(row);
        });
      } else {
        console.log("Error");
      }
    });
}

function getUserList() {
  return fetch(BASE_DIR + "user/get-users", {
    method: "GET",
    headers
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    }).catch((error) => {
      console.error("Error:", error.message);
    });
}

function showUserData(e) {
  if (e.target.closest("tr").dataset.id) {
    let userId = e.target.parentElement.getAttribute("data-id");
    tmpId = userId;
    getUserData(userId)
      .then(response => {
        if (response["data"]) {
          localStorage.setItem("token", response["token"]);
          let { id, username, email, birthday, phone, url } = response["data"];
          let modalUserInfo = document.getElementById("modal-delete-user");
          document.getElementById("user-id-delete").querySelector("span").textContent = id;
          document.getElementById("username-delete").querySelector("span").textContent = username;
          document.getElementById("email-delete").querySelector("span").textContent = email;
          document.getElementById("birthday-delete").querySelector("span").textContent = birthday;
          document.getElementById("url-delete").querySelector("span").textContent = url;
          document.getElementById("phone-delete").querySelector("span").textContent = phone;
          document.getElementById("user-delete").addEventListener("click", deleteUser);
          modalUserInfo.style.display = "block";
          document.body.classList.add("no-scroll");
        } else {
          console.log(response.message);
        }
      });
  }
}

function getUserData(userId) {
  let body = JSON.stringify({ id: userId, token: localStorage.getItem("token") });
  return fetch(BASE_DIR + "user/get", {
    method: "POST",
    headers,
    body
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    });
}

function deleteUser() {
  let isConfirm = confirm("Are you sure?");
  if (isConfirm) {
    fetch(BASE_DIR + "user/delete", {
      method: "POST",
      headers,
      body: JSON.stringify({ id: tmpId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then(response => {
        if (response["data"]) {
          localStorage.setItem("token", response["token"]);
          document.getElementById("modal-delete-user").style.display = "none";
          let table = document.getElementById("user-list");
          let rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
          for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let rowDataId = row.getAttribute("data-id");
            if (rowDataId === tmpId) {
              document.getElementById("user-delete").removeEventListener("click", deleteUser);
              row.parentNode.removeChild(row);
              break;
            }
          }
          if (rows.length === 0) {
            document.getElementById("user-list").style.display = "none";
          }
        } else {
          console.log(response.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }
}

document.getElementById("add-user").addEventListener("submit", addUser);

function addUser(e) {
  e.preventDefault();
  if (!formValidation(e)) return;
  document.getElementById("modal").style.display = "none";
  let body = new FormData(e.target);
  fetch(BASE_DIR + "user/add", {
    method: "POST",
    headers,
    body,
    redirect: "follow"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(response => {
      console.log(response);
      if (response["data"]) {
        localStorage.setItem("token", response["token"]);
        this.reset();
        location.reload();
      } else {
        console.log(response.message);
      }
    })
    .catch(error => console.error("Error:", error.message));
}

function formValidation(event) {
  let username = document.getElementById("username");
  let usernamePattern = new RegExp("^[a-z]+$");
  let minLengthUsername = 3;
  let errUsername = document.getElementById("err-username");

  let email = document.getElementById("email");
  let emailPattern = new RegExp("^[a-z]+@[a-z\\-]+(\\.[a-z]+)+$");
  let errEmail = document.getElementById("err-email");

  let password = document.getElementById("password");
  let passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[\\/|\\\\|\\|!@#$%^&*+()_-])[A-Za-z\\/|\\\\|\\|!@#$%^&*+()_-]{8,}$");
  let lengthPassword = 8;
  let errPassword = document.getElementById("err-password");

  let birthday = document.getElementById("birthday");
  let errBirthday = document.getElementById("err-birthday");

  let url = document.getElementById("url");
  let urlPattern = new RegExp("^(http[s]?://)?(www.)?[a-z-]+\\.[a-z]+$");
  let errUrl = document.getElementById("err-url");

  let phone = document.getElementById("phone");
  let phonePattern = new RegExp("^\\d{10}$");
  let errPhone = document.getElementById("err-phone");

  if (!username.value) {
    event.preventDefault();
    errUsername.textContent = "Username is required.";
    errUsername.style.display = "block";
    return false;
  } else if (username.value.length < minLengthUsername) {
    event.preventDefault();
    errUsername.textContent = `Username must be at least ${ minLengthUsername } characters.`;
    errUsername.style.display = "block";
    return false;
  } else if (!usernamePattern.test(username.value)) {
    event.preventDefault();
    errUsername.textContent = "Invalid username";
    errUsername.style.display = "block";
    return false;
  } else {
    errUsername.style.display = "none";
  }

  if (!email.value) {
    event.preventDefault();
    errEmail.textContent = "Email is required.";
    errEmail.style.display = "block";
    return false;
  } else if (!emailPattern.test(email.value)) {
    event.preventDefault();
    errEmail.textContent = "Invalid email";
    errEmail.style.display = "block";
    return false;
  } else {
    errEmail.style.display = "none";
  }

  if (!password.value) {
    event.preventDefault();
    errPassword.textContent = "Password is required.";
    errPassword.style.display = "block";
    return false;
  } else if (password.value.length < lengthPassword) {
    event.preventDefault();
    errPassword.textContent = "Password must be at least 10 characters.";
    errPassword.style.display = "block";
    return false;
  } else if (!passwordPattern.test(password.value)) {
    event.preventDefault();
    errPassword.textContent = "Password must contain one lowercase letter of the English alphabet, one uppercase letter and a special character (!@#$%^&*+()-).";
    errPassword.style.display = "block";
    return false;
  } else {
    errPassword.style.display = "none";
  }

  let [year, month, day] = birthday.value.split("-");
  if (!birthday.value || !year || !month || !day) {
    event.preventDefault();
    errBirthday.textContent = "Birthday is required.";
    errBirthday.style.display = "block";
    return false;
  } else {
    errBirthday.style.display = "none";
  }

  if (!url.value) {
    event.preventDefault();
    errUrl.textContent = "URL is required.";
    errUrl.style.display = "block";
    return false;
  } else if (!urlPattern.test(url.value)) {
    event.preventDefault();
    errUrl.textContent = "Invalid URL";
    errUrl.style.display = "block";
    return false;
  } else {
    errUrl.style.display = "none";
  }

  if (!phone.value) {
    event.preventDefault();
    errPhone.textContent = "Phone is required.";
    errPhone.style.display = "block";
    return false;
  } else if (!phonePattern.test(phone.value)) {
    event.preventDefault();
    errPhone.textContent = "Only 10 digits";
    errPhone.style.display = "block";
    return false;
  } else {
    errPhone.style.display = "none";
  }

  return true;
}