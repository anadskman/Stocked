const receiptButton = document.getElementById("scan-receipt");

const receiptInput = document.getElementById("receipt-image");

if (receiptButton) {
  receiptButton.addEventListener("click", () => {
    receiptInput.click();
  });
}

if (receiptInput) {
  receiptInput.addEventListener("change", async () => {
    const image = receiptInput.files[0];

    if (!image) return;

    console.log("Reading receipt...");

    const result = await Tesseract.recognize(image, "eng", {
      tessedit_pageseg_mode: 6,
      preserve_interword_spaces: true,
      logger: (m) => {
        console.log(m);
      },
    });

    const text = result.data.text;

    console.log(text);

    processReceipt(text);
  });
}

const productFixes = {
  MILK: "Milk",

  BREAD: "Bread",

  EGG: "Eggs",

  CHICKEN: "Chicken",

  FRIES: "Fries",

  COLA: "Cola",

  "TOILET TISSUE": "Toilet Paper",
};

function processReceipt(text) {
  const lines = text

    .split("\n")

    .map((line) => line.trim())

    .filter((line) => line.length > 2);

  const ignoreWords = [
    "TOTAL",
    "SUBTOTAL",
    "VAT",
    "CHANGE",
    "CASH",
    "CARD",
    "THANK",
    "WELCOME",
    "RECEIPT",
    "STORE",
    "ADDRESS",
    "TEL",
    "PHONE",
    "CUSTOMER",
    "LOYALTY",
    "CLUB",
    "FUND",
    "RECYCLING",
    "CONTRIBUTION",
    "STATUTORY",
    "RIGHTS",
    "EXCLUDING",
    "CLEARANCE",
    "CODE",
  ];

  const products = [];

  lines.forEach((line) => {
    const upper = line.toUpperCase();

    if (ignoreWords.some((word) => upper.includes(word))) {
      return;
    }

    let cleaned = line.replace(
      /\d+[.,]\d{2}/g,

      "",
    );

    cleaned = cleaned.replace(
      /[^a-zA-Z\s]/g,

      "",
    );

    cleaned = cleaned.trim();

    if (cleaned.length < 4) return;

    if (!/[a-zA-Z]/.test(cleaned)) return;

    const letters = (cleaned.match(/[a-zA-Z]/g) || []).length;

    if (letters / cleaned.length < 0.5) return;

    if (cleaned.length < 3) return;

    let finalName = cleaned;

    for (const key in productFixes) {
      if (cleaned.toUpperCase().includes(key)) {
        finalName = productFixes[key];
      }
    }

    const match = matchProduct(finalName);

    if (match) {
      products.push({
        name: match.name,

        category: match.category,

        quantity: 1,
      });
    } else {
      products.push({
        name: finalName,

        category: "Unknown",

        quantity: 1,
      });
    }
  });

  console.log("Parsed products:", products);

  showReceiptResults(products);
}

function showReceiptResults(products) {
  const container = document.getElementById("receipt-list");

  const box = document.getElementById("receipt-results");

  container.innerHTML = "";

  products.forEach((item, index) => {
    container.innerHTML += `

        <div class="receipt-item">

            <input 
            type="checkbox"
            checked
            data-index="${index}">


            <span>
            ${item.name}
            </span>


        </div>

        `;
  });

  box.style.display = "block";
}

function matchProduct(text) {
  const upper = text.toUpperCase();

  for (const product of productDictionary) {
    for (const keyword of product.keywords) {
      if (upper.includes(keyword)) {
        return product;
      }
    }
  }

  return null;
}