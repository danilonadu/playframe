const KEY="playframe.library.v2";
const $=s=>document.querySelector(s);
const fallback="";
const featured=[
 {title:"Grand Theft Auto VI",display:"GRAND THEFT<br><em>AUTO VI</em>",genre:"OPEN WORLD · ACTION",publisher:"ROCKSTAR GAMES",query:"Grand Theft Auto VI",fallback:"",description:"Bem-vindo a Leonida. Uma nova história está prestes a começar."},
 {title:"Red Dead Redemption 2",display:"RED DEAD<br><em>REDEMPTION 2</em>",genre:"ACTION · ADVENTURE",publisher:"ROCKSTAR GAMES",query:"Red Dead Redemption 2",fallback:"",description:"Uma jornada pelo fim de uma era no Velho Oeste."},
 {title:"Cyberpunk 2077",display:"CYBERPUNK<br><em>2077</em>",genre:"OPEN WORLD · RPG",publisher:"CD PROJEKT RED",query:"Cyberpunk 2077",fallback:"",description:"Night City. Uma cidade que nunca dorme e nunca perdoa."},
 {title:"The Witcher 3: Wild Hunt",display:"THE WITCHER 3<br><em>WILD HUNT</em>",genre:"FANTASY · RPG",publisher:"CD PROJEKT RED",query:"The Witcher 3 Wild Hunt",fallback:"",description:"Monstros, escolhas e destinos em um mundo inesquecível."}
];
const seed=[
 {id:"seed-1",name:"Grand Theft Auto VI",genre:"Ação",status:"Quero jogar",rating:0,year:"",image:"",description:"Ambientado no estado fictício de Leonida, com Vice City como um de seus cenários. A história acompanha Lucia e Jason.",developer:"Rockstar North",publisher:"Rockstar Games",platforms:"PlayStation 5 · Xbox Series X|S",source:"https://www.rockstargames.com/VI",createdAt:"2026-11-01T10:00:00Z"},
 {id:"seed-2",name:"Red Dead Redemption 2",genre:"Aventura",status:"Concluído",rating:10,year:2018,image:"",description:"Acompanhe Arthur Morgan e a gangue Van der Linde em uma jornada pelo fim da era do Velho Oeste americano.",developer:"Rockstar Studios",publisher:"Rockstar Games",platforms:"PlayStation 4 · Xbox One · PC",source:"https://www.rockstargames.com/reddeadredemption2",createdAt:"2026-11-02T10:00:00Z"},
 {id:"seed-3",name:"Cyberpunk 2077",genre:"RPG",status:"Jogando",rating:9,year:2020,image:"",description:"RPG de ação em mundo aberto ambientado em Night City. Você controla V, um mercenário em busca de um implante ligado à imortalidade.",developer:"CD Projekt Red",publisher:"CD Projekt",platforms:"PlayStation · Xbox · PC",source:"https://www.cyberpunk.net",createdAt:"2026-11-03T10:00:00Z"}
];
let games=load();
let currentSlide=0;
let slideData=[...featured];
let toastTimer;
function load(){try{const value=localStorage.getItem(KEY);if(value)return JSON.parse(value);const previous=localStorage.getItem("playframe.library.v1");if(previous){const migrated=JSON.parse(previous);localStorage.setItem(KEY,JSON.stringify(migrated));return migrated}localStorage.setItem(KEY,JSON.stringify(seed));return [...seed]}catch(e){return [...seed]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(games))}catch(e){notify("Não foi possível salvar no armazenamento do navegador.")}}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(s){try{const u=new URL(s);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return ""}}
function fallbackGenre(g){return ""}
async function getWikiSummary(title){
 const url="https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(title.replaceAll(" ","_"));
 const res=await fetch(url,{headers:{Accept:"application/json"}});if(!res.ok)throw new Error("Resumo indisponível");
 return await res.json();
}
function setSlide(index){
 currentSlide=(index+featured.length)%featured.length;
 const item=featured[currentSlide];
 $("#spotlightBg").style.backgroundImage=`url("${item.fallback}")`;
 $("#gameTitle").innerHTML=item.display;
 $("#gameGenre").textContent=item.genre;
 $("#gameDescription").textContent=item.description;
 $("#spotlightPublisher").textContent=item.publisher;
 $("#slideNumber").textContent=`0${currentSlide+1} / 0${featured.length}`;
 $("#progressBar").style.width=`${((currentSlide+1)/featured.length)*100}%`;
 $("#spotlightDetails").onclick=()=>openDetails({id:"feature-"+currentSlide,name:item.title,genre:item.genre.split(" · ")[0],status:"Destaque",rating:0,year:"",image:item.fallback,description:item.description,source:"https://en.wikipedia.org/wiki/"+encodeURIComponent(item.query.replaceAll(" ","_"))});
 getWikiSummary(item.query).then(data=>{
   if(currentSlide!==featured.indexOf(item))return;
   const img=data.originalimage?.source||data.thumbnail?.source;
   if(img)$("#spotlightBg").style.backgroundImage=`url("${img}")`;
   if(data.extract)$("#gameDescription").textContent=data.extract.slice(0,220)+(data.extract.length>220?"…":"");
 }).catch(()=>{});
}
$("#previousSlide").addEventListener("click",()=>setSlide(currentSlide-1));
$("#nextSlide").addEventListener("click",()=>setSlide(currentSlide+1));
function render(){
 const q=$("#librarySearch").value.trim().toLocaleLowerCase("pt-BR"),genre=$("#genreFilter").value,sort=$("#sortLibrary").value;
 let visible=games.filter(g=>[g.name,g.genre,g.status,g.description].join(" ").toLocaleLowerCase("pt-BR").includes(q)&&(genre==="Todos"||g.genre===genre));
 if(sort==="az")visible.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
 if(sort==="za")visible.sort((a,b)=>b.name.localeCompare(a.name,"pt-BR"));
 if(sort==="rating")visible.sort((a,b)=>Number(b.rating)-Number(a.rating));
 if(sort==="recent")visible.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 $("#libraryCount").textContent=`${visible.length} ${visible.length===1?"JOGO":"JOGOS"}`;
 $("#emptyState").hidden=visible.length>0;
 $("#gameGrid").innerHTML=visible.map(g=>`<article class="game-card">
  <button class="game-cover" type="button" data-action="details" data-id="${esc(g.id)}" aria-label="Ver detalhes de ${esc(g.name)}">
   ${safeUrl(g.image)?`<img src="${esc(safeUrl(g.image))}" alt="${esc(g.name)}" loading="lazy">`:`<span class="cover-placeholder" aria-hidden="true"></span>`}
   <span class="cover-genre">${esc(g.genre)} · ${esc(g.status)}</span>
  </button>
  <div class="game-info"><div><h3>${esc(g.name)}</h3><p>${g.year?esc(g.year)+" · ":""}${Number(g.rating)>0?"★ "+esc(g.rating)+"/10":"Sem avaliação"}</p></div>
   <div class="card-actions"><button type="button" data-action="edit" data-id="${esc(g.id)}" aria-label="Editar ${esc(g.name)}" title="Editar">↗</button><button type="button" data-action="delete" data-id="${esc(g.id)}" aria-label="Excluir ${esc(g.name)}" title="Excluir">×</button></div>
  </div></article>`).join("");
}
function notify(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2500)}
function openForm(game=null){
 $("#gameForm").reset();$("#gameId").value="";$("#formError").textContent="";
 $("#formTitle").innerHTML=game?"Edit a <em>game.</em>":"Add a <em>game.</em>";
 $("#formMode").textContent=game?"EDIT GAME / YOUR LIBRARY":"NEW GAME / YOUR LIBRARY";
 if(game){$("#gameId").value=game.id;$("#inputName").value=game.name;$("#inputGenre").value=game.genre;$("#inputStatus").value=game.status;$("#inputRating").value=game.rating||0;$("#inputYear").value=game.year||"";$("#inputImage").value=game.image||"";$("#inputDescription").value=game.description;$("#inputDeveloper").value=game.developer||"";$("#inputPublisher").value=game.publisher||"";$("#inputPlatforms").value=game.platforms||"";$("#inputSource").value=game.source||""}
 $("#gameDialog").showModal();$("#inputName").focus();
}
function openDetails(game){
 const image=safeUrl(game.image);
 $("#detailContent").innerHTML=`<div class="detail-hero">${image?`<img src="${esc(image)}" alt="${esc(game.name)}">`:``}</div><div class="detail-body"><div class="detail-meta">${esc(game.genre)} · ${esc(game.status)} ${game.year?"· "+esc(game.year):""}</div><h2 id="detailHeading">${esc(game.name)}</h2><p>${esc(game.description)}</p><dl class="game-facts">${game.developer?`<div><dt>Desenvolvedora</dt><dd>${esc(game.developer)}</dd></div>`:""}${game.publisher?`<div><dt>Publicadora</dt><dd>${esc(game.publisher)}</dd></div>`:""}${game.platforms?`<div><dt>Plataformas</dt><dd>${esc(game.platforms)}</dd></div>`:""}${game.year?`<div><dt>Lançamento</dt><dd>${esc(game.year)}</dd></div>`:""}${Number(game.rating)>0?`<div><dt>Sua avaliação</dt><dd>★ ${esc(game.rating)}/10</dd></div>`:""}</dl>${safeUrl(game.source)?`<a class="detail-source" href="${esc(safeUrl(game.source))}" target="_blank" rel="noopener noreferrer">Fonte e mais informações ↗</a>`:""}${games.some(g=>g.id===game.id)?`<div class="dialog-actions"><button type="button" class="cancel" data-edit-detail="${esc(game.id)}">Editar jogo</button></div>`:""}</div>`;
 $("#detailDialog").showModal();
}
$("#gameForm").addEventListener("submit",e=>{
 e.preventDefault();if(!$("#gameForm").reportValidity())return;
 const id=$("#gameId").value,name=$("#inputName").value.trim(),description=$("#inputDescription").value.trim();
 if(name.length<2||description.length<8){$("#formError").textContent="Informe um título e uma descrição mais completos.";return}
 const game={id:id||"game-"+Date.now()+"-"+Math.random().toString(16).slice(2,7),name,genre:$("#inputGenre").value,status:$("#inputStatus").value,rating:Number($("#inputRating").value)||0,year:$("#inputYear").value||"",image:safeUrl($("#inputImage").value),description,developer:$("#inputDeveloper").value.trim(),publisher:$("#inputPublisher").value.trim(),platforms:$("#inputPlatforms").value.trim(),source:safeUrl($("#inputSource").value),createdAt:id?(games.find(g=>g.id===id)?.createdAt||new Date().toISOString()):new Date().toISOString()};
 if(id)games=games.map(g=>g.id===id?game:g);else games.unshift(game);
 save();render();$("#gameDialog").close();notify(id?"Jogo atualizado.":"Jogo adicionado à biblioteca.");
});
$("#gameGrid").addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const g=games.find(x=>x.id===b.dataset.id);if(!g)return;
 if(b.dataset.action==="details")openDetails(g);
 if(b.dataset.action==="edit")openForm(g);
 if(b.dataset.action==="delete"&&confirm(`Remover "${g.name}" da sua biblioteca?`)){games=games.filter(x=>x.id!==g.id);save();render();notify("Jogo removido.")}
});
$("#detailContent").addEventListener("click",e=>{const b=e.target.closest("[data-edit-detail]");if(!b)return;const g=games.find(x=>x.id===b.dataset.editDetail);$("#detailDialog").close();if(g)openForm(g)});
$("#openAdd").addEventListener("click",()=>openForm());
$("#closeForm").addEventListener("click",()=>$("#gameDialog").close());
$("#cancelForm").addEventListener("click",()=>$("#gameDialog").close());
$("#closeDetail").addEventListener("click",()=>$("#detailDialog").close());
["#librarySearch","#genreFilter","#sortLibrary"].forEach(s=>$(s).addEventListener(s==="#librarySearch"?"input":"change",render));

async function searchWiki(term){
 const msg=$("#apiMessage"),results=$("#apiResults");msg.textContent="Pesquisando artigos e imagens…";results.innerHTML="";
 const params=new URLSearchParams({action:"query",generator:"search",gsrsearch:`${term} video game`,gsrlimit:"8",prop:"pageimages|extracts|info",piprop:"thumbnail",pithumbsize:"1200",exintro:"1",explaintext:"1",inprop:"url",redirects:"1",format:"json",formatversion:"2",origin:"*"});
 try{
  const res=await fetch("https://en.wikipedia.org/w/api.php?"+params.toString());if(!res.ok)throw new Error("HTTP "+res.status);
  const data=await res.json();if(data.error)throw new Error(data.error.info);
  const pages=(data.query?.pages||[]).sort((a,b)=>(a.index||0)-(b.index||0));
  if(!pages.length){msg.textContent="Nenhum resultado encontrado. Tente outro título.";return}
  msg.textContent=`${pages.length} resultado(s). Confira as informações antes de importar.`;
  results.innerHTML=pages.map((p,i)=>`<article class="api-result">${p.thumbnail?.source?`<img src="${esc(p.thumbnail.source)}" alt="" loading="lazy">`:`<div class="api-no-image"></div>`}<div class="api-result-info"><strong>${esc(p.title)}</strong><p>${esc((p.extract||"Artigo da Wikipedia.").slice(0,145))}</p><button type="button" data-import="${i}">Adicionar à coleção +</button></div></article>`).join("");
  results._pages=pages;
 }catch(err){console.error(err);msg.textContent="Não foi possível consultar a Wikipedia agora. Você ainda pode cadastrar jogos manualmente."}
}
$("#apiSearchForm").addEventListener("submit",e=>{e.preventDefault();const term=$("#apiSearchInput").value.trim();if(term.length>1)searchWiki(term)});
$("#apiResults").addEventListener("click",e=>{
 const b=e.target.closest("[data-import]");if(!b)return;const p=$("#apiResults")._pages?.[Number(b.dataset.import)];if(!p)return;
 if(games.some(g=>g.name.toLowerCase()===p.title.toLowerCase())){notify("Esse jogo já está na sua coleção.");return}
 games.unshift({id:"wiki-"+Date.now(),name:p.title,genre:"Outro",status:"Quero jogar",rating:0,year:"",image:p.original?.source||p.thumbnail?.source||"",description:p.extract||"Resumo não disponível. Consulte a fonte para mais informações.",source:p.fullurl||`https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replaceAll(" ","_"))}`,createdAt:new Date().toISOString()});
 save();render();notify("Jogo importado para sua coleção.");$("#library").scrollIntoView({behavior:"smooth"});
});
setSlide(0);render();
// Busca imagens originais da Wikimedia para os jogos iniciais sem imagem cadastrada.
(async()=>{for(const game of games.filter(g=>!g.image)){try{const data=await getWikiSummary(game.name);const image=data.originalimage?.source||data.thumbnail?.source;if(image){game.image=image;save();render();}}catch(_){}}})();
