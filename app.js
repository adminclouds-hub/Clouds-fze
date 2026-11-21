(function(){
  var C = window.CLOUDS_CONFIG || {};
  // contact links
  document.querySelectorAll('.js-email').forEach(function(a){ a.href='mailto:'+C.email; if(a.textContent==='Email' && a.closest('footer')) a.textContent=C.email; });
  document.querySelectorAll('.js-phone').forEach(function(a){ a.href='tel:+'+C.whatsapp; a.textContent=C.phoneDisplay; });
  document.querySelectorAll('.js-wa').forEach(function(a){ a.href='https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent('Hello Clouds FZE, I would like a wholesale quotation.'); });
  document.querySelectorAll('.js-address').forEach(function(el){ el.textContent=C.address; });
  document.querySelectorAll('.js-year').forEach(function(el){ el.textContent=new Date().getFullYear(); });

  // mobile menu
  var btn=document.querySelector('.menu-btn'), nav=document.querySelector('.nav-links');
  if(btn){ btn.addEventListener('click',function(){ var o=nav.classList.toggle('open'); btn.setAttribute('aria-expanded',o); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ nav.classList.remove('open'); }); }); }

  // PWA
  if('serviceWorker' in navigator){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
  var deferred, bar=document.getElementById('install');
  function dismissed(){ try{ return localStorage.getItem('cf_install_x')==='1'; }catch(e){ return false; } }
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; if(bar && !dismissed()) setTimeout(function(){ bar.classList.add('show'); },4000); });
  var ib=document.getElementById('installBtn'), ix=document.getElementById('installX');
  if(ib) ib.addEventListener('click',function(){ if(!deferred) return; deferred.prompt(); deferred.userChoice.finally(function(){ deferred=null; bar.classList.remove('show'); }); });
  if(ix) ix.addEventListener('click',function(){ bar.classList.remove('show'); try{ localStorage.setItem('cf_install_x','1'); }catch(e){} });
})();
