const categorySelect = document.getElementById("category");
const unitSelect = document.getElementById("unit");
const customUnitContainer = document.getElementById("custom-unit-container");
const form = document.getElementById("add-item-form");

let currentBarcode = null;

loadCategories();

async function loadCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  categorySelect.innerHTML = "";

  data.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = `${category.icon ?? ""} ${category.name}`;
    categorySelect.appendChild(option);
  });
}

unitSelect.addEventListener("change", () => {
  if (unitSelect.value === "Custom") {
    customUnitContainer.classList.remove("hidden");
  }
});

document.getElementById("add-category").addEventListener("click", async () => {
  const name = prompt("Category name:");

  if (!name) return;

  const icon = prompt("Category icon (emoji):") || "📦";

  const { data, error } = await supabaseClient
    .from("categories")
    .insert({
      name: name,
      icon: icon,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Failed to add category");
    return;
  }

  const option = document.createElement("option");
  option.value = data.id;
  option.textContent = `${data.icon} ${data.name}`;
  option.selected = true;
  categorySelect.appendChild(option);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("item-name").value;

  const quantity = Number(document.getElementById("quantity").value);

  let unit = unitSelect.value;

  if (unit === "Custom") {
    unit = document.getElementById("custom-unit").value;
  }

  const minimum = Number(document.getElementById("minimum").value);

  const expiry = document.getElementById("expiry").value || null;

  const category_id = categorySelect.value;

  const householdId = await getHouseholdId();

  const { error } = await supabaseClient.from("items").insert({
    name: name,
    quantity: quantity,
    unit: unit,
    minimum: minimum,
    expiry: expiry,
    barcode: currentBarcode,
    category_id: category_id,
    household_id: householdId,
  });

  if (error) {
    console.error(error);
    alert("Could'nt save item");
    return;
  }

  await addActivity(
    `${name} Added`,
    `${quantity} ${unit} added to inventory`,
    "fa-plus",
  );

  window.location.href = "inventory.html";
});

const scanButton = document.getElementById("scan-barcode");
const scanner = document.getElementById("scanner");
scanButton.addEventListener("click", () => {
  console.log("Scan button clicked");
  scanner.style.display = "block";

  const html5QrCode = new Html5Qrcode("scanner");
  html5QrCode.start(
    {
      facingMode: "environment",
    },
    {
      fps: 10,
      qrbox: 250,
    },

    async (barcode) => {
      console.log("Barcode:", barcode);
      currentBarcode = barcode;
      await html5QrCode.stop();
      scanner.style.display = "none";
      lookupBarcode(barcode);
    },
  );
});

async function lookupBarcode(barcode) {
  const { data: cached, error } = await supabaseClient

    .from("barcode_history")

    .select("*")

    .eq("barcode", barcode)

    .maybeSingle();

  if (cached) {
    console.log("Using saved barcode");

    document.getElementById("item-name").value = cached.name;

    document.getElementById("unit").value = cached.unit || "item";

    return;
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}`,
  );

  const data = await response.json();

  if (!data.product) {
    alert("Product not found");

    return;
  }

  const product = data.product;

  const name = product.product_name || "Unknown Product";

  document.getElementById("item-name").value = name;

  document.getElementById("unit").value = "item";

  await supabaseClient

    .from("barcode_history")

    .insert({
      barcode: barcode,

      name: name,

      unit: "item",
    });

  console.log("Saved barcode:", barcode);
}