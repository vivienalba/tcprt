const ENTER_EASE='out(3)';

export function prepareEntrance(steps,anime){
  // Only hide targets whose timeline actually restores opacity. A transform-
  // only parent (such as the certificate grid) must remain visible throughout.
  steps.forEach(({targets,properties})=>{
    if(properties.opacity!==undefined)anime.set(targets,{opacity:0});
  });
}

// Drag position belongs to the button, ambient motion to .object-float,
// and pointer feedback to .object-art. Each layer has a single owner.
export const FLOAT_PROFILES=[
  {range:11,duration:4300,delay:0,drift:.45},
  {range:8,duration:5170,delay:270,drift:0},
  {range:13,duration:4670,delay:620,drift:-.55},
  {range:9,duration:5930,delay:430,drift:.4},
  {range:12,duration:5570,delay:810,drift:0},
  {range:10,duration:4870,delay:560,drift:-.35},
  {range:8,duration:6310,delay:990,drift:0},
  {range:8,duration:5710,delay:740,drift:0}
];

export function createMotionController({doc,anime,enabled=true}={}){
  const active=new Set(),owners=new WeakMap();
  let moving=enabled,destroyed=false;
  const elements=targets=>typeof targets==='string'?Array.from(doc.querySelectorAll(targets)):
    targets?.nodeType?[targets]:Array.from(targets||[]);
  const forget=record=>{
    active.delete(record);
    record.targets.forEach(target=>{if(owners.get(target)?.get(record.channel)===record)owners.get(target).delete(record.channel);});
  };
  function stop(targets,channel='state'){
    const records=new Set(elements(targets).map(target=>owners.get(target)?.get(channel)).filter(Boolean));
    records.forEach(record=>{record.done=true;record.animation.cancel();forget(record);});
  }
  function run(targets,options,channel='state'){
    const list=elements(targets);if(!list.length||destroyed)return null;
    stop(list,channel);
    const record={targets:list,channel,animation:null,done:false};
    const finish=()=>{if(record.done)return;record.done=true;forget(record);options.onComplete?.();};
    record.finish=finish;
    // A zero-duration transition still applies the final state and completion
    // callback (important when a menu/dialog is closing as the preference changes).
    record.animation=anime.animate(list,{
      ease:ENTER_EASE,...options,autoplay:false,
      ...(moving?{}:{duration:0,delay:0}),onComplete:finish
    });
    active.add(record);
    list.forEach(target=>{if(!owners.has(target))owners.set(target,new Map());owners.get(target).set(channel,record);});
    if(moving)record.animation.play();else {record.animation.complete();finish();}
    return record.animation;
  }
  function track(animation,onComplete=()=>{}){
    const record={targets:[],channel:'timeline',animation,done:false};
    record.finish=()=>{if(record.done)return;record.done=true;forget(record);onComplete();};
    animation.onComplete=record.finish;active.add(record);return animation;
  }
  return {
    run,stop,track,
    get enabled(){return moving;},
    setEnabled(value){
      moving=value;
      if(!value)Array.from(active).forEach(record=>{
        record.animation.complete();
        if(record.finish)record.finish();else {record.done=true;forget(record);}
      });
    },
    destroy(){destroyed=true;active.forEach(record=>{record.done=true;record.animation.cancel();});active.clear();}
  };
}

export function initPortfolioMotion({doc,win,anime,enabled=true}={}){
  const $=selector=>doc.querySelector(selector);
  const $$=selector=>Array.from(doc.querySelectorAll(selector));
  const controller=createMotionController({doc,anime,enabled});
  const rootScope=anime.createScope({root:doc.body});
  const listeners=[],entrances=[],floats=new Map(),held=new Set();
  const fine=win.matchMedia('(hover: hover) and (pointer: fine)');
  const hero=$('#home');
  let ambientScope=null,heroTimeline=null,heroReady=false,heroVisible=true,overlayActive=false,destroyed=false,started=false;
  const listen=(element,type,fn,options)=>{element?.addEventListener(type,fn,options);listeners.push(()=>element?.removeEventListener(type,fn,options));};
  const run=controller.run;

  function syncAmbient(){
    const active=controller.enabled&&heroReady&&heroVisible&&!overlayActive&&doc.visibilityState!=='hidden';
    floats.forEach((animation,element)=>{if(active&&!held.has(element))animation.resume();else animation.pause();});
  }
  function buildAmbient(){
    ambientScope?.revert();floats.clear();ambientScope=null;
    if(!controller.enabled||destroyed)return;
    ambientScope=anime.createScope({root:hero}).add(()=>{
      $$('.desk-object').forEach((element,index)=>{
        const profile=FLOAT_PROFILES[index%FLOAT_PROFILES.length];
        const animation=anime.animate(element.querySelector('.object-float'),{
          y:[0,-profile.range],rotate:[0,profile.drift],duration:profile.duration,
          delay:profile.delay,alternate:true,loop:true,ease:'inOutSine',autoplay:false
        });
        floats.set(element,animation);
      });
    });
    syncAmbient();
  }
  const ambientObserver='IntersectionObserver' in win?new win.IntersectionObserver(entries=>{
    entries.forEach(entry=>{heroVisible=entry.isIntersecting;});syncAmbient();
  },{threshold:0}):null;
  ambientObserver?.observe(hero);
  listen(doc,'visibilitychange',syncAmbient);

  // Entrances are grouped by section rather than giving every leaf a fade.
  // All targets occupy their normal layout before any motion begins.
  const query=(root,selector)=>Array.from(root.querySelectorAll(selector));
  const step=(targets,properties,at=0)=>({targets,properties,at});
  const addEntrance=(section,steps)=>{if(section)entrances.push({section,steps,shown:false,timeline:null});};
  const heading=section=>[
    step(query(section,'.section-heading .micro-label'),{opacity:[0,1],y:[4,0],duration:350}),
    step(query(section,'.section-heading h2'),{opacity:[0,1],y:[12,0],duration:570},35)
  ];
  const history=$('#work-history');
  addEntrance(history,[...heading(history),
    step(query(history,'.experience-row'),{opacity:[0,1],y:[8,0],duration:460,delay:anime.stagger(45)},100),
    step(query(history,'.history-collage'),{opacity:[0,1],x:[8,0],duration:570},145)
  ]);
  const projects=$('#projects');
  addEntrance(projects,[...heading(projects),
    step(query(projects,'.work-toolbar'),{opacity:[0,1],duration:350},95),
    step(query(projects,'.project'),{opacity:[0,1],x:[10,0],duration:510,delay:anime.stagger(50)},145)
  ]);
  const tools=$('#tools-technologies');
  addEntrance(tools,[...heading(tools),
    step(query(tools,'.tool-tabs>button'),{opacity:[0,1],x:[-7,0],duration:420,delay:anime.stagger(32)},110),
    step(query(tools,'.tool-panels'),{opacity:[0,1],y:[8,0],duration:520},145),
    step(query(tools,'.tools-objects'),{opacity:[0,1],duration:500},190)
  ]);
  const credentials=$('#certificates');
  addEntrance(credentials,[...heading(credentials),
    step(query(credentials,'.credential-grid'),{y:[10,0],duration:490},125),
    step(query(credentials,'.credential-card'),{opacity:[0,1],duration:490,delay:anime.stagger(65)},125)
  ]);
  const about=$('#about');
  if(about)addEntrance(about,[step(query(about,'.about-copy'),{opacity:[0,1],y:[10,0],duration:570}),step(query(about,'.about-collage'),{opacity:[0,1],x:[8,0],duration:570},100)]);
  const contact=$('#contact');
  addEntrance(contact,[
    step(query(contact,'.contact-intro'),{opacity:[0,1],y:[10,0],duration:540}),
    step(query(contact,'.inquiry-row,.inquiry-fields>.inquiry-field,.inquiry-consent,.inquiry-submit,.inquiry-notice'),{opacity:[0,1],y:[7,0],duration:440,delay:anime.stagger(40)},80)
  ]);
  const footer=$('.site-footer');
  if(footer)addEntrance(footer,[step(Array.from(footer.children),{opacity:[0,1],y:[4,0],duration:380,delay:anime.stagger(35)})]);

  function finishEntrance(entrance){
    entrance.shown=true;revealObserver?.unobserve(entrance.section);
    if(entrance.timeline){entrance.timeline.complete();entrance.timeline=null;}
    entrance.steps.forEach(({targets})=>anime.set(targets,{opacity:1,x:0,y:0}));
  }
  function playEntrance(entrance){
    if(entrance.shown)return;
    entrance.shown=true;revealObserver?.unobserve(entrance.section);
    if(!controller.enabled||entrance.section.contains(doc.activeElement)){finishEntrance(entrance);return;}
    rootScope.execute(()=>{
      const timeline=anime.createTimeline({autoplay:false,defaults:{ease:ENTER_EASE}});
      entrance.steps.forEach(({targets,properties,at})=>{if(targets.length)timeline.add(targets,properties,at);});
      entrance.timeline=controller.track(timeline,()=>{entrance.timeline=null;});timeline.play();
    });
  }
  const revealObserver='IntersectionObserver' in win?new win.IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){const entrance=entrances.find(item=>item.section===entry.target);if(entrance)playEntrance(entrance);}});
  },{rootMargin:'0px 0px 70px 0px',threshold:0}):null;
  // Keyboard focus and early interaction always take priority over a reveal.
  function revealContaining(element){
    entrances.filter(item=>item.section.contains(element)).forEach(item=>{if(!item.shown||item.timeline)finishEntrance(item);});
  }
  listen(doc,'focusin',event=>revealContaining(event.target));
  listen(doc,'pointerdown',event=>revealContaining(event.target),{passive:true});

  function finishHero(){
    if(heroTimeline){heroTimeline.complete();heroTimeline=null;}
    heroReady=true;syncAmbient();
  }
  $$('.desk-object').forEach(element=>{
    const art=element.querySelector('.object-art');let hovered=false,focused=false;
    const respond=()=>run(art,{y:hovered||focused?-2:0,scale:held.has(element)?1.035:hovered||focused?1.025:1,duration:held.has(element)?160:200},'feedback');
    listen(element,'pointerenter',event=>{if(event.pointerType==='touch'||!fine.matches)return;hovered=true;respond();});
    listen(element,'pointerleave',()=>{hovered=false;respond();});
    listen(element,'focus',()=>{focused=element.matches(':focus-visible');respond();});
    listen(element,'blur',()=>{focused=false;respond();});
    element._deskRespond=respond;
  });

  // The cover gets lift/depth; the caption and card's layout remain stable.
  $$('.project').forEach(card=>{
    const cover=card.querySelector('.project-cover'),image=card.querySelector('.project-print>img'),label=card.querySelector('.print-label');
    const respond=active=>{
      if(!cover)return;
      run(cover,{y:active?-3:0,scale:active?1.004:1,duration:280},'feedback');
      run(image,{scale:active?1.018:1,duration:350},'feedback');
      run(label,{y:active?-1:0,duration:250},'feedback');
    };
    listen(card,'pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)respond(true);});
    listen(card,'pointerleave',()=>respond(false));
    listen(cover,'focus',()=>respond(true));listen(cover,'blur',()=>respond(false));
    listen(cover,'pointerdown',()=>run(cover,{y:0,scale:.992,duration:150},'feedback'));
    listen(cover,'pointerup',event=>respond(event.pointerType!=='touch'&&fine.matches));
    listen(cover,'pointercancel',()=>respond(false));
  });
  $$('.credential-card').forEach(card=>{
    const image=card.querySelector('.credential-image img');
    const respond=active=>{run(card,{y:active?-3:0,duration:280},'feedback');run(image,{scale:active?1.012:1,duration:330},'feedback');};
    listen(card,'pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)respond(true);});
    listen(card,'pointerleave',()=>respond(false));listen(card,'focus',()=>respond(true));listen(card,'blur',()=>respond(false));
  });
  $$('.tool-tabs>button').forEach(tab=>{
    const icon=tab.querySelector('.tab-icon'),arrow=tab.querySelector('b');
    const respond=active=>{run(icon,{x:active?2:0,rotate:active?4:0,duration:190},'feedback');run(arrow,{x:active?3:0,duration:190},'feedback');};
    listen(tab,'pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)respond(true);});
    listen(tab,'pointerleave',()=>respond(false));listen(tab,'focus',()=>respond(true));listen(tab,'blur',()=>respond(false));
  });
  $$('.tool-cloud>span').forEach(tool=>{
    listen(tool,'pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)run(tool,{y:-2,duration:180},'feedback');});
    listen(tool,'pointerleave',()=>run(tool,{y:0,duration:200},'feedback'));
  });

  // Tiny press feedback, with one interruptible animation per control.
  const controls=$$('.header-inquire,.menu-toggle,.filters button,.tool-tabs>button,#reset-desk,.inquiry-submit,.desktop-nav a,.mobile-menu a,.social-links a,.dialog-close');
  controls.forEach(control=>{
    const press=()=>{if(!control.disabled)run(control,{scale:.97,duration:150},'press');};
    const release=()=>run(control,{scale:1,duration:190},'press');
    listen(control,'pointerdown',press);listen(control,'pointerup',release);listen(control,'pointerleave',release);listen(control,'pointercancel',release);listen(control,'blur',release);
    listen(control,'keydown',event=>{if(!event.repeat&&['Enter',' '].includes(event.key))press();});
    listen(control,'keyup',event=>{if(['Enter',' '].includes(event.key))release();});
  });

  // A status changes once after a real submission result; typing never moves fields.
  const form=$('#inquiry-form'),status=form?.querySelector('[data-inquiry-status]');let lastState=form?.dataset.state;
  const statusObserver='MutationObserver' in win&&form?new win.MutationObserver(()=>{
    const state=form.dataset.state;
    if(state===lastState)return;lastState=state;
    if((state==='success'||state==='error')&&status.textContent)run(status,{opacity:[0,1],y:[3,0],duration:220});
  }):null;
  statusObserver?.observe(form,{attributes:true,attributeFilter:['data-state']});

  return {
    animate:run,cancel:controller.stop,
    get enabled(){return controller.enabled;},
    setOverlayActive(value){overlayActive=value;syncAmbient();},
    holdObject(element,value){
      if(value){finishHero();held.add(element);}else held.delete(element);
      element._deskRespond?.();syncAmbient();
    },
    revealContaining,
    setMotion(value){
      controller.setEnabled(value);
      if(!value){entrances.forEach(finishEntrance);finishHero();}
      buildAmbient();
    },
    start(){
      if(started)return;started=true;
      if(controller.enabled&&revealObserver){
        entrances.forEach(entrance=>{
          if(entrance.section.getBoundingClientRect().top<win.innerHeight&&entrance.section.getBoundingClientRect().bottom>0){playEntrance(entrance);return;}
          prepareEntrance(entrance.steps,anime);revealObserver.observe(entrance.section);
        });
      }else entrances.forEach(finishEntrance);
      if(controller.enabled){
        rootScope.execute(()=>{
          const timeline=anime.createTimeline({autoplay:false,defaults:{ease:ENTER_EASE}});
          timeline.add($$('.headline-line'),{opacity:[0,1],y:[12,0],duration:520,delay:anime.stagger(55)},0)
            .add($$('.hero-aside,.section-kicker'),{opacity:[0,1],y:[6,0],duration:430,delay:anime.stagger(35)},110)
            .add($$('.desk-entry'),{opacity:[0,1],y:[8,0],scale:[.98,1],duration:520,delay:anime.stagger(38,{from:'center'})},180)
            .add($$('.desk-toolbar,.hero-bottom'),{opacity:[0,1],y:[4,0],duration:350,delay:anime.stagger(30)},230);
          heroTimeline=controller.track(timeline,()=>{heroTimeline=null;heroReady=true;syncAmbient();});timeline.play();
        });
      }else heroReady=true;
      buildAmbient();
    },
    destroy(){
      destroyed=true;listeners.forEach(remove=>remove());revealObserver?.disconnect();ambientObserver?.disconnect();statusObserver?.disconnect();
      ambientScope?.revert();rootScope.revert();controller.destroy();
      $$('.desk-object').forEach(element=>{delete element._deskRespond;});
    }
  };
}

export function initMotionMenu({menu,toggle,animate,getMotion=()=>true,anime}={}){
  let wanted=false;
  const links=Array.from(menu.querySelectorAll('a'));
  function setOpen(open){
    const wasHidden=menu.hidden;wanted=open;
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    menu.inert=!open;
    if(open){
      menu.hidden=false;
      animate(menu,{opacity:wasHidden?[0,1]:1,x:wasHidden?[-16,0]:0,duration:230});
      if(wasHidden)animate(links,{opacity:[0,1],x:[-7,0],duration:220,delay:anime.stagger(22)});
    }else{
      if(wasHidden)return;
      animate(menu,{opacity:0,x:-12,duration:getMotion()?160:0,ease:'in(2)',onComplete:()=>{
        if(wanted)return;menu.hidden=true;anime.set(menu,{opacity:1,x:0});anime.set(links,{opacity:1,x:0});
      }});
    }
  }
  return {toggle(){setOpen(!wanted);},close(){setOpen(false);},get open(){return wanted;}};
}
