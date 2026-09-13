const app=document.querySelector('#app');
const prevBtn=document.querySelector('#prevBtn');
const nextBtn=document.querySelector('#nextBtn');
const fullscreenBtn=document.querySelector('#fullscreenBtn');
const counter=document.querySelector('#counter');
const connectFolderBtn=document.querySelector('#connectFolderBtn');
const exportBtn=document.querySelector('#exportBtn');
const builderStatus=document.querySelector('#builderStatus');
const modeBtn=document.querySelector('#modeBtn');
const printBtn=document.querySelector('#printBtn');
const printDeck=document.querySelector('#printDeck');

let current=0;
let projectDir=null;
let editMode=true;
const localMedia=new Map();
const STORAGE_KEY='magic-zine-slides-draft-v1';

const CURATED_IMAGES={
  intro:[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Fanzine UK / US · selezione storica'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Dettaglio · fanzine anni Settanta'}
  ],
  'what-is-a-zine':[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Una costellazione di testate indipendenti'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Cover, formati e linguaggi differenti'}
  ],
  'amateur-press':[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/%22The_Comet%22_Cover.jpg',caption:'Dalla stampa amatoriale al fandom · 1930'}
  ],
  'sf-fandom':[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/%22The_Comet%22_Cover.jpg',caption:'The Comet · vol. 1 no. 1 · maggio 1930 · cover'},
    {src:'https://fanac.org/fanzines/Comet/Comet01-cv.jpeg',caption:'The Comet · scansione FANAC'}
  ],
  counterculture:[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Underground press e controculture · anni Sessanta / Settanta'},
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Dalla controinformazione alle scene indipendenti'}
  ],
  punk:[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Punk / DIY · cover e xerox'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Fanzine punk · dettaglio di insieme'}
  ],
  'punk-grammar':[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Cut / copy / paste · grammatica xerox'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Collage, titoli manuali, fotografie ritagliate'}
  ],
  'italy-77':[
    {src:'https://www.comune.bologna.it/iperbole/asnsmp/immagini/attraverso.jpg',caption:'A/traverso · Bologna · maggio 1977'},
    {src:'https://www.comune.bologna.it/iperbole/asnsmp/immagini/attraverso.jpg',caption:'A/traverso · dettaglio tipografico / compositivo'}
  ],
  'xerox-culture':[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/1989-1_Skintonic_Nummer_4_-_01.jpg',caption:'Skintonic n.4 · 1989 · xerox culture'},
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Fotocopia come infrastruttura editoriale'}
  ],
  networks:[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/FactsheetFiveCover.jpg',caption:'Factsheet Five · rete di recensioni e indirizzi'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Zine, flyer, posta: la rete prima del web'}
  ],
  'riot-grrrl':[
    {src:'https://hyperallergic.com/content/images/hyperallergic-newspack-s3-amazonaws-com/uploads/2023/10/bikini-kill.jpg',caption:'Bikini Kill · zine · Kathleen Hanna, Tobi Vail, Kathi Wilcox, Billy Karren'},
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Zine culture · scrittura, musica, attivismo'}
  ],
  'photo-zines':[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Photo-zine · sequenza, ritmo, montaggio'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Fotografia e autoproduzione editoriale'}
  ],
  perzines:[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_Selection_of_UK_Punk_Fanzines.jpg',caption:'Perzine · voce situata e autobiografica'}
  ],
  webzines:[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Dalla rete postale alla rete digitale'}
  ],
  'paper-return':[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'La materialità torna a essere una scelta'}
  ],
  contemporary:[
    {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/ALMANAQUEZINE_FOTONOVELA_QR_CODE_versão_google_drive_(14.8_×_21_cm).png',caption:'Zine contemporanea · carta + digitale'},
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Micro-editoria, fiere, collettivi'}
  ],
  compare:[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Forme editoriali da confrontare'}
  ],
  'why-now':[
    {src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Oggetto, sequenza, comunità: perché stampare oggi?'}
  ]
};

const pad=n=>String(n).padStart(2,'0');
const safeName=n=>n.toLowerCase().replace(/[^a-z0-9._-]+/gi,'-');
const norm=x=>typeof x==='string'?{src:x}:x;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

try{
  const draft=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(Array.isArray(draft)&&draft.length===window.SLIDES.length) window.SLIDES=draft;
}catch(_){ }

function editable(value,field,tag='div',extra=''){
  const attr=editMode?' contenteditable="true" spellcheck="false"':'';
  return `<${tag} class="editable ${extra}" data-field="${field}"${attr}>${esc(value)}</${tag}>`;
}

function pointsMarkup(points=[]){
  if(!points.length)return '';
  return `<ul class="slide-points">${points.map((x,i)=>`<li class="editable" data-point="${i}"${editMode?' contenteditable="true" spellcheck="false"':''}>${esc(x)}</li>`).join('')}</ul>`;
}

function refsMarkup(refs=[]){
  if(!refs.length)return '';
  return `<div class="slide-refs">${refs.map(r=>`<a href="${r.url}" target="_blank" rel="noreferrer">${esc(r.label)} ↗</a>`).join('')}</div>`;
}

function imageMarkup(slide,{print=false}={}){
  const saved=(slide.images||[]).map(norm);
  const curated=saved.length?[]:(CURATED_IMAGES[slide.id]||[]);
  const temp=print?[]:(localMedia.get(slide.id)||[]);
  const all=[...saved,...curated.map(x=>({...x,curated:true})),...temp];
  if(!all.length)return `<div class="image-placeholder${print?'':' drop-zone'}"${print?'':' data-drop-zone'}><span>DROP YOUR IMAGE HERE</span><small>cover + dettaglio consigliati</small></div>`;
  return `<div class="media-grid${all.length===1?' is-single':''}${print?'':' drop-zone'}"${print?'':' data-drop-zone'}>${all.map((x,i)=>`<figure class="media${x.curated?' media-curated':''}" ${!print&&!x.curated?`draggable="true" data-media-index="${i}"`:''}><img src="${x.src}" alt="${esc(x.caption||'')}">${x.caption?`<figcaption>${esc(x.caption)}</figcaption>`:''}${!print&&editMode?(x.curated?'<span class="media-source">ARCHIVE PICK</span>':`<button class="media-remove" data-remove="${i}" aria-label="Rimuovi immagine">×</button><span class="media-handle">DRAG</span>`):''}</figure>`).join('')}</div>`;
}

function slideMarkup(slide,{print=false,index=0}={}){
  const isEditable=editMode&&!print;
  const kicker=isEditable?editable(slide.kicker||'','kicker','span','meta-edit'): `<span>${esc(slide.kicker||'')}</span>`;
  const title=isEditable?editable(slide.title||'','title','h1'): `<h1>${esc(slide.title||'')}</h1>`;
  const text=slide.text!==undefined?(isEditable?editable(slide.text||'','text','p'): `<p>${esc(slide.text||'')}</p>`):'';
  const reference=slide.reference!==undefined?`<div class="reference-zine"><small>ZINE DI RIFERIMENTO</small>${isEditable?editable(slide.reference||'','reference','strong'):`<strong>${esc(slide.reference||'')}</strong>`}</div>`:'';
  return `<section class="slide slide-${slide.layout}" data-id="${slide.id}"${print?` data-print-index="${index}"`:''}><header class="slide-meta">${kicker}<span>MICOL GELSI</span></header><div class="slide-copy">${title}${text}${pointsMarkupFor(slide.points||[],isEditable)}${reference}${slide.quote?`<blockquote>${esc(slide.quote)}</blockquote>`:''}${refsMarkup(slide.refs)}</div><div class="slide-media">${imageMarkup(slide,{print})}</div></section>`;
}

function pointsMarkupFor(points,isEditable){
  if(!points.length)return '';
  return `<ul class="slide-points">${points.map((x,i)=>`<li class="${isEditable?'editable':''}" data-point="${i}"${isEditable?' contenteditable="true" spellcheck="false"':''}>${esc(x)}</li>`).join('')}</ul>`;
}

function render(){
  const slide=window.SLIDES[current];
  document.body.dataset.layout=slide.layout;
  document.body.classList.toggle('edit-mode',editMode);
  document.body.classList.toggle('present-mode',!editMode);
  modeBtn.textContent=editMode?'PRESENT':'EDIT';
  app.innerHTML=slideMarkup(slide,{index:current});
  counter.textContent=`${pad(current+1)} / ${pad(window.SLIDES.length)}`;
  prevBtn.disabled=current===0;
  nextBtn.disabled=current===window.SLIDES.length-1;
  location.hash=`slide-${current+1}`;
  bindMediaUI();
  bindEditableUI();
}

function persistDraft(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(window.SLIDES));
  builderStatus.textContent=projectDir?'salvato nel progetto':'bozza salvata nel browser · collega cartella per scrivere slides.js';
}

async function saveContent(){
  persistDraft();
  if(projectDir) await writeSlidesFile();
}

function bindEditableUI(){
  if(!editMode)return;
  document.querySelectorAll('[data-field]').forEach(el=>{
    el.addEventListener('keydown',e=>{if(e.key==='Enter'&&el.tagName!=='P'){e.preventDefault();el.blur();}});
    el.addEventListener('blur',async()=>{
      const slide=window.SLIDES[current];
      slide[el.dataset.field]=el.innerText.trim();
      await saveContent();
    });
  });
  document.querySelectorAll('[data-point]').forEach(el=>{
    el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur();}});
    el.addEventListener('blur',async()=>{
      const slide=window.SLIDES[current];
      slide.points[Number(el.dataset.point)]=el.innerText.trim();
      await saveContent();
    });
  });
}

async function connectProjectFolder(){
  if(!window.showDirectoryPicker){builderStatus.textContent='browser senza accesso cartella · usa EXPORT SLIDES.JS';return}
  try{
    projectDir=await window.showDirectoryPicker({mode:'readwrite'});
    builderStatus.textContent=`collegata: ${projectDir.name}`;
    connectFolderBtn.textContent='CARTELLA COLLEGATA ✓';
  }catch(_){builderStatus.textContent='collegamento annullato'}
}

async function persistFile(slide,file){
  const imagesDir=await projectDir.getDirectoryHandle('images',{create:true});
  const slideDir=await imagesDir.getDirectoryHandle(slide.id,{create:true});
  let filename=safeName(file.name||`image-${Date.now()}.jpg`);
  const handle=await slideDir.getFileHandle(filename,{create:true});
  const writable=await handle.createWritable();
  await writable.write(file);
  await writable.close();
  return `images/${slide.id}/${filename}`;
}

async function writeSlidesFile(){
  if(!projectDir)return;
  const handle=await projectDir.getFileHandle('slides.js',{create:true});
  const writable=await handle.createWritable();
  await writable.write(serializeSlides());
  await writable.close();
  builderStatus.textContent='salvato: slides.js + media';
}

async function addFiles(files){
  const slide=window.SLIDES[current];
  const valid=[...files].filter(file=>file.type.startsWith('image/'));
  if(!valid.length)return;
  for(const file of valid){
    if(projectDir){
      const path=await persistFile(slide,file);
      slide.images=[...(slide.images||[]),path];
    }else{
      const temp=localMedia.get(slide.id)||[];
      temp.push({src:URL.createObjectURL(file),file});
      localMedia.set(slide.id,temp);
    }
  }
  if(projectDir)await writeSlidesFile();
  render();
}

function bindMediaUI(){
  if(!editMode)return;
  const zone=document.querySelector('[data-drop-zone]');
  if(!zone)return;
  ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.add('is-dragging')}));
  ['dragleave','drop'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.remove('is-dragging')}));
  zone.addEventListener('drop',e=>{if(e.dataTransfer.files?.length)addFiles(e.dataTransfer.files)});
  document.querySelectorAll('[data-remove]').forEach(button=>button.onclick=async e=>{
    e.stopPropagation();
    const i=Number(button.dataset.remove);
    const slide=window.SLIDES[current];
    if(i<(slide.images||[]).length)slide.images.splice(i,1);
    if(projectDir)await writeSlidesFile();
    persistDraft();
    render();
  });
}

function buildPrintDeck(){
  printDeck.innerHTML=window.SLIDES.map((slide,index)=>slideMarkup(slide,{print:true,index})).join('');
}

function printPdf(){
  buildPrintDeck();
  document.body.classList.add('printing');
  setTimeout(()=>window.print(),100);
}

window.addEventListener('afterprint',()=>{
  document.body.classList.remove('printing');
  printDeck.innerHTML='';
});

const serializeSlides=()=>`window.SLIDES = ${JSON.stringify(window.SLIDES,null,2)};\n`;
function downloadSlides(){
  const blob=new Blob([serializeSlides()],{type:'text/javascript'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='slides.js';
  a.click();
  URL.revokeObjectURL(a.href);
}
function next(){if(current<window.SLIDES.length-1){current++;render()}}
function prev(){if(current>0){current--;render()}}

prevBtn.onclick=prev;
nextBtn.onclick=next;
connectFolderBtn.onclick=connectProjectFolder;
exportBtn.onclick=downloadSlides;
modeBtn.onclick=()=>{editMode=!editMode;render()};
printBtn.onclick=printPdf;
fullscreenBtn.onclick=async()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();

document.addEventListener('keydown',e=>{
  if(editMode&&document.activeElement?.isContentEditable)return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();next()}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev()}
  if(e.key.toLowerCase()==='f')fullscreenBtn.click();
  if(e.key==='Escape'&&!editMode){editMode=true;render()}
});

const match=location.hash.match(/slide-(\d+)/);
if(match)current=Math.max(0,Math.min(window.SLIDES.length-1,Number(match[1])-1));
render();
