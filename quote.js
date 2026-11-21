(function(){
  var C = window.CLOUDS_CONFIG || {};
  var CATS=['Chocolates','Confectionery','Tea','Coffee','Honey','Beverages','Packaged Food','Custom Sourcing'];
  var UNITS=['Cartons','Pieces','Kg','Pallets','Containers (20ft)','Containers (40ft)'];
  var items=document.getElementById('items'), form=document.getElementById('rfq'), status=document.getElementById('status');
  var qs=new URLSearchParams(location.search), preset=qs.get('cat');
  var PRODS=window.CLOUDS_PRODUCTS||[], pp=PRODS.filter(function(p){return p.slug===qs.get('product')})[0];
  if(PRODS.length){var dl=document.createElement('datalist');dl.id='prodlist';dl.innerHTML=PRODS.map(function(p){return '<option value="'+p.name+' - '+p.pack+'">'}).join('');document.body.appendChild(dl);}

  function opts(list,sel){ return list.map(function(v){ return '<option'+(v===sel?' selected':'')+'>'+v+'</option>'; }).join(''); }
  function addRow(cat,prodName){
    var n=items.children.length+1, row=document.createElement('div');
    row.className='item-row';
    row.innerHTML='<div class="field"><label>Category</label><select class="i-cat">'+opts(CATS,cat)+'</select></div>'+
      '<div class="field prod"><label>Product, brand &amp; pack size</label><input class="i-prod" list="prodlist" placeholder="Start typing, e.g. Twinings, Anchor, Vimto"></div>'+
      '<div class="field"><label>Quantity</label><input class="i-qty" type="number" min="1" inputmode="numeric"></div>'+
      '<div class="field"><label>Unit</label><select class="i-unit">'+opts(UNITS)+'</select></div>'+
      '<button type="button" class="rm" aria-label="Remove product">×</button>';
    if(prodName) row.querySelector('.i-prod').value=prodName;
    row.querySelector('.rm').addEventListener('click',function(){ if(items.children.length>1) row.remove(); });
    items.appendChild(row);
  }
  if(pp) addRow(pp.cat,pp.name+' - '+pp.pack); else addRow(preset && CATS.indexOf(preset)>-1 ? preset : CATS[0]);
  document.getElementById('addItem').addEventListener('click',function(){ addRow(); });

  function collect(){
    var f=new FormData(form), d={};
    ['name','company','email','phone','business_type','delivery_country','city','needed_by','frequency','notes'].forEach(function(k){ d[k]=(f.get(k)||'').toString().trim(); });
    d.services=f.getAll('services').join(', ');
    d.items=[].map.call(items.children,function(r){ return { cat:r.querySelector('.i-cat').value, prod:r.querySelector('.i-prod').value.trim(), qty:r.querySelector('.i-qty').value, unit:r.querySelector('.i-unit').value }; })
      .filter(function(i){ return i.prod || i.qty; });
    return d;
  }
  function itemsText(d){ return d.items.map(function(i,k){ return (k+1)+'. ['+i.cat+'] '+(i.prod||'-')+' : '+(i.qty||'?')+' '+i.unit; }).join('\n'); }
  function summary(d){
    return 'WHOLESALE QUOTE REQUEST\n\n'+
      'Name: '+d.name+'\nCompany: '+d.company+'\nEmail: '+d.email+'\nPhone: '+d.phone+
      '\nBusiness: '+d.business_type+'\nDeliver to: '+d.delivery_country+(d.city?' ('+d.city+')':'')+
      '\n\nPRODUCTS\n'+itemsText(d)+
      '\n\nNeeded by: '+(d.needed_by||'-')+'\nFrequency: '+d.frequency+'\nServices: '+(d.services||'-')+'\nNotes: '+(d.notes||'-');
  }
  function show(msg,ok){ status.className='status '+(ok?'ok':'err'); status.textContent=msg; status.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  function valid(d){
    var missing=[];
    if(!d.name) missing.push('name'); if(!d.company) missing.push('company');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) missing.push('a valid email');
    if(!d.phone) missing.push('phone'); if(!d.delivery_country) missing.push('delivery country');
    if(!d.items.length) missing.push('at least one product');
    if(missing.length){ show('Please add: '+missing.join(', ')+'.',false); return false; }
    return true;
  }

  document.getElementById('waBtn').addEventListener('click',function(){
    var d=collect(); if(!d.items.length){ show('Please add at least one product.',false); return; }
    window.open('https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent(summary(d)),'_blank','noopener');
  });

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(form.botcheck.checked) return;
    var d=collect(); if(!valid(d)) return;
    var ref='CF-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000);
    var btn=document.getElementById('submitBtn'); btn.disabled=true; btn.textContent='Sending…';
    function done(){ btn.disabled=false; btn.textContent='Send quote request'; }
    if(!C.web3formsKey){
      // No form service configured yet: fall back to the buyer's email app.
      location.href='mailto:'+C.email+'?subject='+encodeURIComponent('Quote request '+ref+' - '+d.company)+'&body='+encodeURIComponent('Ref: '+ref+'\n\n'+summary(d));
      show('Your email app has opened with the request filled in. Please press Send there. Ref: '+ref,true); done(); return;
    }
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({access_key:C.web3formsKey,subject:'Quote request '+ref+' - '+d.company+' ('+d.delivery_country+')',from_name:'Clouds FZE website',replyto:d.email,
        reference:ref,name:d.name,company:d.company,email:d.email,phone:d.phone,business_type:d.business_type,delivery_country:d.delivery_country,city:d.city,
        products:itemsText(d),needed_by:d.needed_by,frequency:d.frequency,services:d.services,notes:d.notes})})
    .then(function(r){ return r.json(); })
    .then(function(j){ if(j.success){ show('Thank you! Your request '+ref+' has been sent. We will reply within 24 hours.',true); form.reset(); items.innerHTML=''; addRow(); }
      else show('Sorry, sending failed. Please use the WhatsApp button instead.',false); })
    .catch(function(){ show('No connection. Please try again, or use the WhatsApp button.',false); })
    .finally(done);
  });
})();
