const DEFAULT_PREPS=[
{name:"Omeprazole Oral Suspension",strength:"2 mg/mL"},
{name:"Hydroxyurea Capsules",strength:"100 mg"},
{name:"Spironolactone Suspension",strength:"5 mg/mL"},
{name:"Baclofen Oral Suspension",strength:"5 mg/mL"},
{name:"Tacrolimus Ointment",strength:"0.1%"}
];
let preparations=JSON.parse(localStorage.getItem("cc-preparations")||"null")||DEFAULT_PREPS;
let orders=JSON.parse(localStorage.getItem("cc-orders")||"[]");
let fulfillment="Patient waiting";
const items=document.getElementById("items");
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function optionHTML(){return `<option value="">Select preparation</option>`+preparations.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join("")}
function addRow(){
 const row=document.createElement("div"); row.className="item-row";
 row.innerHTML=`<select class="prep">${optionHTML()}</select><div class="strength">Auto-filled</div><div class="qty"><button class="minus">−</button><input type="number" min="1" value="1"><button class="plus">+</button></div><button class="stock">▣ Not in stock</button><button class="remove">×</button>`;
 row.querySelector(".prep").onchange=e=>{let p=preparations[+e.target.value];row.querySelector(".strength").textContent=p?p.strength:"Auto-filled";updateCounts()};
 row.querySelector(".minus").onclick=()=>{let q=row.querySelector(".qty input");q.value=Math.max(1,+q.value-1)};
 row.querySelector(".plus").onclick=()=>{let q=row.querySelector(".qty input");q.value=Math.max(1,+q.value+1)};
 row.querySelector(".stock").onclick=e=>{e.currentTarget.classList.toggle("ready");e.currentTarget.textContent=e.currentTarget.classList.contains("ready")?"✓ Ready in stock":"▣ Not in stock"};
 row.querySelector(".remove").onclick=()=>{if(items.children.length>1){row.remove();updateCounts()}};
 items.appendChild(row); updateCounts();
}
function updateCounts(){
 document.getElementById("prepCount").textContent=preparations.length;
 document.getElementById("orderCount").textContent=orders.length;
 document.getElementById("draftCount").textContent=[...items.querySelectorAll(".prep")].filter(x=>x.value!=="").length;
 document.getElementById("orderPill").textContent=`${orders.length} ${orders.length===1?"order":"orders"}`;
}
function toast(msg){let t=document.getElementById("toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",2800)}
function renderOrders(){
 const box=document.getElementById("ordersList");
 if(!orders.length){box.innerHTML=`<div class="card empty"><div class="empty-icon">⚗</div><h3>No preparation orders yet</h3><p>Your submitted requests will appear here as detailed order cards.</p></div>`;updateCounts();return}
 box.innerHTML=orders.map(o=>`<article class="card order-card"><div class="order-head"><div><span class="order-id">${esc(o.id)}</span><h3>Compounding preparation request</h3></div><button class="delete-order" data-id="${esc(o.id)}">×</button></div><div class="meta"><span>♙ ${esc(o.pharmacist)}</span><span>▣ ${esc(new Date(o.createdAt).toLocaleString())}</span><span>${o.fulfillment==="Ship by mail"?"✉":"◷"} ${esc(o.fulfillment)}</span></div>${o.items.map(i=>`<div class="order-item"><div><b>${esc(i.name)}</b><small>${esc(i.strength)}</small></div><strong>× ${i.quantity}</strong><span class="stock-chip ${i.ready?"ready":""}">${i.ready?"Ready in stock":"Not in stock"}</span></div>`).join("")}</article>`).join("");
 box.querySelectorAll(".delete-order").forEach(b=>b.onclick=()=>{orders=orders.filter(o=>o.id!==b.dataset.id);saveOrders();renderOrders()});updateCounts();
}
function saveOrders(){localStorage.setItem("cc-orders",JSON.stringify(orders))}
document.getElementById("orderDate").value=new Date().toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
document.getElementById("addItem").onclick=addRow;
document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{document.querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));b.classList.add("active");fulfillment=b.dataset.value});
document.getElementById("submitOrder").onclick=()=>{
 let pharmacist=document.getElementById("pharmacist").value.trim();
 let orderItems=[...items.querySelectorAll(".item-row")].map(r=>{let idx=r.querySelector(".prep").value;if(idx==="")return null;let p=preparations[+idx];return{name:p.name,strength:p.strength,quantity:Math.max(1,+r.querySelector(".qty input").value||1),ready:r.querySelector(".stock").classList.contains("ready")}}).filter(Boolean);
 if(!pharmacist||!orderItems.length){toast("Please select a preparation and enter the pharmacist name.");return}
 orders.unshift({id:`CMP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,pharmacist,fulfillment,items:orderItems,createdAt:new Date().toISOString()});saveOrders();items.innerHTML="";addRow();document.getElementById("pharmacist").value="";renderOrders();toast("Preparation order submitted successfully.");
};
const modal=document.getElementById("modal");
document.getElementById("managePrep").onclick=()=>modal.classList.remove("hidden");
document.getElementById("closeModal").onclick=document.getElementById("cancelModal").onclick=()=>modal.classList.add("hidden");
document.getElementById("savePrep").onclick=()=>{let name=document.getElementById("newPrepName").value.trim(),strength=document.getElementById("newPrepStrength").value.trim();if(!name||!strength){toast("Enter preparation name and strength.");return}preparations.push({name,strength});localStorage.setItem("cc-preparations",JSON.stringify(preparations));document.getElementById("newPrepName").value="";document.getElementById("newPrepStrength").value="";modal.classList.add("hidden");[...items.querySelectorAll(".prep")].forEach(s=>{let v=s.value;s.innerHTML=optionHTML();s.value=v});updateCounts();toast("Preparation added.");};
addRow();renderOrders();