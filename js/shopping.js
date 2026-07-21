const shoppingList = document.getElementById("shopping-list");

loadShoppingList();

async function loadShoppingList() {
  shoppingList.innerHTML = "";

  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient
    .from("shopping_list")
    .select(
      `
            *,
            items (
                name,
                unit
            )
        `,
    )
    .eq("household_id", householdId)
    .order("created_at");

  if (error) {
    console.error(error);
    return;
  }

  if (data.length === 0) {
    shoppingList.innerHTML = `
            <div class="empty-shopping">
                <i class="fa-solid fa-circle-check"></i>
                <p>Your shopping list is empty</p>
            </div>
        `;
    return;
  }

  data.forEach(createShoppingCard);
}

function createShoppingCard(item) {
  const card = document.createElement("div");

  card.className = "shopping-card";

  if (item.completed) {
    card.classList.add("completed");
  }

  card.innerHTML = `

        <div class="shopping-info">

            <h3>
                ${item.items.name}
            </h3>

            <p>
                Need: ${item.quantity_needed}
                ${item.items.unit}
            </p>

        </div>


        <button class="shopping-check" type="button">

            <i class="fa-solid fa-check"></i>

        </button>

    `;

  const checkButton = card.querySelector(".shopping-check");

  checkButton.addEventListener("click", () => {
    toggleComplete(item.id, !item.completed, card);
  });

  shoppingList.appendChild(card);
}

async function toggleComplete(id, completed, card) {
  const { error } = await supabaseClient
    .from("shopping_list")
    .update({
      completed: completed,
    })
    .eq("id", id)
    .eq("household_id", await getHouseholdId());

  if (error) {
    console.error(error);
    return;
  }

  card.classList.toggle("completed", completed);
}

const householdId = await getHouseholdId();

supabaseClient

  .channel("shopping-list-" + householdId)

  .on(
    "postgres_changes",

    {
      event: "*",
      schema: "public",
      table: "shopping_list",
      filter: `household_id=eq.${householdId}`,
    },

    () => {
      loadShoppingList();
    },
  )

  .subscribe();