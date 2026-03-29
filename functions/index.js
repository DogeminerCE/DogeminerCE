const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Restrict concurrency
setGlobalOptions({ maxInstances: 5 });

// Ko-fi Verification Token directly requested by user
const KOFI_VERIFICATION_TOKEN = "75f40def-67ac-49ef-bc24-da82ac457512";

exports.kofiWebhook = onRequest(async (req, res) => {
    // Ko-fi sends POST requests. Sometimes the payload is url-encoded under the 'data' parameter,
    // sometimes parsing depends on headers.
    if (req.method !== 'POST') {
        logger.error("Invalid Request Method", { method: req.method });
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        let payload;

        // Parse payload (Ko-Fi usually sends 'data' param as a JSON string when urlencoded)
        if (req.body && req.body.data) {
            payload = JSON.parse(req.body.data);
        } else if (req.body && typeof req.body === 'object') {
            payload = req.body;
        } else {
            logger.error("Missing payload body");
            res.status(400).send("Bad Payload");
            return;
        }

        // 1. Verify Verification Token
        if (payload.verification_token !== KOFI_VERIFICATION_TOKEN) {
            logger.error("Verification via Ko-Fi token failed.");
            res.status(401).send("Unauthorized");
            return;
        }

        const amount = parseFloat(payload.amount);
        const supporterMessage = payload.message || "";
        
        // 2. Extract Cloud Save ID (Assumed length > 15 to filter out random message nonsense)
        // Find a string in the message that looks like a 20+ character Firebase ID 
        // Example Match: A1b2C3d4E5f6G7h8I9j0
        const idRegex = /[a-zA-Z0-9]{20,}/;
        const match = supporterMessage.match(idRegex);
        
        if (!match) {
            logger.warn("Could not find a valid Cloud Save ID in message.", { message: supporterMessage });
            // Cannot process rewards without ID, but return 200 so Ko-Fi knows we got the signal.
            res.status(200).send("Received, but no valid ID found.");
            return;
        }

        const cloudSaveId = match[0];
        logger.info(`Valid Tip Detected for Save ID: ${cloudSaveId}. Amount: ${amount}`);

        // 3. Process the Rewards securely on the backend
        const docRef = db.collection('users').doc(cloudSaveId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            logger.error(`Document ${cloudSaveId} not found in Firestore.`);
            res.status(200).send("No matching save data found.");
            return;
        }

        // Prepare the payload to push to Firestore
        const updateData = {
            isSupporter: true,
            totalTipAmount: admin.firestore.FieldValue.increment(amount)
        };

        if (amount >= 5.0) {
            updateData.eligibleForGameKey = true;
        }

        await docRef.update(updateData);
        
        logger.info(`Successfully granted Supporter perks to Save ID: ${cloudSaveId}.`);
        res.status(200).send("Success");

    } catch (error) {
        logger.error("Error processing Ko-Fi webhook", error);
        res.status(500).send("Internal Server Error");
    }
});
