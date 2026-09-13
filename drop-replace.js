// Reliable image drop behavior:
// - drop ON an existing image => replace that exact image
// - drop in the surrounding image area => add new image(s)
// - curated/default images are preserved when adding the first custom image
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

  async function persistVisibleSet(slide,items){
    const out=[];
    for(const item of items){
      if(item?.file){
        out.push(await persistFile(slide,item.file));
      }else{
        out.push(asStoredItem(item));
      }
    }
    slide.images=out.filter(Boolean);
    localMedia.delete(slide.id);
    await writeSlidesFile();
    persistDraft();
  }

  async function replaceAt(slide,replacementIndex,file){
    const all=visibleSet(slide);
    if(replacementIndex<0 || replacementIndex>=all.length) return;

    if(projectDir){
      const replacementPath=await persistFile(slide,file);
      const out=[];
      for(let i=0;i<all.length;i++){
        if(i===replacementIndex){
          out.push(replacementPath);
        }else if(all[i]?.file){
          out.push(await persistFile(slide,all[i].file));
        }else{
          out.push(asStoredItem(all[i]));
        }
      }
      slide.images=out.filter(Boolean);
      localMedia.delete(slide.id);
      await writeSlidesFile();
      persistDraft();
      builderStatus.textContent='IMMAGINE SOSTITUITA ✓ · salvata nel progetto';
    }else{
      // Keep everything temporary until the project folder is connected.
      // We intentionally do not write blob: URLs into persistent slide data.
      const next=all.map((item,i)=>i===replacementIndex?{src:URL.createObjectURL(file),file}:item);
      const curatedCount=(slide.images||[]).length?0:(CURATED_IMAGES[slide.id]||[]).length;
      const savedCount=(slide.images||[]).length;

      if(savedCount){
        // Existing saved references stay in slide.images; only temporary replacements are held locally.
        // To represent the complete visible set safely, move it into localMedia and temporarily hide saved refs.
        slide.__dropBackupImages=slide.images;
        slide.images=[];
      }
      // When defaults are visible, keeping slide.images empty lets curated images remain visible.
      // For a replacement of a curated item, store the whole visible set as temporary items.
      localMedia.set(slide.id,next.map((item,i)=>{
        if(i===replacementIndex) return item;
        if(item?.file) return item;
        if(i<curatedCount) return item;
        return item;
      }));
      persistDraft();
      builderStatus.textContent='IMMAGINE SOSTITUITA TEMPORANEAMENTE · collega la cartella e premi SALVA TUTTO';
    }
    render();
  }

  async function addFilesToArea(slide,files){
    const valid=[...files].filter(file=>file.type.startsWith('image/'));
    if(!valid.length) return;

    if(projectDir){
      // Materialize exactly what is currently visible first, including curated defaults
      // and any temporary images, then append the new drops.
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

  document.addEventListener('dragover',e=>{
    if(!editMode)return;
    const media=e.target.closest?.('.media');
    const zone=e.target.closest?.('[data-drop-zone]');
    if(!media && !zone)return;
    e.preventDefault();
    if(media) media.classList.add('is-replace-target');
    if(e.dataTransfer)e.dataTransfer.dropEffect='copy';
  },true);

  document.addEventListener('dragleave',e=>{
    const media=e.target.closest?.('.media');
    if(media)media.classList.remove('is-replace-target');
  },true);

  document.addEventListener('drop',async e=>{
    if(!editMode)return;
    const files=[...(e.dataTransfer?.files||[])].filter(f=>f.type.startsWith('image/'));
    if(!files.length)return;

    const media=e.target.closest?.('.media');
    const zone=e.target.closest?.('[data-drop-zone]');
    if(!media && !zone)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const slide=window.SLIDES[current];

    if(media){
      media.classList.remove('is-replace-target');
      const figures=[...media.parentElement.querySelectorAll(':scope > .media')];
      const index=figures.indexOf(media);
      if(index>=0) await replaceAt(slide,index,files[0]);
      return;
    }

    await addFilesToArea(slide,files);
  },true);
})();
