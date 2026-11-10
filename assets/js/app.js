(function () {
  'use strict';
  const app = window.Temple, $ = id => document.getElementById(id);
  if (!app || app.failed) return;
  try {
    const state = app.State.read();
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reducedQuery.matches, started = false, action = null, input;
    let toastTimer, storageWarning = false, last = 0, frameId, walkingTime = 0, angle = 0, lastZone = '';
    const host = $('scene'), dialogs = [...document.querySelectorAll('dialog')];
    const practiceButtons = [...document.querySelectorAll('[data-action]')];
    const sound = new app.Audio();
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe1e4d7,180,550);
    scene.add(new THREE.HemisphereLight(0xfff7e6,0x7e8060,0.9));
    const sun = new THREE.DirectionalLight(0xffefd2,0.8);
    sun.position.set(-24,38,60); sun.target.position.set(0,0,10);
    scene.add(sun,sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
    Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:0.5,far:100});
    sun.shadow.bias = -0.001;
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.addEventListener('webglcontextlost', e => {
      e.preventDefault(); input && input.reset(); cancelAnimationFrame(frameId); sound.pause();
      $('fatal-message').textContent = t('contextLost'); app.showFailure();
    });
    const camera = new THREE.PerspectiveCamera(61,1,0.1,700);
    const world = app.createWorld(scene), visitor = world.avatar;
    const desiredCamera = new THREE.Vector3(), target = new THREE.Vector3();
    let frameInterval = 1000/30;
    const t = key => app.I18N[state.lang][key] || key;
    const hasModal = () => dialogs.some(dialog => dialog.open);
    const canMove = () => started && !action && !hasModal() && !app.failed && !document.hidden;

    function toast(message) {
      $('toast').textContent = message; $('toast').classList.add('visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'),2800);
    }
    function persist() {
      if (!app.State.write(state) && !storageWarning) { storageWarning = true; toast(t('storageError')); }
    }
    function updateSoundUI() {
      $('sound').setAttribute('aria-pressed',String(state.sound));
      $('sound').setAttribute('aria-label',t(state.sound ? 'soundOff' : 'soundOn'));
      $('sound').title = t(state.sound ? 'soundOff' : 'soundOn');
      $('sound-icon').setAttribute('href',state.sound ? '#i-sound' : '#i-muted');
      $('ambient').disabled = !state.sound; $('ambient').checked = state.ambient;
    }
    function setZone() {
      const z = visitor.position.z;
      const key = z < -31.8 ? 'locationHall' : z < -20.8 ? 'locationSteps' : z < 49 ? 'locationCourt' : 'locationGate';
      if (key !== lastZone) { lastZone = key; $('zone-text').textContent = t(key); }
    }
    function applyLanguage() {
      document.documentElement.lang = state.lang; document.title = t('title');
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const value = t(element.dataset.i18n); if (typeof value === 'string') element.textContent = value;
      });
      document.querySelectorAll('[data-label]').forEach(element => {
        element.setAttribute('aria-label',t(element.dataset.label)); element.title = t(element.dataset.label);
      });
      $('enter-text').textContent = app.ready ? t('enter') : t('loading');
      $('language').value = state.lang;
      host.setAttribute('aria-label',t('canvasLabel'));
      $('move-pad').setAttribute('aria-label',t('joystick'));
      $('practices').setAttribute('aria-label',t('tourLabel'));
      $('zone').setAttribute('aria-label',t('zoneLabel'));
      lastZone = ''; setZone(); updateSoundUI();
    }
    function resize() {
      const width = Math.max(1,host.clientWidth), height = Math.max(1,host.clientHeight);
      renderer.setSize(width,height,false); camera.aspect = width/height;
      camera.fov = camera.aspect < 0.7 ? 65 : 58; camera.updateProjectionMatrix();
      if (!started) welcomeCamera();
    }
    function quality() {
      const low = state.quality === 'low';
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1,low ? 1 : 1.5));
      renderer.shadowMap.enabled = false;
      frameInterval = 1000/(low ? 24 : 30); resize();
      $('power-saving').checked = low;
    }
    function welcomeCamera() {
      camera.position.set(45,40,90); camera.lookAt(0,3,-12);
    }
    function followCamera(dt,snap) {
      const portrait = camera.aspect < 0.8;
      desiredCamera.set(visitor.position.x,visitor.position.y+(portrait?4.9:4),visitor.position.z+(portrait?8.2:7.2));
      const amount = snap || reduced ? 1 : 1-Math.exp(-dt*5);
      camera.position.lerp(desiredCamera,amount);
      target.set(visitor.position.x,visitor.position.y+1.25,visitor.position.z-4);
      camera.lookAt(target);
    }
    async function activateSound() {
      try { await sound.enable(state.sound); sound.setAmbient(state.sound && state.ambient); return true; }
      catch (_) { state.sound = false; updateSoundUI(); persist(); toast(t('audioError')); return false; }
    }
    function resetPractice() {
      action = null; world.woodfish.visible = world.handBeads.visible = false;
      practiceButtons.forEach(button => { button.disabled = false; button.setAttribute('aria-pressed','false'); button.style.setProperty('--progress','0'); });
    }
    function goHome() {
      if (!started) return;
      input.reset(); resetPractice(); visitor.position.set(0,0,67); visitor.rotation.y = angle = walkingTime = 0;
      world.resetDoors(); followCamera(0,true); setZone(); toast(t('homeDone'));
    }
    function startPractice(name) {
      if (!canMove() || !app.State.actions.includes(name)) return;
      input.reset(); activateSound();
      action = {name,time:0,lastBeat:-1,duration:{palm:2.3,bow:2.8,wood:3,beads:3}[name]};
      world.woodfish.visible = name === 'wood'; world.handBeads.visible = name === 'beads';
      practiceButtons.forEach(button => { button.disabled = true; button.setAttribute('aria-pressed',String(button.dataset.action === name)); });
      toast(t(name + 'Msg'));
      if (name === 'bow') sound.bell();
    }
    function animatePractice(dt) {
      if (!action) return;
      action.time = Math.min(action.time+dt,action.duration);
      const {name,time,duration} = action;
      const weight = Math.max(0,Math.min(1,time/0.35,(duration-time)/0.35));
      if (name === 'palm' || name === 'bow') {
        world.arms[0].rotation.set(1.3*weight,0,0.7*weight);
        world.arms[1].rotation.set(1.3*weight,0,-0.7*weight);
        if (name === 'bow') world.body.rotation.x = -Math.sin(Math.PI*time/duration)*(reduced?0.55:1.05);
      } else if (name === 'wood') {
        const beat = Math.floor(time/0.5), dip = Math.max(0,1-(time%0.5)/0.13);
        world.arms[0].rotation.set(0.9*weight,0,0.55*weight);
        world.arms[1].rotation.set((1.25-0.4*dip)*weight,0,-0.55*weight);
        if (beat !== action.lastBeat && time < duration) { action.lastBeat = beat; sound.wood(); }
      } else {
        const beat = Math.floor(time/0.48);
        world.arms[0].rotation.set(weight,0,0.6*weight);
        world.arms[1].rotation.set((1+(reduced?0:0.1*Math.sin(time*12)))*weight,0,-0.6*weight);
        if (beat !== action.lastBeat && time < duration) { action.lastBeat = beat; sound.bead(); }
      }
      const button = practiceButtons.find(item => item.dataset.action === name);
      button.style.setProperty('--progress',String(time/duration));
      if (time >= duration) resetPractice();
    }
    function openDialog(id) {
      input && input.reset();
      dialogs.forEach(dialog => { if (dialog.open) dialog.close(); });
      $(id).showModal();
    }
    input = new app.Input(host,{active:canMove,action:startPractice,home:goHome});
    $('enter').onclick = () => {
      if (!app.ready || app.failed) return;
      started = true; document.body.dataset.stage = 'explore';
      input.reset(); followCamera(0,true); host.focus({preventScroll:true}); activateSound(); toast(t('ready'));
    };
    $('home').onclick = goHome;
    $('sound').onclick = async () => {
      state.sound = !state.sound; const succeeded = await activateSound(); updateSoundUI(); persist();
      if (succeeded) toast(t(state.sound ? 'soundEnabled' : 'soundDisabled'));
    };
    $('language').onchange = e => { state.lang = e.target.value; applyLanguage(); persist(); };
    $('power-saving').onchange = e => { state.quality = e.target.checked ? 'low' : 'auto'; quality(); persist(); };
    $('ambient').onchange = e => { state.ambient = e.target.checked; sound.setAmbient(state.sound && state.ambient); persist(); };
    $('settings-button').onclick = () => openDialog('settings-dialog');
    $('help-button').onclick = () => openDialog('help-dialog');
    document.querySelectorAll('.close-dialog').forEach(button => { button.onclick = () => button.closest('dialog').close(); });
    dialogs.forEach(dialog => {
      dialog.addEventListener('click', e => {
        if (e.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
      });
      dialog.addEventListener('close',() => { input.reset(); $('settings-button').focus({preventScroll:true}); });
    });
    practiceButtons.forEach(button => { button.onclick = () => startPractice(button.dataset.action); });
    const motionChanged = () => { reduced = reducedQuery.matches; $('motion-note').hidden = !reduced; };
    if (reducedQuery.addEventListener) reducedQuery.addEventListener('change',motionChanged);
    motionChanged();
    new ResizeObserver(resize).observe(host);
    function frame(now) {
      if (app.failed || document.hidden) return;
      frameId = requestAnimationFrame(frame);
      if (last && now-last < frameInterval-1) return;
      const dt = Math.min(last ? (now-last)/1000 : 0,0.06); last = now;
      const paused = hasModal();
      let moving = false, vx = 0, vz = 0;
      if (canMove()) {
        const direction = input.read(), magnitude = Math.hypot(direction.x,direction.z);
        if (magnitude > 0.12) {
          const scale = Math.min(magnitude,1)/magnitude;
          vx = direction.x*scale; vz = direction.z*scale;
          const beforeX = visitor.position.x, beforeZ = visitor.position.z;
          const next = app.Navigation.move({x:beforeX,z:beforeZ},vx*6.8*dt,vz*6.8*dt,world.doorOpen);
          visitor.position.set(next.x,app.Navigation.heightAt(next.z,next.x),next.z);
          moving = Math.hypot(next.x-beforeX,next.z-beforeZ) > 0.001;
          if (moving) {
            const desired = Math.atan2(-vx,-vz), delta = desired-angle;
            angle += Math.atan2(Math.sin(delta),Math.cos(delta))*Math.min(1,dt*12);
            visitor.rotation.y = angle; walkingTime += dt*10;
          }
        }
      }
      if (!moving) walkingTime = 0;
      const swing = moving && !reduced ? Math.sin(walkingTime)*0.55 : 0;
      world.legs[0].rotation.x = swing; world.legs[1].rotation.x = -swing;
      if (!paused) {
        world.body.rotation.x = 0; world.body.position.y = 0.85+(moving && !reduced ? Math.abs(Math.sin(walkingTime))*0.055 : 0);
        world.arms[0].rotation.set(-swing*0.7,0,0.08); world.arms[1].rotation.set(swing*0.7,0,-0.08);
        animatePractice(dt); world.updateDoors(dt,visitor.position);
      }
      if (started) { followCamera(dt,false); setZone(); }
      renderer.render(scene,camera);
    }
    document.addEventListener('visibilitychange',() => {
      input.reset(); cancelAnimationFrame(frameId); last = 0;
      if (document.hidden) sound.pause();
      else { if (started && state.sound) activateSound(); frameId = requestAnimationFrame(frame); }
    });
    window.addEventListener('pagehide',() => { input.reset(); sound.pause(); });
    quality(); applyLanguage();
    app.ready = true; $('enter').disabled = false; $('enter-text').textContent = t('enter');
    frameId = requestAnimationFrame(frame);
    if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* The online app remains usable. */ });
    }
  } catch (error) {
    console.error('Temple could not start:',error);
    app.showFailure();
  }
})();
