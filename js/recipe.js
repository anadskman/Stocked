const params = new URLSearchParams(location.search);
const recipeId = params.get("id");

loadRecipe();

async function loadRecipe() {
  const { data: recipe } = await supabaseClient
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  document.getElementById("recipe-header").innerHTML = `
        <div class="recipe-header">
            <h1>${recipe.name}</h1>
            <p>${recipe.description ?? ""}</p>
        </div>
    `;

  const { data: ingredients } = await supabaseClient
    .from("recipe_items")
    .select(
      `
        *,
        items(*)
    `,
    )
    .eq("recipe_id", recipeId);

  const list = document.getElementById("ingredient-list");

  list.innerHTML = "";

  let missing = [];

  let have = 0;

  ingredients.forEach((item) => {
    const enough = item.items && item.items.quantity >= item.quantity;

    if (enough) have++;

    if (!enough) missing.push(item);

    list.innerHTML += `
            <div class="ingredient-card">

                <div>

                    <strong>${item.items.name}</strong>

                    <br>

                    ${item.quantity} ${item.items.unit}

                </div>

                <div class="${enough ? "have" : "need"}">

                    ${enough ? "✔ In Stock" : "✖ Missing"}

                </div>

            </div>
        `;
  });

  document.getElementById("recipe-summary").innerHTML = `

    <div class="recipe-card">
  
        <h3>Recipe Status</h3>
  
        <p>
  
            ${have} of
            ${ingredients.length}
            ingredients available
  
        </p>
  
    </div>
  
    `;

  document.getElementById("shopping-button").onclick = () => {
    addMissingItems(missing);
  };
}

async function addMissingItems(missing) {
  for (const ingredient of missing) {
    const existing = await supabaseClient

      .from("shopping_list")

      .select("*")

      .eq("item_id", ingredient.item_id)

      .maybeSingle();

    if (existing.data) continue;

    await supabaseClient

      .from("shopping_list")

      .insert({
        item_id: ingredient.item_id,

        quantity_needed: ingredient.quantity,

        completed: false,
      });
  }

  alert("Missing ingredients added.");
}
