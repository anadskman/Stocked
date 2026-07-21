async function getUser() {

    const user = await getCurrentUser();

    if(!user){

        window.location.href = "index.html";

        return null;

    }

    return user;

}


document
.getElementById("create-household")
.onclick = createHousehold;


document
.getElementById("join-household")
.onclick = joinHousehold;



async function createHousehold(){

    const name = prompt("Household name");


    if(!name)
        return;


    const user = await getUser();


    if(!user)
        return;



    const code =
    Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();



    const {data:house,error} =
    await supabaseClient

    .from("households")

    .insert({

        name:name,

        invite_code:code,

        owner_id:user.id

    })

    .select()

    .single();



    if(error){

        console.error(error);

        alert("Could not create household");

        return;

    }



    await supabaseClient

    .from("profiles")

    .update({

        household_id:house.id

    })

    .eq("id",user.id);



    await supabaseClient

    .from("household_members")

    .insert({

        household_id:house.id,

        user_id:user.id,

        role:"owner"

    });



    alert(
        "Household created. Code: " + code
    );


    window.location.href="dashboard.html";

}





async function joinHousehold(){

    const code =
    prompt("Invite code");


    if(!code)
        return;



    const user = await getUser();


    if(!user)
        return;



    const {data:house,error} =
    await supabaseClient

    .from("households")

    .select("*")

    .eq("invite_code",code.toUpperCase())

    .single();



    if(error || !house){

        alert("Invalid code");

        return;

    }



    await supabaseClient

    .from("profiles")

    .update({

        household_id:house.id

    })

    .eq("id",user.id);



    await supabaseClient

    .from("household_members")

    .insert({

        household_id:house.id,

        user_id:user.id,

        role:"member"

    });



    window.location.href="dashboard.html";

}