
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const EMOJIS = ["❤️","👍","😊","✅","💯"];
const ADMIN_CODE = "FORWARD-ADMIN-2026";
const API = window.SUPABASE_URL + "/rest/v1/";
const STORAGE = window.SUPABASE_URL + "/storage/v1/object";
const HEADERS = {
  "apikey": window.SUPABASE_KEY,
  "Authorization": "Bearer " + window.SUPABASE_KEY,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};
let activeMember = JSON.parse(localStorage.getItem("forward_active_member") || "null");
let adminUnlocked = sessionStorage.getItem("forward_admin_unlocked") === "1";
let roomsCache = [];
let activeRoom = null;

async function db(path, options={}){
  const res = await fetch(API + path, {headers: HEADERS, ...options});
  if(!res.ok) throw new Error(await res.text());
  return await res.json();
}
function cleanId(v){ return (v || "").replace(/\D/g, "").trim(); }
function now(){ return new Date().toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"}); }
function isAdmin(){ return adminUnlocked || (activeMember && activeMember.role === "admin"); }
function memberName(){ return activeMember ? `${activeMember.name} ${activeMember.surname}` : "Forward Member"; }
function escapeHTML(str){ return (str || "").replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }


function readKey(roomName){
  return "forward_last_read_" + encodeURIComponent(roomName);
}

function markRoomRead(roomName){
  localStorage.setItem(readKey(roomName), new Date().toISOString());
}

async function hasUnreadMessages(roomName){
  try{
    const lastRead = localStorage.getItem(readKey(roomName));
    const rows = await db(`forward_messages?room_name=eq.${encodeURIComponent(roomName)}&select=created_at&order=created_at.desc&limit=1`);
    if(!rows.length) return false;
    if(!lastRead) return true;
    return new Date(rows[0].created_at).getTime() > new Date(lastRead).getTime();
  }catch(e){
    return false;
  }
}


function setIndustryOptions(){
  $("#industry").innerHTML = `<option value="">Industry / Room interest</option>` + window.FORWARD_ROOMS
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

$("#joinForm").onsubmit = async e => {
  e.preventDefault();
  const id = cleanId($("#idNumber").value);
  if(id.length !== 13){
    alert("Please enter a valid 13-digit South African ID number.");
    return;
  }
  const payload = {
    name: $("#firstName").value.trim(),
    surname: $("#surname").value.trim(),
    email: $("#email").value.trim(),
    phone: $("#phone").value.trim(),
    id_number: id,
    province: $("#province").value,
    age_range: $("#ageRange").value,
    industry: $("#industry").value,
    consent: $("#consent").checked,
    role: "member"
  };
  try{
    const existing = await db(`forward_members?id_number=eq.${id}&select=*`);
    if(existing.length){
      activeMember = existing[0];
    }else{
      activeMember = (await db("forward_members", {method:"POST", body:JSON.stringify(payload)}))[0];
    }
    localStorage.setItem("forward_active_member", JSON.stringify(activeMember));
    enterWithLoading();
  }catch(err){ alert("Join failed: " + err.message); }
};

$("#signinForm").onsubmit = async e => {
  e.preventDefault();
  const id = cleanId($("#signinId").value);
  try{
    const rows = await db(`forward_members?id_number=eq.${id}&select=*`);
    if(!rows.length){
      alert("No Forward account found with this ID number. Please join first.");
      return;
    }
    activeMember = rows[0];
    localStorage.setItem("forward_active_member", JSON.stringify(activeMember));
    enterWithLoading();
  }catch(err){ alert("Sign in failed: " + err.message); }
};

function enterWithLoading(){
  $("#auth").classList.add("hidden");
  $("#loading").classList.remove("hidden");
  setTimeout(async () => {
    $("#loading").classList.add("hidden");
    $("#app").classList.remove("hidden");
    await initApp();
  }, 3000);
}

async function initApp(){
  $("#memberLine").textContent = activeMember ? `${activeMember.name} ${activeMember.surname} • ${activeMember.province || "Forward"}` : "Rooms";
  await renderRooms();
  showPage("roomsPage");
}

$("#logoutBtn").onclick = () => {
  localStorage.removeItem("forward_active_member");
  sessionStorage.removeItem("forward_admin_unlocked");
  location.reload();
};

$("#adminToggle").onclick = () => {
  if(!isAdmin()){
    $("#adminUnlockBox").classList.toggle("hidden");
    return;
  }
  $("#adminPanel").classList.toggle("hidden");
};

$("#unlockAdminBtn").onclick = async () => {
  const code = ($("#adminCodeInput").value || "").trim();
  if(code !== ADMIN_CODE){
    alert("Incorrect admin code.");
    return;
  }
  adminUnlocked = true;
  sessionStorage.setItem("forward_admin_unlocked","1");
  if(activeMember){
    await db(`forward_members?id_number=eq.${activeMember.id_number}`, {method:"PATCH", body:JSON.stringify({role:"admin"})});
    activeMember.role = "admin";
    localStorage.setItem("forward_active_member", JSON.stringify(activeMember));
  }
  $("#adminUnlockBox").classList.add("hidden");
  $("#adminPanel").classList.remove("hidden");
  $("#adminCodeInput").value = "";
  if(activeRoom) await openRoom(activeRoom.name);
};

function showPage(id){
  $$(".page").forEach(p => p.classList.remove("active"));
  $("#" + id).classList.add("active");
}

async function hasApproval(roomName){
  if(!activeMember) return false;
  if(roomName === "General Access & Announcements") return true;
  const rows = await db(`forward_room_approvals?room_name=eq.${encodeURIComponent(roomName)}&member_id_number=eq.${activeMember.id_number}&select=*`);
  return rows.length > 0;
}
async function canEnter(room){
  if(isAdmin()) return true;
  if(room.status === "Open") return true;
  return await hasApproval(room.name);
}

async function renderRooms(){
  roomsCache = await db("forward_rooms?select=*&order=created_at.asc");
  const requestRows = activeMember ? await db(`forward_room_requests?member_id_number=eq.${activeMember.id_number}&status=eq.pending&select=*`) : [];
  const reqMap = new Set(requestRows.map(r => r.room_name));
  const list = $("#roomsList");
  let html = "";
  for(const room of roomsCache){
    const allowed = await canEnter(room);
    const requested = reqMap.has(room.name);
    const badgeClass = room.status === "Open" ? "open" : room.status === "Read-only" ? "readonly" : "closed";
    const lockedText = allowed ? "Enter Room" : (requested ? "Access Requested" : "Request Access");
    const actionClass = allowed ? "enter-room" : (requested ? "access-requested" : "request-access");
    const unread = await hasUnreadMessages(room.name);
    const unreadText = unread ? `<span class="unread-note">new messages</span>` : "";
    html += `
      <div class="room-card" data-room="${escapeHTML(room.name)}">
        <div>
          <h3>${escapeHTML(room.name)}</h3>
          <p>${escapeHTML(room.description || "")}</p>
          ${unreadText}
        </div>
        <div class="room-meta">
          <span class="count">${escapeHTML(room.display_count || "0+")} Professionals Connected</span>
          <span class="badge ${badgeClass}">${escapeHTML(room.status)}</span>
          <span class="badge ${actionClass}">${lockedText}</span>
        </div>
      </div>
    `;
  }
  list.innerHTML = html;
  $$(".room-card").forEach(card => {
    card.onclick = async () => {
      const roomName = card.dataset.room;
      const room = roomsCache.find(r => r.name === roomName);
      if(await canEnter(room)) await openRoom(room.name);
      else await requestAccess(room.name);
    };
  });
}

async function requestAccess(roomName){
  const existing = await db(`forward_room_requests?room_name=eq.${encodeURIComponent(roomName)}&member_id_number=eq.${activeMember.id_number}&status=eq.pending&select=*`);
  if(!existing.length){
    await db("forward_room_requests", {method:"POST", body:JSON.stringify({room_name:roomName, member_id_number:activeMember.id_number, status:"pending"})});
  }
  await renderRooms();
  alert(`Access requested for ${roomName}. You will receive access once admin has approved your entry.`);
}

async function openRoom(roomName){
  activeRoom = (await db(`forward_rooms?name=eq.${encodeURIComponent(roomName)}&select=*`))[0];
  $("#roomTitle").textContent = activeRoom.name;
  $("#roomInfo").textContent = `${activeRoom.display_count} Professionals Connected • ${activeRoom.status}`;
  $("#roomBadge").textContent = activeRoom.status;
  $("#roomBadge").className = "badge " + (activeRoom.status === "Open" ? "open" : activeRoom.status === "Read-only" ? "readonly" : "closed");
  $("#adminPanel").classList.toggle("hidden", !isAdmin());
  $("#composer").classList.toggle("hidden", !canUserWrite(activeRoom));
  await renderMessages();
  markRoomRead(activeRoom.name);
  showPage("chatPage");
}

function canUserWrite(room){
  if(isAdmin()) return true;
  if(room.status !== "Open") return false;
  return true;
}

$("#backBtn").onclick = async () => {
  await renderRooms();
  showPage("roomsPage");
};

async function renderMessages(){
  const rows = await db(`forward_messages?room_name=eq.${encodeURIComponent(activeRoom.name)}&select=*&order=created_at.asc`);
  $("#messages").innerHTML = rows.map((m, i) => {
    const adminTag = m.sender_role === "admin" ? `<span class="admin-tag">Admin</span>` : "";
    const media = m.media_url ? mediaHTML({url:m.media_url,type:m.media_type,name:"Open file"}) : "";
    const reactions = EMOJIS.map(e => {
      const key = `${m.id}_${e}`;
      const active = localStorage.getItem(key) === "1";
      return `<button class="${active ? "active" : ""}" data-react="${key}">${e}</button>`;
    }).join("");
    return `
      <div class="msg">
        <div class="msg-head">
          <div><span class="msg-name">${escapeHTML(m.sender_name || "Forward Member")}</span>${adminTag}</div>
          <span class="msg-time">${new Date(m.created_at).toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"})}</span>
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

function mediaHTML(media){
  if(media.type && media.type.startsWith("image/")) return `<div class="msg-media"><img src="${media.url}" alt="${media.name || ""}"></div>`;
  if(media.type && media.type.startsWith("video/")) return `<div class="msg-media"><video src="${media.url}" controls playsinline></video></div>`;
  return `<div class="msg-media"><a class="file-link" href="${media.url}" target="_blank">${media.name || "Open file"}</a></div>`;
}

$("#sendMsg").onclick = async () => {
  const body = $("#messageInput").value.trim();
  if(!body) return;
  if(!canUserWrite(activeRoom)){
    alert("This room is not open for member messages.");
    return;
  }
  await db("forward_messages", {method:"POST", body:JSON.stringify({
    room_name:activeRoom.name,
    member_id_number:activeMember.id_number,
    sender_name:memberName(),
    sender_role:isAdmin() ? "admin" : "member",
    body
  })});
  $("#messageInput").value = "";
  await renderMessages();
};

$("#toggleOpen").onclick = async () => {
  const next = activeRoom.status === "Open" ? "Closed" : "Open";
  await db(`forward_rooms?name=eq.${encodeURIComponent(activeRoom.name)}`, {method:"PATCH", body:JSON.stringify({status:next})});
  await openRoom(activeRoom.name);
};

$("#toggleReadonly").onclick = async () => {
  const next = activeRoom.status === "Read-only" ? "Open" : "Read-only";
  await db(`forward_rooms?name=eq.${encodeURIComponent(activeRoom.name)}`, {method:"PATCH", body:JSON.stringify({status:next})});
  await openRoom(activeRoom.name);
};

$("#approveRequests").onclick = async () => {
  $("#requestsBox").classList.toggle("hidden");
  await renderRequests();
};

async function renderRequests(){
  const reqs = await db(`forward_room_requests?room_name=eq.${encodeURIComponent(activeRoom.name)}&status=eq.pending&select=*`);
  const box = $("#requestsBox");
  if(!reqs.length){
    box.innerHTML = `<p>No access requests for this room yet.</p>`;
    return;
  }
  let html = "";
  for(const req of reqs){
    const rows = await db(`forward_members?id_number=eq.${req.member_id_number}&select=*`);
    const u = rows[0];
    if(!u) continue;
    html += `<div class="request-card">
      <strong>${escapeHTML(u.name)} ${escapeHTML(u.surname)}</strong>
      <p>${escapeHTML(u.province || "")} • ${escapeHTML(u.industry || "")} • ${escapeHTML(u.age_range || "")}</p>
      <button data-approve="${req.member_id_number}" data-request="${req.id}">Approve Access</button>
    </div>`;
  }
  box.innerHTML = html;
  $$("[data-approve]").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.approve;
      const requestId = btn.dataset.request;
      await db("forward_room_approvals", {method:"POST", body:JSON.stringify({room_name:activeRoom.name, member_id_number:id})});
      await db(`forward_room_requests?id=eq.${requestId}`, {method:"PATCH", body:JSON.stringify({status:"approved"})});
      await renderRequests();
    };
  });
}

$("#manageAdmins").onclick = async () => {
  $("#adminsBox").classList.toggle("hidden");
  await renderAdmins();
};

$("#makeAdminBtn").onclick = async () => {
  const id = cleanId($("#adminIdInput").value);
  if(!id) return alert("Enter a member ID number.");
  const rows = await db(`forward_members?id_number=eq.${id}&select=*`);
  if(!rows.length) return alert("No member found with that ID number.");
  await db(`forward_members?id_number=eq.${id}`, {method:"PATCH", body:JSON.stringify({role:"admin"})});
  $("#adminIdInput").value = "";
  await renderAdmins();
};

async function renderAdmins(){
  const rows = await db("forward_members?role=eq.admin&select=*");
  $("#adminsList").innerHTML = rows.map(u => `<div class="admin-row"><strong>${escapeHTML(u.name)} ${escapeHTML(u.surname)}</strong><p>${escapeHTML(u.id_number)}</p></div>`).join("");
}

$("#sendAdminPost").onclick = async () => {
  if(!isAdmin()) return;
  const body = $("#adminMessage").value.trim();
  const file = $("#mediaUpload").files[0];
  if(!body && !file) return alert("Write a message or choose a file.");
  let mediaUrl = null;
  let mediaType = null;
  if(file){
    const filename = `${Date.now()}-${file.name}`.replace(/\s+/g,"-");
    const uploadRes = await fetch(`${STORAGE}/forward-media/${filename}`, {
      method:"POST",
      headers:{
        "apikey":window.SUPABASE_KEY,
        "Authorization":"Bearer "+window.SUPABASE_KEY,
        "x-upsert":"true",
        "content-type":file.type || "application/octet-stream"
      },
      body:file
    });
    if(!uploadRes.ok){
      alert("Media upload failed.");
      return;
    }
    mediaUrl = `${window.SUPABASE_URL}/storage/v1/object/public/forward-media/${filename}`;
    mediaType = file.type;
  }
  await db("forward_messages", {method:"POST", body:JSON.stringify({
    room_name:activeRoom.name,
    member_id_number:activeMember.id_number,
    sender_name:memberName(),
    sender_role:"admin",
    body,
    media_url:mediaUrl,
    media_type:mediaType
  })});
  $("#adminMessage").value = "";
  $("#mediaUpload").value = "";
  await renderMessages();
};

setIndustryOptions();
if(activeMember){
  $("#auth").classList.add("hidden");
  $("#app").classList.remove("hidden");
  initApp();
}
