const ingredientBox = document.getElementById("ingredients");

let ingredients = [];

document
  .getElementById("add-ingredient")
  .addEventListener("click", addIngredientRow);

async function addIngredientRow() {
  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .order("name");


if(error){

    console.error(error);
    return;

}

  const row = document.createElement("div");
  row.className = "ingredient-row";

  row.innerHTML = `

        <select class="ingredient-item">

            ${data
              .map(
                (item) => `
                <option value="${item.id}">
                    ${item.name}
                </option>
            `,
              )
              .join("")}

        </select>

        <input
            class="ingredient-quantity"
            type="number"
            value="1"
            min="1">

    `;

  document.getElementById("ingredients").appendChild(row);
}

document.getElementById("recipe-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const household = await getHouseholdId();

  const { data: recipe, error } = await supabaseClient

    .from("recipes")

    .insert({
      household_id: household,

      name: document.getElementById("recipe-name").value,

      description: document.getElementById("description").value,
    })

    .select()

    .single();

  if (error) {
    console.error(error);

    return;
  }

  const ingredientRows = document.querySelectorAll(".ingredient-row");


const inserts = Array.from(ingredientRows).map(row => {

    return supabaseClient
        .from("recipe_items")
        .insert({

            recipe_id: recipe.id,

            item_id:
            row.querySelector(".ingredient-item").value,

            quantity:
            Number(
                row.querySelector(".ingredient-quantity").value
            ),

            unit: ""

        });

});


const results = await Promise.all(inserts);


const failed = results.find(result => result.error);


if(failed){

    console.error(
        "Ingredient insert failed:",
        failed.error
    );

    return;

}


window.location.href = "recipes.html";
});
