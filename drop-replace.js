// Reliable image drop behavior:
// - normal slides: drop ON an existing image => replace that exact image
// - normal slides: drop anywhere else inside .slide-media => add image(s)
// - cover: drop anywhere inside .slide-media => replace the single cover image
// This handler runs in capture phase and stops the older app.js drop handler,
// so one drop can never trigger both add and replace.
(function(){
  const asStoredItem=item=>{
    if(typeof item==='string') return item;
    if(!item) return item;
    if(item.file) return item;
    if(item.src) return item.caption ? {src:item.src,caption:item.caption} : item.src;
    return item;
  };

  function visibleSet(slide){
    const saved=(slide.images||[]).map(norm);
    const curated=saved.length?[]:(CURATED_IMAGES[slide.id]||[]);
    const temp=localMedia.get(slide.id)||[];
    return [...saved,...curated,...temp];
  }

  async function replaceAt(slide,replacementIndex,file){
    const all=visibleSet(slide);
    if(replacementIndex<0 || replacementIndex>=all.length) return;

    if(projectDir){
      const replacementPath=await persistFile(slide,file);
      const out=[];
      for(let i=0;i<all.length;i++){
        if(i===replacementIndex) out.push(replacementPath);
        else if(all[i]?.file) out.push(await persistFile(slide,all[i].file));
        else out.push(asStoredItem(all[i]));
      }
      slide.images=out.filter(Boolean);
      localMedia.delete(slide.id);
      await writeSlidesFile();
      persistDraft();
      builderStatus.textContent='IMMAGINE SOSTITUITA ✓ · salvata nel progetto';
    }else{
      const next=all.map((item,i)=>i===replacementIndex?{src:URL.createObjectURL(file),file}:item);
      if((slide.images||[]).length){
        slide.__dropBackupImages=slide.images;
        slide.images=[];
      }
      localMedia.set(slide.id,next);
      persistDraft();
      builderStatus.textContent='IMMAGINE SOSTITUITA TEMPORANEAMENTE · collega la cartella e premi SALVA TUTTO';
    }
    render();
  }

  async function replaceCover(slide,file){
    const all=visibleSet(slide);
    if(!all.length){
      await addFilesToArea(slide,[file]);
      return;
    }
    await replaceAt(slide,0,file);
  }

  async function addFilesToArea(slide,files){
    const valid=[...files].filter(file=>file.type.startsWith('image/'));
    if(!valid.length) return;

    if(projectDir){
      const base=visibleSet(slide);
      const out=[];
      for(const item of base){
        if(item?.file) out.push(await persistFile(slide,item.file));
        else out.push(asStoredItem(item));
      }
      for(const file of valid) out.push(await persistFile(slide,file));
      slide.images=out.filter(Boolean);
      localMedia.delete(slide.id);
      await writeSlidesFile();
      persistDraft();
      builderStatus.textContent=`${valid.length} IMMAGINE${valid.length>1?'I':''} AGGIUNTA${valid.length>1?'E':''} ✓ · salvata nel progetto`;
    }else{
      const temp=localMedia.get(slide.id)||[];
      valid.forEach(file=>temp.push({src:URL.createObjectURL(file),file}));
      localMedia.set(slide.id,temp);
      persistDraft();
      builderStatus.textContent=`${valid.length} IMMAGINE${valid.length>1?'I':''} AGGIUNTA${valid.length>1?'E':''} TEMPORANEAMENTE · collega la cartella e premi SALVA TUTTO`;
    }
    render();
  }

  function targets(e){
    const frame=e.target.closest?.('.slide-media');
    const media=e.target.closest?.('.media');
    return {frame,media};
  }

  function cleanupTargets(){
    document.querySelectorAll('.is-replace-target,.is-add-target').forEach(el=>{
      el.classList.remove('is-replace-target','is-add-target');
    });
  }

  document.addEventListener('dragover',e=>{
    if(!editMode) return;
    const {frame,media}=targets(e);
    if(!frame) return;

    e.preventDefault();
    e.stopPropagation();

    const slide=window.SLIDES[current];
    cleanupTargets();

    if(slide.layout==='cover'){
      frame.classList.add('is-replace-target');
    }else if(media){
      media.classList.add('is-replace-target');
    }else{
      frame.classList.add('is-add-target');
    }

    if(e.dataTransfer) e.dataTransfer.dropEffect='copy';
  },true);

  document.addEventListener('dragleave',e=>{
    const {frame}=targets(e);
    if(!frame) return;
    const related=e.relatedTarget;
    if(!related || !frame.contains(related)) cleanupTargets();
  },true);

  document.addEventListener('drop',async e=>{
    if(!editMode) return;

    const files=[...(e.dataTransfer?.files||[])].filter(f=>f.type.startsWith('image/'));
    if(!files.length) return;

    const {frame,media}=targets(e);
    if(!frame) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    cleanupTargets();

    const slide=window.SLIDES[current];

    // Cover is intentionally simple: the whole image frame replaces its single image.
    if(slide.layout==='cover'){
      await replaceCover(slide,files[0]);
      return;
    }

    // Existing figure = replace exactly that figure.
    if(media){
      const figures=[...media.parentElement.querySelectorAll(':scope > .media')];
      const index=figures.indexOf(media);
      if(index>=0) await replaceAt(slide,index,files[0]);
      return;
    }

    // Anywhere else in the image column = append new image(s).
    await addFilesToArea(slide,files);
  },true);
})();
