const BASE_URL = "https://research-department.onrender.com";

// --- ADMIN AUTH ---
const adminEmail = "admin@gentry.com";
const adminPassword = "admin123";

const mainEl = document.querySelector("main");
if (localStorage.getItem("gentry_admin") !== "true") {
  window.location.href = "/admin-login.html";
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("gentry_admin");
  window.location.href = "/admin-login.html";
});

// --- FETCH HELPER ---
async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// --- SECTIONS ---
const sections = {
  users: document.getElementById("usersSection"),
  products: document.getElementById("productsSection"),
  orders: document.getElementById("ordersSection")
};

// Sidebar navigation
document.querySelectorAll("aside button").forEach(btn => {
  btn.addEventListener("click", () => {
    Object.values(sections).forEach(s => s.classList.add("hidden"));
    sections[btn.dataset.section].classList.remove("hidden");
  });
});

// --- USERS ---
let allUsers = [];
async function renderUsers(users = []) {
  allUsers = users;
  const tbody = document.getElementById("usersTable");
  if (!tbody) return;
  tbody.replaceChildren();
  users.forEach(u => {
    const tr = document.createElement("tr");
    ["id", "name", "email", "blocked"].forEach(key => {
    const td = document.createElement("td");
    td.className = "p-2";
    if (key === "blocked") {
      // Swap true/false for display
      td.textContent = u[key] ? "Blocked" : "Active";
    } else {
      td.textContent = u[key];
    }
    tr.appendChild(td);
  });
    const tdActions = document.createElement("td"); tdActions.className="p-2 flex gap-2";
    const btnBlock = document.createElement("button");
    btnBlock.className="blockBtn bg-yellow-400 px-2 rounded"; btnBlock.textContent="Toggle Block";
    btnBlock.addEventListener("click", async()=>await fetchData(`${BASE_URL}/api/users/${u.id}/toggle-block`,{method:"PATCH"}));
    const btnDelete = document.createElement("button");
    btnDelete.className="deleteBtn bg-red-600 px-2 rounded"; btnDelete.textContent="Delete";
    btnDelete.addEventListener("click", async()=>await fetchData(`${BASE_URL}/api/users/${u.id}`,{method:"DELETE"}));
    tdActions.appendChild(btnBlock); tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions); tbody.appendChild(tr);
  });
}

// User search
document.getElementById("userSearch")?.addEventListener("input", e => {
  const search = e.target.value.toLowerCase();
  renderUsers(allUsers.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)));
});

// --- PRODUCTS ---
let allProducts = [];
async function renderProducts(products = []) {
  allProducts = products;
  const tbody = document.getElementById("productsTable");
  if (!tbody) return;
  tbody.replaceChildren();
  products.forEach(p => {
    const tr = document.createElement("tr");
    ["id","brand","name","price","quantity"].forEach(key=>{
      const td=document.createElement("td"); td.className="p-2"; td.textContent=p[key]; tr.appendChild(td);
    });
    const img = document.createElement("img");
    img.className = "w-16 h-16 object-contain";
    tdImg.appendChild(img);
    tr.appendChild(tdImg);
    const tdActions=document.createElement("td"); tdActions.className="p-2 flex gap-2";
    const btnEdit=document.createElement("button"); btnEdit.className="editProdBtn bg-blue-500 px-2 rounded"; btnEdit.textContent="Edit";
    btnEdit.addEventListener("click",()=>openEditModal(p));
    const btnDelete=document.createElement("button"); btnDelete.className="deleteProdBtn bg-red-600 px-2 rounded"; btnDelete.textContent="Delete";
    btnDelete.addEventListener("click", async()=>await fetchData(`${BASE_URL}/api/products/${p.id}`,{method:"DELETE"}));
    tdActions.appendChild(btnEdit); tdActions.appendChild(btnDelete); tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

// Product search
document.getElementById("productSearch")?.addEventListener("input", e => {
  const search = e.target.value.toLowerCase();
  renderProducts(allProducts.filter(p => p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search)));
});

// Add product form
const addProductForm=document.getElementById("addProductForm");
if(addProductForm){
  addProductForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const newProduct={
      id: document.getElementById("productId").value.trim(),
      brand: document.getElementById("productBrand").value.trim(),
      name: document.getElementById("productName").value.trim(),
      price:Number(document.getElementById("productPrice").value),
      img: document.getElementById("productImgMain").value.trim(),
      images:[
        document.getElementById("productImg1").value.trim(),
        document.getElementById("productImg2").value.trim(),
        document.getElementById("productImg3").value.trim()
      ],
      quantity:Number(document.getElementById("productQuantity").value),
      desc:document.getElementById("productDesc")?.value.trim()||""
    };
    await fetchData(`${BASE_URL}/api/products`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newProduct)});
    addProductForm.reset();
  });
}

// Edit modal
function openEditModal(product){
  const oldModal=document.getElementById("editModal"); if(oldModal) oldModal.remove();
  const modal=document.createElement("div"); modal.id="editModal"; modal.className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  const container=document.createElement("div"); container.className="bg-gray-800 p-6 rounded-lg w-96 space-y-4";
  const title=document.createElement("h2"); title.className="text-lg font-semibold"; title.textContent="Edit Product"; container.appendChild(title);
  const editBrand=document.createElement("input"); editBrand.type="text"; editBrand.className="w-full p-2 rounded bg-gray-900"; editBrand.value=product.brand; container.appendChild(editBrand);
  const editName=document.createElement("input"); editName.type="text"; editName.className="w-full p-2 rounded bg-gray-900"; editName.value=product.name; container.appendChild(editName);
  const editPrice=document.createElement("input"); editPrice.type="number"; editPrice.className="w-full p-2 rounded bg-gray-900"; editPrice.value=product.price; container.appendChild(editPrice);
  const editImg=document.createElement("input"); editImg.type="text"; editImg.className="w-full p-2 rounded bg-gray-900"; editImg.value=product.img; container.appendChild(editImg);
  const editQuantity=document.createElement("input"); editQuantity.type="number"; editQuantity.className="w-full p-2 rounded bg-gray-900"; editQuantity.value=product.quantity; container.appendChild(editQuantity);
  const btnContainer=document.createElement("div"); btnContainer.className="flex justify-end gap-2";
  const cancelBtn=document.createElement("button"); cancelBtn.className="px-4 py-2 bg-gray-600 rounded"; cancelBtn.textContent="Cancel"; cancelBtn.addEventListener("click",()=>modal.remove());
  const saveBtn=document.createElement("button"); saveBtn.className="px-4 py-2 bg-green-500 rounded"; saveBtn.textContent="Save";
  saveBtn.addEventListener("click", async()=>{
    const updatedProduct={
      brand:editBrand.value,name:editName.value,price:Number(editPrice.value),
      img:editImg.value,quantity:Number(editQuantity.value)
    };
    await fetch(`${BASE_URL}/api/products/${product.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(updatedProduct)});
    modal.remove();
  });
  btnContainer.appendChild(cancelBtn); btnContainer.appendChild(saveBtn); container.appendChild(btnContainer); modal.appendChild(container);
  document.body.appendChild(modal);
}

// --- ORDERS ---
let allOrders=[];
async function renderOrders(orders=[]){
  allOrders=orders;
  const tbody=document.getElementById("ordersTable");
  if(!tbody) return; tbody.replaceChildren();
  orders.forEach(o=>{
    const tr=document.createElement("tr");
    ["id","userEmail"].forEach(k=>{const td=document.createElement("td"); td.className="p-2"; td.textContent=o[k]; tr.appendChild(td);});
    const tdItems=document.createElement("td"); tdItems.className="p-2"; tdItems.textContent=o.items.map(i=>`${i.name} x${i.qty}`).join(", "); tr.appendChild(tdItems);
    const tdTotal=document.createElement("td"); tdTotal.className="p-2"; tdTotal.textContent=o.total; tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });

  const ctx=document.getElementById("ordersChart");
  if(ctx){
    const orderCount={};
    orders.forEach(o=>orderCount[o.userEmail]=(orderCount[o.userEmail]||0)+1);
    const data={labels:Object.keys(orderCount),datasets:[{label:"Total Orders per User",data:Object.values(orderCount),backgroundColor:"rgba(255,191,0,0.7)"}]};
    if(window.ordersChartInstance){window.ordersChartInstance.data=data; window.ordersChartInstance.update();}
    else{window.ordersChartInstance=new Chart(ctx,{type:"bar",data,options:{responsive:true,plugins:{legend:{display:false}}}});}
  }
}

// --- LOAD DATA ---
async function loadData(){
  const users=await fetchData(`${BASE_URL}/api/users`);
  renderUsers(users);
  const products=await fetchData(`${BASE_URL}/api/products`);
  renderProducts(products);
  const orders=await fetchData(`${BASE_URL}/api/orders`);
  renderOrders(orders);
}
loadData();

// --- WEBSOCKET ---
const ws=new WebSocket("wss://research-department.onrender.com");
ws.addEventListener("open",()=>console.log("Connected to WS"));
ws.addEventListener("message",event=>{
  const msg=JSON.parse(event.data);
  switch(msg.type){
    case"users-update":renderUsers(msg.data); break;
    case"products-update":renderProducts(msg.data); break;
    case"orders-update":renderOrders(msg.data); break;
  }
});
ws.addEventListener("close",()=>console.log("WS disconnected"));
