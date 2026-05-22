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
