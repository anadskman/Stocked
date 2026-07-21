loadAnalytics();

async function loadAnalytics() {
  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient.from("consumption").select(`
amount,
created_at,
items(
name
)
`);

  if (error) {
    console.error(error);

    return;
  }

  const now = new Date();

  const weekAgo = new Date();

  weekAgo.setDate(now.getDate() - 7);

  const monthAgo = new Date();

  monthAgo.setDate(now.getDate() - 30);

  let weekly = 0;

  let monthly = 0;

  const usage = {};

  data.forEach((entry) => {
    const date = new Date(entry.created_at);

    if (date >= weekAgo) {
      weekly += entry.amount;
    }

    if (date >= monthAgo) {
      monthly += entry.amount;
    }

    const name = entry.items?.name;

    if (name) {
      if (!usage[name]) usage[name] = 0;

      usage[name] += entry.amount;
    }
  });

  document.getElementById("weekly-usage").textContent = weekly;

  document.getElementById("monthly-usage").textContent = monthly;

  const sorted = Object.entries(usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const list = document.getElementById("usage-list");

  list.innerHTML = "";

  sorted.forEach((item) => {
    list.innerHTML += `

<div class="usage-item">

<strong>
${item[0]}
</strong>

<span>
${item[1]} used
</span>


</div>

`;
  });
}
