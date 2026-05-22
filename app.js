const $=(s)=>document.querySelector(s);
const $$=(s)=>document.querySelectorAll(s);

let admin=false, activeRoom=1;
let profile=null;

const stories=["Forward","FNB","Spar","Partners","Rooms","Advertising"];
let posts=[
 {title:"Welcome To Access.", type:"Opportunity Update", body:"Forward connects people, opportunities, rooms and movement.", likes:12, liked:false},
 {title:"The Future Of South African Wealth Is Human Capital.", type:"Access Note", body:"South Africa does not lack talent. It lacks access, alignment and proximity to opportunity.", likes:21, liked:false}
];
let rooms=[
 {name:"Announcements",desc:"Admin-only updates",members:221,status:"Read-only",locked:true,readOnly:true},
 {name:"General Access",desc:"Open ecosystem room",members:221,status:"Open",locked:false,readOnly:false},
 {name:"SMMEs",desc:"Entrepreneurs and business owners",members:84,status:"Open",locked:false,readOnly:false},
 {name:"Farmers",desc:"Agriculture and farming access",members:31,status:"Open",locked:false,readOnly:false},
 {name:"Funding & Grants",desc:"Capital and opportunity access",members:117,status:"Open",locked:false,readOnly:false},
 {name:"E-commerce",desc:"Online selling and digital commerce",members:76,status:"Open",locked:false,readOnly:false},
 {name:"Green Sector",desc:"Energy, climate and sustainability",members:62,status:"Open",locked:false,readOnly:false},
 {name:"Technology",desc:"Builders, tools and digital work",members:91,status:"Open",locked:false,readOnly:false},
 {name:"Media",desc:"Creative economy and visibility",members:57,status:"Open",locked:false,readOnly:false},
 {name:"NGOs & NPOs",desc:"Impact, funding and partnerships",members:51,status:"Open",locked:false,readOnly:false},
 {name:"Learnerships",desc:"Skills and learning opportunities",members:189,status:"Open",locked:false,readOnly:false},
 {name:"People Living With Disabilities",desc:"Inclusive access and opportunity",members:19,status:"Open",locked:false,readOnly:false},
 {name:"Unemployed Youth",desc:"Youth opportunity access",members:144,status:"Open",locked:false,readOnly:false},
 {name:"Unemployed General",desc:"Open opportunity access",members:63,status:"Open",locked:false,readOnly:false},
 {name:"Essentials",desc:"Essentials membership room",members:28,status:"Closed",locked:true,readOnly:false},
 {name:"Breakthrough",desc:"Breakthrough membership room",members:14,status:"Closed",locked:true,readOnly:false},
 {name:"Premium Experience",desc:"Premium private room",members:7,status:"Closed",locked:true,readOnly:false}
];
let events=[
 {title:"Forward Access Evening",date:"Coming Soon",price:"Invite-only",desc:"A private room for founders, builders, funders and people moving closer to opportunity.",poster:"Access Evening"},
 {title:"Opportunity Room: Funding & Grants",date:"June 2026",price:"Free / RSVP",desc:"A focused session for funding pathways, grants, partner access and capital readiness.",poster:"Funding Room"}
];

let offers=[
 {title:"Essentials Membership",price:"R199 / month",button:"Apply"},
 {title:"Breakthrough Membership",price:"R499 / month",button:"Join"},
 {title:"Premium Experience",price:"R699 / month",button:"Reserve"}
];

function saveProfile(){
 profile={first:$("#firstName").value.trim(),surname:$("#surname").value.trim(),contact:$("#contact").value.trim(),province:$("#province").value,age:$("#age").value,industry:$("#industry").value};
 localStorage.setItem("forwardProfileV21", JSON.stringify(profile));
 return profile;
}
function loadProfile(){try{return JSON.parse(localStorage.getItem("forwardProfileV21")||"null")}catch(e){return null}}
function setProfile(p){
 $("#profileName").textContent=(p.first+" "+p.surname).trim();
 $("#profileLevel").textContent="Level 1 • General Access";
 $("#pProvince").textContent=p.province||"-";
 $("#pIndustry").textContent=p.industry||"-";
 $("#pAge").textContent=p.age||"-";
 $("#avatar").textContent=(p.first||"F")[0].toUpperCase();
 $("#statusText").textContent=`${p.province||"Access"} • ${p.industry||"Member"}`;
}
function enter(p, loading=true){
 $("#authScreen").classList.add("hidden");
 if(loading){$("#loadingScreen").classList.remove("hidden");}
 setTimeout(()=>{$("#loadingScreen").classList.add("hidden");$("#app").classList.remove("hidden");setProfile(p);renderAll();}, loading?5000:0);
}
$("#joinBtn").addEventListener("click",()=>{
 if(!$("#firstName").value.trim()||!$("#surname").value.trim()||!$("#contact").value.trim()||!$("#province").value||!$("#age").value||!$("#industry").value){alert("Please complete all fields.");return;}
 if(!$("#consent").checked){alert("Please accept the consent form.");return;}
 enter(saveProfile());
});
const existing=loadProfile(); if(existing){profile=existing;enter(existing,false);}

function renderAll(){renderStories();renderFeed();renderRooms();renderEvents();renderMarket();applyAdmin();}
function renderStories(){
 $("#stories").innerHTML=stories.map((s,i)=>`<div class="story ${i===0?"active":""}"><div class="ring">${s[0]}</div><small>${s}</small></div>`).join("");
}
function renderFeed(){
 $("#feed").innerHTML=posts.map((p,i)=>`<article class="feed-card"><div class="feed-head"><span>Forward</span><small>${p.type}</small></div><h3>${p.title}</h3><p>${p.body}</p><div class="actions"><button class="like ${p.liked?"liked":""}" data-post="${i}">${p.liked?"♥":"♡"} <span>${p.likes}</span></button><button>Comment</button><button>Share</button></div>${admin?'<div class="admin-tools"><button>Edit Post</button><button class="danger">Delete Post</button></div>':""}</article>`).join("");
 $$(".like").forEach(btn=>btn.onclick=()=>{const p=posts[+btn.dataset.post];p.liked=!p.liked;p.likes+=p.liked?1:-1;renderFeed();});
}
function roomStatus(r){return r.readOnly?"Read-only":(r.locked?"Closed":"Open")}
function renderRooms(){
 $("#roomList").innerHTML=rooms.map((r,i)=>`<button class="room-card" data-room="${i}"><div><h3>${r.name}</h3><p>${r.desc}</p></div><div class="room-meta"><span class="status ${roomStatus(r)!=="Open"?"closed":""}">${roomStatus(r)}</span><span class="count">${r.members} Members</span></div></button>`).join("");
 $$(".room-card").forEach(c=>c.onclick=()=>{activeRoom=+c.dataset.room;openRoom();});
}
function openRoom(){
 const r=rooms[activeRoom];
 $("#roomTitle").textContent=r.name; $("#roomMeta").textContent=`${roomStatus(r)} room • ${r.members} members`;
 $("#editRoomName").value=r.name; $("#editRoomDesc").value=r.desc;
 $("#composer").classList.toggle("hidden",(r.locked||r.readOnly)&&!admin);
 showPage("roomView"); renderMessages(); applyAdmin();
}
$("#backToRooms").onclick=()=>showPage("rooms");
$("#saveRoomEdit").onclick=()=>{rooms[activeRoom].name=$("#editRoomName").value||rooms[activeRoom].name;rooms[activeRoom].desc=$("#editRoomDesc").value||rooms[activeRoom].desc;openRoom();renderRooms();}
$("#toggleLock").onclick=()=>{rooms[activeRoom].locked=!rooms[activeRoom].locked;openRoom();renderRooms();}
$("#toggleReadOnly").onclick=()=>{rooms[activeRoom].readOnly=!rooms[activeRoom].readOnly;openRoom();renderRooms();}
$("#deleteRoom").onclick=()=>{if(rooms.length>1){rooms.splice(activeRoom,1);activeRoom=0;showPage("rooms");renderRooms();}}
function reactionBar(){return `<div class="reaction-row">${["❤️","👍","😊","✅","💯"].map(x=>`<button>${x}</button>`).join("")}</div>`}
function renderMessages(){
 $("#messages").innerHTML=[["Forward","Welcome To Forward Access."],["Forward","Use this room for signal, movement and opportunity. No noise."]].map(m=>`<div class="msg"><small>${m[0]}</small>${m[1]}${reactionBar()}</div>`).join("");
 $$(".reaction-row button").forEach(b=>b.onclick=()=>b.classList.toggle("active"));
}
$("#sendMessage").onclick=()=>{const v=$("#messageInput").value.trim(); if(!v)return; const d=document.createElement("div"); d.className="msg"; d.innerHTML=`<small>You</small>${v}${reactionBar()}`; $("#messages").appendChild(d); $("#messageInput").value=""; d.querySelectorAll("button").forEach(b=>b.onclick=()=>b.classList.toggle("active"));}


function renderEvents(){
 $("#eventsList").innerHTML=events.map((e,i)=>`<div class="market-card">
  <div class="event-poster">${e.poster}</div>
  <h3>${e.title}</h3>
  <p>${e.date} • ${e.price}</p>
  <button class="read-more" data-event="${i}">See More Details</button>
  <div class="event-details" id="eventDetails${i}">
    <p>${e.desc}</p>
    <button>Register Interest</button>
    ${admin?'<div class="admin-tools"><button>Edit Event</button><button class="danger">Delete Event</button></div>':""}
  </div>
 </div>`).join("");
 $$(".read-more[data-event]").forEach(btn=>btn.onclick=()=>$("#eventDetails"+btn.dataset.event).classList.toggle("open"));
}

function renderMarket(){
 $("#marketList").innerHTML=offers.map((o,i)=>`<div class="market-card">
  <div class="market-image">${o.title.split(" ")[0]}</div>
  <h3>${o.title}</h3>
  <p>${o.price}</p>
  <button>${o.button}</button>
  <button class="read-more" data-offer="${i}">Read More</button>
  <div class="market-details" id="marketDetails${i}">
    <p>This offer can include a product image, full description, payment link, sponsor details and application instructions.</p>
    ${admin?'<div class="admin-tools"><button>Edit Offer</button><button class="danger">Delete Offer</button></div>':""}
  </div>
 </div>`).join("");
 $$(".read-more[data-offer]").forEach(btn=>btn.onclick=()=>$("#marketDetails"+btn.dataset.offer).classList.toggle("open"));
}
$("#createOffer").onclick=()=>{offers.unshift({title:$("#offerTitle").value||"New Offer",price:$("#offerPrice").value||"Custom",button:$("#offerButton").value});renderMarket();}
$("#showOfferCreator").onclick=()=>$("#offerCreator").classList.toggle("hidden");
$("#showEventCreator").onclick=()=>$("#eventCreator").classList.toggle("hidden");
$("#createEvent").onclick=()=>{
 events.unshift({title:$("#eventTitle").value||"New Event",date:$("#eventDate").value||"Coming Soon",price:$("#eventPrice").value||"Free",desc:$("#eventDesc").value||"Forward access event.",poster:$("#eventTitle").value||"Event"});
 renderEvents();
};
$("#showRoomCreator").onclick=()=>$("#roomCreator").classList.toggle("hidden");
$("#createRoom").onclick=()=>{rooms.unshift({name:$("#newRoomName").value||"New Room",desc:$("#newRoomDesc").value||"Access room",members:0,locked:false,readOnly:false});renderRooms();}
$("#addPost").onclick=()=>{posts.unshift({title:$("#postTitle").value||"Forward Update",type:"Admin Post",body:$("#postBody").value||"New access update.",likes:0,liked:false});renderFeed();}
function showPage(id){$$(".page").forEach(p=>p.classList.remove("active"));$("#"+id).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));}
$$(".nav").forEach(n=>n.onclick=()=>showPage(n.dataset.page));
$("#adminToggle").onclick=()=>{admin=!admin;$("#adminToggle").textContent=admin?"Admin On":"Admin";renderFeed();renderEvents();renderMarket();applyAdmin(); if($("#rooms").classList.contains("active"))renderRooms();}
function applyAdmin(){$$(".admin-only").forEach(el=>el.classList.toggle("hidden",!admin));$("#roomAdminTools").classList.toggle("hidden",!admin);}

$("#saveThought").onclick=()=>{
 const val=$("#thoughtInput").value.trim();
 if(!val)return;
 $("#thoughtDisplay").textContent="“"+val+"”";
 $("#thoughtInput").value="";
};
$("#askAI").onclick=()=>{
 const q=$("#aiQuestion").value.trim().toLowerCase();
 const ans=$("#aiAnswer");
 if(!q){ans.textContent="Ask about rooms, memberships, events or opportunities.";return;}
 if(q.includes("room")) ans.textContent="Forward rooms are private access spaces for industries, opportunities and high-trust movement.";
 else if(q.includes("member")) ans.textContent="Memberships unlock deeper access, private rooms and stronger proximity to opportunities.";
 else if(q.includes("event")) ans.textContent="Forward events are access rooms: gatherings, summits and partner sessions designed for movement.";
 else ans.textContent="Forward connects people and businesses to rooms, opportunities, visibility and economic access.";
};
