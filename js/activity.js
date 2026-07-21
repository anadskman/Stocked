async function addActivity(
    title,
    description,
    icon = "fa-box"
) {


    const householdId =
    await getHouseholdId();



    const { error } = await supabaseClient

        .from("activity")

        .insert({

            title,

            description,

            icon,

            household_id: householdId

        });



    if(error){

        console.error(error);

    }

}