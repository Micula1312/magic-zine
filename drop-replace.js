// Reliable image drop behavior:
// - drop ON an existing image => replace that exact image
// - drop in the surrounding image area => add new image(s)
// - on cover/final special layouts, dropping on the frame replaces the single visible image
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

  function getTargets(e){
    const media=e.target.closest?.('.media');
    const zone=e.target.closest?.('[data-drop-zone]');
    const frame=e.target.closest?.('.slide-media');
    return {media,zone,frame};
  }

  function isSingleFrameReplace(slide,media,zone,frame){
    if(media || zone || !frame) return false;
    const count=visibleSet(slide).length;
    return count===1 && ['cover','statement','final'].includes(slide.layout);
  }

  document.addEventListener('dragover',e=>{
    if(!editMode)return;
    const slide=window.SLIDES[current];
    const {media,zone,frame}=getTargets(e);
    const frameReplace=isSingleFrameReplace(slide,media,zone,frame);
    if(!media && !zone && !frameReplace)return;
    e.preventDefault();
    if(media) media.classList.add('is-replace-target');
    if(frameReplace) frame.classList.add('is-replace-target');
    if(e.dataTransfer)e.dataTransfer.dropEffect='copy';
  },true);

  document.addEventListener('dragleave',e=>{
    const {media,frame}=getTargets(e);
    if(media) media.classList.remove('is-replace-target');
    if(frame) frame.classList.remove('is-replace-target');
  },true);

  document.addEventListener('drop',async e=>{
    if(!editMode)return;
    const files=[...(e.dataTransfer?.files||[])].filter(f=>f.type.startsWith('image/'));
    if(!files.length)return;

    const slide=window.SLIDES[current];
    const {media,zone,frame}=getTargets(e);
    const frameReplace=isSingleFrameReplace(slide,media,zone,frame);
    if(!media && !zone && !frameReplace)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if(media){
      media.classList.remove('is-replace-target');
      const figures=[...media.parentElement.querySelectorAll(':scope > .media')];
      const index=figures.indexOf(media);
      if(index>=0) await replaceAt(slide,index,files[0]);
      return;
    }

    if(frameReplace){
      frame.classList.remove('is-replace-target');
      await replaceAt(slide,0,files[0]);
      return;
    }

    await addFilesToArea(slide,files);
  },true);
})();
