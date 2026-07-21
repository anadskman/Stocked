loadDashboard();

async function loadDashboard() {
  loadTotalItems();
  loadLowStock();
  loadExpiringSoon();
  loadShoppingCount();
  LoadActivity();
  loadRecipeSuggestions();
}

async function loadTotalItems() {
  const householdId = await getHouseholdId();

  const { count, error } = await supabaseClient
    .from("items")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("household_id", householdId);

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("total-items").textContent = count || 0;
}

async function loadLowStock() {
  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient
    .from("items")
    .select("quantity, minimum")
    .eq("household_id", householdId);

  if (error) {
    console.error(error);
    return;
  }

  const low = data.filter((item) => item.quantity <= item.minimum).length;

  document.getElementById("low-stock").textContent = low;
}

async function loadExpiringSoon() {
  const today = new Date();
  const future = new Date();

  future.setDate(today.getDate() + 7);

  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient
    .from("items")
    .select("expiry")
    .eq("household_id", householdId)
    .not("expiry", "is", null);

  if (error) {
    console.error(error);
    return;
  }

  const expiring = data.filter((item) => {
    const date = new Date(item.expiry);
    return date >= today && date <= future;
  }).length;

  document.getElementById("expiring-soon").textContent = expiring;
}

async function loadShoppingCount() {
  const { count, error } = await supabaseClient
    .from("shopping_list")
    .select("*", {
      count: "exact",
      head: true,
    })

    .eq("completed", false)
    .eq("household_id", await getHouseholdId());

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("shopping-count").textContent = count || 0;
}

async function loadActivity() {
  const list = document.getElementById("activity-list");
  list.innerHTML = "";

  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient
    .from("activity")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((activity) => {
    list.innerHTML += `
        <div class="activity-item">
            <i class="fa-solid ${activity.icon}"></i>
            <div>
                <h4>${activity.title}</h4>

                <p>${timeAgo(activity.created_at)}</p>
            </div>
        </div>
        `;
  });
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "Just now";

  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;

  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;

  return `${Math.floor(seconds / 86400)} days ago`;
}

async function loadRecipeSuggestions() {
  const container = document.getElementById("recipe-suggestions");

  if (!container) return;

  container.innerHTML = "";

  const { data: recipes } = await supabaseClient
    .from("recipes")
    .select("*")
    .limit(5);

  if (!recipes.length) {
    container.innerHTML = `
            <p>No recipes yet.</p>
        `;

    return;
  }

  for (const recipe of recipes) {
    const { data: ingredients } = await supabaseClient

      .from("recipe_items")

      .select(
        `
                quantity,
                items(
                    quantity
                )
            `,
      )

      .eq("recipe_id", recipe.id);

    let canMake = true;

    ingredients.forEach((item) => {
      if (!item.items || item.items.quantity < item.quantity) {
        canMake = false;
      }
    });

    container.innerHTML += `

        <div class="recipe-suggestion-card"

            onclick="location.href='recipe.html?id=${recipe.id}'">

            <h3>

                ${canMake ? "🍳" : "🛒"}

                ${recipe.name}

            </h3>

            <p>

                ${canMake ? "Everything is in stock" : "Missing ingredients"}

            </p>

        </div>

        `;
  }
}
