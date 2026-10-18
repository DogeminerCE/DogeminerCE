const {setGlobalOptions}=require('firebase-functions/v2');
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const logger=require('firebase-functions/logger');
const admin=require('firebase-admin');
const {createKofiWebhook}=require('./kofi-webhook');
admin.initializeApp();
setGlobalOptions({maxInstances:5});
const verificationToken=defineSecret('KOFI_VERIFICATION_TOKEN');
exports.kofiWebhook=onRequest({secrets:[verificationToken]},createKofiWebhook({
    db:admin.firestore(),getVerificationToken:()=>verificationToken.value(),
    increment:amount=>admin.firestore.FieldValue.increment(amount),logger
}));
