export function initProjectCarousel(rail, {win=globalThis, previous, next, getMotion=()=>true,cardClass='project'}={}) {
  const listeners=[];
  let drag=null, suppressClick=false, clickTimer, refreshFrame;
  const listen=(target,type,handler,options)=>{
    target.addEventListener(type,handler,options);
    listeners.push(()=>target.removeEventListener(type,handler,options));
  };
  const maxScroll=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
  function refresh(){
    if(previous)previous.disabled=rail.scrollLeft<=2;
    if(next)next.disabled=rail.scrollLeft>=maxScroll()-2;
  }
  function step(){
    const card=Array.from(rail.children).find(child=>child.classList.contains(cardClass)&&!child.hidden);
    const gap=parseFloat(win.getComputedStyle?.(rail).columnGap)||24;
    return card?card.offsetWidth+gap:rail.clientWidth;
  }
  function goTo(left){
    rail.scrollTo({left:Math.max(0,Math.min(maxScroll(),left)),behavior:getMotion()?'smooth':'auto'});
    refresh();
  }
  function clearClickBlock(){
    suppressClick=false;win.clearTimeout(clickTimer);
  }
  function finishDrag(){
    if(!drag)return;
    const ended=drag;drag=null;
    rail.classList.remove('is-dragging');
    if(rail.hasPointerCapture?.(ended.id))rail.releasePointerCapture(ended.id);
    if(ended.active){
      suppressClick=true;win.clearTimeout(clickTimer);
      clickTimer=win.setTimeout(()=>{suppressClick=false;},250);
    }
    refresh();
  }
  listen(rail,'pointerdown',event=>{
    if(event.pointerType!=='mouse'||event.button!==0||event.isPrimary===false)return;
    clearClickBlock();
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rail.scrollLeft,active:false};
  });
  listen(win,'pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.active){
      if(Math.abs(dx)<8)return;
      if(Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      drag.active=true;
      rail.classList.add('is-dragging');
      try{rail.setPointerCapture?.(drag.id);}catch{}
    }
    event.preventDefault();
    rail.scrollLeft=Math.max(0,Math.min(maxScroll(),drag.left-dx));
    refresh();
  },{passive:false});
  for(const type of ['pointerup','pointercancel'])listen(win,type,event=>{
    if(drag&&event.pointerId===drag.id)finishDrag();
  });
  listen(rail,'lostpointercapture',event=>{if(drag&&event.pointerId===drag.id)finishDrag();});
  listen(rail,'click',event=>{
    if(!suppressClick)return;
    if(event.detail===0){clearClickBlock();return;}
    event.preventDefault();event.stopImmediatePropagation();clearClickBlock();
  },true);
  listen(rail,'dragstart',event=>event.preventDefault());
  listen(rail,'scroll',refresh,{passive:true});
  listen(rail,'keydown',event=>{
    if(event.target!==rail)return;
    const destinations={ArrowLeft:rail.scrollLeft-step(),ArrowRight:rail.scrollLeft+step(),Home:0,End:maxScroll()};
    if(!(event.key in destinations))return;
    event.preventDefault();goTo(destinations[event.key]);
  });
  if(previous)listen(previous,'click',()=>goTo(rail.scrollLeft-step()));
  if(next)listen(next,'click',()=>goTo(rail.scrollLeft+step()));
  listen(win,'resize',()=>{finishDrag();refresh();});
  listen(win,'blur',finishDrag);
  const observer=win.ResizeObserver?new win.ResizeObserver(refresh):null;
  observer?.observe(rail);
  refresh();
  return {
    reset(){
      finishDrag();clearClickBlock();rail.scrollLeft=0;refresh();
      if(win.requestAnimationFrame){
        win.cancelAnimationFrame?.(refreshFrame);
        refreshFrame=win.requestAnimationFrame(refresh);
      }
    },
    destroy(){
      finishDrag();clearClickBlock();listeners.forEach(remove=>remove());observer?.disconnect();
      win.cancelAnimationFrame?.(refreshFrame);
    }
  };
}
