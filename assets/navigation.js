// Navigation starts after the modal closes, so focus never moves into inert
// page content. A cancelled menu cannot leave a stale destination behind.
export function initCarNavigation({doc,trigger,dialog,openDialog,closeDialog,getMotion=()=>true}){
  let destination=null;
  const removers=[];
  const listen=(target,type,handler)=>{
    target.addEventListener(type,handler);
    removers.push(()=>target.removeEventListener(type,handler));
  };
  listen(trigger,'click',()=>{destination=null;openDialog(dialog);});
  dialog.querySelectorAll('nav a').forEach(link=>listen(link,'click',event=>{
    // Preserve modified link activation and validate the destination first.
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const section=doc.getElementById(link.getAttribute('href').slice(1));
    if(!section)return;
    event.preventDefault();destination=section;closeDialog(dialog);
  }));
  listen(dialog,'close',()=>{
    if(!destination)return;
    const section=destination;destination=null;
    const original=section.getAttribute('tabindex');
    section.setAttribute('tabindex','-1');
    section.focus({preventScroll:true});
    section.scrollIntoView({behavior:getMotion()?'smooth':'auto',block:'start'});
    if(original===null)section.removeAttribute('tabindex');else section.setAttribute('tabindex',original);
  });
  return {destroy(){destination=null;removers.forEach(remove=>remove());}};
}
