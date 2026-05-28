
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const EMOJIS = ["❤️","👍","😊","✅","💯"];

// IMPORTANT:
// To make yourself automatic admin by ID, replace this with your real ID number.
// Otherwise use the admin code: FORWARD-ADMIN-2026
const ADMIN_ID = "CHANGE_THIS_TO_YOUR_ID_NUMBER";
const ADMIN_CODE = "FORWARD-ADMIN-2026";

const defaultRooms = window.FORWARD_ROOMS.map((r, idx) => ({
  id: "room_" + idx,
  name: r.name,
  count: r.count,
  status: r.status,
  desc: r.desc,
  chatOpen: r.status === "Open",
  readOnly: r.status !== "Open",
  approved: r.status === "Open" ? "all" : []
}));

let state = JSON.parse(localStorage.getItem("forwardRoomsMVP_v2") || "null") || {
  users: {},
  activeId: null,
  admins: ADMIN_ID === "CHANGE_THIS_TO_YOUR_ID_NUMBER" ? [] : [ADMIN_ID],
  rooms: defaultRooms,
  requests: {},
  messages: {
    room_0: [
      { by:"Forward", admin:true, body:"Welcome to General Access & Announcements. This is the open room for official Forward access updates.", time:Date.now(), reactions:{} }
    ]
  }
};

function save(){ localStorage.setItem("forwardRoomsMVP_v2", JSON.stringify(state)); }
function currentUser(){ return state.users[state.activeId] || null; }
function isAdmin(id = state.activeId){ return sessionStorage.getItem("forwardAdminUnlocked")==="1" || state.admins.includes(id); }
function now(){ return new Date().toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"}); }
function cleanId(v){ return (v || "").replace(/\D/g, "").trim(); }

function setIndustryOptions(){
  const sel = $("#industry");
  sel.innerHTML = `<option value="">Industry / Room interest</option>` + window.FORWARD_ROOMS
    .filter(r => r.name !== "General Access & Announcements")
    .map(r => `<option>${r.name}</option>`)
    .join("");
}

$("#joinTab").onclick = () => {
  $("#joinTab").classList.add("active");
  $("#signinTab").classList.remove("active");
  $("#joinForm").classList.remove("hidden");
  $("#signinForm").classList.add("hidden");
};

$("#signinTab").onclick = () => {
  $("#signinTab").classList.add("active");
  $("#joinTab").classList.remove("active");
  $("#signinForm").classList.remove("hidden");
  $("#joinForm").classList.add("hidden");
};

$("#joinForm").onsubmit = e => {
  e.preventDefault();
  const id = cleanId($("#idNumber").value);
  if(id.length !== 13 && id !== ADMIN_ID){
    alert("Please enter a valid 13-digit South African ID number.");
    return;
  }
  const user = {
    firstName: $("#firstName").value.trim(),
    surname: $("#surname").value.trim(),
    email: $("#email").value.trim(),
    phone: $("#phone").value.trim(),
    id,
    southAfrican: $("#southAfrican").checked,
    province: $("#province").value,
    ageRange: $("#ageRange").value,
    industry: $("#industry").value,
    consent: $("#consent").checked,
    joinedAt: Date.now()
  };
  state.users[id] = user;
  state.activeId = id;
  if(id === ADMIN_ID && ADMIN_ID !== "CHANGE_THIS_TO_YOUR_ID_NUMBER" && !state.admins.includes(id)) state.admins.push(id);
  save();
  enterWithLoading();
};

$("#signinForm").onsubmit = e => {
  e.preventDefault();
  const id = cleanId($("#signinId").value);
  if(!state.users[id] && id !== ADMIN_ID){
    alert("No Forward account found with this ID number. Please join first.");
    return;
  }
  if(id === ADMIN_ID && ADMIN_ID !== "CHANGE_THIS_TO_YOUR_ID_NUMBER" && !state.users[id]){
    state.users[id] = {firstName:"Forward", surname:"Admin", id, province:"Gauteng", industry:"General Access & Announcements", ageRange:"25–34", email:"", phone:"", consent:true, southAfrican:true};
    if(!state.admins.includes(id)) state.admins.push(id);
  }
  state.activeId = id;
  save();
  enterWithLoading();
};

function enterWithLoading(){
  $("#auth").classList.add("hidden");
  $("#loading").classList.remove("hidden");
  setTimeout(() => {
    $("#loading").classList.add("hidden");
    $("#app").classList.remove("hidden");
    initApp();
  }, 3000);
}

function initApp(){
  const u = currentUser();
  $("#memberLine").textContent = u ? `${u.firstName} ${u.surname} • ${u.province || "Forward"}` : "Rooms";
  $("#adminToggle").classList.remove("hidden");
  renderRooms();
  showPage("roomsPage");
}

$("#logoutBtn").onclick = () => {
  state.activeId = null;
  sessionStorage.removeItem("forwardAdminUnlocked");
  save();
  location.reload();
};

$("#adminToggle").onclick = () => {
  if(!isAdmin()){
    $("#adminUnlockBox").classList.toggle("hidden");
    return;
  }
  $("#adminPanel").classList.toggle("hidden");
};

$("#unlockAdminBtn").onclick = () => {
  const code = ($("#adminCodeInput").value || "").trim();
  if(code !== ADMIN_CODE){
    alert("Incorrect admin code.");
    return;
  }
  sessionStorage.setItem("forwardAdminUnlocked","1");
  $("#adminUnlockBox").classList.add("hidden");
  $("#adminPanel").classList.remove("hidden");
  $("#adminCodeInput").value = "";
  renderRooms();
  if(activeRoomId) openRoom(activeRoomId);
};

function showPage(id){
  $$(".page").forEach(p => p.classList.remove("active"));
  $("#" + id).classList.add("active");
}

function roomCanEnter(room){
  if(isAdmin()) return true;
  if(room.status === "Open") return true;
  return Array.isArray(room.approved) && room.approved.includes(state.activeId);
}

function renderRooms(){
  const list = $("#roomsList");
  list.innerHTML = state.rooms.map(room => {
    const badgeClass = room.status === "Open" ? "open" : room.status === "Read-only" ? "readonly" : "closed";
    const hasRequested = state.requests[room.id] && state.requests[room.id].includes(state.activeId);
    const lockedText = roomCanEnter(room) ? "Enter Room" : (hasRequested ? "Access Requested" : "Request Access");
    return `
      <div class="room-card" data-room="${room.id}">
        <div>
          <h3>${room.name}</h3>
          <p>${room.desc}</p>
        </div>
        <div class="room-meta">
          <span class="count">${room.count} Professionals Connected</span>
          <span class="badge ${badgeClass}">${room.status}</span>
          <span class="badge">${lockedText}</span>
        </div>
      </div>
    `;
  }).join("");

  $$(".room-card").forEach(card => {
    card.onclick = () => {
      const room = state.rooms.find(r => r.id === card.dataset.room);
      if(roomCanEnter(room)){
        openRoom(room.id);
      } else {
        requestAccess(room.id);
      }
    };
  });
}

function requestAccess(roomId){
  const room = state.rooms.find(r => r.id === roomId);
  if(!state.requests[roomId]) state.requests[roomId] = [];
  if(!state.requests[roomId].includes(state.activeId)){
    state.requests[roomId].push(state.activeId);
    save();
  }
  renderRooms();
  alert(`Access requested for ${room.name}. You will receive access once admin has approved your entry.`);
}

let activeRoomId = null;

function openRoom(roomId){
  activeRoomId = roomId;
  const room = state.rooms.find(r => r.id === roomId);
  $("#roomTitle").textContent = room.name;
  $("#roomInfo").textContent = `${room.count} Professionals Connected • ${room.status}`;
  $("#roomBadge").textContent = room.status;
  $("#roomBadge").className = "badge " + (room.status === "Open" ? "open" : room.status === "Read-only" ? "readonly" : "closed");
  $("#adminPanel").classList.toggle("hidden", !isAdmin());
  $("#composer").classList.toggle("hidden", !canUserWrite(room));
  renderMessages();
  showPage("chatPage");
}

function canUserWrite(room){
  if(isAdmin()) return true;
  if(room.status !== "Open") return false;
  if(room.readOnly) return false;
  return true;
}

$("#backBtn").onclick = () => {
  renderRooms();
  showPage("roomsPage");
};

function renderMessages(){
  const msgs = state.messages[activeRoomId] || [];
  $("#messages").innerHTML = msgs.map((m, i) => {
    const user = state.users[m.userId] || null;
    const name = m.by || (user ? `${user.firstName} ${user.surname}` : "Forward Member");
    const adminTag = m.admin ? `<span class="admin-tag">Admin</span>` : "";
    const media = m.media ? mediaHTML(m.media) : "";
    const reactions = EMOJIS.map(e => {
      const key = `${activeRoomId}_${i}_${e}`;
      const active = localStorage.getItem(key) === "1";
      return `<button class="${active ? "active" : ""}" data-react="${key}">${e}</button>`;
    }).join("");
    return `
      <div class="msg">
        <div class="msg-head">
          <div><span class="msg-name">${name}</span>${adminTag}</div>
          <span class="msg-time">${m.timeText || now()}</span>
        </div>
        ${m.body ? `<div class="msg-body">${escapeHTML(m.body)}</div>` : ""}
        ${media}
        <div class="reacts">${reactions}</div>
      </div>
    `;
  }).join("");

  $$(".reacts button").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.react;
      const active = localStorage.getItem(key) === "1";
      localStorage.setItem(key, active ? "0" : "1");
      btn.classList.toggle("active", !active);
    };
  });
}

function escapeHTML(str){
  return (str || "").replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
}

function mediaHTML(media){
  if(media.type && media.type.startsWith("image/")) return `<div class="msg-media"><img src="${media.url}" alt="${media.name || ""}"></div>`;
  if(media.type && media.type.startsWith("video/")) return `<div class="msg-media"><video src="${media.url}" controls playsinline></video></div>`;
  return `<div class="msg-media"><a class="file-link" href="${media.url}" target="_blank">${media.name || "Open file"}</a></div>`;
}

$("#sendMsg").onclick = () => {
  const body = $("#messageInput").value.trim();
  if(!body) return;
  const room = state.rooms.find(r => r.id === activeRoomId);
  if(!canUserWrite(room)){
    alert("This room is not open for member messages.");
    return;
  }
  if(!state.messages[activeRoomId]) state.messages[activeRoomId] = [];
  const u = currentUser();
  state.messages[activeRoomId].push({userId: state.activeId, by:`${u.firstName} ${u.surname}`, admin:isAdmin(), body, time:Date.now(), timeText:now()});
  $("#messageInput").value = "";
  save();
  renderMessages();
};

$("#toggleOpen").onclick = () => {
  const room = state.rooms.find(r => r.id === activeRoomId);
  room.status = room.status === "Open" ? "Closed" : "Open";
  room.chatOpen = room.status === "Open";
  room.readOnly = room.status !== "Open";
  save();
  openRoom(activeRoomId);
};

$("#toggleReadonly").onclick = () => {
  const room = state.rooms.find(r => r.id === activeRoomId);
  room.status = room.status === "Read-only" ? "Open" : "Read-only";
  room.readOnly = room.status === "Read-only";
  save();
  openRoom(activeRoomId);
};

$("#approveRequests").onclick = () => {
  const box = $("#requestsBox");
  box.classList.toggle("hidden");
  renderRequests();
};

function renderRequests(){
  const reqs = state.requests[activeRoomId] || [];
  const box = $("#requestsBox");
  if(!reqs.length){
    box.innerHTML = `<p>No access requests for this room yet.</p>`;
    return;
  }
  box.innerHTML = reqs.map(id => {
    const u = state.users[id];
    if(!u) return "";
    return `<div class="request-card">
      <strong>${u.firstName} ${u.surname}</strong>
      <p>${u.province} • ${u.industry} • ${u.ageRange}</p>
      <button data-approve="${id}">Approve Access</button>
    </div>`;
  }).join("");
  $$("[data-approve]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.approve;
      const room = state.rooms.find(r => r.id === activeRoomId);
      if(!Array.isArray(room.approved)) room.approved = [];
      if(!room.approved.includes(id)) room.approved.push(id);
      state.requests[activeRoomId] = (state.requests[activeRoomId] || []).filter(x => x !== id);
      save();
      renderRequests();
      renderRooms();
    };
  });
}

$("#manageAdmins").onclick = () => {
  $("#adminsBox").classList.toggle("hidden");
  renderAdmins();
};

$("#makeAdminBtn").onclick = () => {
  const id = cleanId($("#adminIdInput").value);
  if(!id) return alert("Enter a member ID number.");
  if(!state.users[id]) return alert("No member found with that ID number.");
  if(!state.admins.includes(id)) state.admins.push(id);
  $("#adminIdInput").value = "";
  save();
  renderAdmins();
  renderMessages();
};

function renderAdmins(){
  $("#adminsList").innerHTML = state.admins.map(id => {
    const u = state.users[id] || {firstName:"Forward", surname:"Admin"};
    return `<div class="admin-row"><strong>${u.firstName} ${u.surname}</strong><p>${id}</p></div>`;
  }).join("");
}

$("#sendAdminPost").onclick = async () => {
  if(!isAdmin()) return;
  const body = $("#adminMessage").value.trim();
  const file = $("#mediaUpload").files[0];
  if(!body && !file) return alert("Write a message or choose a file.");
  let media = null;
  if(file) media = await fileToData(file);
  if(!state.messages[activeRoomId]) state.messages[activeRoomId] = [];
  const u = currentUser() || {firstName:"Forward", surname:"Admin"};
  state.messages[activeRoomId].push({userId: state.activeId, by:`${u.firstName} ${u.surname}`, admin:true, body, media, time:Date.now(), timeText:now()});
  $("#adminMessage").value = "";
  $("#mediaUpload").value = "";
  save();
  renderMessages();
};

function fileToData(file){
  return new Promise(resolve => {
    if(!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve({name:file.name,type:file.type,url:reader.result});
    reader.readAsDataURL(file);
  });
}

setIndustryOptions();
if(state.activeId && state.users[state.activeId]){
  $("#auth").classList.add("hidden");
  $("#app").classList.remove("hidden");
  initApp();
}
