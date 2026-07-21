const notificationButton = document.getElementById("notification-button");

const notificationPanel = document.getElementById("notification-panel");

const notificationList = document.getElementById("notification-list");

notificationButton.addEventListener("click", () => {
  notificationPanel.classList.toggle("open");

  loadNotifications();
});

async function loadNotifications() {
  notificationList.innerHTML = "";

  const notifications = [];

    const householdId = await getHouseholdId();

    const { data: items, error } = await supabaseClient

      .from("items")

      .select("*")

      .eq("household_id", householdId);

  if (error) {
    console.error(error);

    return;
  }

  const today = new Date();

  const future = new Date();

  future.setDate(today.getDate() + 3);

  items.forEach((item) => {
    if (item.quantity <= item.minimum) {
      notifications.push({
        icon: "fa-cart-shopping",

        text: `${item.name} is low stock`,
      });
    }

    if (item.expiry) {
      const expiry = new Date(item.expiry);

      if (expiry <= future) {
        notifications.push({
          icon: "fa-calendar",

          text: `${item.name} expires soon`,
        });
      }
    }
  });

  if (notifications.length === 0) {
    notificationList.innerHTML = `

        <div class="empty-notification">

            No notifications

        </div>

        `;

    return;
  }

  notifications.forEach((notification) => {
    notificationList.innerHTML += `

        <div class="notification-item">

            <i class="fa-solid ${notification.icon}"></i>

            <p>
                ${notification.text}
            </p>

        </div>

        `;
  });
}
