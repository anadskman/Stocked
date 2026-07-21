loadSettings();

async function loadSettings() {
  const householdId = await getHouseholdId();

  const { data, error } = await supabaseClient

    .from("households")

    .select("*")

    .eq("id", householdId)

    .single();

  if (error) {
    console.error(error);

    return;
  }

  document.getElementById("household-name").textContent = data.name;

  document.getElementById("invite-code").textContent = data.invite_code;
}

document.getElementById("copy-code").onclick = async () => {
  const code = document.getElementById("invite-code").textContent;

  await navigator.clipboard.writeText(code);

  alert("Invite code copied");
};

document.getElementById("logout").onclick = async () => {
  await supabaseClient.auth.signOut();

  localStorage.removeItem("mode");

  window.location.href = "index.html";
};

document.getElementById("leave-household").onclick = async () => {
  if (!confirm("Leave this household?")) return;

  const user = await getCurrentUser();

  await supabaseClient

    .from("profiles")

    .update({
      household_id: null,
    })

    .eq("id", user.id);

  await supabaseClient

    .from("household_members")

    .delete()

    .eq("user_id", user.id);

  window.location.href = "setup.html";
};

document
.getElementById("logout-button")
.addEventListener("click", async()=>{

    localStorage.removeItem("mode");

    await supabaseClient.auth.signOut();

    window.location.href="index.html";

});
