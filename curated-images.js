window.MAGIC_ZINE_IMAGES={
intro:[{src:'https://angeloferrillo.org/wp-content/uploads/2025/03/uk_and_us_zines.jpg',caption:'Fanzine UK / US · panoramica storica'}],
'what-is-a-zine':[{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/1970s_fanzines_%2821224199545%29.jpg/960px-1970s_fanzines_%2821224199545%29.jpg',caption:'Selezione di fanzine punk e post-punk · forme e linguaggi'}],
'amateur-press':[{src:'https://fanac.org/fanzines/Comet/Comet01-cv.jpeg',caption:'The Comet · Science Correspondence Club · cover · 1930'}],
'sf-fandom':[{src:'https://fanac.org/fanzines/Comet/Comet01-01.jpeg',caption:'The Comet · pagina interna · 1930'}],
counterculture:[{src:'https://images.wisconsinhistory.org/700007140003/0714000011-l.jpg',caption:'The Black Panther: Black Community News Service · stampa politica underground · 1970'}],
punk:[{src:'https://upload.wikimedia.org/wikipedia/en/3/3f/Sniffin_glue_1_cover.jpg',caption:'Sniffin’ Glue · issue 1 · 1976'}],
'punk-grammar':[{src:'https://angeloferrillo.org/wp-content/uploads/2025/03/1970s_fanzines_21224199545.jpg',caption:'Punk DIY · xerox, collage, lettering manuale'}],
'italy-77':[
 {src:'https://www.arengario.it/wp-content/uploads/2022/03/A-TRAVERSO-febbraio-1977.jpg',caption:'A/traverso · Giornale per l’Autonomia · Bologna · 1977'},
 {src:'https://www.slumberland.it/public/gallerie/pentothal_prima_tavola.jpg',caption:'Andrea Pazienza · Le straordinarie avventure di Pentothal · 1977 · Bologna'},
 {src:'https://www.citebd.org/sites/default/files/styles/free_content/public/2023-09/4.-cannibale-n.3-juin-1977-troisiecme-numeuro-de-la-revue-dessins-de-mattioli-et-tamburini.jpeg?itok=vWn0bjTG',caption:'Cannibale · 1977 · rivista underground legata alla scena creativa del ’77'}
],
'xerox-culture':[{src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/1989-1_Skintonic_Nummer_4_-_01.jpg',caption:'Skintonic n. 4 · 1989'}],
networks:[{src:'https://rumorbooks.com/cdn/shop/files/Photo12-12-2023_43622pm.jpg?v=1702429782',caption:'Factsheet Five · no. 38'}],
'graffiti-zines':[{src:'https://www.grafflibrary.com/media/12_oz_prophet_issue_1.jpg',caption:'12 Ounce Prophet · graffiti publishing · primi anni Novanta'},{src:'https://exhibitions.letterformarchive.org/mischief/media/pages/artworks/12oz-prophet-issue-3/4c375b74c4-1687912190/lfa_skillscollections_0302_001.jpg',caption:'12oz Prophet · issue 3 · 1995'}],
'riot-grrrl':[{src:'https://hyperallergic.com/content/images/hyperallergic-newspack-s3-amazonaws-com/uploads/2023/10/bikini-kill.jpg',caption:'Girl Power #2 · 1991 · Riot Grrrl'}],
'photo-zines':[{src:'https://dalezineshop.com/cdn/shop/files/ari-marcopoulos-zines_interior_005_grande.webp?v=1686861114',caption:'Ari Marcopoulos: Zines · spread'}],
perzines:[{src:'https://i.pinimg.com/originals/57/20/47/572047a7291a72e6eba9989c193221cf.jpg',caption:'Jigsaw #7 · Tobi Vail'}],
webzines:[{src:'https://miro.medium.com/v2/resize%3Afit%3A1400/1%2AGU1SodSBe8J9Y0rkn93Y0A.png',caption:'On-line journal · 1996'}],
'paper-return':[{src:'https://imaonline.jp/wp-content/uploads/2017/03/new-20170308la-art-book-fair_11-1000x751.jpg',caption:'Self Publish, Be Happy · LA Art Book Fair'}],
contemporary:[{src:'https://media.somersethouse.org.uk/images/PageMasters-_May_Monthly_-_mobil.format-webp.width-3200_znaxFthS5LbHDCsM.webp',caption:'Zine fair contemporanea'}],
compare:[{src:'https://www.pen-online.jp/uploads/94878b65a6d28f2927754735a2dd5c0dac859968.jpg',caption:'Tokyo Art Book Fair'}],
'why-now':[{src:'https://images.squarespace-cdn.com/content/v1/5ea2512665a84946698888f1/1593736331922-JXGWGAFEG40YA6CA5F8K/218548_208050675882730_7921232_o.jpg',caption:'Zinefest · oggetto, incontro, circolazione'}],
bibliography:[{src:'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1647899629i/60610185.jpg',caption:'Shotgun Seamstress · antologia della pratica zine'}]
};
Object.keys(CURATED_IMAGES).forEach(k=>delete CURATED_IMAGES[k]);
Object.assign(CURATED_IMAGES,window.MAGIC_ZINE_IMAGES);
render();
