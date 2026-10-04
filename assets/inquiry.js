export const INQUIRY_RECIPIENT='vivienalba1016@gmail.com';
export const INQUIRY_ENDPOINT=`https://formsubmit.co/ajax/${INQUIRY_RECIPIENT}`;

export class InquiryError extends Error {
  constructor(code){super(code);this.name='InquiryError';this.code=code;}
}

export async function submitInquiry(fields,{fetchImpl=globalThis.fetch,signal}={}) {
  const name=String(fields.name??'').trim();
  const email=String(fields.email??'').trim();
  const message=String(fields.message??'').trim();
  if(!name||name.length>100||!/^[^\s@]+@[^\s@]+$/.test(email)||email.length>254||!message||message.length>5000||fields.consent!==true||String(fields.honey??'').trim())throw new InquiryError('validation');
  const response=await fetchImpl(INQUIRY_ENDPOINT,{
    method:'POST',credentials:'omit',signal,
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({name,email,message,consent:'I agree to the Privacy Policy and to being contacted about this inquiry.',_subject:'New portfolio inquiry for Vivien Alba',_template:'table',_honey:''})
  });
  let result;
  try{result=await response.json();}catch{throw new InquiryError('service');}
  if(!response.ok)throw new InquiryError('service');
  if(/activat|confirm.{0,30}email|check.{0,30}inbox/i.test(String(result?.message??'')))throw new InquiryError('activation');
  if(result?.success!==true&&result?.success!=='true')throw new InquiryError('service');
  return {status:'submitted'};
}

export function initInquiryForm(form,{win=globalThis,fetchImpl=win.fetch?.bind(win),FormDataClass=win.FormData}={}) {
  const fields=form.querySelector('fieldset');
  const button=form.querySelector('[type="submit"]');
  const status=form.querySelector('[data-inquiry-status]');
  let pending=false,destroyed=false,controller,timer;
  const announce=(state,message)=>{form.dataset.state=state;status.textContent=message;};
  async function onSubmit(event){
    event.preventDefault();
    if(pending||destroyed||!form.reportValidity())return;
    const data=new FormDataClass(form);
    const values={name:data.get('name'),email:data.get('email'),message:data.get('message'),consent:data.get('consent')==='yes',honey:data.get('_honey')};
    pending=true;fields.disabled=true;button.textContent='Sending…';form.setAttribute('aria-busy','true');
    announce('pending','Sending your inquiry…');
    controller=new win.AbortController();
    timer=win.setTimeout(()=>controller.abort(),20000);
    try{
      await submitInquiry(values,{fetchImpl,signal:controller.signal});
      if(destroyed)return;
      form.reset();announce('success','Your inquiry was submitted. Thank you for getting in touch.');
    }catch(error){
      if(destroyed)return;
      const message=error.code==='activation'?'The inquiry form is temporarily unavailable. Your details are still here; please try again later.':error.code==='validation'?'Please check your details and agree to the privacy notice before sending.':'We couldn’t confirm your submission. Your details are still here; please try again.';
      announce('error',message);
    }finally{
      win.clearTimeout(timer);timer=undefined;controller=undefined;
      if(!destroyed){pending=false;fields.disabled=false;button.textContent='Send inquiry';form.setAttribute('aria-busy','false');}
    }
  }
  form.addEventListener('submit',onSubmit);
  return {destroy(){destroyed=true;controller?.abort();win.clearTimeout(timer);form.removeEventListener('submit',onSubmit);}};
}
