const params = new URLSearchParams(location.search);
const recipeId = params.get("id");

loadRecipe();


async function loadRecipe() {

    if(!recipeId){
        console.error("No recipe ID");
        return;
    }


    const householdId = await getHouseholdId();


    if(!householdId){
        console.error("No household");
        return;
    }



    const { data: recipe, error } = await supabaseClient
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .eq("household_id", householdId)
        .single();


    if(error){

        console.error("Recipe load error:", error);

        return;

    }



    document.getElementById("recipe-header").innerHTML = `

        <div class="recipe-header">

            <h1>${recipe.name}</h1>

            <p>${recipe.description ?? ""}</p>

        </div>

    `;




    const { data: ingredients, error: ingredientError } = await supabaseClient

        .from("recipe_items")

        .select(`
            *,
            items (
                name,
                quantity,
                unit,
                household_id
            )
        `)

        .eq("recipe_id", recipeId);



    if(ingredientError){

        console.error(ingredientError);

        return;

    }




    const list = document.getElementById("ingredient-list");

    list.innerHTML = "";



    let missing = [];

    let have = 0;




    ingredients.forEach((item)=>{


        if(!item.items)
            return;



        const enough =
            item.items.quantity >= item.quantity;



        if(enough){

            have++;

        } else {

            missing.push(item);

        }



        list.innerHTML += `

        <div class="ingredient-card">

            <div>

                <strong>
                    ${item.items.name}
                </strong>

                <br>

                ${item.quantity}
                ${item.items.unit}

            </div>


            <div class="${enough ? "have" : "need"}">

                ${enough ? "✔ In Stock" : "✖ Missing"}

            </div>


        </div>

        `;

    });




    document.getElementById("recipe-summary").innerHTML = `

    <div class="recipe-card">

        <h3>
            Recipe Status
        </h3>


        <p>

            ${have} of ${ingredients.length}
            ingredients available

        </p>

    </div>

    `;



    document.getElementById("shopping-button").onclick = () => {

        addMissingItems(missing);

    };

}





async function addMissingItems(missing){


    const householdId = await getHouseholdId();



    for(const ingredient of missing){


        const {data: existing} = await supabaseClient

            .from("shopping_list")

            .select("*")

            .eq("item_id", ingredient.item_id)

            .eq("household_id", householdId)

            .maybeSingle();



        if(existing)
            continue;



        await supabaseClient

            .from("shopping_list")

            .insert({

                item_id: ingredient.item_id,

                household_id: householdId,

                quantity_needed: ingredient.quantity,

                completed:false

            });

    }



    alert("Missing ingredients added.");

}
