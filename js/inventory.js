const inventoryList = document.getElementById("inventory-list");
const search = document.getElementById("search-items");

loadInventory();

async function loadInventory() {

    inventoryList.innerHTML = "";

    const householdId = await getHouseholdId();

    const { data, error } = await supabaseClient
      .from("items")
      .select(
        `
        *,
        categories (
            name,
            icon
        )
    `,
      )
      .eq("household_id", householdId)
      .order("name");


    if (error) {
        console.error(error);
        return;
    }


    data.forEach(createInventoryCard);
}

function createInventoryCard(item) {


    const percentage = Math.min(
        (item.quantity / (item.minimum * 2)) * 100,
        100
    );


    let status = "In Stock";
    let statusClass = "status-good";


    if (item.quantity === 0) {

        status = "Out of Stock";
        statusClass = "status-danger";

    } else if (item.quantity <= item.minimum) {

        status = "Low Stock";
        statusClass = "status-warning";

    }

    const card = document.createElement("div");

    card.className = "inventory-card";

    card.dataset.id = item.id;
    card.dataset.minimum = item.minimum;

    card.innerHTML = `

        <div class="card-top">

            <div>

                <h3>${item.name}</h3>

                <p class="category">
                    ${item.categories?.icon ?? "📦"}
                    ${item.categories?.name ?? "No Category"}
                </p>

            </div>


            <span class="${statusClass}">
                ${status}
            </span>

        </div>


        <p class="stock-text">

            <span class="quantity">
                ${item.quantity}
            </span>

            ${item.unit}

        </p>


        <p class="expiry-status">
            ${getExpiryStatus(item.expiry)}
        </p>


        <div class="stock-bar">

            <div
                class="stock-fill"
                style="width:${percentage}%">
            </div>

        </div>


        <p class="minimum">

            Minimum:
            ${item.minimum}
            ${item.unit}

        </p>


        <div class="quantity-control">

            <button class="minus">

                <i class="fa-solid fa-minus"></i>

            </button>


            <span class="quantity-display">
                ${item.quantity}
            </span>


            <button class="plus">

                <i class="fa-solid fa-plus"></i>

            </button>

        </div>

    `;

    card.querySelector(".minus")
        .addEventListener("click", () => {

            changeQuantity(card, item, -1);

        });

    card.querySelector(".plus")
        .addEventListener("click", () => {

            changeQuantity(card, item, 1);

        });

    inventoryList.appendChild(card);

    card.addEventListener("click",(e)=>{

    if(e.target.closest("button"))
        return;

    window.location.href=
        `edit-item.html?id=${item.id}`;

    });

}

async function changeQuantity(card, item, amount) {

    const buttons = card.querySelectorAll("button");

    const display = card.querySelector(".quantity-display");

    const stockText = card.querySelector(".quantity");

    const oldQuantity = Number(
        display.textContent
    );

    const householdId = await getHouseholdId();

    const newQuantity = Math.max(
        oldQuantity + amount,
        0
    );

    item.quantity = newQuantity;

    const difference = oldQuantity - newQuantity;

    if (difference > 0) {
      await supabaseClient.from("consumption").insert({
        household_id: householdId,

        item_id: item.id,

        amount: difference,
      });
    }

    display.textContent = newQuantity;

    stockText.textContent = newQuantity;

    updateStatus(
        card,
        newQuantity,
        item.minimum
    );

    buttons.forEach(button => {

        button.disabled = true;

    });

    card.classList.add("saving");

    const { error } = await supabaseClient

        .from("items")

        .update({

            quantity:newQuantity

        })

        .eq("id", item.id);


    if(error){

        console.error(error);


        display.textContent = oldQuantity;

        stockText.textContent = oldQuantity;


        item.quantity = oldQuantity;


        updateStatus(
            card,
            oldQuantity,
            item.minimum
        );


        buttons.forEach(button => {

            button.disabled = false;

        });


        card.classList.remove("saving");

        return;

    }

    await addActivity(

        `${item.name} Updated`,

        `Quantity changed to ${newQuantity} ${item.unit}`,

        "fa-pen"

    );


    await syncShoppingList(

        item,
        newQuantity

    );


    buttons.forEach(button => {

        button.disabled = false;

    });


    card.classList.remove("saving");

}

function updateStatus(card, quantity, minimum) {

    const status = card.querySelector(
        ".status-good, .status-warning, .status-danger"
    );

    status.classList.remove(
        "status-good",
        "status-warning",
        "status-danger"
    );

    if(quantity === 0){

        status.textContent = "Out of Stock";

        status.classList.add(
            "status-danger"
        );

    } else if(quantity <= minimum){

        status.textContent = "Low Stock";

        status.classList.add(
            "status-warning"
        );

    } else {

        status.textContent = "In Stock";

        status.classList.add(
            "status-good"
        );


    }

    const fill = card.querySelector(".stock-fill");


    const percentage = Math.min(

        (quantity / (minimum * 2)) * 100,

        100

    );


    fill.style.width = `${percentage}%`;

}

async function syncShoppingList(item, quantity) {

    const minimum = item.minimum;

    const householdId = await getHouseholdId();

    const { data: existing, error } = await supabaseClient
      .from("shopping_list")
      .select("*")
      .eq("item_id", item.id)
      .eq("household_id", householdId)
      .maybeSingle();

    if(error){

        console.error(error);

        return;

    }


    if(quantity <= minimum){

        if(existing){

            await supabaseClient

                .from("shopping_list")

                .update({

                    quantity_needed:
                    minimum - quantity + 1

                })

                .eq(
                    "id",
                    existing.id
                );

        } else {

            await supabaseClient

              .from("shopping_list")

              .insert({
                item_id: item.id,

                household_id: householdId,

                quantity_needed: minimum - quantity + 1,

                completed: false,
              });

            await addActivity(

                `${item.name} Low Stock`,

                "Added to shopping list",

                "fa-cart-shopping"

            );


        }

    } else {
        
        if(existing){

            await supabaseClient

                .from("shopping_list")

                .delete()

                .eq(
                    "id",
                    existing.id
                );

            await addActivity(

                `${item.name} Restocked`,

                "Removed from shopping list",

                "fa-check"

            );


        }

    }

}

search.addEventListener("input", () => {

    const value = search.value.toLowerCase();

    document.querySelectorAll(".inventory-card")

        .forEach(card => {


            const title =
                card.querySelector("h3")
                .textContent
                .toLowerCase();



            card.style.display =
                title.includes(value)
                ? "flex"
                : "none";


        });


});

function getExpiryStatus(date){


    if(!date)
        return "";



    const today = new Date();

    const expiry = new Date(date);



    const days = Math.ceil(

        (expiry - today) /

        (1000 * 60 * 60 * 24)

    );



    if(days < 0){

        return "❌ Expired";

    }



    if(days <= 3){

        return `⚠️ Expires in ${days} days`;

    }



    return `📅 Expires in ${days} days`;

}