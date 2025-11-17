// BASE URL for Render deployment
const BASE_URL = "https://research-department.onrender.com";

// ADMIN LOGIN & DASHBOARD PROTECTION
const adminEmail = "admin@gentry.com";
const adminPassword = "admin123";

const loginForm = document.getElementById("adminLoginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("gentry_admin", "true");
      window.location.href = "./admin-dashboard.html";
    } else {
      document.getElementById("loginMsg").textContent = "Invalid credentials";
    }
  });
}

const mainEl = document.querySelector("main");
if (mainEl && localStorage.getItem("gentry_admin") !== "true") {
  window.location.href = "./admin-login.html";
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("gentry_admin");
  window.location.href = "./admin-login.html";
});

// FETCH HELPER
async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// RENDER USERS
async function renderUsers(users = []) {
  const tbody = document.getElementById("usersTable");
  if (!tbody) return;
  tbody.replaceChildren();

  users.forEach(u => {
    const tr = document.createElement("tr");
    ["id", "name", "email", "blocked"].forEach(key => {
      const td = document.createElement("td");
      td.className = "p-2";
      td.textContent = u[key];
      tr.appendChild(td);
    });

    const tdActions = document.createElement("td");
    tdActions.className = "p-2 flex gap-2";

    const btnBlock = document.createElement("button");
    btnBlock.className = "blockBtn bg-yellow-400 px-2 rounded";
    btnBlock.textContent = "Toggle Block";
    btnBlock.addEventListener("click", async () => {
      await fetchData(`${BASE_URL}/api/users/${u.id}/toggle-block`, { method: "PATCH" });
    });

    const btnDelete = document.createElement("button");
    btnDelete.className = "deleteBtn bg-red-600 px-2 rounded";
    btnDelete.textContent = "Delete";
    btnDelete.addEventListener("click", async () => {
      await fetchData(`${BASE_URL}/api/users/${u.id}`, { method: "DELETE" });
    });

    tdActions.appendChild(btnBlock);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

// RENDER PRODUCTS
async function renderProducts(products = []) {
  const tbody = document.getElementById("productsTable");
  if (!tbody) return;
  tbody.replaceChildren();

  products.forEach(p => {
    const tr = document.createElement("tr");
    ["id", "brand", "name", "price", "stock"].forEach(key => {
      const td = document.createElement("td");
      td.className = "p-2";
      td.textContent = p[key];
      tr.appendChild(td);
    });

    const tdImg = document.createElement("td");
    tdImg.className = "p-2";

    const img = document.createElement("img");
    img.className = "w-16 h-16 object-contain";
    tdImg.appendChild(img);
    tr.appendChild(tdImg);

    const tdActions = document.createElement("td");
    tdActions.className = "p-2 flex gap-2";

    const btnEdit = document.createElement("button");
    btnEdit.className = "editProdBtn bg-blue-500 px-2 rounded";
    btnEdit.textContent = "Edit";
    btnEdit.addEventListener("click", () => openEditModal(p));

    const btnDelete = document.createElement("button");
    btnDelete.className = "deleteProdBtn bg-red-600 px-2 rounded";
    btnDelete.textContent = "Delete";
    btnDelete.addEventListener("click", async () => {
      await fetchData(`${BASE_URL}/api/products/${p.id}`, { method: "DELETE" });
    });

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

// ADD PRODUCT FORM
if (addProductForm) {
  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
    id: document.getElementById("productId").value.trim(),
    brand: document.getElementById("productBrand").value.trim(),
    name: document.getElementById("productName").value.trim(),
    price: Number(document.getElementById("productPrice").value),
    img: document.getElementById("productImgMain").value.trim(),
    images: [
      document.getElementById("productImg1").value.trim(),
      document.getElementById("productImg2").value.trim(),
      document.getElementById("productImg3").value.trim()
    ],
    stock: document.getElementById("productStock").value === "1",
    desc: document.getElementById("productDesc")?.value.trim() || ""
  };

    await fetchData(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });

    addProductForm.reset();
  });
}

// EDIT PRODUCT MODAL
function openEditModal(product) {
  // Remove previous modal if exists
  const oldModal = document.getElementById("editModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "editModal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  // Modal content container
  const container = document.createElement("div");
  container.className = "bg-gray-800 p-6 rounded-lg w-96 space-y-4";

  // Title
  const title = document.createElement("h2");
  title.className = "text-lg font-semibold";
  title.textContent = "Edit Product";
  container.appendChild(title);

  // Brand input
  const editBrand = document.createElement("input");
  editBrand.id = "editBrand";
  editBrand.type = "text";
  editBrand.className = "w-full p-2 rounded bg-gray-900";
  editBrand.value = product.brand;
  container.appendChild(editBrand);

  // Name input
  const editName = document.createElement("input");
  editName.id = "editName";
  editName.type = "text";
  editName.className = "w-full p-2 rounded bg-gray-900";
  editName.value = product.name;
  container.appendChild(editName);

  // Price input
  const editPrice = document.createElement("input");
  editPrice.id = "editPrice";
  editPrice.type = "number";
  editPrice.className = "w-full p-2 rounded bg-gray-900";
  editPrice.value = product.price;
  container.appendChild(editPrice);

  // Image input
  const editImg = document.createElement("input");
  editImg.id = "editImg";
  editImg.type = "text";
  editImg.className = "w-full p-2 rounded bg-gray-900";
  editImg.value = product.img;
  container.appendChild(editImg);

  // Stock select
  const editStock = document.createElement("select");
  editStock.id = "editStock";
  editStock.className = "w-full p-2 rounded bg-gray-900";
  
  const optionTrue = document.createElement("option");
  optionTrue.value = "true";
  optionTrue.textContent = "In Stock";
  if (product.stock) optionTrue.selected = true;

  const optionFalse = document.createElement("option");
  optionFalse.value = "false";
  optionFalse.textContent = "Out of Stock";
  if (!product.stock) optionFalse.selected = true;

  editStock.appendChild(optionTrue);
  editStock.appendChild(optionFalse);
  container.appendChild(editStock);

  // Buttons container
  const btnContainer = document.createElement("div");
  btnContainer.className = "flex justify-end gap-2";

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelEdit";
  cancelBtn.className = "px-4 py-2 bg-gray-600 rounded";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => modal.remove());

  const saveBtn = document.createElement("button");
  saveBtn.id = "saveEdit";
  saveBtn.className = "px-4 py-2 bg-green-500 rounded";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", async () => {
    const updatedProduct = {
      brand: editBrand.value,
      name: editName.value,
      price: Number(editPrice.value),
      img: editImg.value,
      stock: editStock.value === "true"
    };

    await fetchData(`${BASE_URL}/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct)
    });
    modal.remove();
  });

  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(saveBtn);
  container.appendChild(btnContainer);

  modal.appendChild(container);
  document.body.appendChild(modal);
}

// RENDER ORDERS
async function renderOrders(orders = []) {
  const tbody = document.getElementById("ordersTable");
  if (!tbody) return;
  tbody.replaceChildren();

  orders.forEach(o => {
    const tr = document.createElement("tr");
    const tdId = document.createElement("td"); tdId.className = "p-2"; tdId.textContent = o.id; tr.appendChild(tdId);
    const tdEmail = document.createElement("td"); tdEmail.className = "p-2"; tdEmail.textContent = o.userEmail; tr.appendChild(tdEmail);
    const tdItems = document.createElement("td"); tdItems.className = "p-2"; tdItems.textContent = o.items.map(i => `${i.name} x${i.qty}`).join(", "); tr.appendChild(tdItems);
    const tdTotal = document.createElement("td"); tdTotal.className = "p-2"; tdTotal.textContent = o.total; tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });

  const ctx = document.getElementById("ordersChart");
  if (!ctx) return;

  const orderCount = {};
  orders.forEach(o => orderCount[o.userEmail] = (orderCount[o.userEmail] || 0) + 1);

  const data = {
    labels: Object.keys(orderCount),
    datasets: [{ label: "Total Orders per User", data: Object.values(orderCount), backgroundColor: "rgba(255,191,0,0.7)" }]
  };

  if (window.ordersChartInstance) {
    window.ordersChartInstance.data = data;
    window.ordersChartInstance.update();
  } else {
    window.ordersChartInstance = new Chart(ctx, { type: "bar", data, options: { responsive: true, plugins: { legend: { display: false } } } });
  }
}

// FETCH ORDERS ON PAGE LOAD
async function loadOrdersFallback() {
  const orders = await fetchData(`${BASE_URL}/api/orders`);
  const ordersArray = Array.isArray(orders) ? orders : (orders.orders || []);
  console.log("Orders fetched on page load:", ordersArray);
  renderOrders(ordersArray);
}

if (mainEl) loadOrdersFallback();

// TOAST NOTIFICATION
function showAdminToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `fixed bottom-4 right-4 p-3 rounded shadow-lg text-white z-50 transition-opacity duration-500 ${
    type === "success" ? "bg-green-500" :
    type === "error" ? "bg-red-500" : "bg-blue-500"
  }`;
  toast.style.opacity = "0";
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = "1");
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

// WEBSOCKET
const ws = new WebSocket("wss://research-department.onrender.com");
ws.addEventListener("open", () => console.log("Connected to WebSocket server"));
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  switch(msg.type) {
    case "users-update": renderUsers(msg.data); showAdminToast("Users list updated", "info"); break;
    case "products-update": renderProducts(msg.data); showAdminToast("Products list updated", "success"); break;
    case "orders-update": renderOrders(msg.data); break;
    case "user-blocked": showAdminToast(`User ${msg.userEmail} ${msg.blocked ? "blocked" : "unblocked"}`, "error"); break;
    case "product-deleted": showAdminToast(`Product "${msg.productName}" deleted`, "error"); break;
    case "product-added": showAdminToast(`Product "${msg.productName}" added`, "success"); break;
    case "product-updated": showAdminToast(`Product "${msg.productName}" updated`, "success"); break;
  }
});
ws.addEventListener("close", () => console.log("WebSocket disconnected"));
