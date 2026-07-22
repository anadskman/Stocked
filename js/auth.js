const demoButton = document.getElementById("demo-login");

const loginButton = document.getElementById("login-button");

const signupButton = document.getElementById("signup-button");

if (demoButton) {
  demoButton.onclick = async () => {

    const { data, error } = await supabaseClient
      .from("households")
      .select("id")
      .eq("invite_code", "DEMO")
      .single();

    if (error) {
      console.error(error);
      alert("Demo household not found.");
      return;
    }

    localStorage.setItem("mode", "demo");
    localStorage.setItem("demo_household_id", data.id);

    window.location.href = "dashboard.html";
  };
}

if (loginButton) {
  loginButton.onclick = async () => {
    const email = prompt("Email");

    const password = prompt("Password");

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,

      password,
    });

    if (error) {
      alert(error.message);

      return;
    }

    localStorage.removeItem("mode");
    localStorage.removeItem("demo_household_id");

    checkSetup();
  };
}

if (signupButton) {
  signupButton.onclick = async () => {
    const name = prompt("Name");

    const email = prompt("Email");

    const password = prompt("Password");

    const { error } = await supabaseClient.auth.signUp({
      email,

      password,

      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      alert(error.message);

      return;
    }

    window.location.href = "setup.html";
  };
}

async function checkSetup() {

    const user = await getCurrentUser();

    if(!user){
        window.location.href = "index.html";
        return;
    }


    const { data, error } = await supabaseClient
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();


    if(error){

        console.error(error);
        return;

    }


    if(data?.household_id){

        window.location.href = "dashboard.html";

    } else {

        window.location.href = "setup.html";

    }

}
