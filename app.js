const users={
 admin:{password:"admin123",name:"Transport Admin",role:"ADMIN"},
 student:{password:"student123",name:"Arun Kumar",role:"STUDENT"},
 driver:{password:"driver123",name:"Rahul Driver",role:"DRIVER"}
};
let currentUser=null, currentPage="dashboard";
const buses=[
 {id:"TN-38-AB-1024",route:"R1",driver:"Rahul",status:"Moving",eta:"08 min",speed:"34 km/h",lat:11.016,lng:76.955},
 {id:"TN-38-CD-2048",route:"R2",driver:"Karthik",status:"Moving",eta:"14 min",speed:"29 km/h",lat:11.027,lng:76.968},
 {id:"TN-38-EF-3066",route:"R3",driver:"Vijay",status:"At Stop",eta:"02 min",speed:"0 km/h",lat:11.008,lng:76.945},
 {id:"TN-38-GH-4012",route:"R4",driver:"Suresh",status:"Delayed",eta:"21 min",speed:"18 km/h",lat:11.035,lng:76.932}
];
let routes=[
 {id:"R1",name:"Gandhipuram Express",bus:"TN-38-AB-1024",driver:"Rahul",start:"Gandhipuram",end:"College Main Gate",time:"07:15 AM",stops:["Gandhipuram","RS Puram","Saibaba Colony","Peelamedu","College"]},
 {id:"R2",name:"Singanallur Line",bus:"TN-38-CD-2048",driver:"Karthik",start:"Singanallur",end:"College Main Gate",time:"07:30 AM",stops:["Singanallur","Uppilipalayam","Hopes College","Lakshmi Mills","College"]},
 {id:"R3",name:"Saravanampatti Route",bus:"TN-38-EF-3066",driver:"Vijay",start:"Saravanampatti",end:"College Main Gate",time:"07:00 AM",stops:["Saravanampatti","Sivanandapuram","Ganapathy","Avinashi Road","College"]},
 {id:"R4",name:"Ukkadam Night Route",bus:"TN-38-GH-4012",driver:"Suresh",start:"Ukkadam",end:"College Main Gate",time:"08:00 AM",stops:["Ukkadam","Town Hall","Gandhipark","Lawley Road","College"]}
];
let trips=[
 ["Oct 06, 2026","R1","TN-38-AB-1024","Gandhipuram Express","38 min","48","Completed"],
 ["Oct 06, 2026","R2","TN-38-CD-2048","Singanallur Line","44 min","52","Completed"],
 ["Oct 05, 2026","R3","TN-38-EF-3066","Saravanampatti Route","41 min","45","Completed"],
 ["Oct 05, 2026","R4","TN-38-GH-4012","Ukkadam Night Route","51 min","39","Delayed"],
 ["Oct 04, 2026","R1","TN-38-AB-1024","Gandhipuram Express","36 min","50","Completed"],
 ["Oct 04, 2026","R2","TN-38-CD-2048","Singanallur Line","42 min","49","Completed"]
];
let notifications=[
 ["🚌","Bus R1 is 8 minutes away","TN-38-AB-1024 is approaching Peelamedu stop.","2 min ago"],
 ["⚠","Route R4 delayed","Traffic congestion detected near Town Hall. ETA increased by 9 minutes.","12 min ago"],
 ["✓","Boarding verified","Student Arun Kumar boarded bus R1 at Saibaba Colony.","18 min ago"],
 ["₹","Fee reminder","October transport fee is due in 4 days.","1 hr ago"],
 ["🔔","Schedule updated","Morning departure for R3 changed to 07:00 AM.","Yesterday"]
];
function loadState(){try{const r=JSON.parse(localStorage.trackitrideRoutes||"null");if(Array.isArray(r))routes=r;const t=JSON.parse(localStorage.trackitrideTrips||"null");if(Array.isArray(t))trips=t;const n=JSON.parse(localStorage.trackitrideNotifications||"null");if(Array.isArray(n))notifications=n}catch(e){}}
function saveState(){localStorage.trackitrideRoutes=JSON.stringify(routes);localStorage.trackitrideTrips=JSON.stringify(trips);localStorage.trackitrideNotifications=JSON.stringify(notifications)}
function loadUsers(){try{const u=JSON.parse(localStorage.trackitrideUsers||"null");if(u&&typeof u==="object")Object.assign(users,u)}catch(e){}}
function persistUser(){localStorage.trackitrideUsers=JSON.stringify(users);localStorage.trackitrideProfile=JSON.stringify({username:currentUser.username,name:currentUser.name,role:currentUser.role})}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function downloadCSV(filename,rows){const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast(filename+" downloaded")}
function csvHistory(){downloadCSV("college-bus-trip-history.csv",[["Date","Route","Bus","Trip","Duration","Boarded","Status"],...trips])}
function csvReport(){downloadCSV("college-bus-report.csv",[["Bus","Route","Driver","Status","ETA","Speed","Latitude","Longitude"],...buses.map(b=>[b.id,b.route,b.driver,b.status,b.eta,b.speed,b.lat,b.lng])])}
function openModal(title,body,actions){let m=$("appModal");if(!m){m=document.createElement("div");m.id="appModal";m.className="modal-backdrop";document.body.appendChild(m)}m.innerHTML=`<div class="modal"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div><div class="modal-actions">${actions||"<button class='secondary' onclick='closeModal()'>Close</button>"}</div></div>`;m.classList.add("show")}
function closeModal(){const m=$("appModal");if(m)m.classList.remove("show")}
function markAllNotificationsRead(){notifications=notifications.map(n=>[n[0],n[1],n[2],n[3],"read"]);saveState();render("notifications");toast("All notifications marked as read")}
function markAllAlertsRead(){localStorage.trackitrideAlertsRead="1";render("alerts");toast("All alerts marked as read")}
function showQRScanner(){openModal("QR Boarding Scanner",`<div class="scanner-box"><video id="qrVideo" autoplay playsinline></video><div class="scanner-line"></div></div><p class="muted">Point the camera at a student QR code. If QR detection is unavailable, enter a demo code manually.</p><div class="field"><label>Manual QR code</label><input id="qrCode" placeholder="STUDENT-ARUN-001"></div><div id="qrResult" class="result-box">Waiting for scan…</div>`,`<button class="secondary" onclick="stopQR();closeModal()">Cancel</button><button class="primary" onclick="verifyQR()">Verify QR</button>`);startQR()}
let qrStream=null,qrTimer=null;
async function startQR(){const v=$("qrVideo");if(!v)return;try{qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});v.srcObject=qrStream;if("BarcodeDetector" in window){const d=new BarcodeDetector({formats:["qr_code"]});qrTimer=setInterval(async()=>{try{const c=await d.detect(v);if(c.length){$("qrCode").value=c[0].rawValue;verifyQR()}}catch(e){}},700)}}catch(e){if($("qrResult"))$("qrResult").textContent="Camera unavailable. Use the manual QR code field."}}
function stopQR(){if(qrTimer)clearInterval(qrTimer);qrTimer=null;if(qrStream)qrStream.getTracks().forEach(t=>t.stop());qrStream=null}
function verifyQR(){const code=($("qrCode")?.value||"").trim();if(!code){toast("Enter or scan a QR code");return}const student=code.toLowerCase().includes("arun")?"Arun Kumar":code.toLowerCase().includes("meena")?"Meena S":"Student";const now=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});notifications.unshift(["✓","Boarding verified",`${student} verified by QR at ${now}.`,"Just now"]);saveState();if($("qrResult"))$("qrResult").textContent=`✓ Verified: ${student}`;toast("QR verified successfully")}
function geofences(){try{return JSON.parse(localStorage.trackitrideGeofences||"[]")}catch(e){return[]}}
function openGeofence(){openModal("Create Geofence",`<div class="form-grid"><div class="field"><label>Name</label><input id="gfName" value="College Main Gate"></div><div class="field"><label>Radius (m)</label><input id="gfRadius" type="number" value="150" min="20"></div><div class="field"><label>Latitude</label><input id="gfLat" type="number" step="0.000001" value="11.0168"></div><div class="field"><label>Longitude</label><input id="gfLng" type="number" step="0.000001" value="76.9558"></div></div><div class="result-box">${geofences().map(g=>`<div><b>${escapeHtml(g.name)}</b> · ${g.radius}m</div>`).join("")||"No geofences yet."}</div>`,`<button class="secondary" onclick="closeModal()">Close</button><button class="primary" onclick="saveGeofence()">Save Geofence</button>`)}
function saveGeofence(){const name=$("gfName").value.trim(),radius=Number($("gfRadius").value),lat=Number($("gfLat").value),lng=Number($("gfLng").value);if(!name||radius<20||!Number.isFinite(lat)||!Number.isFinite(lng)){toast("Enter valid geofence details");return}const g=geofences();g.push({name,radius,lat,lng});localStorage.trackitrideGeofences=JSON.stringify(g);closeModal();toast("Geofence saved successfully")}
function editRouteModal(id){const r=routes.find(x=>x.id===id);if(!r)return;openModal("Edit "+r.id,`<div class="form-grid"><div class="field"><label>Route name</label><input id="erName" value="${escapeHtml(r.name)}"></div><div class="field"><label>Departure</label><input id="erTime" value="${escapeHtml(r.time)}"></div><div class="field"><label>Start</label><input id="erStart" value="${escapeHtml(r.start)}"></div><div class="field"><label>Destination</label><input id="erEnd" value="${escapeHtml(r.end)}"></div><div class="field"><label>Bus</label><input id="erBus" value="${escapeHtml(r.bus)}"></div><div class="field"><label>Driver</label><input id="erDriver" value="${escapeHtml(r.driver)}"></div></div><div class="field" style="margin-top:15px"><label>Stops</label><input id="erStops" value="${escapeHtml(r.stops.join(", "))}"></div>`,`<button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveEditedRoute('${id}')">Save route</button>`)}
function saveEditedRoute(id){const r=routes.find(x=>x.id===id);if(!r)return;r.name=$("erName").value.trim()||r.name;r.time=$("erTime").value.trim()||r.time;r.start=$("erStart").value.trim()||r.start;r.end=$("erEnd").value.trim()||r.end;r.bus=$("erBus").value.trim()||r.bus;r.driver=$("erDriver").value.trim()||r.driver;r.stops=$("erStops").value.split(",").map(x=>x.trim()).filter(Boolean);if(!r.stops.length)r.stops=[r.end];saveState();closeModal();render("routes");toast(id+" updated and saved")}
function openPayment(){openModal("Pay Transport Fee",`<div class="payment-summary"><b>Amount due</b><strong>₹2,500</strong><span>October transport fee</span></div><div class="field"><label>Payment method</label><select id="payMethod"><option>UPI</option><option>Card</option><option>NetBanking</option></select></div><div class="field" style="margin-top:12px"><label>Payment details</label><input id="payRefInput" placeholder="UPI ID or card reference"></div>`,`<button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="completePayment()">Pay ₹2,500</button>`)}
function completePayment(){const method=$("payMethod").value,ref=$("payRefInput").value.trim();if(!ref){toast("Enter payment details");return}const reference="PAY"+Date.now().toString().slice(-8);localStorage.trackitridePayment=JSON.stringify({amount:2500,method,ref,reference,date:new Date().toISOString()});notifications.unshift(["₹","Payment successful","₹2,500 transport fee paid via "+method+" • "+reference,"Just now"]);saveState();closeModal();render("fees");toast("Payment successful • "+reference)}
function saveSettings(){const prefs={};document.querySelectorAll("#settingsPrefs .switch").forEach((b,i)=>prefs[i]=b.classList.contains("on"));localStorage.trackitridePrefs=JSON.stringify(prefs);toast("Account preferences saved")}


const $=id=>document.getElementById(id);
function toast(msg){const d=document.createElement("div");d.className="toast";d.textContent=msg;$("toastContainer").appendChild(d);setTimeout(()=>d.remove(),3200)}
function showPage(page){
 currentPage=page; document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 const names={dashboard:"Dashboard",tracking:"Live Tracking",routes:"Route Management",timings:"Bus Timings",history:"Trip History",boarding:"Boarding Verification",fees:"Fees & Payments",alerts:"Safety Alerts",notifications:"Notifications",settings:"Settings"};
 $("pageTitle").textContent=names[page]||"Dashboard"; render(page); if(innerWidth<720)$("sidebar").classList.remove("open");
}
function render(page){
 const pages={dashboard:dashboardPage,tracking:trackingPage,routes:routesPage,timings:timingsPage,history:historyPage,boarding:boardingPage,fees:feesPage,alerts:alertsPage,notifications:notificationsPage,settings:settingsPage};
 $("content").innerHTML=(pages[page]||dashboardPage)();
 if(page==="dashboard"||page==="tracking") startMapAnimation();
 if(page==="routes") enableDragRoutes();
}
function header(title,sub,actions=""){return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="actions">${actions}</div></div>`}
function mapHTML(){
return `<div class="map" id="liveMap">
<div class="road" style="left:7%;top:30%;width:82%;transform:rotate(9deg)"></div><div class="road" style="left:22%;top:70%;width:75%;transform:rotate(-16deg)"></div><div class="road" style="left:47%;top:5%;width:75%;transform:rotate(82deg)"></div>
${buses.map((b,i)=>`<div class="bus-pin" data-bus="${b.id}" style="left:${16+i*20}%;top:${25+(i%2)*30}%">🚌<span class="bus-label">${b.id} • ${b.eta}</span></div>`).join("")}
<div class="map-legend">🔵 Moving &nbsp; 🟠 Delayed &nbsp; ⚪ Stops &nbsp; • Updates every 10 sec</div></div>`
}
function dashboardPage(){
return header("Good morning, "+currentUser.name.split(" ")[0]+" 👋","Here is today's transport overview.","<button class='secondary' onclick=\"csvReport()\">⇩ Export Report</button><button class='primary' onclick=\"showPage('tracking')\">◉ Track Fleet</button>")+`
<div class="grid stats-grid">
${stat("🚌","Active Buses","18 / 22","+8.2% today","green")}${stat("◉","On-Time Rate","94.6%","+3.4% today","green")}${stat("✓","Boarded Today","1,284","+12.5% today","green")}${stat("⚠","Open Alerts","3","2 high priority","red")}
</div>
<div class="grid dashboard-grid">
<div class="card"><div class="card-head"><h3>Live Fleet Map</h3><a href="#" onclick="showPage('tracking');return false">Open full map →</a></div>${mapHTML()}</div>
<div class="card"><div class="card-head"><h3>Today's Activity</h3><a href="#" onclick="showPage('notifications');return false">View all</a></div>
${notifications.slice(0,4).map(n=>`<div class="notification"><div class="nicon">${n[0]}</div><div><b>${n[1]}</b><p>${n[2]}</p><time>${n[3]}</time></div></div>`).join("")}</div>
</div>
<div class="grid dashboard-grid">
<div class="card"><div class="card-head"><h3>Route Performance</h3><span class="muted">Today</span></div><div class="chart">${[72,84,90,76,95,88,92,96,82,91,87,94].map((x,i)=>`<div class="bar" style="height:${x}%"><span>${x}%</span></div>`).join("")}</div></div>
<div class="card"><div class="card-head"><h3>Next Departures</h3><a href="#" onclick="showPage('timings');return false">Schedule</a></div>${routes.slice(0,4).map(r=>`<div class="timeline"><div class="time">${r.time}</div><div class="dotline"><b>${r.id} · ${r.name}</b><p>${r.start} → ${r.end}</p></div></div>`).join("")}</div>
</div>
<div class="card" style="margin-top:18px"><div class="card-head"><h3>Recent Trips</h3><a href="#" onclick="showPage('history');return false">View history →</a></div>${tripTable(trips.slice(0,4))}</div>`;
}
function stat(i,t,v,s,c){return `<div class="stat-card"><div class="ico">${i}</div><b>${v}</b><small>${t}</small><span class="trend ${c}">${s}</span></div>`}
function trackingPage(){
return header("Live GPS Tracking","Real-time fleet location, speed and ETA.","<button class='secondary' onclick=\"refreshGPS()\">↻ Refresh</button><button class='primary' onclick=\"openGeofence()\">＋ Geofence</button>")+`
<div class="grid dashboard-grid"><div class="card"><div class="card-head"><h3>Fleet Map · Live</h3><span class="status green">● LIVE</span></div>${mapHTML()}</div>
<div class="card"><div class="card-head"><h3>Fleet Status</h3><span class="muted">22 buses</span></div>${buses.map(b=>`<div class="notification"><div class="nicon">🚌</div><div style="flex:1"><b>${b.id} · ${b.route}</b><p>Driver ${b.driver} · ${b.speed} · ETA ${b.eta}</p></div><span class="status ${b.status==="Delayed"?"orange":"green"}">${b.status}</span></div>`).join("")}</div></div>
<div class="card" style="margin-top:18px">${tripTable(trips)}</div>`;
}
function routesPage(){
return header("Route Management","Create, edit and optimize college bus routes.","<button class='secondary' onclick=\"optimizeRoutes()\">✦ Optimize</button><button class='primary' onclick=\"addRoute()\">＋ Add Route</button>")+`
<div class="filterbar"><input id="routeSearch" placeholder="Search routes, stops or drivers..." oninput="filterRoutes()"><select onchange="toast('Filter applied')"><option>All Status</option><option>Active</option><option>Inactive</option></select></div>
<div id="routeGrid" class="grid route-grid">${routes.map(r=>routeCard(r)).join("")}</div>`;
}
function routeCard(r){return `<div class="card route-card" draggable="true" data-id="${r.id}" data-search="${r.id} ${r.name} ${r.driver} ${r.stops.join(" ")}" data-optimized="${r.optimized?"true":"false"}"><div class="route-top"><span class="route-no">${r.id}</span><span class="status green">ACTIVE</span></div><h3>${r.name}</h3><div class="route-meta">🚌 ${r.bus}<br>👤 ${r.driver}<br>◷ Departure ${r.time}<br>⌁ ${r.start} → ${r.end}</div><div class="route-stops">${r.stops.map(s=>`<span class="stop">${s}</span>`).join("")}</div><div class="actions" style="margin-top:15px"><button class="secondary" onclick="editRoute('${r.id}')">Edit</button><button class="secondary" onclick="duplicateRoute('${r.id}')">Duplicate</button></div></div>`}
function filterRoutes(){let q=$("routeSearch").value.toLowerCase();document.querySelectorAll(".route-card").forEach(c=>c.style.display=c.dataset.search.toLowerCase().includes(q)?"block":"none")}
function addRoute(){const nextId="R"+(routes.length+1);const name=prompt("Route name:","New Campus Route");if(!name)return;const start=prompt("Starting point:","New Start");if(!start)return;const end=prompt("Destination:","College Main Gate");if(!end)return;const time=prompt("Departure time:","08:15 AM");if(!time)return;const stops=prompt("Stops (comma separated):","New Stop, College");routes.push({id:nextId,name,bus:"Assign bus",driver:"Assign driver",start,end,time,stops:(stops||"College").split(",").map(x=>x.trim()).filter(Boolean)});saveState();render("routes");toast(nextId+" added successfully")}
function editRoute(id){editRouteModal(id)}
function duplicateRoute(id){const r=routes.find(x=>x.id===id);if(!r)return;const copy=JSON.parse(JSON.stringify(r));copy.id="R"+(routes.length+1);copy.name=r.name+" Copy";routes.push(copy);render("routes");toast(copy.id+" duplicated successfully");}
function enableDragRoutes(){let drag;document.querySelectorAll(".route-card").forEach(c=>{c.ondragstart=()=>drag=c;c.ondragover=e=>e.preventDefault();c.ondrop=()=>{if(drag!==c)c.parentNode.insertBefore(drag,c);toast("Route order updated")}})}
function timingsPage(){
return header("Bus Timings","Plan departures, arrivals and peak-hour schedules.","<button class='secondary' onclick=\"toast('Timetable downloaded')\">⇩ Download</button><button class='primary' onclick=\"toast('Timing editor opened')\">＋ Add Timing</button>")+`
<div class="card"><div class="card-head"><h3>Morning & Evening Schedule</h3><div class="actions"><button class="secondary">Mon–Fri</button><button class="secondary">Weekend</button></div></div>
${routes.map((r,i)=>`<div class="notification"><div class="nicon">◷</div><div style="flex:1"><b>${r.id} · ${r.name}</b><p>${r.start} → ${r.end} · ${r.stops.length} stops</p></div><strong>${r.time}</strong><span class="status ${i===3?"orange":"green"}">${i===3?"Delayed":"On schedule"}</span><button class="secondary" onclick="toast('Editing timing for ${r.id}')">Edit</button></div>`).join("")}</div>
<div class="grid dashboard-grid" style="margin-top:18px"><div class="card"><div class="card-head"><h3>Peak Demand</h3><span class="muted">Passengers / hour</span></div><div class="chart">${[38,54,72,88,95,91,82,66,53,48,39,30].map((x,i)=>`<div class="bar" style="height:${x}%"><span>${x}</span></div>`).join("")}</div></div><div class="card"><div class="card-head"><h3>Smart Timing Suggestions</h3></div><div class="notification"><div class="nicon">✦</div><div><b>Move R2 departure +5 min</b><p>Could reduce average stop crowding by 14%.</p></div></div><div class="notification"><div class="nicon">✦</div><div><b>Add one trip to R3</b><p>Demand exceeds 90% capacity on Tuesdays.</p></div></div></div></div>`;
}
function tripTable(data){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Route</th><th>Bus</th><th>Trip</th><th>Duration</th><th>Boarded</th><th>Status</th></tr></thead><tbody>${data.map(t=>`<tr>${t.slice(0,6).map(x=>`<td>${x}</td>`).join("")}<td><span class="status ${t[6]==="Delayed"?"orange":t[6]==="Cancelled"?"red":"green"}">${t[6]}</span></td></tr>`).join("")}</tbody></table></div>`}
function historyPage(){return header("Trip History","Search previous journeys, mileage and boarding records.","<button class='secondary' onclick=\"csvHistory()\">⇩ Export CSV</button>")+`<div class="card"><div class="filterbar"><input id="historySearch" placeholder="Search trip / bus / route" oninput="filterHistory()"><select id="historyStatus" onchange="filterHistory()"><option>All statuses</option><option>Completed</option><option>Delayed</option><option>Cancelled</option></select></div><div id="historyTable">${tripTable(trips)}</div></div>`}
function filterHistory(){const q=($("historySearch")?.value||"").toLowerCase(),st=$("historyStatus")?.value||"All statuses";const data=trips.filter(t=>(!q||t.slice(0,4).join(" ").toLowerCase().includes(q))&&(st==="All statuses"||t[6]===st));$("historyTable").innerHTML=tripTable(data)}
function boardingPage(){return header("Boarding Verification","QR/manual verification confirms who boarded each bus.","<button class='primary' onclick=\"showQRScanner()\">▣ Scan QR</button>")+`
<div class="grid stats-grid">${stat("✓","Verified Today","1,284","+12.5%","green")}${stat("◌","Pending","7","Needs review","orange")}${stat("⚠","Unverified","3","Follow up","red")}${stat("▣","QR Scans","1,106","86% of boardings","blue")}</div>
<div class="card" style="margin-top:18px"><div class="card-head"><h3>Recent Boarding Events</h3><span class="status green">LIVE</span></div><table class="table"><thead><tr><th>Student</th><th>Route</th><th>Stop</th><th>Time</th><th>Method</th><th>Status</th></tr></thead><tbody>
${[["Arun Kumar","R1","Saibaba Colony","07:41","QR Scan","Verified"],["Meena S","R2","Hopes College","07:43","QR Scan","Verified"],["Vikram P","R3","Ganapathy","07:44","Manual","Verified"],["Nisha K","R1","Peelamedu","07:48","QR Scan","Pending"]].map(x=>`<tr>${x.slice(0,5).map(v=>`<td>${v}</td>`).join("")}<td><span class="status ${x[5]==="Pending"?"orange":"green"}">${x[5]}</span></td></tr>`).join("")}</tbody></table></div>`}
function feesPage(){return header("Fees & Payments","Transport fee status and digital payment tracking.","<button class='primary' onclick=\"openPayment()\">₹ Pay Fee</button>")+`
<div class="grid stats-grid">${stat("₹","Collected This Month","₹8.42L","+6.8%","green")}${stat("◷","Pending","₹1.18L","92 accounts","orange")}${stat("✓","Paid","1,842","94.1%","green")}${stat("↗","Online Share","87%","+11%","blue")}</div>
<div class="card" style="margin-top:18px"><div class="card-head"><h3>My Transport Account</h3><span class="status ${paid?"green":"orange"}">${paid?"PAID":"Due Oct 10"}</span></div><div class="kpi-row"><div class="mini-kpi"><small>Monthly Fee</small><b>₹2,500</b></div><div class="mini-kpi"><small>Current Balance</small><b>${paid?"₹0":"₹2,500"}</b></div><div class="mini-kpi"><small>Last Payment</small><b>Sep 09</b></div></div><button class="primary" style="margin-top:18px" onclick="makePayment()">Pay ₹2,500 securely</button></div>`}
function alertsPage(){return header("Safety Alerts","Driver behavior, route incidents and vehicle health.","<button class='secondary' onclick=\"markAllAlertsRead()\">Mark all read</button>")+`<div class="grid dashboard-grid"><div class="card"><div class="card-head"><h3>Active Alerts</h3><span class="status red">3 OPEN</span></div>
${[["🔴","Speed threshold exceeded","R2 · TN-38-CD-2048 reached 62 km/h in a 40 km/h zone.","2 min ago","red"],["🟠","Route delay detected","R4 · Town Hall congestion added 9 min to ETA.","12 min ago","orange"],["🟠","Harsh braking event","R1 · Near Peelamedu intersection.","28 min ago","orange"]].map(a=>`<div class="notification"><div class="nicon">${a[0]}</div><div style="flex:1"><b>${a[1]}</b><p>${a[2]}</p><time>${a[3]}</time></div><span class="status ${a[4]}">${a[4]==="red"?"HIGH":"MEDIUM"}</span></div>`).join("")}</div>
<div class="card"><div class="card-head"><h3>Driver Safety Score</h3></div>${["Rahul","Karthik","Vijay","Suresh"].map((n,i)=>`<div class="notification"><div class="avatar small">${n[0]}</div><div style="flex:1"><b>${n}</b><p>${96-i*4}/100 · ${i+1} alerts this week</p></div><span class="status ${i>1?"orange":"green"}">${96-i*4}/100</span></div>`).join("")}</div></div>`}
function notificationsPage(){return header("Notifications","Real-time transport updates delivered to students, parents and admins.","<button class='secondary' onclick=\"markAllNotificationsRead()\">Mark all read</button>")+`<div class="card">${notifications.concat(notifications.slice(1,3)).map(n=>`<div class="notification ${n[4]==="read"?"read":""}"><div class="nicon">${n[0]}</div><div><b>${n[1]}</b><p>${n[2]}</p><time>${n[3]}${n[4]==="read"?" · Read":""}</time></div></div>`).join("")}</div>`}
function settingsPage(){let prefs={};try{prefs=JSON.parse(localStorage.trackitridePrefs||"{}")}catch(e){}const labels=["Bus arrival alerts","Delay & incident alerts","Fee reminders","Boarding confirmations"];return header("Settings","Customize your transport portal preferences.")+`<div class="grid settings-grid"><div class="card"><div class="card-head"><h3>Notifications</h3><button class="secondary" onclick="saveSettings()">Save preferences</button></div><div id="settingsPrefs">${labels.map((x,i)=>`<div class="toggle"><span>${x}</span><button class="switch ${prefs[i]===undefined?(i<3?"on":""):prefs[i]?"on":""}" onclick="this.classList.toggle('on')"><i></i></button></div>`).join("")}</div></div><div class="card"><h3>Profile & Account</h3><div class="field" style="margin-top:18px"><label>Full name</label><input id="profileName" value="${escapeHtml(currentUser.name)}" maxlength="60"></div><div class="field" style="margin-top:15px"><label>Username</label><input value="${escapeHtml(currentUser.username)}" disabled></div><div class="field" style="margin-top:15px"><label>Role</label><input value="${escapeHtml(currentUser.role)}" disabled></div><button class="primary" style="margin-top:18px" onclick="saveProfile()">Save profile</button><hr style="margin:22px 0;border:0;border-top:1px solid var(--line)"><h3>Change password</h3><div class="field" style="margin-top:12px"><label>New password</label><input id="newPassword" type="password" minlength="6" placeholder="At least 6 characters"></div><button class="secondary" style="margin-top:12px" onclick="savePassword()">Save password</button></div></div>`}

function saveProfile(){const input=$("profileName");if(!input)return;const name=input.value.trim();if(!name){toast("Please enter your name");return}users[currentUser.username].name=name;currentUser.name=name;persistUser();setUser({...currentUser});render("settings");toast("Profile saved successfully")}
function savePassword(){const p=$("newPassword")?.value||"";if(p.length<6){toast("Password must be at least 6 characters");return}users[currentUser.username].password=p;persistUser();$("newPassword").value="";toast("Password changed and saved")}
function makePayment(){openPayment()}
function refreshGPS(){buses.forEach(b=>{b.lat+=(Math.random()-.45)*.001;b.lng+=(Math.random()-.45)*.001;const speed=Math.max(0,Math.round((parseInt(b.speed)||20)+(Math.random()-.5)*6));b.speed=speed+" km/h";if(b.status!=="Delayed")b.status=speed<5?"At Stop":"Moving";b.eta=Math.max(1,Math.round((parseInt(b.eta)||10)+(Math.random()-.5)*3))+" min"});render(currentPage);toast("GPS refreshed • "+new Date().toLocaleTimeString())}
function optimizeRoutes(){routes.forEach((r,i)=>{r.optimized=i%2===1});saveState();render("routes");toast("Route optimization applied") }
function startMapAnimation(){clearInterval(window.mapTimer);window.mapTimer=setInterval(()=>{document.querySelectorAll(".bus-pin").forEach((p,i)=>{let left=parseFloat(p.style.left);p.style.left=(left+(i%2?-.35:.28))+"%"});},3000)}
function updateClock(){let d=new Date();$("clock").textContent=d.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})+" • "+d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function toggleTheme(){document.body.classList.toggle("dark");localStorage.theme=document.body.classList.contains("dark")?"dark":"light"}
function setUser(u){const savedProfile=JSON.parse(localStorage.trackitrideProfile||"null");if(savedProfile&&savedProfile.username===u.username)u.name=savedProfile.name;currentUser=u;$("sideName").textContent=u.name;$("sideRole").textContent=u.role==="ADMIN"?"Administrator":u.role==="DRIVER"?"Driver":"Student / Parent";$("topName").textContent=u.name;$("avatar").textContent=u.name[0];$("topAvatar").textContent=u.name[0]}
loadUsers();loadState();
$("loginForm").onsubmit=e=>{e.preventDefault();let u=$("username").value.trim().toLowerCase(),p=$("password").value;if(!users[u]||users[u].password!==p){$("loginError").textContent="Invalid username or password. Use one of the demo accounts.";return}currentUser={...users[u],username:u};if($("remember").checked)localStorage.trackitrideUser=u;$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");setUser(currentUser);showPage("dashboard");toast("Welcome back, "+currentUser.name+"!")}
$("logout").onclick=()=>{currentUser=null;$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("password").value="";$("loginError").textContent=""}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
if(localStorage.theme==="dark")document.body.classList.add("dark");
let saved=localStorage.trackitrideUser;if(saved&&users[saved]){currentUser={...users[saved],username:saved};$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");setUser(currentUser);showPage("dashboard")}
setInterval(updateClock,1000);updateClock();
