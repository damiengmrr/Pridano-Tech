const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createContactHandler,validateContact}=require('../server/handlers/contact');
const {handler:netlify}=require('../netlify/functions/contact');
const valid={name:'Test local',email:'test@example.test',company:'QA',phone:'',message:'Vérification locale du parcours de contact.',projectType:'site',consent:true};
test('contact rejects invalid email, consent, type, oversized fields and honeypot',()=>{
 for(const changes of [{email:'incorrect'},{consent:false},{consent:'true'},{projectType:'unknown'},{message:'court'},{name:'x'.repeat(121)},{website:'spam'},{email:['test@example.test']}]) assert.ok(validateContact({...valid,...changes}).error);
});
test('invalid requests never reach email transport',async()=>{
 let calls=0;const handler=createContactHandler(async()=>{calls++;});
 const result=await handler({body:{}});assert.equal(result.statusCode,400);assert.equal(calls,0);
});
test('confirmation requires transport delivery id and preserves reply-to',async()=>{
 let email;const handler=createContactHandler(async message=>{email=message;return{id:'local-mock-id'};});
 const result=await handler({body:{...valid,name:'<script>bad</script>'}});
 assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).ok,true);assert.equal(email.replyTo,valid.email);assert.ok(!email.html.includes('<script>'));assert.ok(email.html.includes('&lt;script&gt;'));
});
test('transport errors and missing delivery acknowledgement are failures, never fake success',async()=>{
 for(const send of [async()=>{throw Error('Unavailable');},async()=>({})]) {const result=await createContactHandler(send)({body:valid});assert.equal(result.statusCode,503);assert.equal(JSON.parse(result.body).ok,false);}
});
test('Netlify endpoint rejects GET and malformed JSON',async()=>{
 assert.equal((await netlify({httpMethod:'GET',headers:{}})).statusCode,405);
 assert.equal((await netlify({httpMethod:'POST',body:'{',headers:{}})).statusCode,400);
});
