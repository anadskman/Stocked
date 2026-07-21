const demoButton = document.getElementById("demo-login");

const loginButton = document.getElementById("login-button");

const signupButton = document.getElementById("signup-button");

if (demoButton) {
  demoButton.onclick = () => {
    localStorage.setItem("mode", "demo");

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

  const { data } = await supabaseClient

    .from("profiles")

    .select("household_id")

    .eq("id", user.id)

    .single();

  if (data.household_id) {
    window.location.href = "dashboard.html";
  } else {
    window.location.href = "setup.html";
  }
}
