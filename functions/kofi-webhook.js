// Payment acknowledgments are idempotent: Ko-fi may retry the same delivery.
const {createHash,timingSafeEqual}=require('node:crypto');
function sameToken(actual,expected){
    if(typeof actual!=='string'||typeof expected!=='string'||!expected)return false;
    const a=Buffer.from(actual),b=Buffer.from(expected);
    return a.length===b.length&&timingSafeEqual(a,b);
}
function createKofiWebhook({db,getVerificationToken,increment,logger=console,now=Date.now}){
    return async(req,res)=>{
        if(req.method!=='POST'){res.status(405).send('Method Not Allowed');return;}
        let payload;
        try{payload=typeof req.body?.data==='string'?JSON.parse(req.body.data):req.body;}
        catch(_){res.status(400).send('Bad Payload');return;}
        if(!payload||typeof payload!=='object'||Array.isArray(payload)){res.status(400).send('Bad Payload');return;}
        const expected=getVerificationToken();
        if(!expected){logger.error('Ko-fi verification secret is not configured.');res.status(503).send('Temporarily Unavailable');return;}
        if(!sameToken(payload.verification_token,expected)){res.status(401).send('Unauthorized');return;}
        const amount=typeof payload.amount==='number'?payload.amount:typeof payload.amount==='string'&&/^\d+(?:\.\d{1,2})?$/.test(payload.amount)?Number(payload.amount):NaN;
        const eventId=payload.message_id||payload.kofi_transaction_id;
        if(!Number.isFinite(amount)||amount<=0||typeof eventId!=='string'||!eventId||eventId.length>200){res.status(400).send('Bad Payment');return;}
        const match=typeof payload.message==='string'&&payload.message.match(/\b[a-zA-Z0-9]{20,128}\b/);
        if(!match){res.status(200).send('Received, but no valid ID found.');return;}
        const cloudSaveId=match[0],receiptId=createHash('sha256').update(eventId).digest('hex');
        try{
            const result=await db.runTransaction(async transaction=>{
                const receiptRef=db.collection('kofiWebhookReceipts').doc(receiptId),userRef=db.collection('users').doc(cloudSaveId);
                const receipt=await transaction.get(receiptRef);
                if(receipt.exists)return 'Already processed';
                const user=await transaction.get(userRef);
                if(!user.exists)return 'No matching save data found.';
                const update={isSupporter:true,totalTipAmount:increment(amount)};
                if(amount>=5)update.eligibleForGameKey=true;
                transaction.update(userRef,update);
                transaction.set(receiptRef,{cloudSaveId,amount,currency:typeof payload.currency==='string'?payload.currency:null,processedAt:now()});
                return 'Success';
            });
            res.status(200).send(result);
        }catch(error){logger.error('Error processing Ko-fi webhook',error);res.status(500).send('Internal Server Error');}
    };
}
module.exports={createKofiWebhook,sameToken};
