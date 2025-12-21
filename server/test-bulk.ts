
import dotenv from 'dotenv';
dotenv.config();

// Standard fetch is available in Node 18+ or via TSX
// We will test if the API accepts an array of phones

async function getWhatsAppToken() {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    try {
        const response = await fetch("http://167.172.24.203:5001/get-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, clientSecret }),
        });
        if (!response.ok) return null;
        const data: any = await response.json();
        return data.access_token || data.token;
    } catch (error) {
        return null;
    }
}

async function testBulk() {
    console.log("Fetching token...");
    const token = await getWhatsAppToken();
    console.log("Token:", token ? "Obtained" : "Failed (Using placeholder)");

    const validToken = token || process.env.WHATSAPP_API_TOKEN || "YOUR_TOKEN_HERE";

    // Test Data: Array of phones
    // CAUTION: This will try to send messages if the API supports it. 
    // Using the same number twice to see if it handles arrays.
    // The number 563238044 was seen in user logs.
    const testPayload = {
        phone: ["563238044", "563238044"],
        message: "Test Bulk Send"
    };

    console.log("Sending Payload:", JSON.stringify(testPayload));

    try {
        const response = await fetch("http://167.172.24.203:5001/wp/send?cid=default_client_id1", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${validToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(testPayload),
        });

        console.log(`Response Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

testBulk();
