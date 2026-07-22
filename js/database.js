const supabaseClient = window.supabase.createClient(
  "https://jmnbzjduuwpozsbmfuel.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbmJ6amR1dXdwb3pzYm1mdWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mzk4MzYsImV4cCI6MjEwMDExNTgzNn0.Oyh6VitzFee5UFgfLSI20bXvGNcJJnoPgmNpoJ_Gq18",
);

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    console.error(error);

    return null;
  }

  return data.user;
}

async function getHouseholdId() {

    if (localStorage.getItem("mode") === "demo") {
        return localStorage.getItem("demo_household_id");
    }

    const user = await getCurrentUser();

    if (!user){
        return null;
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();

    if(error){
        console.error(error);
        return null;
    }

    return data.household_id;
}
