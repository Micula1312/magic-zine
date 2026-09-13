// Drop behavior extension: drop on an image replaces it; drop elsewhere keeps app.js add behavior.
(function(){
  async function materializeCurrentSet(slide,replacementIndex,file){
    const saved=(slide.images||[]).map(norm);
    const curated=saved.length?[]:(CURATED_IMAGES[slide.id]||[]);
    const temp=localMedia.get(slide.id)||[];
    const all=[...saved,...curated.map(x=>({...x,curated:true})),...temp];

    if(projectDir){
      const out=[];
      for(let i=0;i<all.length;i++){
        if(i===replacementIndex){
          out.push(await persistFile(slide,file));
        }else if(all[i]?.file){
          out.push(await persistFile(slide,all[i].file));
        }else{
          out.push(all[i]?.src||all[i]);
        }
      }
      slide.images=out;
      localMedia.delete(slide.id);
      await writeSlidesFile();
      persistDraft();
      builderStatus.textContent='immagine sostituita · salvata nel progetto';
    }else{
      const replacement={src:URL.createObjectURL(file),file};
      const out=all.map((item,i)=>i===replacementIndex?replacement:item);
      slide.images=out.map(item=>typeof item==='string'?item:(item?.src||item));
      builderStatus.textContent='immagine sostituita temporaneamente · collega la cartella per salvarla';
    }
    render();
  }

  document.addEventListener('dragover',e=>{
    if(!editMode)return;
    const media=e.target.closest?.('.media');
    if(!media)return;
    e.preventDefault();
    e.stopPropagation();
    media.classList.add('is-replace-target');
    if(e.dataTransfer)e.dataTransfer.dropEffect='copy';
  },true);

  document.addEventListener('dragleave',e=>{
    const media=e.target.closest?.('.media');
    if(media)media.classList.remove('is-replace-target');
  },true);

  document.addEventListener('drop',async e=>{
    if(!editMode)return;
    const media=e.target.closest?.('.media');
    if(!media)return;
    const file=[...(e.dataTransfer?.files||[])].find(f=>f.type.startsWith('image/'));
    if(!file)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    media.classList.remove('is-replace-target');

    const figures=[...media.parentElement.querySelectorAll(':scope > .media')];
    const index=figures.indexOf(media);
    if(index<0)return;
    await materializeCurrentSet(window.SLIDES[current],index,file);
  },true);
})();
