const menuButton = document.getElementById("menu-button");
const closeButton = document.getElementById("close-menu");

const sideMenu = document.getElementById("side-menu");
const overlay = document.getElementById("menu-overlay");

function closeMenu() {
  if (sideMenu) sideMenu.classList.remove("open");

  if (overlay) overlay.classList.remove("show");
}

if (menuButton) {
  menuButton.onclick = () => {
    if (sideMenu) sideMenu.classList.add("open");

    if (overlay) overlay.classList.add("show");
  };
}

if (closeButton) {
  closeButton.onclick = closeMenu;
}

if (overlay) {
  overlay.onclick = closeMenu;
}

async function checkAuth() {
  const page = window.location.pathname.split("/").pop();

  if (page === "index.html" || page === "" || page === "setup.html") {
    return;
  }

  if (localStorage.getItem("mode") === "demo") {
    return;
  }

  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "index.html";

    return;
  }

  const householdId = await getHouseholdId();

  if (!householdId) {
    window.location.href = "setup.html";
  }
}

checkAuth();

if(localStorage.getItem("mode") === "demo"){

    document
    .getElementById("demo-banner")
    ?.classList.add("show");

}
