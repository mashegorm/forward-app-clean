
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

const rooms = [
  {name:"Announcements", desc:"Admin-only updates", members:221, locked:true, readOnly:true},
  {name:"General Access", desc:"Open ecosystem room", members:221, locked:false, readOnly:false},
  {name:"SMMEs", desc:"Entrepreneurs and business owners", members:84, locked:false, readOnly:false},
  {name:"Funding & Grants", desc:"Capital and opportunity access", members:117, locked:false, readOnly:false},
  {name:"Green Sector", desc:"Energy, climate and sustainability", members:62, locked:false, readOnly:false},
  {name:"Technology & Digital Skills", desc:"Builders, tools and digital work", members:91, locked:false, readOnly:false},
  {name:"Essentials", desc:"Member room", members:38, locked:true, readOnly:false},
  {name:"Breakthrough", desc:"Member room", members:17, locked:true, readOnly:false},
  {name:"Premium Experience", desc:"Private member room", members:9, locked:true, readOnly:false}
];

let activeRoom = 1;
let adminMode = false;

function saveProfile(){
  const profile = {
    name: $("#fullName").value.trim(),
    contact: $("#contact").value.trim(),
    province: $("#province").value,
    age: $("#ageRange").value,
    industry: $("#industry").value
  };
  localStorage.setItem("forwardProfile", JSON.stringify(profile));
  return profile;
}

function loadProfile(){
  try{return JSON.parse(localStorage.getItem("forwardProfile") || "null")}catch(e){return null}
}

function setProfile(profile){
  $("#memberName").textContent = profile.name || "Forward Member";
  $("#memberMeta").textContent = `Level 1 • ${profile.age || "Access Member"}`;
  $("#memberProvince").textContent = profile.province || "-";
  $("#memberIndustry").textContent = profile.industry || "-";
  $("#avatar").textContent = (profile.name || "F").charAt(0).toUpperCase();
  $("#statusLine").textContent = `${profile.province || "Access"} • ${profile.industry || "Member"}`;
}

function enterApp(profile){
  $("#authScreen").classList.add("hidden");
  $("#loadingScreen").classList.remove("hidden");
  setTimeout(()=>{
    $("#loadingScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    setProfile(profile);
    renderRooms();
    renderMessages();
  }, 450);
}

$("#joinForward").addEventListener("click", ()=>{
  if(!$("#fullName").value.trim() || !$("#contact").value.trim() || !$("#province").value || !$("#ageRange").value || !$("#industry").value){
    alert("Please complete all fields.");
    return;
  }
  if(!$("#consent").checked){
    alert("Please accept the consent form.");
    return;
  }
  enterApp(saveProfile());
});

const existing = loadProfile();
if(existing){
  $("#authScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  setProfile(existing);
  renderRooms();
  renderMessages();
}

$$(".nav").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    showPage(btn.dataset.page);
    $$(".nav").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function showPage(id){
  $$(".page").forEach(p=>p.classList.remove("active"));
  $("#"+id).classList.add("active");
}

$$(".like").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const span = btn.querySelector("span");
    const current = parseInt(span.textContent || "0",10);
    const liked = btn.classList.toggle("liked");
    btn.firstChild.textContent = liked ? "♥ " : "♡ ";
    span.textContent = liked ? current + 1 : Math.max(0,current - 1);
  });
});

$("#adminSwitch").addEventListener("click", ()=>{
  adminMode = !adminMode;
  $("#adminSwitch").textContent = adminMode ? "Admin On" : "Admin";
  $$(".admin-only").forEach(el=>el.classList.toggle("hidden", !adminMode));
});

function renderRooms(){
  const list = $("#roomList");
  list.innerHTML = rooms.map((r,i)=>`
    <button class="room-card" data-room="${i}">
      <div>
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
      </div>
      <span class="count">${r.members} Members ${r.locked ? "• Locked" : ""}</span>
    </button>
  `).join("");
  $$(".room-card").forEach(card=>{
    card.addEventListener("click", ()=>{
      activeRoom = Number(card.dataset.room);
      openRoom();
    });
  });
}

function openRoom(){
  const r = rooms[activeRoom];
  $("#roomTitle").textContent = r.name;
  $("#roomState").textContent = r.readOnly ? "Read-only room • reactions enabled" : (r.locked ? "Locked room" : "Open room");
  $("#messageComposer").classList.toggle("hidden", r.readOnly && !adminMode);
  showPage("roomView");
  renderMessages();
}

$("#backRooms").addEventListener("click", ()=>showPage("rooms"));

$("#toggleRoomLock").addEventListener("click", ()=>{
  rooms[activeRoom].locked = !rooms[activeRoom].locked;
  openRoom();
  renderRooms();
});

$("#toggleReadOnly").addEventListener("click", ()=>{
  rooms[activeRoom].readOnly = !rooms[activeRoom].readOnly;
  openRoom();
  renderRooms();
});

const defaultMessages = [
  {author:"Forward", body:"Welcome To Forward Access."},
  {author:"Forward", body:"Use this room for signal, movement and opportunity. No noise."}
];

function reactionBar(){
  return `<div class="reaction-row">
    ${["❤️","👍","😊","✅","💯"].map(e=>`<button class="msg-react">${e}</button>`).join("")}
  </div>`;
}

function renderMessages(){
  const box = $("#messages");
  box.innerHTML = defaultMessages.map(m=>`
    <div class="msg"><small>${m.author}</small>${m.body}${reactionBar()}</div>
  `).join("");
  $$(".msg-react").forEach(b=>{
    b.addEventListener("click",()=>b.classList.toggle("active"));
  });
}

$("#sendMessage").addEventListener("click", ()=>{
  const val = $("#messageInput").value.trim();
  if(!val) return;
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<small>You</small>${val}${reactionBar()}`;
  $("#messages").appendChild(div);
  $("#messageInput").value = "";
  div.querySelectorAll(".msg-react").forEach(b=>b.addEventListener("click",()=>b.classList.toggle("active")));
});
