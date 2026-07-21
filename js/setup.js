async function getUser() {
  return await getCurrentUser();
}

document.getElementById("create-household").onclick = createHousehold;

document.getElementById("join-household").onclick = joinHousehold;

async function createHousehold() {
  const name = prompt("Household name");

  if (!name) return;

  const user = await getUser();

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: house, error } = await supabaseClient

    .from("households")

    .insert({
      name: name,

      invite_code: code,

      owner_id: user.id,
    })

    .select()

    .single();

  if (error) {
    console.error(error);

    return;
  }

  await supabaseClient

    .from("profiles")

    .update({
      household_id: house.id,
    })

    .eq("id", user.id);

  await supabaseClient

    .from("household_members")

    .insert({
      household_id: house.id,

      user_id: user.id,

      role: "owner",
    });

  alert("Household created. Code: " + code);

  window.location.href = "dashboard.html";
}

async function joinHousehold() {
  const code = prompt("Invite code");

  const user = await getUser();

  const { data: house, error } = await supabaseClient

    .from("houses")

    .select("*")

    .eq("invite_code", code)

    .single();

  if (error || !house) {
    alert("Invalid code");

    return;
  }

  await supabaseClient

    .from("profiles")

    .update({
      household_id: house.id,
    })

    .eq("id", user.id);

  await supabaseClient

    .from("household_members")

    .insert({
      household_id: house.id,

      user_id: user.id,
    });

  window.location.href = "dashboard.html";
}
