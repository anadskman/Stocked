const recipeList = document.getElementById("recipe-list");

loadRecipes();

async function loadRecipes() {

    recipeList.innerHTML = "";

    const { data: recipes, error } = await supabaseClient
        .from("recipes")
        .select("*")
        .order("name");

    if (error) {
        console.error(error);
        return;
    }

    for (const recipe of recipes) {
        await createRecipeCard(recipe);
    }

}

async function createRecipeCard(recipe) {

    const { data: ingredients } = await supabaseClient
        .from("recipe_items")
        .select(`
            quantity,
            items (
                name,
                quantity,
                unit
            )
        `)
        .eq("recipe_id", recipe.id);

    let missing = 0;

    ingredients.forEach(item => {

        if (!item.items)
            return;

        if (item.items.quantity < item.quantity)
            missing++;

    });

    let status = "Can Make";
    let statusClass = "status-green";

    if (missing > 0 && missing <= 2) {

        status = `Missing ${missing}`;
        statusClass = "status-orange";

    }

    if (missing > 2) {

        status = `Missing ${missing}`;
        statusClass = "status-red";

    }

    recipeList.innerHTML += `

        <div class="recipe-card"
            onclick="location.href='recipe.html?id=${recipe.id}'">

            <h3>${recipe.name}</h3>

            <p>${recipe.description ?? ""}</p>

            <div class="recipe-footer">

                <span class="recipe-status ${statusClass}">
                    ${status}
                </span>

                <i class="fa-solid fa-chevron-right"></i>

            </div>

        </div>

    `;

}