const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let state = JSON.parse(localStorage.getItem("forwardV30")||"null") || {
  profiles:{}, activeContact:null, admin:true,
  stories:["Forward","FNB","Spar","Partners","Rooms","Advertising"],
  posts:[
    {title:"Welcome To Access.",type:"Opportunity Update",body:"Forward connects people, opportunities, rooms and movement.",likes:12,liked:false},
    {title:"The Future Of South African Wealth Is Human Capital.",type:"Access Note",body:"South Africa does not lack talent. It lacks access, alignment and proximity to opportunity.",likes:21,liked:false}
  ],
  rooms:[
    {name:"Announcements",desc:"Admin-only updates",members:221,status:"Read-only"},
    {name:"General Access",desc:"Open ecosystem room",members:221,status:"Open"},
    {name:"SMMEs",desc:"Entrepreneurs and business owners",members:84,status:"Open"},
    {name:"Farmers",desc:"Agriculture and farming access",members:31,status:"Open"},
    {name:"Funding & Grants",desc:"Capital and opportunity access",members:117,status:"Open"},
    {name:"E-commerce",desc:"Online selling and digital commerce",members:76,status:"Open"},
    {name:"Green Sector",desc:"Energy, climate and sustainability",members:62,status:"Open"},
    {name:"Technology",desc:"Builders, tools and digital work",members:91,status:"Open"},
    {name:"Media",desc:"Creative economy and visibility",members:57,status:"Open"},
    {name:"NGOs & NPOs",desc:"Impact, funding and partnerships",members:51,status:"Open"},
    {name:"Learnerships",desc:"Skills and learning opportunities",members:189,status:"Open"},
    {name:"People Living With Disabilities",desc:"Inclusive access and opportunity",members:19,status:"Open"},
    {name:"Unemployed Youth",desc:"Youth opportunity access",members:144,status:"Open"},
    {name:"Unemployed General",desc:"Open opportunity access",members:63,status:"Open"},
    {name:"Essentials",desc:"Essentials membership room",members:28,status:"Closed"},
    {name:"Breakthrough",desc:"Breakthrough membership room",members:14,status:"Closed"},
    {name:"Premium Experience",desc:"Premium private room",members:7,status:"Closed"}
  ],
  messages:{},
  reels:[
    {title:"Inside Forward",caption:"Rooms. Access. Movement."},
    {title:"Opportunity Watch",caption:"Funding. Partners. Visibility."}
  ],
  events:[
    {title:"Forward Access Evening",date:"Coming Soon",price:"Invite-only",details:"A private gathering for founders, professionals, funders and builders."},
    {title:"Opportunity Room: Funding & Grants",date:"June 2026",price:"Free / RSVP",details:"A focused access session for funding pathways, grants and capital readiness."}
  ],
  offers:[
    {title:"Essentials Membership",price:"R199 / month",button:"Apply",details:"Core access, rooms, updates and member movement."},
    {title:"Breakthrough Membership",price:"R499 / month",button:"Join",details:"Private rooms, stronger support, focused access and partner opportunities."},
    {title:"Premium Experience",price:"R699 / month",button:"Reserve",details:"Priority access, premium rooms, curated opportunities and visibility."}
  ],
  socials:{website:"",instagram:"",facebook:"",linkedin:"",youtube:""},
  roles:{}
};
let activeRoom=0;
function save(){localStorage.setItem("forwardV30",JSON.stringify(state))}
function fileToData(file){
  if(!file)return Promise.resolve(null);
  return new Promise((res)=>{
    if(file.size > 4500000){
      res({name:file.name,type:file.type,url:URL.createObjectURL(file),temporary:true});
      return;
    }
    let r=new FileReader();
    r.onload=()=>res({name:file.name,type:file.type,url:r.result});
    r.onerror=()=>res({name:file.name,type:file.type,url:URL.createObjectURL(file),temporary:true});
    r.readAsDataURL(file);
  });
}
function mediaHTML(m){if(!m)return ""; if(m.type&&m.type.startsWith("video"))return `<div class="media"><video src="${m.url}" controls playsinline></video></div>`; if(m.type&&m.type.startsWith("image"))return `<div class="media"><img src="${m.url}"></div>`; return `<a class="file-name" href="${m.url}" target="_blank">${m.name||"Open file"}</a>`}
function activeProfile(){return state.profiles[state.activeContact]||null}
function showCreate(){createForm.classList.remove("hidden");signinForm.classList.add("hidden");createTab.classList.add("active");signinTab.classList.remove("active")}
function showSignin(){signinForm.classList.remove("hidden");createForm.classList.add("hidden");signinTab.classList.add("active");createTab.classList.remove("active")}
createTab.onclick=showCreate; signinTab.onclick=showSignin;
joinBtn.onclick=()=>{if(!firstName.value||!surname.value||!contact.value||!province.value||!age.value||!industry.value)return alert("Please complete all fields.");if(!consent.checked)return alert("Please accept the consent form.");let c=contact.value.toLowerCase();state.profiles[c]={first:firstName.value,surname:surname.value,contact:c,province:province.value,age:age.value,industry:industry.value,thought:"Can’t wait for Opportunities.",role:"admin"};state.activeContact=c;save();enter(true)}
signinBtn.onclick=()=>{let c=signinContact.value.toLowerCase();if(!state.profiles[c])return alert("No Forward profile found. Create an account first.");state.activeContact=c;save();enter(true)}
signOut.onclick=()=>{state.activeContact=null;save();location.reload()}
function enter(delay=true){auth.classList.add("hidden"); if(delay)loading.classList.remove("hidden"); setTimeout(()=>{loading.classList.add("hidden");app.classList.remove("hidden");setProfile();renderAll()},delay?5000:0)}
function setProfile(){let p=activeProfile();if(!p)return;profileName.textContent=`${p.first} ${p.surname}`;pProvince.textContent=p.province;pIndustry.textContent=p.industry;pAge.textContent=p.age;pRole.textContent=p.role||"member";avatar.textContent=p.first[0].toUpperCase();status.textContent=`${p.province} • ${p.industry}`;thoughtDisplay.textContent=`“${p.thought||"Can’t wait for Opportunities."}”`;state.admin=true;adminToggle.textContent="Admin On"}
function renderAll(){renderStories();renderFeed();renderRooms();renderReels();renderEvents();renderMarket();renderSocials();renderRoles();applyAdmin()}
function page(id){$$(".page").forEach(p=>p.classList.remove("active"));$("#"+id).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id))}
$$(".nav").forEach(n=>n.onclick=()=>page(n.dataset.page));
adminToggle.onclick=()=>{state.admin=!state.admin;adminToggle.textContent=state.admin?"Admin On":"Admin";save();renderAll()}
function applyAdmin(){$$(".admin-only").forEach(e=>e.classList.toggle("hidden",!state.admin));roomAdmin.classList.toggle("hidden",!state.admin)}
function renderStories(){stories.innerHTML=state.stories.map((s,i)=>{let label=typeof s==="string"?s:s.label,m=typeof s==="object"?s.media:null;return `<div class="story ${i==0?"active":""}" data-i="${i}"><div class="ring" ${m?`style="background-image:url('${m.url}')"`:""}>${m?"":label[0]}</div><small>${label}</small></div>`}).join("");$$(".story").forEach(st=>st.onclick=()=>openStory(+st.dataset.i))}
function openStory(i){let s=state.stories[i],label=typeof s==="string"?s:s.label,m=typeof s==="object"?s.media:null;storyViewer.classList.remove("hidden");storyContent.innerHTML=m?(m.type&&m.type.startsWith("video")?`<video src="${m.url}" controls autoplay playsinline></video>`:`<img src="${m.url}">`):`<div class="fallback">${label}</div>`}
closeStory.onclick=()=>storyViewer.classList.add("hidden");
addStoryBtn.onclick=()=>{let label=prompt("Story label","New Story");if(!label)return;let inp=document.createElement("input");inp.type="file";inp.accept="image/*,video/*";inp.onchange=async()=>{state.stories.push({label,media:await fileToData(inp.files[0])});save();renderStories()};inp.click()}
quickStory.onclick=()=>addStoryBtn.click();
createPost.onclick=async()=>{state.posts.unshift({title:postTitle.value||"Forward Update",type:"Admin Post",body:postBody.value||"",likes:0,liked:false,media:await fileToData(postFile.files[0])});postTitle.value=postBody.value=postFile.value="";save();renderFeed()}
function renderFeed(){feed.innerHTML=state.posts.map((p,i)=>`<article class="feed-card"><div class="feed-head"><span>Forward</span><small>${p.type||"Update"}</small></div><h3>${p.title}</h3><p>${p.body}</p>${mediaHTML(p.media)}<div class="actions"><button class="like ${p.liked?"liked":""}" data-i="${i}">${p.liked?"♥":"♡"} <span>${p.likes}</span></button><button>Comment</button><button>Share</button><button>React</button></div>${state.admin?`<div class="admin-panel"><button onclick="editPost(${i})">Edit</button><button onclick="deletePost(${i})" class="danger">Delete</button></div>`:""}</article>`).join("");$$(".like").forEach(b=>b.onclick=()=>{let p=state.posts[b.dataset.i];p.liked=!p.liked;p.likes+=p.liked?1:-1;save();renderFeed()})}
window.editPost=i=>{state.posts[i].title=prompt("Title",state.posts[i].title)||state.posts[i].title;state.posts[i].body=prompt("Body",state.posts[i].body)||state.posts[i].body;save();renderFeed()}
window.deletePost=i=>{state.posts.splice(i,1);save();renderFeed()}
showRoomCreate.onclick=()=>roomCreate.classList.toggle("hidden");createRoom.onclick=()=>{state.rooms.unshift({name:roomNameInput.value||"New Room",desc:roomDescInput.value||"Access room",members:0,status:"Open"});save();renderRooms()}
function renderRooms(){roomList.innerHTML=state.rooms.map((r,i)=>`<button class="room-card" data-i="${i}"><div><h3>${r.name}</h3><p>${r.desc}</p></div><div class="room-meta"><span class="status ${r.status!="Open"?"closed":""}">${r.status}</span><span class="count">${r.members} Members</span></div></button>`).join("");$$(".room-card").forEach(c=>c.onclick=()=>openRoom(+c.dataset.i))}
function openRoom(i){activeRoom=i;let r=state.rooms[i];roomTitle.textContent=r.name;roomMeta.textContent=`${r.status} room • ${r.members} members • reactions enabled`;editRoomName.value=r.name;editRoomDesc.value=r.desc;composer.classList.toggle("hidden",r.status!="Open"&&!state.admin);page("roomView");renderMessages();applyAdmin()}
backRooms.onclick=()=>page("rooms");saveRoom.onclick=()=>{let r=state.rooms[activeRoom];r.name=editRoomName.value;r.desc=editRoomDesc.value;save();renderRooms();openRoom(activeRoom)};lockRoom.onclick=()=>{let r=state.rooms[activeRoom];r.status=r.status==="Closed"?"Open":"Closed";save();openRoom(activeRoom);renderRooms()};readOnlyRoom.onclick=()=>{let r=state.rooms[activeRoom];r.status=r.status==="Read-only"?"Open":"Read-only";save();openRoom(activeRoom);renderRooms()};deleteRoom.onclick=()=>{state.rooms.splice(activeRoom,1);save();page("rooms");renderRooms()}
function reacts(){return `<div class="reactions">${["❤️","👍","😊","✅","💯"].map(x=>`<button>${x}</button>`).join("")}</div>`}
function attachReacts(){$$(".reactions button").forEach(b=>b.onclick=()=>b.classList.toggle("active"))}
function renderMessages(){let key=state.rooms[activeRoom].name;if(!state.messages[key])state.messages[key]=[{author:"Forward",body:"Welcome To Forward Access."}];messages.innerHTML=state.messages[key].map(m=>`<div class="msg"><small>${m.author}</small>${m.body||""}${mediaHTML(m.media)}${reacts()}</div>`).join("");attachReacts()}
sendMessage.onclick=()=>{if(!messageInput.value.trim())return;let key=state.rooms[activeRoom].name;state.messages[key].push({author:activeProfile().first,body:messageInput.value});messageInput.value="";save();renderMessages()}
roomSendFile.onclick=async()=>{let f=await fileToData(roomFile.files[0]);if(!f)return alert("Choose file first");let key=state.rooms[activeRoom].name;state.messages[key].push({author:"Admin",media:f});roomFile.value="";save();renderMessages()}
showReelCreate.onclick=()=>reelCreate.classList.toggle("hidden");
createReel.onclick=async()=>{
  let f=await fileToData(reelFile.files[0]);
  if(!f)return alert("Choose a video or image first.");
  state.reels.unshift({title:reelTitle.value||"New Reel",caption:reelCaption.value||"",media:f});
  reelTitle.value="";
  reelCaption.value="";
  reelFile.value="";
  save();
  renderReels();
  reelCreate.classList.add("hidden");
  alert("Reel posted.");
}
function renderReels(){
  if(!state.reels || !state.reels.length){
    state.reels=[
      {title:"Inside Forward",caption:"Rooms. Access. Movement."},
      {title:"Opportunity Watch",caption:"Funding. Partners. Visibility."}
    ];
  }
  reelStack.innerHTML=state.reels.map((r,i)=>{
    let mediaBlock="";
    if(r.media && r.media.url){
      if(r.media.type && r.media.type.startsWith("video")){
        mediaBlock=`<video src="${r.media.url}" controls playsinline preload="metadata"></video>`;
      }else{
        mediaBlock=`<img src="${r.media.url}" alt="">`;
      }
    }
    return `<div class="reel">${mediaBlock}<div><h2>${r.title}</h2><p>${r.caption||""}</p><div>❤️ 👍 😊 ✅ 💯</div>${r.media&&r.media.url?`<button class="play-open" onclick="openReel(${i})">Open Reel</button>`:""}${state.admin?`<button class="read-more" onclick="deleteReel(${i})">Delete</button>`:""}</div></div>`;
  }).join("");
}
window.deleteReel=i=>{state.reels.splice(i,1);save();renderReels()}
showEventCreate.onclick=()=>eventCreate.classList.toggle("hidden");
createEvent.onclick=async()=>{
  const poster=await fileToData(eventPoster.files[0]);
  state.events.unshift({title:eventTitleInput.value||"New Event",date:eventDateInput.value||"Coming Soon",price:eventPriceInput.value||"Free",details:eventDescInput.value||"",media:poster});
  eventTitleInput.value="";
  eventDateInput.value="";
  eventPriceInput.value="";
  eventDescInput.value="";
  eventPoster.value="";
  save();
  renderEvents();
  eventCreate.classList.add("hidden");
  alert("Event posted.");
}
function renderEvents(){
  eventsList.innerHTML=state.events.map((e,i)=>{
    const bg=e.media?`style="background-image:url('${e.media.url}')"`:"";
    return `<div class="event-card"><div class="event-poster ${e.media?"has-media":""}" ${bg}>${e.media?"":e.title}</div><h3>${e.title}</h3><p>${e.date} • ${e.price}</p><button class="read-more" onclick="toggleDetails('event${i}')">See More Details</button><div class="details" id="event${i}"><p>${e.details}</p><button>Register Interest</button>${state.admin?`<button class="danger" onclick="deleteEvent(${i})">Delete</button>`:""}</div></div>`;
  }).join("");
}
window.deleteEvent=i=>{state.events.splice(i,1);save();renderEvents()}
showOfferCreate.onclick=()=>offerCreate.classList.toggle("hidden");createOffer.onclick=async()=>{state.offers.unshift({title:offerTitleInput.value||"New Offer",price:offerPriceInput.value||"Custom",button:offerButtonInput.value,details:offerDescInput.value||"",media:await fileToData(offerImage.files[0])});offerTitleInput.value=offerPriceInput.value=offerDescInput.value=offerImage.value="";save();renderMarket()}
function renderMarket(){marketList.innerHTML=state.offers.map((o,i)=>`<div class="market-card"><div class="product-image" ${o.media?`style="background-image:url('${o.media.url}')"`:""}>${o.media?"":o.title}</div><h3>${o.title}</h3><p>${o.price}</p><button>${o.button}</button><button class="read-more" onclick="toggleDetails('offer${i}')">Read More</button><div class="details" id="offer${i}"><p>${o.details}</p>${state.admin?`<button class="danger" onclick="deleteOffer(${i})">Delete</button>`:""}</div></div>`).join("")}
window.deleteOffer=i=>{state.offers.splice(i,1);save();renderMarket()}
window.toggleDetails=id=>document.getElementById(id).classList.toggle("open")
saveThought.onclick=()=>{let p=activeProfile();p.thought=thoughtInput.value||p.thought;thoughtInput.value="";save();setProfile()}
askAI.onclick=()=>{let q=aiQuestion.value.toLowerCase();let a="Forward connects people and businesses to rooms, opportunities, visibility, funding, partnerships, events and economic movement.";if(q.includes("room"))a="Rooms are private access spaces. Some are open, closed or read-only. Even closed rooms allow reactions.";else if(q.includes("market"))a="Marketplace shows memberships, tickets, partner offers, courses, sponsored products and opportunities.";else if(q.includes("event"))a="Events are Forward access rooms in real life: summits, gatherings, partner sessions and opportunity rooms.";else if(q.includes("earn"))a="Forward Earnings is coming soon for referrals, campaigns, opportunity sharing and partner activity.";aiAnswer.textContent=a}
function renderSocials(){socialLinks.innerHTML=["Website","Instagram","Facebook","LinkedIn","YouTube"].map(name=>`<button>${name}</button>`).join("");websiteLink.value=state.socials.website||"";instagramLink.value=state.socials.instagram||"";facebookLink.value=state.socials.facebook||"";linkedinLink.value=state.socials.linkedin||"";youtubeLink.value=state.socials.youtube||""}
saveSocials.onclick=()=>{state.socials={website:websiteLink.value,instagram:instagramLink.value,facebook:facebookLink.value,linkedin:linkedinLink.value,youtube:youtubeLink.value};save();renderSocials()}
$$("[data-admin-go]").forEach(b=>b.onclick=()=>page(b.dataset.adminGo));assignAdmin.onclick=()=>assignRole("admin");assignPartner.onclick=()=>assignRole("partner")
function assignRole(role){
  let c=roleContact.value.toLowerCase().trim();
  if(!c)return alert("Type the member email or phone number in the box first.");
  state.roles[c]=role;
  if(state.profiles[c])state.profiles[c].role=role;
  roleContact.value="";
  save();
  renderRoles();
  alert(role==="admin" ? "Admin assigned." : "Partner assigned.");
}
function renderRoles(){
  roleList.innerHTML=Object.entries(state.roles).length
    ? Object.entries(state.roles).map(([c,r])=>`${c} — ${r}`).join("<br>")
    : "No admins or partners assigned yet.";
}
if(state.activeContact&&state.profiles[state.activeContact]){ signinContact.value = state.activeContact; showSignin(); }

const resetLoginBtnEl = document.getElementById("resetLoginBtn");
if(resetLoginBtnEl){
  resetLoginBtnEl.onclick=()=>{
    localStorage.removeItem("forwardV30");
    location.reload();
  };
}

showReelCreate.onclick=()=>reelCreate.classList.toggle("hidden");
createReel.onclick=async()=>{
  const raw = reelFile.files[0];
  if(!raw){ alert("Choose a video or image first."); return; }
  const f = await fileToData(raw);
  state.reels.unshift({title:reelTitle.value||"New Reel",caption:reelCaption.value||"",media:f});
  reelTitle.value="";
  reelCaption.value="";
  reelFile.value="";
  try{ save(); }catch(e){ alert("This video is too large to save permanently in this prototype. It will show now, but use a smaller video or backend storage for permanent video saving."); }
  renderReels();
  reelCreate.classList.add("hidden");
  page("reels");
  setTimeout(()=>{ const first=document.querySelector(".reel video"); if(first){ first.load(); } },100);
};
window.openReel=(i)=>{
  const r=state.reels[i];
  if(!r || !r.media || !r.media.url){ alert("No reel media found."); return; }
  storyViewer.classList.remove("hidden");
  storyContent.innerHTML = r.media.type&&r.media.type.startsWith("video")
    ? `<video src="${r.media.url}" controls autoplay playsinline></video>`
    : `<img src="${r.media.url}">`;
};


/* V33 REELS UPLOAD FINAL OVERRIDE
   Fixes posted reels not appearing by keeping the uploaded file URL in live memory
   and rendering the reel immediately before any storage attempt can fail. */
window.forwardLiveReelURLs = window.forwardLiveReelURLs || {};

function normalizeReelsV33(){
  if(!state.reels || !Array.isArray(state.reels)) state.reels = [];
  state.reels = state.reels.map(r=>{
    if(!r) return {title:"Untitled Reel",caption:"",media:null};
    if(r.media && r.media.url && r.media.temporary){
      // Blob URLs from previous sessions cannot survive a refresh.
      // Keep the card visible instead of breaking the whole reels page.
      return {...r, media:null, lostMedia:true};
    }
    return r;
  });
}

function reelMediaBlockV33(r){
  if(r.liveKey && window.forwardLiveReelURLs[r.liveKey]){
    const src = window.forwardLiveReelURLs[r.liveKey];
    const type = r.mediaType || "";
    if(type.startsWith("video")){
      return `<video src="${src}" controls playsinline preload="auto"></video>`;
    }
    return `<img src="${src}" alt="">`;
  }

  if(r.media && r.media.url){
    if(r.media.type && r.media.type.startsWith("video")){
      return `<video src="${r.media.url}" controls playsinline preload="auto"></video>`;
    }
    if(r.media.type && r.media.type.startsWith("image")){
      return `<img src="${r.media.url}" alt="">`;
    }
  }

  return "";
}

renderReels = function(){
  normalizeReelsV33();

  if(!state.reels.length){
    state.reels = [
      {title:"Inside Forward",caption:"Rooms. Access. Movement."},
      {title:"Opportunity Watch",caption:"Funding. Partners. Visibility."}
    ];
  }

  reelStack.innerHTML = state.reels.map((r,i)=>{
    const mediaBlock = reelMediaBlockV33(r);
    const lost = r.lostMedia ? `<span class="reel-file-note">Video needs repost after refresh</span>` : "";
    const pendingClass = mediaBlock ? "" : "pending-reel";
    return `<div class="reel ${pendingClass}">
      ${mediaBlock}
      <div>
        <h2>${r.title || "Untitled Reel"}</h2>
        <p>${r.caption || ""}</p>
        ${lost}
        <div>❤️ 👍 😊 ✅ 💯</div>
        ${mediaBlock ? `<button class="play-open" onclick="openReel(${i})">Open Reel</button>` : ""}
        ${state.admin ? `<button class="read-more" onclick="deleteReel(${i})">Delete</button>` : ""}
      </div>
    </div>`;
  }).join("");

  setTimeout(()=>{
    document.querySelectorAll(".reel video").forEach(v=>{
      try{ v.load(); }catch(e){}
    });
  },100);
};

createReel.onclick = async()=>{
  const status = document.getElementById("reelStatus");
  const raw = reelFile.files && reelFile.files[0];

  if(!raw){
    alert("Choose a video or image first.");
    return;
  }

  if(status) status.textContent = "Preparing reel...";

  const liveKey = "reel_" + Date.now();
  const liveURL = URL.createObjectURL(raw);
  window.forwardLiveReelURLs[liveKey] = liveURL;

  const reel = {
    title: reelTitle.value || "New Reel",
    caption: reelCaption.value || "",
    liveKey,
    mediaType: raw.type || "",
    mediaName: raw.name || "Uploaded reel",
    createdAt: Date.now()
  };

  state.reels.unshift(reel);

  reelTitle.value = "";
  reelCaption.value = "";
  reelFile.value = "";

  // Render immediately. This is the important fix.
  renderReels();
  reelCreate.classList.add("hidden");
  page("reels");

  // Save metadata only. Do not force huge video files into localStorage.
  try{
    save();
    if(status) status.textContent = "";
  }catch(e){
    if(status) status.textContent = "Reel is visible now. Large videos require backend storage to remain after refresh.";
  }

  setTimeout(()=>{
    const first = document.querySelector(".reel video");
    if(first){
      try{ first.load(); first.play().catch(()=>{}); }catch(e){}
    }
  },150);
};

openReel = function(i){
  const r = state.reels[i];
  if(!r){ alert("Reel not found."); return; }

  let src = null;
  let type = r.mediaType || (r.media && r.media.type) || "";

  if(r.liveKey && window.forwardLiveReelURLs[r.liveKey]){
    src = window.forwardLiveReelURLs[r.liveKey];
  }else if(r.media && r.media.url){
    src = r.media.url;
  }

  if(!src){
    alert("This reel card exists, but the video file is no longer available in this browser session. Post it again or connect permanent backend storage.");
    return;
  }

  storyViewer.classList.remove("hidden");
  storyContent.innerHTML = type.startsWith("video")
    ? `<video src="${src}" controls autoplay playsinline></video>`
    : `<img src="${src}">`;
};

deleteReel = function(i){
  const r = state.reels[i];
  if(r && r.liveKey && window.forwardLiveReelURLs[r.liveKey]){
    try{ URL.revokeObjectURL(window.forwardLiveReelURLs[r.liveKey]); }catch(e){}
    delete window.forwardLiveReelURLs[r.liveKey];
  }
  state.reels.splice(i,1);
  save();
  renderReels();
};

// Run once after load, in case old bad reel objects are present.
setTimeout(()=>{ try{ renderReels(); }catch(e){} },300);


/* V34 HARD REELS FIX — replaces old reel handlers completely */
window.forwardReelsLiveFilesV34 = window.forwardReelsLiveFilesV34 || {};
window.forwardSelectedReelV34 = null;

function setupReelsV34(){
  const oldBtn = document.getElementById("createReel");
  const oldFile = document.getElementById("reelFile");
  if(!oldBtn || !oldFile) return;

  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);

  const newFile = oldFile.cloneNode(true);
  oldFile.parentNode.replaceChild(newFile, oldFile);

  window.createReel = newBtn;
  window.reelFile = newFile;

  newFile.addEventListener("change", ()=>{
    const f = newFile.files && newFile.files[0];
    window.forwardSelectedReelV34 = f || null;
    const label = document.getElementById("reelPickedName");
    if(label) label.textContent = f ? "Selected: " + f.name : "";
  });

  newBtn.addEventListener("click", ()=>{
    const fileInput = document.getElementById("reelFile");
    const raw = (fileInput.files && fileInput.files[0]) || window.forwardSelectedReelV34;

    if(!raw){
      alert("Choose a video or image first.");
      return;
    }

    const liveKey = "live_reel_" + Date.now();
    const liveURL = URL.createObjectURL(raw);

    window.forwardReelsLiveFilesV34[liveKey] = {
      url: liveURL,
      type: raw.type || "",
      name: raw.name || "Reel"
    };

    if(!state.reels || !Array.isArray(state.reels)) state.reels = [];

    state.reels.unshift({
      title: (document.getElementById("reelTitle").value || "New Reel"),
      caption: (document.getElementById("reelCaption").value || ""),
      liveKeyV34: liveKey,
      mediaName: raw.name || "Reel",
      mediaType: raw.type || "",
      createdAt: Date.now()
    });

    document.getElementById("reelTitle").value = "";
    document.getElementById("reelCaption").value = "";
    fileInput.value = "";
    window.forwardSelectedReelV34 = null;
    const label = document.getElementById("reelPickedName");
    if(label) label.textContent = "";

    // Save only metadata. Do NOT save the actual video into localStorage.
    try{ save(); }catch(e){}

    renderReels();
    document.getElementById("reelCreate").classList.add("hidden");
    page("reels");

    setTimeout(()=>{
      const first = document.querySelector(".reel video");
      if(first){
        try{ first.load(); first.play().catch(()=>{}); }catch(e){}
      }
    },150);

    alert("Reel posted. It will stay visible in this browser session. For permanent video storage, connect Supabase Storage upload policies.");
  });
}

renderReels = function(){
  if(!state.reels || !Array.isArray(state.reels)){
    state.reels = [];
  }

  if(!state.reels.length){
    state.reels = [
      {title:"Inside Forward",caption:"Rooms. Access. Movement."},
      {title:"Opportunity Watch",caption:"Funding. Partners. Visibility."}
    ];
  }

  reelStack.innerHTML = state.reels.map((r,i)=>{
    let mediaBlock = "";
    let canOpen = false;

    if(r.liveKeyV34 && window.forwardReelsLiveFilesV34[r.liveKeyV34]){
      const live = window.forwardReelsLiveFilesV34[r.liveKeyV34];
      canOpen = true;
      mediaBlock = live.type.startsWith("video")
        ? `<video src="${live.url}" controls playsinline preload="auto"></video>`
        : `<img src="${live.url}" alt="">`;
    }else if(r.media && r.media.url){
      canOpen = true;
      mediaBlock = (r.media.type && r.media.type.startsWith("video"))
        ? `<video src="${r.media.url}" controls playsinline preload="auto"></video>`
        : `<img src="${r.media.url}" alt="">`;
    }

    const note = r.liveKeyV34 && !window.forwardReelsLiveFilesV34[r.liveKeyV34]
      ? `<span class="reel-live-badge">Repost video after refresh</span>`
      : "";

    return `<div class="reel">
      ${mediaBlock}
      <div>
        <h2>${r.title || "Untitled Reel"}</h2>
        <p>${r.caption || ""}</p>
        ${note}
        <div>❤️ 👍 😊 ✅ 💯</div>
        ${canOpen ? `<button class="play-open" onclick="openReel(${i})">Open Reel</button>` : ""}
        ${state.admin ? `<button class="read-more" onclick="deleteReel(${i})">Delete</button>` : ""}
      </div>
    </div>`;
  }).join("");
};

openReel = function(i){
  const r = state.reels[i];
  if(!r){ alert("Reel not found."); return; }

  let src = "";
  let type = "";

  if(r.liveKeyV34 && window.forwardReelsLiveFilesV34[r.liveKeyV34]){
    src = window.forwardReelsLiveFilesV34[r.liveKeyV34].url;
    type = window.forwardReelsLiveFilesV34[r.liveKeyV34].type;
  }else if(r.media && r.media.url){
    src = r.media.url;
    type = r.media.type || "";
  }

  if(!src){
    alert("This reel needs to be reposted after refresh. Permanent reel saving requires Supabase Storage upload policies.");
    return;
  }

  storyViewer.classList.remove("hidden");
  storyContent.innerHTML = type.startsWith("video")
    ? `<video src="${src}" controls autoplay playsinline></video>`
    : `<img src="${src}">`;
};

deleteReel = function(i){
  const r = state.reels[i];
  if(r && r.liveKeyV34 && window.forwardReelsLiveFilesV34[r.liveKeyV34]){
    try{ URL.revokeObjectURL(window.forwardReelsLiveFilesV34[r.liveKeyV34].url); }catch(e){}
    delete window.forwardReelsLiveFilesV34[r.liveKeyV34];
  }
  state.reels.splice(i,1);
  try{ save(); }catch(e){}
  renderReels();
};

setTimeout(()=>{
  try{
    setupReelsV34();
    renderReels();
  }catch(e){
    console.error("V34 reel setup failed", e);
  }
},400);
