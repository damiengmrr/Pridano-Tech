const { sendBriefEmail } = require('../lib/resend');
const { json } = require('./http');
const projectTypes = {site:'Création de site web',refonte:'Refonte de site web',saas:'SaaS / logiciel sur mesure',automatisation:'Automatisation / intégration',crm:'Pridano Business OS'};
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function validateContact(body) {
  if(!body || typeof body !== 'object' || Array.isArray(body)) return {error:'Le formulaire est incomplet.'};
  const data={};
  for(const [key,max] of Object.entries({name:120,company:160,email:254,phone:40,projectType:30,message:6000,website:200})) {
    if(body[key]!==undefined && typeof body[key]!=='string') return {error:'Le formulaire contient un champ invalide.'};
    data[key]=(body[key] || '').trim();
    if(data[key].length>max) return {error:'Un champ dépasse la longueur autorisée.'};
  }
  if(data.website) return {error:'La demande n’a pas pu être validée.'};
  if(!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /[\r\n]/.test(data.email) || !projectTypes[data.projectType] || data.message.length<15 || body.consent!==true) return {error:'Merci de vérifier votre nom, votre email, votre message et votre accord pour être recontacté.'};
  return {data};
}
function createContactHandler(send=sendBriefEmail) {
  return async function handleContact({body}) {
    const {data,error}=validateContact(body);
    if(error) return json(400,{ok:false,message:error});
    const lines=[`Type de projet : ${projectTypes[data.projectType]}`,`Nom : ${data.name}`,`Entreprise : ${data.company || 'Non renseignée'}`,`Email : ${data.email}`,`Téléphone : ${data.phone || 'Non renseigné'}`,'',data.message,'','Accord pour être recontacté : oui.'];
    try {
      const result=await send({subject:`Projet Pridano — ${projectTypes[data.projectType]}`,text:lines.join('\n'),html:`<h1>Nouvelle demande de projet</h1><p>${lines.map(escape).join('<br>')}</p>`,replyTo:data.email});
      if(!result?.id) throw new Error('MISSING_DELIVERY_ID');
      return json(200,{ok:true,message:'Votre demande a bien été transmise.'});
    } catch(error) {
      console.error('[contact] Email delivery failed:',error.code || 'DELIVERY_FAILED');
      return json(503,{ok:false,message:'L’envoi est momentanément indisponible.'});
    }
  };
}
module.exports={validateContact,createContactHandler,handleContact:createContactHandler()};
