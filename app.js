const $=(s)=>document.querySelector(s);
const $$=(s)=>document.querySelectorAll(s);
let admin=false,activeRoom=1;

const stories=["Forward","FNB","Spar","Partners","Rooms","Advertising"];
let posts=[
 {title:"Welcome To Access.",type:"Opportunity Update",body:"Forward connects people, opportunities, rooms and movement.",likes:12,liked:false},
 {title:"The Future Of South African Wealth Is Human Capital.",type:"Access Note",body:"South Africa does not lack talent. It lacks access, alignment and proximity to opportunity.",likes:21,liked:false}
];
let rooms=[
 {name:"Announcements",desc:"Admin-only updates",members:221,locked:true,readOnly:true},
 {name:"General Access",desc:"Open ecosystem room",members:221,locked:false,readOnly:false},
 {name:"SMMEs",desc:"Entrepreneurs and business owners",members:84,locked:false,readOnly:false},
 {name:"Farmers",desc:"Agriculture and farming access",members:31,locked:false,readOnly:false},
 {name:"Funding & Grants",desc:"Capital and opportunity access",members:117,locked:false,readOnly:false},
 {name:"E-commerce",desc:"Online selling and digital commerce",members:76,locked:false,readOnly:false},
 {name:"Green Sector",desc:"Energy, climate and sustainability",members:62,locked:false,readOnly:false},
 {name:"Technology",desc:"Builders, tools and digital work",members:91,locked:false,readOnly:false},
 {name:"Media",desc:"Creative economy and visibility",members:57,locked:false,readOnly:false},
 {name:"NGOs & NPOs",desc:"Impact, funding and partnerships",members:51,locked:false,readOnly:false},
 {name:"Learnerships",desc:"Skills and learning opportunities",members:189,locked:false,readOnly:false},
 {name:"People Living With Disabilities",desc:"Inclusive access and opportunity",members:19,locked:false,readOnly:false},
 {name:"Unemployed Youth",desc:"Youth opportunity access",members:144,locked:false,readOnly:false},
 {name:"Unemployed General",desc:"Open opportunity access",members:63,locked:false,readOnly:false},
 {name:"Essentials",desc:"Essentials membership room",members:28,locked:true,readOnly:false},
 {name:"Breakthrough",desc:"Breakthrough membership room",members:14,locked:true,readOnly:false},
 {name:"Premium Experience",desc:"Premium private room",members:7,locked:true,readOnly:false}
];
let offers=[
 {title:"Essentials Membership",price:"R199 / month",button:"Apply",details:"Core access, rooms, updates and member movement."},
 {title:"Breakthrough Membership",price:"R499 / month",button:"Join",details:"Private rooms, stronger support, focused access and partner opportunities."},
 {title:"Premium Experience",price:"R699 / month",button:"Reserve",details:"Priority access, premium rooms, curated opportunities and visibility."}
];
let events=[
 {title:"Forward Access Evening",date:"Coming Soon",price:"Invite-only",poster:"Access Evening",details:"A private gathering for founders, professionals, funders and builders."},
 {title:"Opportunity Room: Funding & Grants",date:"June 2026",price:"Free / RSVP",poster:"Funding Room",details:"A focused access session for funding pathways, grants and capital readiness."}
];

function profileData(){return{first:$("#firstName").value.trim(),surname:$("#surname").value.trim(),contact:$("#contact").value.trim(),province:$("#province").value,age:$("#age").value,industry:$("#industry").value,thought:"Can’t wait for Opportunities."}}
function saveProfile(){const p=profileData();localStorage.setItem("forwardProfileV23",JSON.stringify(p));return p}
function loadProfile(){try{return JSON.parse(localStorage.getItem("forwardProfileV23")||"null")}catch(e){return null}}
function setProfile(p){$("#profileName").textContent=`${p.first} ${p.surname}`.trim();$("#pProvince").textContent=p.province||"-";$("#pIndustry").textContent=p.industry||"-";$("#pAge").textContent=p.age||"-";$("#avatar").textContent=(p.first||"F")[0].toUpperCase();$("#statusText").textContent=`${p.province||"Access"} • ${p.industry||"Member"}`;$("#thoughtDisplay").textContent=`“${p.thought||"Can’t wait for Opportunities."}”`}
function enter(p,loading=true){$("#authScreen").classList.add("hidden");if(loading)$("#loadingScreen").classList.remove("hidden");setTimeout(()=>{$("#loadingScreen").classList.add("hidden");$("#app").classList.remove("hidden");setProfile(p);renderAll()},loading?5000:0)}
$("#joinBtn").onclick=()=>{if(!$("#firstName").value.trim()||!$("#surname").value.trim()||!$("#contact").value.trim()||!$("#province").value||!$("#age").value||!$("#industry").value){alert("Please complete all fields.");return}if(!$("#consent").checked){alert("Please accept the consent form.");return}enter(saveProfile())}
const existing=(function(){try{const c=localStorage.getItem("forwardActiveContactV25");if(!c)return null;const ps=JSON.parse(localStorage.getItem("forwardProfilesV25")||"{}");return ps[c]||null}catch(e){return null}})();if(existing)enter(existing,false);

function renderAll(){renderStories();renderFeed();renderRooms();renderMarket();renderEvents();applyAdmin()}
function renderStories(){$("#stories").innerHTML=stories.map((s,i)=>`<div class="story ${i===0?"active":""}"><div class="ring">${s[0]}</div><small>${s}</small></div>`).join("")}
function renderFeed(){$("#feed").innerHTML=posts.map((p,i)=>`<article class="feed-card"><div class="feed-head"><span>Forward</span><small>${p.type}</small></div><h3>${p.title}</h3><p>${p.body}</p><div class="actions"><button class="like ${p.liked?"liked":""}" data-post="${i}">${p.liked?"♥":"♡"} <span>${p.likes}</span></button><button>Comment</button><button>Share</button><button>React</button></div>${admin?'<div class="admin-tools"><button>Edit Post</button><button class="danger">Delete Post</button></div>':""}</article>`).join("");$$(".like").forEach(b=>b.onclick=()=>{let p=posts[+b.dataset.post];p.liked=!p.liked;p.likes+=p.liked?1:-1;renderFeed()})}
function status(r){return r.readOnly?"Read-only":(r.locked?"Closed":"Open")}
function renderRooms(){$("#roomList").innerHTML=rooms.map((r,i)=>`<button class="room-card" data-room="${i}"><div><h3>${r.name}</h3><p>${r.desc}</p></div><div class="room-meta"><span class="status ${status(r)!=="Open"?"closed":""}">${status(r)}</span><span class="count">${r.members} Members</span></div></button>`).join("");$$(".room-card").forEach(c=>c.onclick=()=>{activeRoom=+c.dataset.room;openRoom()})}
function openRoom(){const r=rooms[activeRoom];$("#roomTitle").textContent=r.name;$("#roomMeta").textContent=`${status(r)} room • ${r.members} members • reactions enabled`;$("#editRoomName").value=r.name;$("#editRoomDesc").value=r.desc;$("#composer").classList.toggle("hidden",(r.locked||r.readOnly)&&!admin);showPage("roomView");renderMessages();applyAdmin()}
$("#backToRooms").onclick=()=>showPage("rooms");
$("#saveRoomEdit").onclick=()=>{rooms[activeRoom].name=$("#editRoomName").value||rooms[activeRoom].name;rooms[activeRoom].desc=$("#editRoomDesc").value||rooms[activeRoom].desc;openRoom();renderRooms()}
$("#toggleLock").onclick=()=>{rooms[activeRoom].locked=!rooms[activeRoom].locked;openRoom();renderRooms()}
$("#toggleReadOnly").onclick=()=>{rooms[activeRoom].readOnly=!rooms[activeRoom].readOnly;openRoom();renderRooms()}
$("#deleteRoom").onclick=()=>{if(rooms.length>1){rooms.splice(activeRoom,1);activeRoom=0;showPage("rooms");renderRooms()}}
function reactionBar(){return `<div class="reaction-row">${["❤️","👍","😊","✅","💯"].map(x=>`<button>${x}</button>`).join("")}</div>`}
function renderMessages(){$("#messages").innerHTML=[["Forward","Welcome To Forward Access."],["Forward","Use this room for signal, movement and opportunity. No noise."]].map(m=>`<div class="msg"><small>${m[0]}</small>${m[1]}${reactionBar()}</div>`).join("");attachReactions()}
function attachReactions(){$$(".reaction-row button").forEach(b=>b.onclick=()=>b.classList.toggle("active"))}
$("#sendMessage").onclick=()=>{let v=$("#messageInput").value.trim();if(!v)return;let d=document.createElement("div");d.className="msg";d.innerHTML=`<small>You</small>${v}${reactionBar()}`;$("#messages").appendChild(d);$("#messageInput").value="";attachReactions()}
function renderMarket(){$("#marketList").innerHTML=offers.map((o,i)=>`<div class="market-card"><div class="product-image">${o.title.split(" ")[0]}</div><h3>${o.title}</h3><p>${o.price}</p><button>${o.button}</button><button class="read-more" data-offer="${i}">Read More</button><div class="details" id="offer${i}"><p>${o.details}</p>${admin?'<div class="admin-tools"><button>Edit Offer</button><button class="danger">Delete Offer</button></div>':""}</div></div>`).join("");$$("[data-offer]").forEach(b=>b.onclick=()=>$("#offer"+b.dataset.offer).classList.toggle("open"))}
function renderEvents(){$("#eventsList").innerHTML=events.map((e,i)=>`<div class="event-card"><div class="event-poster">${e.poster}</div><h3>${e.title}</h3><p>${e.date} • ${e.price}</p><button class="read-more" data-event="${i}">See More Details</button><div class="details" id="event${i}"><p>${e.details}</p><button>Register Interest</button>${admin?'<div class="admin-tools"><button>Edit Event</button><button class="danger">Delete Event</button></div>':""}</div></div>`).join("");$$("[data-event]").forEach(b=>b.onclick=()=>$("#event"+b.dataset.event).classList.toggle("open"))}
$("#showOfferCreator").onclick=()=>$("#offerCreator").classList.toggle("hidden");$("#showEventCreator").onclick=()=>$("#eventCreator").classList.toggle("hidden");$("#showRoomCreator").onclick=()=>$("#roomCreator").classList.toggle("hidden");
$("#createOffer").onclick=()=>{offers.unshift({title:$("#offerTitle").value||"New Offer",price:$("#offerPrice").value||"Custom",button:$("#offerButton").value,details:$("#offerDesc").value||"Offer details."});renderMarket()}
$("#createEvent").onclick=()=>{events.unshift({title:$("#eventTitle").value||"New Event",date:$("#eventDate").value||"Coming Soon",price:$("#eventPrice").value||"Free",poster:$("#eventTitle").value||"Event Poster",details:$("#eventDesc").value||"Event details."});renderEvents();enhanceEventPostersV25 && enhanceEventPostersV25()}
$("#createRoom").onclick=()=>{rooms.unshift({name:$("#newRoomName").value||"New Room",desc:$("#newRoomDesc").value||"Access room",members:0,locked:false,readOnly:false});renderRooms()}
$("#addPost").onclick=()=>{posts.unshift({title:$("#postTitle").value||"Forward Update",type:"Admin Post",body:$("#postBody").value||"New access update.",likes:0,liked:false});renderFeed()}
$("#saveThought").onclick=()=>{let v=$("#thoughtInput").value.trim();if(!v)return;let p=loadProfile()||{};p.thought=v;localStorage.setItem("forwardProfileV23",JSON.stringify(p));$("#thoughtDisplay").textContent=`“${v}”`;$("#thoughtInput").value=""}
$("#askAI").onclick=()=>{
 let q=$("#aiQuestion").value.trim().toLowerCase();
 let a=$("#aiAnswer");
 if(!q){a.textContent="Ask about rooms, memberships, events, marketplace, earnings, profile, admin settings or opportunities.";return}

 if(q.includes("what is forward")||q.includes("about forward")||q.includes("forward do")||q.includes("what does forward")){
   a.textContent="Forward is a private access company connecting individuals and businesses to rooms, opportunities, funding, partnerships, visibility and economic movement.";
 }
 else if(q.includes("room")||q.includes("chat")||q.includes("access room")){
   a.textContent="Rooms are Forward access spaces. Some are open, some are closed, and some are read-only. When a room is closed or read-only, members can still react with ❤️ 👍 😊 ✅ 💯.";
 }
 else if(q.includes("membership")||q.includes("essentials")||q.includes("breakthrough")||q.includes("premium")){
   a.textContent="Forward memberships create deeper access. Essentials, Breakthrough and Premium Experience are designed to unlock stronger rooms, support, visibility and proximity to opportunities.";
 }
 else if(q.includes("event")||q.includes("summit")||q.includes("gathering")){
   a.textContent="Forward events are access rooms in real life: summits, gatherings, partner sessions, networking rooms and opportunity-focused experiences.";
 }
 else if(q.includes("market")||q.includes("buy")||q.includes("apply")||q.includes("offer")||q.includes("ticket")||q.includes("course")){
   a.textContent="The Marketplace is where Forward can show memberships, tickets, partner offers, courses, sponsored opportunities and products. Each item can have an image, price, details and a button.";
 }
 else if(q.includes("earn")||q.includes("earning")||q.includes("money")||q.includes("referral")){
   a.textContent="Forward Earnings is coming soon. It is planned for referrals, campaigns, opportunity sharing and verified partner activity.";
 }
 else if(q.includes("profile")||q.includes("thought")||q.includes("status")){
   a.textContent="Your profile shows your name, level, province, industry, age range, profile views, rank and thought/status. You can edit your thought from the profile page.";
 }
 else if(q.includes("admin")||q.includes("manage")||q.includes("settings")){
   a.textContent="Admin HQ is where Forward can manage posts, rooms, admins, partners, marketplace items, events, reels and stories. Admin mode reveals management controls.";
 }
 else if(q.includes("fnb")||q.includes("spar")||q.includes("partner")){
   a.textContent="Partners can appear in stories, marketplace offers, events and access rooms. Forward is built to make partner visibility feel premium and intentional.";
 }
 else if(q.includes("opportunity")||q.includes("funding")||q.includes("grant")){
   a.textContent="Forward is built around opportunity movement: funding, grants, partnerships, rooms, events, visibility and access that moves people closer to where they need to be.";
 }
 else{
   a.textContent="Forward helps people and businesses move closer to access: rooms, opportunities, visibility, funding, partnerships, events and economic movement.";
 }
}
function showPage(id){$$(".page").forEach(p=>p.classList.remove("active"));$("#"+id).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id))}
$$(".nav").forEach(n=>n.onclick=()=>showPage(n.dataset.page));
$("#adminToggle").onclick=()=>{admin=!admin;$("#adminToggle").textContent=admin?"Admin On":"Admin";renderFeed();renderMarket();renderEvents();applyAdmin()}
function applyAdmin(){$$(".admin-only").forEach(el=>el.classList.toggle("hidden",!admin));$("#roomAdminTools").classList.toggle("hidden",!admin)}


/* V25 login and events fixes */
function allProfilesV25(){
  try{return JSON.parse(localStorage.getItem("forwardProfilesV25")||"{}")}catch(e){return {}}
}
function saveAllProfilesV25(data){
  localStorage.setItem("forwardProfilesV25", JSON.stringify(data));
}
function setActiveProfileV25(p){
  localStorage.setItem("forwardActiveContactV25", (p.contact||"").toLowerCase());
}
function getActiveProfileV25(){
  const contact=(localStorage.getItem("forwardActiveContactV25")||"").toLowerCase();
  const profiles=allProfilesV25();
  return profiles[contact] || null;
}
function storeProfileV25(p){
  const profiles=allProfilesV25();
  profiles[(p.contact||"").toLowerCase()]=p;
  saveAllProfilesV25(profiles);
  setActiveProfileV25(p);
}
function showCreateV25(){
  const createForm=document.getElementById("createForm");
  const signinForm=document.getElementById("signinForm");
  const createTab=document.getElementById("createTab");
  const signinTab=document.getElementById("signinTab");
  if(!createForm)return;
  createForm.classList.remove("hidden");
  signinForm.classList.add("hidden");
  createTab.classList.add("active");
  signinTab.classList.remove("active");
}
function showSigninV25(){
  const createForm=document.getElementById("createForm");
  const signinForm=document.getElementById("signinForm");
  const createTab=document.getElementById("createTab");
  const signinTab=document.getElementById("signinTab");
  if(!signinForm)return;
  signinForm.classList.remove("hidden");
  createForm.classList.add("hidden");
  signinTab.classList.add("active");
  createTab.classList.remove("active");
}
const createTabV25=document.getElementById("createTab");
const signinTabV25=document.getElementById("signinTab");
if(createTabV25) createTabV25.onclick=showCreateV25;
if(signinTabV25) signinTabV25.onclick=showSigninV25;

const signinBtnV25=document.getElementById("signinBtn");
if(signinBtnV25){
  signinBtnV25.onclick=()=>{
    const contact=(document.getElementById("signinContact").value||"").trim().toLowerCase();
    if(!contact){alert("Enter the email or phone number you used to join Forward.");return;}
    const profiles=allProfilesV25();
    const p=profiles[contact];
    if(!p){alert("No Forward profile found for this email or phone number. Create an account first.");return;}
    setActiveProfileV25(p);
    enter(p,true);
  };
}

const logoutBtnV25=document.getElementById("logoutBtn");
if(logoutBtnV25){
  logoutBtnV25.onclick=()=>{
    localStorage.removeItem("forwardActiveContactV25");
    localStorage.removeItem("forwardProfileV23");
    location.reload();
  };
}

/* Override profile save/load so login is not missing and returning users can sign in */
saveProfile = function(){
  const p={
    first:document.getElementById("firstName").value.trim(),
    surname:document.getElementById("surname").value.trim(),
    contact:document.getElementById("contact").value.trim().toLowerCase(),
    province:document.getElementById("province").value,
    age:document.getElementById("age").value,
    industry:document.getElementById("industry").value,
    thought:"Can’t wait for Opportunities."
  };
  localStorage.setItem("forwardProfileV23", JSON.stringify(p));
  storeProfileV25(p);
  return p;
};
loadProfile = function(){
  return getActiveProfileV25();
};

/* Make event posters full-size and clearly poster-like */
function enhanceEventPostersV25(){
  document.querySelectorAll(".event-poster").forEach(p=>{
    p.setAttribute("aria-label","Full event poster");
  });
}
setTimeout(enhanceEventPostersV25,100);


/* V26 FUNCTIONAL ADMIN LAYER */
(function(){
  if(!document.getElementById("toast")){
    const t=document.createElement("div");
    t.id="toast"; t.className="toast"; document.body.appendChild(t);
  }
})();

function notifyV26(msg){
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.classList.remove("show"),2400);
}
function fileToDataURLV26(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve(null);
    const reader=new FileReader();
    reader.onload=()=>resolve({name:file.name,type:file.type,url:reader.result});
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}
function saveStateV26(){
  try{
    localStorage.setItem("forwardPostsV26",JSON.stringify(posts||[]));
    localStorage.setItem("forwardRoomsV26",JSON.stringify(rooms||[]));
    localStorage.setItem("forwardOffersV26",JSON.stringify(offers||[]));
    localStorage.setItem("forwardEventsV26",JSON.stringify(events||[]));
    localStorage.setItem("forwardStoriesV26",JSON.stringify(stories||[]));
    localStorage.setItem("forwardReelsV26",JSON.stringify(window.forwardReels||[]));
  }catch(e){}
}
function loadStateV26(){
  try{
    const p=JSON.parse(localStorage.getItem("forwardPostsV26")||"null"); if(p) posts=p;
    const r=JSON.parse(localStorage.getItem("forwardRoomsV26")||"null"); if(r) rooms=r;
    const o=JSON.parse(localStorage.getItem("forwardOffersV26")||"null"); if(o) offers=o;
    const e=JSON.parse(localStorage.getItem("forwardEventsV26")||"null"); if(e) events=e;
    const s=JSON.parse(localStorage.getItem("forwardStoriesV26")||"null"); if(s) stories=s;
    window.forwardReels=JSON.parse(localStorage.getItem("forwardReelsV26")||"null") || [
      {title:"Inside Forward",caption:"Rooms. Access. Movement.",media:null},
      {title:"Opportunity Watch",caption:"Funding. Partners. Visibility.",media:null}
    ];
  }catch(e){
    window.forwardReels=[
      {title:"Inside Forward",caption:"Rooms. Access. Movement.",media:null},
      {title:"Opportunity Watch",caption:"Funding. Partners. Visibility.",media:null}
    ];
  }
}

renderStories=function(){
  const box=document.getElementById("stories");
  if(!box)return;
  box.innerHTML=(stories||[]).map((s,i)=>{
    const label=typeof s==="string"?s:(s.label||"Story");
    const media=typeof s==="object"?s.media:null;
    const bg=media&&media.url?`style="background-image:url('${media.url}');background-size:cover;background-position:center;"`:"";
    return `<div class="story ${i===0?"active":""}"><div class="ring" ${bg}>${media&&media.url?"":label[0]}</div><small>${label}</small></div>`;
  }).join("");
};

renderFeed=function(){
  const feed=document.getElementById("feed");
  if(!feed)return;
  feed.innerHTML=(posts||[]).map((p,i)=>{
    const media=p.media&&p.media.url ? (p.media.type&&p.media.type.startsWith("video") ? `<div class="media-preview"><video src="${p.media.url}" controls playsinline></video></div>` : (p.media.type&&p.media.type.startsWith("image") ? `<div class="media-preview"><img src="${p.media.url}"></div>` : `<span class="file-chip">${p.media.name}</span>`)) : "";
    return `<article class="feed-card"><div class="feed-head"><span>Forward</span><small>${p.type||"Update"}</small></div><h3>${p.title}</h3><p>${p.body}</p>${media}<div class="actions"><button class="like ${p.liked?"liked":""}" data-post="${i}">${p.liked?"♥":"♡"} <span>${p.likes||0}</span></button><button>Comment</button><button>Share</button><button>React</button></div>${admin?`<div class="admin-tools"><button onclick="editPostV26(${i})">Edit Post</button><button onclick="attachPostMediaV26(${i})">Add Image / PDF / Video / Link</button><button class="danger" onclick="deletePostV26(${i})">Delete Post</button></div>`:""}</article>`;
  }).join("");
  document.querySelectorAll(".like").forEach(b=>b.onclick=()=>{let p=posts[+b.dataset.post];p.liked=!p.liked;p.likes=(p.likes||0)+(p.liked?1:-1);saveStateV26();renderFeed();});
};
window.editPostV26=function(i){let p=posts[i];let title=prompt("Edit post title",p.title);if(title===null)return;let body=prompt("Edit post body",p.body);if(body===null)return;p.title=title;p.body=body;saveStateV26();renderFeed();notifyV26("Post updated");};
window.deletePostV26=function(i){posts.splice(i,1);saveStateV26();renderFeed();notifyV26("Post deleted");};
window.attachPostMediaV26=function(i){let picker=document.getElementById("globalFilePicker");picker.onchange=async()=>{posts[i].media=await fileToDataURLV26(picker.files[0]);picker.value="";saveStateV26();renderFeed();notifyV26("Media added");};picker.click();};

const addPostBtnV26=document.getElementById("addPost");
if(addPostBtnV26){
  addPostBtnV26.onclick=()=>{
    const obj={title:document.getElementById("postTitle").value||"Forward Update",type:"Admin Post",body:document.getElementById("postBody").value||"New access update.",likes:0,liked:false,media:null};
    if(confirm("Add file/image/video/link placeholder to this post?")){
      const picker=document.getElementById("globalFilePicker");
      picker.onchange=async()=>{obj.media=await fileToDataURLV26(picker.files[0]);posts.unshift(obj);picker.value="";saveStateV26();renderFeed();notifyV26("Post created");};
      picker.click();
    }else{posts.unshift(obj);saveStateV26();renderFeed();notifyV26("Post created");}
  };
}

function addRoomMediaV26(){
  const picker=document.getElementById("globalFilePicker");
  picker.onchange=async()=>{
    const media=await fileToDataURLV26(picker.files[0]);
    const d=document.createElement("div"); d.className="msg";
    let preview=media.type&&media.type.startsWith("video")?`<div class="media-preview"><video src="${media.url}" controls playsinline></video></div>`:(media.type&&media.type.startsWith("image")?`<div class="media-preview"><img src="${media.url}"></div>`:`<span class="file-chip">${media.name}</span>`);
    d.innerHTML=`<small>Admin</small>${preview}${reactionBar()}`;
    document.getElementById("messages").appendChild(d);
    picker.value=""; attachReactions(); notifyV26("Room media sent");
  };
  picker.click();
}
document.addEventListener("click",(e)=>{
  if(e.target && e.target.textContent && e.target.textContent.includes("Add Picture")){e.preventDefault();addRoomMediaV26();}
});

renderMarket=function(){
  const list=document.getElementById("marketList");
  if(!list)return;
  list.innerHTML=(offers||[]).map((o,i)=>{
    const bg=o.image&&o.image.url?`style="background-image:url('${o.image.url}');background-size:cover;background-position:center;"`:"";
    return `<div class="market-card"><div class="product-image" ${bg}>${o.image&&o.image.url?"":o.title.split(" ")[0]}</div><h3>${o.title}</h3><p>${o.price}</p><button>${o.button}</button><button class="read-more" data-offer="${i}">Read More</button><div class="details" id="offer${i}"><p>${o.details||"This offer can include a product image, full description, payment link, sponsor details and application instructions."}</p>${admin?`<div class="admin-tools"><button onclick="editOfferV26(${i})">Edit Offer</button><button onclick="addOfferImageV26(${i})">Add / Change Image</button><button class="danger" onclick="deleteOfferV26(${i})">Delete Offer</button></div>`:""}</div></div>`;
  }).join("");
  document.querySelectorAll("[data-offer]").forEach(b=>b.onclick=()=>document.getElementById("offer"+b.dataset.offer).classList.toggle("open"));
};
window.editOfferV26=function(i){let o=offers[i];let title=prompt("Offer title",o.title);if(title===null)return;let price=prompt("Price",o.price);if(price===null)return;let button=prompt("Button label",o.button);if(button===null)return;let details=prompt("Offer details",o.details||"");if(details===null)return;Object.assign(o,{title,price,button,details});saveStateV26();renderMarket();notifyV26("Offer updated");};
window.addOfferImageV26=function(i){let picker=document.getElementById("marketFilePicker");picker.onchange=async()=>{offers[i].image=await fileToDataURLV26(picker.files[0]);picker.value="";saveStateV26();renderMarket();notifyV26("Offer image updated");};picker.click();};
window.deleteOfferV26=function(i){offers.splice(i,1);saveStateV26();renderMarket();notifyV26("Offer deleted");};

const createOfferBtnV26=document.getElementById("createOffer");
if(createOfferBtnV26){
  createOfferBtnV26.onclick=()=>{
    const o={title:document.getElementById("offerTitle").value||"New Offer",price:document.getElementById("offerPrice").value||"Custom",button:document.getElementById("offerButton").value,details:document.getElementById("offerDesc").value||"Offer details.",image:null};
    if(confirm("Add image for this offer?")){
      let picker=document.getElementById("marketFilePicker");
      picker.onchange=async()=>{o.image=await fileToDataURLV26(picker.files[0]);offers.unshift(o);picker.value="";saveStateV26();renderMarket();notifyV26("Offer created");};
      picker.click();
    }else{offers.unshift(o);saveStateV26();renderMarket();notifyV26("Offer created");}
  };
}

renderEvents=function(){
  const list=document.getElementById("eventsList");
  if(!list)return;
  list.innerHTML=(events||[]).map((ev,i)=>{
    const bg=ev.image&&ev.image.url?`style="background-image:url('${ev.image.url}');background-size:contain;background-position:center;background-repeat:no-repeat;"`:"";
    return `<div class="event-card"><div class="event-poster" ${bg}>${ev.image&&ev.image.url?"":ev.poster}</div><h3>${ev.title}</h3><p>${ev.date} • ${ev.price}</p><button class="read-more" data-event="${i}">See More Details</button><div class="details" id="event${i}"><p>${ev.details}</p><button>Register Interest</button>${admin?`<div class="admin-tools"><button onclick="editEventV26(${i})">Edit Event</button><button onclick="addEventPosterV26(${i})">Add / Change Poster</button><button class="danger" onclick="deleteEventV26(${i})">Delete Event</button></div>`:""}</div></div>`;
  }).join("");
  document.querySelectorAll("[data-event]").forEach(b=>b.onclick=()=>document.getElementById("event"+b.dataset.event).classList.toggle("open"));
};
window.editEventV26=function(i){let ev=events[i];let title=prompt("Event name",ev.title);if(title===null)return;let date=prompt("Date",ev.date);if(date===null)return;let price=prompt("Price",ev.price);if(price===null)return;let details=prompt("Event details",ev.details);if(details===null)return;Object.assign(ev,{title,date,price,details,poster:title});saveStateV26();renderEvents();notifyV26("Event updated");};
window.addEventPosterV26=function(i){let picker=document.getElementById("eventFilePicker");picker.onchange=async()=>{events[i].image=await fileToDataURLV26(picker.files[0]);picker.value="";saveStateV26();renderEvents();notifyV26("Event poster updated");};picker.click();};
window.deleteEventV26=function(i){events.splice(i,1);saveStateV26();renderEvents();notifyV26("Event deleted");};

const createEventBtnV26=document.getElementById("createEvent");
if(createEventBtnV26){
  createEventBtnV26.onclick=()=>{
    const ev={title:document.getElementById("eventTitle").value||"New Event",date:document.getElementById("eventDate").value||"Coming Soon",price:document.getElementById("eventPrice").value||"Free",poster:document.getElementById("eventTitle").value||"Event Poster",details:document.getElementById("eventDesc").value||"Event details.",image:null};
    if(confirm("Add poster/image for this event?")){
      let picker=document.getElementById("eventFilePicker");
      picker.onchange=async()=>{ev.image=await fileToDataURLV26(picker.files[0]);events.unshift(ev);picker.value="";saveStateV26();renderEvents();notifyV26("Event created");};
      picker.click();
    }else{events.unshift(ev);saveStateV26();renderEvents();notifyV26("Event created");}
  };
}

const manageStoriesBtn=document.getElementById("manageStoriesBtn");
if(manageStoriesBtn){
  manageStoriesBtn.onclick=()=>{
    const label=prompt("Story label","New Story"); if(!label)return;
    if(confirm("Add image/video to story?")){
      const picker=document.getElementById("storyFilePicker");
      picker.onchange=async()=>{stories.push({label,media:await fileToDataURLV26(picker.files[0])});picker.value="";saveStateV26();renderStories();notifyV26("Story added");};
      picker.click();
    }else{stories.push(label);saveStateV26();renderStories();notifyV26("Story added");}
  };
}

function renderReelsV26(){
  const stack=document.querySelector(".reel-stack");
  if(!stack)return;
  stack.innerHTML=(window.forwardReels||[]).map((r,i)=>{
    const media=r.media&&r.media.url?(r.media.type&&r.media.type.startsWith("video")?`<video src="${r.media.url}" muted autoplay loop playsinline></video>`:`<img src="${r.media.url}">`):"";
    return `<div class="reel">${media}<div><h2>${r.title}</h2><p>${r.caption}</p><div class="reel-reacts">❤️ 👍 😊 ✅ 💯</div>${admin?`<button class="read-more" onclick="editReelV26(${i})">Edit Reel</button><button class="read-more danger" onclick="deleteReelV26(${i})">Delete Reel</button>`:""}</div></div>`;
  }).join("");
}
window.editReelV26=function(i){let r=window.forwardReels[i];let title=prompt("Reel title",r.title);if(title===null)return;let caption=prompt("Caption",r.caption);if(caption===null)return;r.title=title;r.caption=caption;saveStateV26();renderReelsV26();notifyV26("Reel updated");};
window.deleteReelV26=function(i){window.forwardReels.splice(i,1);saveStateV26();renderReelsV26();notifyV26("Reel deleted");};
const manageReelsBtn=document.getElementById("manageReelsBtn");
if(manageReelsBtn){
  manageReelsBtn.onclick=()=>{
    const title=prompt("Reel title","New Reel"); if(!title)return;
    const caption=prompt("Caption","Forward movement."); if(caption===null)return;
    const picker=document.getElementById("reelFilePicker");
    picker.onchange=async()=>{window.forwardReels.unshift({title,caption,media:await fileToDataURLV26(picker.files[0])});picker.value="";saveStateV26();renderReelsV26();notifyV26("Reel added");};
    picker.click();
  };
}

const saveSocialLinks=document.getElementById("saveSocialLinks");
if(saveSocialLinks){
  const saved=JSON.parse(localStorage.getItem("forwardSocialLinksV26")||"{}");
  ["websiteLink","instagramLink","facebookLink","linkedinLink","youtubeLink"].forEach(id=>{if(document.getElementById(id))document.getElementById(id).value=saved[id]||""});
  saveSocialLinks.onclick=()=>{
    const links={};
    ["websiteLink","instagramLink","facebookLink","linkedinLink","youtubeLink"].forEach(id=>links[id]=document.getElementById(id).value);
    localStorage.setItem("forwardSocialLinksV26",JSON.stringify(links));
    notifyV26("Social links saved");
  };
}

const shortcuts={manageMarketBtn:"market",manageEventsBtn:"events",manageFeedBtn:"home"};
Object.keys(shortcuts).forEach(id=>{const el=document.getElementById(id);if(el)el.onclick=()=>showPage(shortcuts[id]);});
const assignAdminsBtn=document.getElementById("assignAdminsBtn"); if(assignAdminsBtn)assignAdminsBtn.onclick=()=>notifyV26("Admin assignment needs backend connection in production.");
const assignPartnersBtn=document.getElementById("assignPartnersBtn"); if(assignPartnersBtn)assignPartnersBtn.onclick=()=>notifyV26("Partner assignment needs backend connection in production.");

const oldRenderAllV26=renderAll;
renderAll=function(){loadStateV26();oldRenderAllV26();renderReelsV26();applyAdmin();};
const oldApplyAdminV26=applyAdmin;
applyAdmin=function(){oldApplyAdminV26();renderReelsV26();};

loadStateV26();
renderAll();
