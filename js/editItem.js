const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");

if(!itemId){
    window.location.href = "inventory.html";
}

async function loadCategories() {
    const {data} = await supabaseClient
        .from("categories")
        .select("*")
        .order("name");
    
    const select =
        document.getElementById("category");
    
    data.forEach(category=>{
        select.innerHTML += `
        <option value="${category.id}">
            ${category.icon} ${category.name}
        </option>
        `;
    });
}

async function loadTotalItems() {
    const householdId = await getHouseholdId();

    const {data,error} = await supabaseClient
        .from("items")
        .select("*")
        .eq("id",itemId)
        .eq(
            "household_id",
            householdId
        )
        .single();

    if(error){
        console.error(error);
        return;
    }

    document.getElementById("item-name").value =
        data.name;

    document.getElementById("quantity").value =
        data.quantity;

    document.getElementById("minimum").value =
        data.minimum;

    document.getElementById("unit").value =
        data.unit;

    document.getElementById("expiry").value =
        data.expiry ?? "";

    document.getElementById("category").value =
        data.category_id;
}

loadCategories().then(loadTotalItem);

document
.getElementById("edit-item-form")
.addEventListener("submit", async(e)=>{
    e.preventDefault();

    const updates={
        name:
        document.getElementById("item-name").value,

        quantity:
        Number(document.getElementById("quantity").value),

        minimum:
        Number(document.getElementById("minimum").value),

        unit:
        document.getElementById("unit").value,

        expiry:
        document.getElementById("expiry").value || null,

        category_id:
        document.getElementById("category").value
    };

    const householdId = await getHouseholdId();

    const { error } = await supabaseClient
      .from("items")
      .update(updates)
      .eq("id", itemId)
      .eq("household_id", householdId);

    if(error){
        console.error(error);
        return;
    }

    await addActivity(
        `${updates.name} Edited`,
        "Item updated",
        "fa-pen"
    );

    window.location.href="inventory.html"
});

document
.getElementById("delete-item")
.addEventListener("click",async()=>{

    if(!confirm("Delete this item?"))
        return;

    const householdId = await getHouseholdId();

    const { data } = await supabaseClient

      .from("items")

      .select("name")

      .eq("id", itemId)

      .eq("household_id", householdId)

      .single();

    await supabaseClient

      .from("shopping_list")

      .delete()

      .eq("item_id", itemId)
      .eq("household_id", householdId);

    const { error } = await supabaseClient

      .from("items")

      .delete()

      .eq("item_id", itemId)
      .eq("household_id", householdId);

    if(error){

        console.error(error);

        return;

    }

    await addActivity(

        `${data.name} Deleted`,

        "Removed from inventory",

        "fa-trash"

    );

    window.location.href="inventory.html";

});