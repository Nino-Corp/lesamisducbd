const url = "https://lesamisducbd.fr/api";
const key = "A71ZSF7AV89ZG3K84NPH6M83DAV81LQC";

async function inspectProfile() {
    // 1. Fetch customer by email
    const email = 'test4@test.com'; // user's test email
    const getRes = await fetch(`${url}/customers?ws_key=${key}&output_format=JSON&display=full&filter[email]=${email}`);
    const getData = await getRes.json();
    console.log("Customer data (JSON):", JSON.stringify(getData?.customers?.[0] || {}, null, 2));

    // 2. Fetch the XML schema forPUT to see required fields
    if (getData?.customers?.[0]?.id) {
        const id = getData.customers[0].id;
        const xmlRes = await fetch(`${url}/customers/${id}?ws_key=${key}`);
        const xmlText = await xmlRes.text();
        console.log("\nCustomer XML skeleton for PUT:");
        console.log(xmlText.substring(0, 1000)); // just print the first part
    }
}
inspectProfile().catch(console.error);
