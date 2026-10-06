import * as Anime from './vendor/anime.esm.min.js';
import {projects, sampleRows, cleanSample} from './data.js?v=lintel-2';
import {initProjectCarousel} from './carousel.js?v=credentials-carousel-1';
import {initInquiryForm} from './inquiry.js';
import {initPortfolioMotion,initMotionMenu} from './motion.js';
import {initDesk} from './desk.js';
import {initCarNavigation} from './navigation.js';

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const email='vivienalba1016@gmail.com';
export const policies={
  privacy:{title:'Privacy Policy',paragraphs:[
    'This portfolio does not require an account or use analytics or advertising trackers.',
    'When you submit an inquiry, your name, email address, message, and consent are sent to FormSubmit for delivery to Vivien Alba’s email inbox. These details are used to respond to your inquiry and are not added to a marketing list.',
    'FormSubmit processes submissions and says it retains them for 30 days. Its own privacy terms apply. Email providers may also process delivered inquiries. Please avoid sharing sensitive information in the form. For access or deletion requests, contact Vivien at '+email+'.',
    'The data-cleaning demonstration uses a fixed fictional sample inside your browser. It does not send sample data to a server.',
    'External project, certificate, and social links are governed by those services’ own policies.',
    'The hosting service may process technical information needed to deliver and protect the website, including connection and access information. For privacy questions, email '+email+'.'
  ]},
  terms:{title:'Terms & Conditions',paragraphs:[
    'This website presents Vivien Alba’s professional work and experience. Project previews and descriptions provide information about the work; they do not create a service contract.',
    'The small data-cleaning demo is illustrative and limited to the supplied sample. Review output from the full application before using it in a live business workflow.',
    'External projects and services may change or become unavailable. Brand names and third-party trademarks belong to their respective owners. Any professional engagement will have its own agreed scope and terms.',
    'For project inquiries and opportunities, email '+email+'.'
  ]},
  cookies:{title:'Cookie Policy',paragraphs:[
    'The portfolio code does not set advertising or analytics cookies.',
    'Essential hosting or access controls may be managed by the hosting service.',
    'No external contact-form scripts are loaded. With JavaScript enabled, inquiry submissions are sent to FormSubmit without including provider cookies. Without JavaScript, the form opens FormSubmit’s confirmation page, where its own cookie practices apply. Links to external services may also open websites that use their own cookies.'
  ]},
  refunds:{title:'Refund Policy',paragraphs:[
    'This portfolio does not take payments or sell products. No purchase is made through the website, so there is no website checkout to refund.',
    'If you agree to a paid project with Vivien Alba, payment, cancellation, and refund terms will be agreed separately in writing before work begins.'
  ]}
};

export function initPortfolio({doc=document,win=window,anime=Anime}={}) {
  const $=selector=>doc.querySelector(selector);
  const $$=selector=>Array.from(doc.querySelectorAll(selector));
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!reduced.matches;
  const effects=initPortfolioMotion({doc,win,anime,enabled:motion});
  const animate=effects.animate;
  doc.documentElement.classList.add('motion-ready');
  let toastTimer;
  const say=message=>{
    const element=$('.toast');element.textContent=message;element.classList.add('visible');
    win.clearTimeout(toastTimer);toastTimer=win.setTimeout(()=>element.classList.remove('visible'),2500);
  };
  function updateMotion(){
    motion=!reduced.matches;
    doc.documentElement.classList.toggle('no-motion',!motion);
    effects.setMotion(motion);
  }
  reduced.addEventListener('change',updateMotion);
  doc.documentElement.classList.toggle('no-motion',!motion);
  const desk=initDesk({doc,win,anime,effects,getMotion:()=>motion,onReset:()=>say('Back to a little order.')});

  const menu=$('#mobile-menu'),menuToggle=$('.menu-toggle');
  const mobileNavigation=initMotionMenu({menu,toggle:menuToggle,animate,getMotion:()=>motion,anime});
  const closeMenu=()=>mobileNavigation.close();
  menuToggle.addEventListener('click',()=>mobileNavigation.toggle());
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuToggle.focus();}});
  doc.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!menuToggle.contains(event.target))closeMenu();});
  menu.addEventListener('focusout',()=>win.setTimeout(()=>{if(!menu.hidden&&!menu.contains(doc.activeElement)&&doc.activeElement!==menuToggle)closeMenu();},0));
  win.addEventListener('resize',()=>{if(win.innerWidth>760)closeMenu();});
  $$('[data-scroll]').forEach(element=>element.addEventListener('click',()=>doc.getElementById(element.dataset.scroll)?.scrollIntoView({behavior:motion?'smooth':'auto'})));

  const projectDialog=$('#project-dialog'),policyDialog=$('#policy-dialog');
  const carDialog=$('#car-navigation');
  const dialogs=[projectDialog,policyDialog,carDialog];
  let priorOverflow='';
  function openDialog(dialog){
    if(!dialogs.some(d=>d.open))priorOverflow=doc.body.style.overflow;
    effects.setOverlayActive(true);
    dialog.dataset.closing='false';dialog.showModal();dialog.scrollTop=0;doc.body.style.overflow='hidden';
    animate(dialog,{opacity:[0,1],y:[12,0],scale:[.985,1],duration:240,ease:'out(3)'});
  }
  function closeDialog(dialog){
    if(!dialog.open||dialog.dataset.closing==='true')return;
    dialog.dataset.closing='true';
    const finish=()=>{dialog.close();dialog.dataset.closing='false';};
    if(motion)animate(dialog,{opacity:0,y:8,scale:.99,duration:140,ease:'in(2)',onComplete:finish});else finish();
  }
  dialogs.forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>closeDialog(dialog));
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);
    });
    dialog.addEventListener('close',()=>{if(!dialogs.some(d=>d.open)){doc.body.style.overflow=priorOverflow;effects.setOverlayActive(false);}});
  });
  const carNavigation=initCarNavigation({doc,trigger:$('#car-navigation-trigger'),dialog:carDialog,openDialog,closeDialog,getMotion:()=>motion});
  function openProject(id){
    const p=projects[id];if(!p)return;
    $('#dialog-content').innerHTML=`
      <div class="dialog-head"><span class="micro-label">PROJECT / ${escapeHTML(p.eyebrow)}</span><h2 id="dialog-title">${escapeHTML(p.title)}</h2><p class="dialog-subtitle">${escapeHTML(p.category)}</p><p class="dialog-status">${escapeHTML(p.status)}</p></div>
      <div class="dialog-body"><a class="case-screenshot" href="${escapeHTML(p.imagePath || `./assets/current/${p.image}.webp`)}" target="_blank" rel="noopener noreferrer" aria-label="Open full preview of ${escapeHTML(p.title)}"><img src="${escapeHTML(p.imagePath || `./assets/current/${p.image}.webp`)}" alt="${escapeHTML(p.imageAlt || `Screenshot of ${p.title}`)}"><span>OPEN FULL PREVIEW ↗</span></a><p class="dialog-description">${escapeHTML(p.description)}</p>
      <div class="case-columns"><div><h3>The Context</h3><p>${escapeHTML(p.problem)}</p></div><div><h3>The Approach</h3><p>${escapeHTML(p.approach)}</p></div></div>
      <div class="case-details"><h3>A Few Details</h3><ul>${p.details.map(d=>`<li>${escapeHTML(d)}</li>`).join('')}</ul></div><div class="case-tools">${p.tools.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div>
      ${p.demo?renderDemo():''}${p.link?`<a class="text-link dialog-link" href="${escapeHTML(p.link)}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.linkLabel)} <span aria-hidden="true">↗</span></a>`:''}</div>`;
    if(p.demo)bindDemo();openDialog(projectDialog);
  }
  $$('[data-project]').forEach(element=>element.addEventListener('click',()=>openProject(element.dataset.project)));
  const inquiryForm=initInquiryForm($('#inquiry-form'),{win});
  $$('[data-inquire]').forEach(element=>element.addEventListener('click',()=>{
    $('#contact').scrollIntoView({behavior:motion?'smooth':'auto'});
    $('#inquiry-name').focus({preventScroll:true});
  }));
  $$('[data-policy]').forEach(element=>element.addEventListener('click',event=>{
    event.preventDefault();const p=policies[element.dataset.policy];
    $('#policy-content').innerHTML=`<div class="policy-content"><span class="micro-label">VIVIEN ALBA / WEBSITE INFORMATION</span><h2 id="policy-title">${escapeHTML(p.title)}</h2>${p.paragraphs.map(t=>`<p>${escapeHTML(t)}</p>`).join('')}${element.dataset.policy==='privacy'?'<p><a class="text-link" href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">FormSubmit privacy terms ↗</a></p>':''}<a class="text-link" href="mailto:${email}">Contact Vivien ↗</a></div>`;openDialog(policyDialog);
  }));
  function renderDemo(){return `<section class="demo" aria-labelledby="demo-title"><div class="demo-heading"><div><h3 id="demo-title">A Little Live Demonstration</h3><p>FOUR SAMPLE ROWS. A FEW FAMILIAR PROBLEMS.</p></div><button class="demo-button" id="clean-demo">Clean the sample ↗</button></div><div class="demo-table-wrap"><table><caption class="sr-only">Illustrative customer data. This is a fixed fictional sample.</caption><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Status</th></tr></thead><tbody id="demo-rows">${tableRows(sampleRows,true)}</tbody></table></div><p class="demo-result" aria-live="polite">Before: inconsistent spaces, mixed email capitalization, one repeated row, and a missing email.</p><div class="demo-actions"><button class="demo-reset" id="reset-demo">Reset the sample ↺</button><button class="demo-button" id="download-demo" hidden>Download sample CSV ↓</button></div><p class="demo-note">An illustrative browser demo using fictional records. The full Python application handles uploaded files and more cleanup options. Missing information stays flagged for review.</p></section>`;}
  function tableRows(rows,before=false){return rows.map((r,i)=>`<tr class="${before&&i===2?'duplicate':''}"><td>${escapeHTML(r.name)}</td><td>${r.email?escapeHTML(r.email):'<span style="color:#8c522b">Missing email</span>'}</td><td>${escapeHTML(r.status)}</td></tr>`).join('');}
  function bindDemo(){
    let result=null;
    $('#clean-demo').addEventListener('click',()=>{
      result=cleanSample(sampleRows);$('#demo-rows').innerHTML=tableRows(result.rows);
      $('.demo-result').textContent=`After: ${result.rows.length} rows ready for review. ${result.duplicatesRemoved} duplicate removed. Spacing and emails standardized. ${result.missingEmails} missing email remains flagged.`;
      $('#clean-demo').textContent='A little tidier ✓';$('#clean-demo').disabled=true;$('#download-demo').hidden=false;
      animate($('#demo-rows').querySelectorAll('tr'),{opacity:[0,1],y:[6,0],duration:260,delay:anime.stagger(40),ease:'out(3)'});
    });
    $('#reset-demo').addEventListener('click',()=>{
      result=null;$('#demo-rows').innerHTML=tableRows(sampleRows,true);$('#clean-demo').disabled=false;$('#clean-demo').textContent='Clean the sample ↗';$('#download-demo').hidden=true;
      $('.demo-result').textContent='Before: inconsistent spaces, mixed email capitalization, one repeated row, and a missing email.';
    });
    $('#download-demo').addEventListener('click',()=>{
      if(!result)return;
      const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
      const csv='Name,Email,Status\r\n'+result.rows.map(r=>[r.name,r.email,r.status].map(quote).join(',')).join('\r\n');
      const url=win.URL.createObjectURL(new win.Blob([csv],{type:'text/csv;charset=utf-8'}));
      const link=doc.createElement('a');link.href=url;link.download='tidygrid-illustrative-sample.csv';doc.body.append(link);link.click();link.remove();win.setTimeout(()=>win.URL.revokeObjectURL(url),1000);say('Your sample CSV is ready.');
    });
  }

  const projectCarousel=initProjectCarousel($('#project-carousel'),{win,getMotion:()=>motion});
  const credentialCarousel=initProjectCarousel($('#credential-carousel'),{win,getMotion:()=>motion,cardClass:'credential-card'});
  const cards=$$('.project'),filters=$$('[data-filter]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    effects.revealContaining($('#projects'));
    anime.remove?.(cards);
    const visible=[];cards.forEach(card=>{
      card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;
      card.style.opacity='1';card.style.transform='none';if(!card.hidden)visible.push(card);
    });
    projectCarousel.reset();
    animate(visible,{opacity:[0,1],y:[9,0],duration:300,delay:anime.stagger(35),ease:'out(3)'});
  }));
  let effectsStarted=false;
  const tabs=$$('.tool-tabs>[role=tab]');
  function selectToolTab(tab){
    tabs.forEach(t=>{
      const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
      doc.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
    });
    const panel=doc.getElementById(tab.getAttribute('aria-controls'));
    if(effectsStarted)animate(panel,{opacity:[0,1],y:[5,0],duration:280,ease:'out(3)'});
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectToolTab(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;
      if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();tabs[next].focus();selectToolTab(tabs[next]);}
    });
  });
  selectToolTab(tabs[0]);
  $$('.experience-row').forEach(row=>row.addEventListener('toggle',()=>{
    if(row.open)animate(row.querySelector('.experience-body'),{opacity:[0,1],y:[-5,0],duration:200,ease:'out(3)'});
  }));
  const sections=$$('main>section[id]');
  const navObserver='IntersectionObserver' in win?new win.IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)$$('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));});
  },{rootMargin:'-15% 0px -65% 0px'}):null;
  sections.forEach(section=>navObserver?.observe(section));
  const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit'});
  function tick(){const now=new Date();$('#manila-clock').textContent=clock.format(now);$('#year').textContent=now.getFullYear();}
  tick();const clockTimer=win.setInterval(tick,60000);
  effectsStarted=true;effects.start();
  win.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    win.clearInterval(clockTimer);win.clearTimeout(toastTimer);navObserver?.disconnect();
    reduced.removeEventListener('change',updateMotion);carNavigation.destroy();desk.destroy();effects.destroy();projectCarousel.destroy();inquiryForm.destroy();
  });
  return {openProject,selectToolTab,policies};
}
if(typeof document!=='undefined')initPortfolio();
