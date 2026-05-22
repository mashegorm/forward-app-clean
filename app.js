const SUPABASE_URL = "https://mxzgrbeqgfucmbzedffh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14emdyYmVxZ2Z1Y21iemVkZmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzU4OTIsImV4cCI6MjA5NTAxMTg5Mn0.qKAps91lXS3JIUHhucoit05tg4W0gXWHg46Cs6IEDP4";
const REST_URL = SUPABASE_URL + "/rest/v1";
const STORAGE_URL = SUPABASE_URL + "/storage/v1";

async function api(table, options={}){
  const method = options.method || "GET";
  const query = options.query || "";
  const body = options.body;
  const prefer = options.prefer || "return=representation";
  const res = await fetch(`${REST_URL}/${table}${query}`, {
    method,
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": prefer
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  if(!res.ok) throw new Error(cleanError(text || res.statusText));
  if(!text) return [];
  return JSON.parse(text);
}

function cleanError(msg){
  try { const parsed = JSON.parse(msg); return parsed.message || msg; }
  catch(e) { return msg; }
}

async function uploadFile(bucket, file){
  if(!file) return null;
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${cleanName}`;
  const res = await fetch(`${STORAGE_URL}/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: file
  });
  const text = await res.text();
  if(!res.ok) throw new Error(cleanError(text || res.statusText));
  return `${STORAGE_URL}/object/public/${bucket}/${path}`;
}

const icons = {
  heart:`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6c-1.8-1.7-4.7-1.5-6.3.4L12 7.8 9.5 5C7.9 3.1 5 2.9 3.2 4.6 1.2 6.5 1.1 9.6 3 11.6l9 8.4 9-8.4c1.9-2 1.8-5.1-.2-7Z"/></svg>`,
  comment:`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.7 8.2 9.6 9.6 0 0 1-3.6-.7L3 21l1.6-4.6A7.9 7.9 0 0 1 3.7 12 8.4 8.4 0 0 1 12.4 3.8 8.4 8.4 0 0 1 21 11.5Z"/></svg>`,
  share:`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/></svg>`
};

const defaultStories = [{title:"FNB"},{title:"Funding"},{title:"Events"},{title:"Partners"},{title:"Yoco"},{title:"Seda"}];

const seedRooms = [
  {name:"Announcements", description:"Official Forward updates.", member_count:128, read_only:true, locked:false, membership_required:"Open"},
  {name:"General Access", description:"Open conversation for the Forward network.", member_count:221, read_only:false, locked:false, membership_required:"Open"},
  {name:"SMMEs", description:"For small businesses and entrepreneurs.", member_count:84, read_only:false, locked:false, membership_required:"Open"},
  {name:"Farmers", description:"Agriculture and farming access.", member_count:31, read_only:false, locked:false, membership_required:"Open"},
  {name:"People Living With Disabilities", description:"Access and inclusion room.", member_count:19, read_only:false, locked:false, membership_required:"Open"},
  {name:"Unemployed Youth", description:"Youth opportunities and movement.", member_count:144, read_only:false, locked:false, membership_required:"Open"},
  {name:"Unemployed General", description:"General opportunity access.", member_count:63, read_only:false, locked:false, membership_required:"Open"},
  {name:"Green Sector", description:"Green energy and sustainability.", member_count:42, read_only:false, locked:false, membership_required:"Open"},
  {name:"E-commerce", description:"Online business and digital selling.", member_count:76, read_only:false, locked:false, membership_required:"Open"},
  {name:"NGOs & NPOs", description:"Social impact and institutions.", member_count:51, read_only:false, locked:false, membership_required:"Open"},
  {name:"Learnerships", description:"Learnerships and skills access.", member_count:189, read_only:false, locked:false, membership_required:"Open"},
  {name:"Creatives & Media", description:"Creative economy, content, media.", member_count:57, read_only:false, locked:false, membership_required:"Open"},
  {name:"Technology & Digital Skills", description:"Digital skills, tech and AI.", member_count:103, read_only:false, locked:false, membership_required:"Open"},
  {name:"Funding & Grants", description:"Funding pathways and grants.", member_count:117, read_only:false, locked:false, membership_required:"Open"},
  {name:"Essentials", description:"Essentials membership room.", member_count:28, read_only:false, locked:true, membership_required:"Essentials"},
  {name:"Breakthrough", description:"Breakthrough membership room.", member_count:14, read_only:false, locked:true, membership_required:"Breakthrough"},
  {name:"Premium Experience", description:"Premium member room.", member_count:7, read_only:false, locked:true, membership_required:"Premium"}
];

let state = {
  user: JSON.parse(sessionStorage.getItem("forwardActiveUserV10") || "null"),
  posts: [], rooms: [], messages: {}, events: [], market: [], stories: [], reels: [],
  admin: false, activeRoom: null, activeCommentsPost: null, previousPage: "homePage"
};

function setSync(text, mode="live"){
  const el = document.getElementById("syncStatus");
  if(!el) return;
  el.textContent = text;
  el.classList.remove("live","offline");
  el.classList.add(mode);
}

async function boot(){
  try {
    setSync("Connecting", "");
    await seedDatabaseIfEmpty();
    if(state.user) {
      document.getElementById("authScreen").classList.add("hidden");
      document.getElementById("mainApp").classList.remove("hidden");
      await loadAll();
      setSync("Live", "live");
      startRealtimePolling();
    } else setSync("Ready", "live");
  } catch(err) {
    console.error(err);
    setSync("Offline", "offline");
    alert("Connection issue: " + cleanError(err.message));
  }
}

async function seedDatabaseIfEmpty(){
  const rooms = await api("rooms", {query:"?select=id&limit=1"});
  if(!rooms.length) await api("rooms", {method:"POST", body:seedRooms});
  const stories = await api("stories", {query:"?select=id&limit=1"});
  if(!stories.length) await api("stories", {method:"POST", body:defaultStories});
  const posts = await api("posts", {query:"?select=id&limit=1"});
  if(!posts.length) await api("posts", {method:"POST", body:[
    {title:"South Africa does not lack ambition.", body:"It lacks access, alignment, and proximity to opportunity. Forward exists to close that distance.", likes:42, comments:8},
    {title:"Access Rooms are opening.", body:"Industry rooms are being prepared for builders, founders, farmers, creators, funders, and people ready to move.", likes:31, comments:5}
  ]});
  const events = await api("events", {query:"?select=id&limit=1"});
  if(!events.length) await api("events", {method:"POST", body:[
    {title:"Forward Access Evening", date_text:"Coming Soon", description:"A private room for founders, professionals, funders, and ambitious builders.", poster_url:"Access Evening"},
    {title:"Opportunity Room: Funding & Grants", date_text:"June 2026", description:"A focused session connecting members to funding pathways and partner opportunities.", poster_url:"Funding Room"}
  ]});
  const market = await api("marketplace", {query:"?select=id&limit=1"});
  if(!market.length) await api("marketplace", {method:"POST", body:[
    {title:"Essentials Membership", price:"R199 / month", description:"Access to core rooms, opportunities, and Forward community updates."},
    {title:"Breakthrough Membership", price:"R499 / month", description:"Private rooms, focused events, strategic resources, and deeper support."},
    {title:"Premium Experience", price:"R699 / month", description:"Priority access, curated rooms, premium events, and elevated member visibility."},
    {title:"Forward Event Ticket", price:"Coming Soon", description:"Tickets for Forward access evenings, private gatherings, and partner rooms."},
    {title:"Partner Opportunity Feature", price:"Custom", description:"A sponsored placement for partners who want to reach the Forward network."}
  ]});
  const reels = await api("reels", {query:"?select=id&limit=1"});
  if(!reels.length) await api("reels", {method:"POST", body:[
    {title:"Inside Forward", video_url:"", caption:"A glimpse into the rooms, people, and opportunities shaping the ecosystem.", likes:128},
    {title:"Opportunity Watch", video_url:"", caption:"Short updates on funding, events, partnerships, and access moments.", likes:91},
    {title:"Member Momentum", video_url:"", caption:"Stories from people building, moving, learning, and connecting through Forward.", likes:73}
  ]});
}

async function loadAll(){
  await Promise.all([loadPosts(), loadRooms(), loadEvents(), loadMarket(), loadStories(), loadReels()]);
  renderProfile();
}

async function loadPosts(){ state.posts = await api("posts", {query:"?select=*&order=created_at.desc"}); renderFeed(); }
async function loadRooms(){ state.rooms = await api("rooms", {query:"?select=*&order=created_at.asc"}); renderRooms(); }
async function loadEvents(){ state.events = await api("events", {query:"?select=*&order=created_at.desc"}); renderEvents(); }
async function loadMarket(){ state.market = await api("marketplace", {query:"?select=*&order=created_at.desc"}); renderMarket(); }
async function loadStories(){ state.stories = await api("stories", {query:"?select=*&order=created_at.asc"}); renderStories(); }
async function loadReels(){ state.reels = await api("reels", {query:"?select=*&order=created_at.desc"}); renderReels(); }

function showApp(){
  document.getElementById("loadingScreen").classList.remove("hidden");
  document.getElementById("authScreen").classList.add("hidden");
  setTimeout(async ()=>{
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    await loadAll();
    setSync("Live", "live");
    startRealtimePolling();
  }, 900);
}

document.getElementById("joinTab").onclick = ()=>{
  document.getElementById("joinTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");
  document.getElementById("joinForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
};
document.getElementById("loginTab").onclick = ()=>{
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("joinTab").classList.remove("active");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("joinForm").classList.add("hidden");
};

document.getElementById("joinForm").addEventListener("submit", async e=>{
  e.preventDefault();
  try {
    const form = Object.fromEntries(new FormData(e.target).entries());
    const contact = (form.contact || "").trim().toLowerCase();
    const profile = {
      first_name: form.firstName, surname: form.surname, contact,
      province: form.province, age_range: form.ageRange, industry: form.industry,
      thought: "Closer to the right rooms.", bio: "", rank: "Level 1",
      membership: "General Access", profile_views: 0, earnings: 0,
      is_admin: false, is_partner: false
    };
    const existing = await api("profiles", {query:`?contact=eq.${encodeURIComponent(contact)}&select=*`});
    let data;
    if(existing.length) data = (await api("profiles", {method:"PATCH", query:`?contact=eq.${encodeURIComponent(contact)}`, body:profile}))[0];
    else data = (await api("profiles", {method:"POST", body:profile}))[0];
    state.user = data;
    sessionStorage.setItem("forwardActiveUserV10", JSON.stringify(data));
    showApp();
  } catch(err) { alert("Could not create account: " + cleanError(err.message)); }
});

document.getElementById("loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  try {
    const loginContact = new FormData(e.target).get("loginContact").trim().toLowerCase();
    const data = await api("profiles", {query:`?contact=eq.${encodeURIComponent(loginContact)}&select=*`});
    if(!data.length) return alert("This email or phone number is not registered yet. Please create an account first.");
    state.user = data[0];
    sessionStorage.setItem("forwardActiveUserV10", JSON.stringify(state.user));
    showApp();
  } catch(err) { alert("Login failed: " + cleanError(err.message)); }
});

function renderStories(){
  const list = document.getElementById("storiesList");
  list.innerHTML = state.stories.map(s=>{
    const bg = s.image_url ? `style="background-image:url('${s.image_url}')"` : "";
    return `<div class="story"><div class="story-ring"><div class="story-inner" ${bg}>${s.image_url ? "" : (s.title||"F").slice(0,2).toUpperCase()}</div></div><span>${s.title}</span></div>`;
  }).join("");
}

document.getElementById("createStory").onclick = async ()=>{
  try {
    const title = document.getElementById("storyLabel").value.trim();
    if(!title) return;
    const file = document.getElementById("storyFile").files[0];
    const url = file ? await uploadFile(file.type.startsWith("video/") ? "forward-videos" : "forward-images", file) : null;
    await api("stories", {method:"POST", body:{title, image_url:url, created_by: state.user?.id}});
    document.getElementById("storyLabel").value="";
    document.getElementById("storyFile").value="";
    await loadStories();
  } catch(err) { alert("Story upload failed: " + cleanError(err.message)); }
};

function renderProfile(){
  if(!state.user) return;
  const initials = `${state.user.first_name?.[0]||"F"}${state.user.surname?.[0]||""}`.toUpperCase();
  document.getElementById("avatarInitials").textContent = initials;
  document.getElementById("profileName").textContent = `${state.user.first_name || "Forward"} ${state.user.surname || "Member"}`;
  document.getElementById("profileMeta").textContent = `${state.user.rank || "Level 1"} · ${state.user.membership || "General Access"}`;
  document.getElementById("pProvince").textContent = state.user.province || "-";
  document.getElementById("pIndustry").textContent = state.user.industry || "-";
  document.getElementById("pRank").textContent = state.user.rank || "Level 1";
  document.getElementById("profileViews").textContent = state.user.profile_views ?? 0;
  document.getElementById("thoughtDisplay").textContent = `“${state.user.thought || "Closer to the right rooms."}”`;
  document.getElementById("bioInput").value = state.user.bio || "";
}

document.getElementById("saveThought").onclick = async ()=>{
  const val = document.getElementById("thoughtInput").value.trim();
  if(!val) return;
  const data = await api("profiles", {method:"PATCH", query:`?id=eq.${state.user.id}`, body:{thought: val}});
  state.user = data[0]; sessionStorage.setItem("forwardActiveUserV10", JSON.stringify(state.user));
  document.getElementById("thoughtInput").value = ""; renderProfile();
};
document.getElementById("saveBio").onclick = async ()=>{
  const bio = document.getElementById("bioInput").value.trim();
  const data = await api("profiles", {method:"PATCH", query:`?id=eq.${state.user.id}`, body:{bio}});
  state.user = data[0]; sessionStorage.setItem("forwardActiveUserV10", JSON.stringify(state.user)); renderProfile();
};

function mediaHtml(item){
  let out = "";
  if(item.image_url) out += `<div class="media-preview"><img src="${item.image_url}" /></div>`;
  if(item.video_url) out += `<div class="media-preview"><video src="${item.video_url}" controls playsinline></video></div>`;
  if(item.pdf_url) out += `<a class="file-link" href="${item.pdf_url}" target="_blank">Open PDF</a>`;
  if(item.link_url) out += `<a class="file-link" href="${item.link_url}" target="_blank">Open Link</a>`;
  return out;
}


function localCommentsKey(postId){ return "forwardComments_" + postId; }
function getLocalComments(postId){
  try { return JSON.parse(localStorage.getItem(localCommentsKey(postId)) || "[]"); }
  catch(e){ return []; }
}
function saveLocalComments(postId, comments){
  localStorage.setItem(localCommentsKey(postId), JSON.stringify(comments));
}
async function likePost(postId){
  try{
    const post = state.posts.find(p=>p.id===postId);
    if(!post) return;
    const newLikes = (post.likes || 0) + 1;
    await api("posts", {method:"PATCH", query:`?id=eq.${postId}`, body:{likes:newLikes}});
    await loadPosts();
  }catch(err){ alert("Like failed: " + cleanError(err.message)); }
}
function openComments(postId){
  state.activeCommentsPost = postId;
  state.previousPage = currentPageId;
  const post = state.posts.find(p=>p.id===postId);
  document.getElementById("commentsTitle").textContent = post ? post.title : "Forward discussion";
  renderComments();
  switchPage("commentsPage","Comments");
}
function renderComments(){
  const postId = state.activeCommentsPost;
  const list = document.getElementById("commentsList");
  const comments = getLocalComments(postId);
  if(!comments.length){
    list.innerHTML = `<div class="card"><p>No comments yet. Start the conversation.</p></div>`;
    return;
  }
  list.innerHTML = comments.map(c=>`<div class="comment-row"><strong>${c.author}</strong><p>${c.body}</p></div>`).join("");
}
async function addComment(){
  const input = document.getElementById("commentInput");
  const body = input.value.trim();
  if(!body || !state.activeCommentsPost) return;
  const comments = getLocalComments(state.activeCommentsPost);
  comments.push({author: state.user?.first_name || "Member", body, created_at: new Date().toISOString()});
  saveLocalComments(state.activeCommentsPost, comments);
  const post = state.posts.find(p=>p.id===state.activeCommentsPost);
  if(post){
    await api("posts", {method:"PATCH", query:`?id=eq.${post.id}`, body:{comments:(post.comments || 0)+1}});
    await loadPosts();
  }
  input.value="";
  renderComments();
}
async function deleteRecord(table, id, reloadFn){
  if(!confirm("Delete this item?")) return;
  try{
    await api(table, {method:"DELETE", query:`?id=eq.${id}`, prefer:"return=minimal"});
    if(reloadFn) await reloadFn();
  }catch(err){ alert("Delete failed: " + cleanError(err.message)); }
}

function renderFeed(){
  const list = document.getElementById("feedList");
  list.innerHTML = state.posts.map(p=>`<article class="post">
    <div class="post-head"><h4>${p.title}</h4><span class="eyebrow blue">Forward</span></div>
    <p>${p.body || ""}</p>${mediaHtml(p)}
    <div class="actions">
      <span class="like-btn" onclick="likePost('${p.id}')">${icons.heart}${p.likes || 0}</span>
      <span class="comment-btn" onclick="openComments('${p.id}')">${icons.comment}${p.comments || 0}</span>
      <span>${icons.share}Share</span>
    </div>
    ${state.admin ? `<button class="admin-delete" onclick="deleteRecord('posts','${p.id}',loadPosts)">Delete Post</button>` : ""}
  </article>`).join("");
}

document.getElementById("addPost").onclick = async ()=>{
  try {
    const text = document.getElementById("postText").value.trim();
    if(!text) return;
    const image_url = await uploadFile("forward-images", document.getElementById("postImage").files[0]);
    const pdf_url = await uploadFile("forward-pdfs", document.getElementById("postPdf").files[0]);
    const video_url = await uploadFile("forward-videos", document.getElementById("postVideo").files[0]);
    const link_url = document.getElementById("postLink").value.trim() || null;
    await api("posts", {method:"POST", body:{title:"Forward Update", body:text, profile_id: state.user?.id, image_url, pdf_url, video_url, link_url, likes:0, comments:0}});
    ["postText","postImage","postPdf","postVideo","postLink"].forEach(id=>document.getElementById(id).value="");
    await loadPosts();
  } catch(err) { alert("Post failed: " + cleanError(err.message)); }
};

function renderRooms(){
  const list = document.getElementById("roomsList");
  list.innerHTML = state.rooms.map((r, idx)=>`<div class="room">
    <div onclick="openRoom(${idx})"><strong>${r.name}</strong><p>${r.member_count || 0} members · ${r.read_only ? "Read-only" : "Open chat"} · ${r.membership_required || "Open"}</p></div>
    <div><span class="badge">${r.locked ? "Locked" : "Open"}</span>${state.admin ? `<button class="admin-delete" onclick="event.stopPropagation(); deleteRecord('rooms','${r.id}',loadRooms)">Delete</button>` : ""}</div>
  </div>`).join("");
}

document.getElementById("createRoom").onclick = async ()=>{
  const name = document.getElementById("newRoomName").value.trim();
  if(!name) return;
  const description = document.getElementById("newRoomDescription").value.trim();
  await api("rooms", {method:"POST", body:{name, description, member_count:0, read_only:false, locked:false, membership_required:"Open"}});
  document.getElementById("newRoomName").value="";
  document.getElementById("newRoomDescription").value="";
  await loadRooms();
};

async function openRoom(idx){
  state.activeRoom = idx;
  const r = state.rooms[idx];
  document.getElementById("chatTitle").textContent = r.name;
  document.getElementById("chatMeta").textContent = `${r.member_count || 0} members · ${r.locked ? "Locked" : "Open"} · ${r.read_only ? "Read-only" : "Chat enabled"}`;
  document.getElementById("chatBox").classList.toggle("hidden", r.read_only || r.locked);
  document.getElementById("roomAdminActions").classList.toggle("hidden", !state.admin);
  document.getElementById("toggleRoomLock").textContent = r.locked ? "Unlock" : "Lock";
  document.getElementById("toggleRoomReadOnly").textContent = r.read_only ? "Open Chat" : "Read-only";
  document.getElementById("adminChatTools").classList.toggle("hidden", !state.admin);
  switchPage("roomChatPage", "Room");
  await loadMessages(r.id);
}

document.getElementById("backToRooms").onclick = ()=>switchPage("roomsPage","Rooms");

async function loadMessages(roomId){
  state.messages[roomId] = await api("messages", {query:`?room_id=eq.${roomId}&select=*&order=created_at.asc`});
  renderMessages();
}

function renderMessages(){
  const room = state.rooms[state.activeRoom];
  const arr = state.messages[room.id] || [];
  const box = document.getElementById("chatMessages");
  box.innerHTML = `<div class="msg welcome"><small>Forward</small>Welcome To Forward Access.</div>`;
  arr.forEach(m=>{
    const initials = m.author_name ? m.author_name[0].toUpperCase() : "F";
    const thought = (m.profile_id === state.user.id && state.user.thought) ? `<span class="msg-thought">${state.user.thought}</span>` : "";
    box.innerHTML += `<div class="msg ${m.profile_id === state.user.id ? "me" : ""}">
      <div class="msg-profile"><span class="msg-avatar">${initials}</span><div><small>${m.author_name || "Member"}</small>${thought}</div></div>
      ${m.body || ""}${mediaHtml(m)}
    </div>`;
  });
}

document.getElementById("sendMessage").onclick = async ()=>{
  try {
    const input = document.getElementById("chatInput");
    const body = input.value.trim();
    const image_url = state.admin ? await uploadFile("forward-images", document.getElementById("chatImage").files[0]) : null;
    const pdf_url = state.admin ? await uploadFile("forward-pdfs", document.getElementById("chatPdf").files[0]) : null;
    const video_url = state.admin ? await uploadFile("forward-videos", document.getElementById("chatVideo").files[0]) : null;
    const link_url = state.admin ? (document.getElementById("chatLink").value.trim() || null) : null;
    if(!body && !image_url && !pdf_url && !video_url && !link_url) return;
    const room = state.rooms[state.activeRoom];
    await api("messages", {method:"POST", body:{room_id: room.id, profile_id: state.user.id, author_name: state.user.first_name || "Member", body, message_type:"text", image_url, pdf_url, video_url, link_url}});
    input.value="";
    if(state.admin) ["chatImage","chatPdf","chatVideo","chatLink"].forEach(id=>document.getElementById(id).value="");
    await loadMessages(room.id);
  } catch(err) { alert("Message failed: " + cleanError(err.message)); }
};

document.getElementById("toggleRoomLock").onclick = async ()=>{
  const r = state.rooms[state.activeRoom];
  await api("rooms", {method:"PATCH", query:`?id=eq.${r.id}`, body:{locked: !r.locked}});
  await loadRooms(); await openRoom(state.rooms.findIndex(x=>x.id === r.id));
};
document.getElementById("toggleRoomReadOnly").onclick = async ()=>{
  const r = state.rooms[state.activeRoom];
  await api("rooms", {method:"PATCH", query:`?id=eq.${r.id}`, body:{read_only: !r.read_only}});
  await loadRooms(); await openRoom(state.rooms.findIndex(x=>x.id === r.id));
};

function renderEvents(){
  const list = document.getElementById("eventsList");
  list.innerHTML = state.events.map((e,idx)=>`<div class="card">
    <p class="eyebrow blue">${e.date_text || "Coming Soon"}</p><h4>${e.title}</h4><p>${e.description || ""}</p>
    <button class="read-more ghost" onclick="toggleEventDetail(${idx})">Read More</button>
    <div class="event-detail" id="eventDetail${idx}">
      ${e.poster_url && e.poster_url.startsWith("http") ? `<div class="event-poster full-poster"><img src="${e.poster_url}" /></div>` : `<div class="event-poster">${e.poster_url || e.title}</div>`}
      <p>More details, poster artwork, venue notes, registration information, speakers, and partner information will appear here.</p>
      <button>Register Interest</button>
    </div>
    ${state.admin ? `<button class="admin-delete" onclick="deleteRecord('events','${e.id}',loadEvents)">Delete Event</button>` : ""}
  </div>`).join("");
}
function toggleEventDetail(idx){ document.getElementById(`eventDetail${idx}`).classList.toggle("open"); }

document.getElementById("createEvent").onclick = async ()=>{
  try {
    const title = document.getElementById("eventTitle").value.trim();
    const date_text = document.getElementById("eventDate").value.trim();
    const description = document.getElementById("eventBody").value.trim();
    if(!title || !description) return;
    const poster_url = await uploadFile("forward-posters", document.getElementById("eventPoster").files[0]) || title;
    await api("events", {method:"POST", body:{title, date_text:date_text || "Coming Soon", poster_url, description, created_by: state.user?.id}});
    ["eventTitle","eventDate","eventPoster","eventBody"].forEach(id=>document.getElementById(id).value="");
    await loadEvents();
  } catch(err) { alert("Event failed: " + cleanError(err.message)); }
};

function renderMarket(){
  const list = document.getElementById("marketList");
  list.innerHTML = state.market.map(m=>`<div class="card">
    ${m.image_url ? `<div class="media-preview"><img src="${m.image_url}" /></div>` : ""}
    <h4>${m.title}</h4><div class="price">${m.price || ""}</div><p>${m.description || ""}</p>
    <button onclick="window.open('${m.payment_link || "#"}','_blank')">Buy / Apply</button>
    ${state.admin ? `<button class="admin-delete" onclick="deleteRecord('marketplace','${m.id}',loadMarket)">Delete Offer</button>` : ""}
  </div>`).join("");
}

document.getElementById("createProduct").onclick = async ()=>{
  try {
    const title = document.getElementById("productTitle").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const description = document.getElementById("productBody").value.trim();
    if(!title || !description) return;
    const image_url = await uploadFile("forward-images", document.getElementById("productImage").files[0]);
    const payment_link = document.getElementById("productPayment").value.trim() || null;
    await api("marketplace", {method:"POST", body:{title, price:price || "Custom", description, image_url, payment_link, created_by: state.user?.id}});
    ["productTitle","productPrice","productImage","productPayment","productBody"].forEach(id=>document.getElementById(id).value="");
    await loadMarket();
  } catch(err) { alert("Offer failed: " + cleanError(err.message)); }
};

function renderReels(){
  const list = document.getElementById("reelsList");
  list.innerHTML = state.reels.map((r,idx)=>{
    const isImage = r.video_url && !r.video_url.match(/\.(mp4|mov|webm|m4v)(\?|$)/i);
    const media = r.video_url ? (isImage ? `<img src="${r.video_url}" />` : `<video src="${r.video_url}" muted playsinline></video>`) : `<div class="play-mark">▶</div>`;
    return `<div class="reel-card" data-reel="${idx}">
      <div class="reel-progress"></div><div class="reel-status">Playing</div>
      <div class="reel-video-layer">${media}</div>
      <div class="reel-side-actions"><button onclick="likeReel('${r.id}')">♡</button><button>💬</button><button>↗</button></div>
      <div class="reel-content"><p class="eyebrow blue">Forward Reel</p><h4>${r.title}</h4><p>${r.caption || ""}</p>
      <div class="reel-actions"><span>♡ ${r.likes || 0}</span><span>Comments</span><span>Share</span></div>
      ${state.admin ? `<button class="admin-delete" onclick="deleteRecord('reels','${r.id}',loadReels)">Delete Reel</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

async function likeReel(reelId){
  try{
    const reel = state.reels.find(r=>r.id===reelId);
    if(!reel) return;
    await api("reels", {method:"PATCH", query:`?id=eq.${reelId}`, body:{likes:(reel.likes || 0)+1}});
    await loadReels();
  }catch(err){ alert("Reel like failed: " + cleanError(err.message)); }
}

document.getElementById("createReel").onclick = async ()=>{
  try {
    const title = document.getElementById("reelTitle").value.trim();
    const caption = document.getElementById("reelBody").value.trim();
    if(!title || !caption) return;
    const mediaFile = document.getElementById("reelMedia").files[0];
    const uploaded = mediaFile ? await uploadFile(mediaFile.type.startsWith("video/") ? "forward-reels" : "forward-images", mediaFile) : null;
    const video_url = uploaded;
    await api("reels", {method:"POST", body:{title, video_url, caption, likes:0, created_by: state.user?.id}});
    ["reelTitle","reelMedia","reelBody"].forEach(id=>document.getElementById(id).value="");
    await loadReels();
  } catch(err) { alert("Reel failed: " + cleanError(err.message)); }
};

document.getElementById("askAI").onclick = ()=>{
  const q = document.getElementById("aiInput").value.trim().toLowerCase();
  const ans = document.getElementById("aiAnswer");
  if(!q){ ans.textContent = "Ask about rooms, memberships, events, or where you fit inside Forward."; return; }
  if(q.includes("membership")) ans.textContent = "Forward memberships unlock deeper rooms, private access, events, and curated opportunities.";
  else if(q.includes("event")) ans.textContent = "Forward events are designed as opportunity rooms: intimate, strategic, and built around access.";
  else if(q.includes("fund")) ans.textContent = "Start with the Funding & Grants room. It is built for funding pathways, partner updates, and practical access.";
  else ans.textContent = "Based on your profile, start inside General Access, then join the room closest to your industry or ambition.";
};

let pollTimer = null, reelTimer = null, activeReelIndex = 0, currentPageId = "homePage";
function startRealtimePolling(){
  if(pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async ()=>{
    try {
      if(currentPageId === "roomChatPage" && state.activeRoom !== null) await loadMessages(state.rooms[state.activeRoom].id);
      if(currentPageId === "homePage") await loadPosts();
      if(currentPageId === "roomsPage") await loadRooms();
    } catch(e) {}
  }, 3500);
}
function startReelAutoplay(){
  const list = document.getElementById("reelsList");
  if(!list || currentPageId !== "reelsPage") return;
  const cards = [...list.querySelectorAll(".reel-card")];
  if(!cards.length) return;
  stopReelAutoplay(); activeReelIndex = 0; playReel(cards, activeReelIndex);
  reelTimer = setInterval(()=>{
    if(currentPageId !== "reelsPage") return stopReelAutoplay();
    activeReelIndex = (activeReelIndex + 1) % cards.length;
    playReel(cards, activeReelIndex);
    list.scrollTo({top: cards[activeReelIndex].offsetTop - list.offsetTop, behavior:"smooth"});
  }, 6500);
}
function stopReelAutoplay(){ if(reelTimer) clearInterval(reelTimer); reelTimer = null; }
function playReel(cards,index){
  cards.forEach((card,i)=>{
    card.classList.toggle("active-reel", i === index);
    const v = card.querySelector("video");
    if(v){ i === index ? v.play().catch(()=>{}) : v.pause(); }
    const progress = card.querySelector(".reel-progress");
    if(progress){ progress.style.animation="none"; progress.offsetHeight; if(i===index) progress.style.animation="reelProgress 6.5s linear forwards"; }
  });
}
function switchPage(id,title){
  currentPageId = id;
  if(id !== "reelsPage") stopReelAutoplay();
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.getElementById("pageTitle").textContent = title;
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active", b.dataset.page === id));
  if(id === "reelsPage") startReelAutoplay();
}
document.getElementById("exitReels").onclick = ()=>switchPage("homePage","Home");
document.querySelectorAll(".bottom-nav button").forEach(btn=>{ btn.onclick=()=>switchPage(btn.dataset.page, btn.textContent); });
document.getElementById("adminToggle").onclick = ()=>{
  state.admin = !state.admin;
  document.getElementById("adminToggle").textContent = state.admin ? "Admin On" : "Admin Mode";
  ["adminComposer","adminRoomTools","adminEventTools","adminMarketTools","adminStoryTools","adminReelTools"].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.toggle("hidden", !state.admin); });
  if(state.activeRoom !== null){
    document.getElementById("roomAdminActions").classList.toggle("hidden", !state.admin);
    document.getElementById("adminChatTools").classList.toggle("hidden", !state.admin);
  }
  renderFeed(); renderRooms(); renderEvents(); renderMarket(); renderReels();
};
document.getElementById("backFromComments").onclick = ()=>switchPage(state.previousPage || "homePage", state.previousPage === "reelsPage" ? "Reels" : "Home");
document.getElementById("sendComment").onclick = addComment;
document.getElementById("logout").onclick = ()=>{ sessionStorage.removeItem("forwardActiveUserV10"); location.reload(); };

boot();
