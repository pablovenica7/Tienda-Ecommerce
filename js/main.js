let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

fetch("./bd/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    if (document.getElementById("productos")) renderizarProductos();
  });

const guardarCarrito = () => localStorage.setItem("carrito", JSON.stringify(carrito));

function renderizarProductos(productosFiltrados = productos) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  productosFiltrados.forEach(producto => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${producto.nombre}</h3>
      <p>Precio: $${producto.precio}</p>
      <button onclick="agregarAlCarrito(${producto.id})">Agregar</button>
    `;
    contenedor.appendChild(card);
  });
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  let total = 0;

  carrito.forEach(producto => {
    const item = document.createElement("li");
    item.innerHTML = `
      ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
      <button onclick="sumarUnidad(${producto.id})">+</button>
      <button onclick="restarUnidad(${producto.id})">-</button>
    `;
    contenedor.appendChild(item);
    total += producto.precio * producto.cantidad;
  });

  const totalSpan = document.getElementById("total");
  if (totalSpan) totalSpan.innerText = total;
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const enCarrito = carrito.find(p => p.id === id);

  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
  if (typeof renderizarCarrito === "function") renderizarCarrito();
}

function sumarUnidad(id) {
  const producto = carrito.find(p => p.id === id);
  producto.cantidad++;
  guardarCarrito();
  renderizarCarrito();
}

function restarUnidad(id) {
  const producto = carrito.find(p => p.id === id);
  producto.cantidad--;
  if (producto.cantidad === 0) {
    carrito = carrito.filter(p => p.id !== id);
  }
  guardarCarrito();
  renderizarCarrito();
}

function calcularCuotas() {
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cuotas = parseInt(document.getElementById("cuotas").value);
  let interes = 1;
  if (cuotas === 3) interes = 1.05;
  if (cuotas === 6) interes = 1.10;
  if (cuotas === 12) interes = 1.20;
  const cuota = (total * interes / cuotas).toFixed(2);
  document.getElementById("pagoCuotas").innerText = `Pago en ${cuotas} cuotas de $${cuota}`;
}

// ---------------------- Eventos por página ----------------------

// 🛒 Página: carrito.html
if (window.location.pathname.includes("carrito.html")) {
  renderizarCarrito();

  document.getElementById("calcularCuotas").addEventListener("click", calcularCuotas);
}

// 📦 Página: datos_entrega.html
if (window.location.pathname.includes("datos_entrega.html")) {
  document.getElementById("formEntrega").addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const direccion = document.getElementById("direccion").value;

    const datosEntrega = { nombre, email, direccion };
    localStorage.setItem("datosEntrega", JSON.stringify(datosEntrega));

    window.location.href = "forma_pago.html";
  });
}

// 💳 Página: forma_pago.html
if (window.location.pathname.includes("forma_pago.html")) {
  document.getElementById("formPago").addEventListener("submit", function (e) {
    e.preventDefault();

    const metodoPago = document.getElementById("metodoPago").value;
    if (!metodoPago) {
      Swal.fire("Seleccioná un método de pago", "", "warning");
      return;
    }

    const datosEntrega = JSON.parse(localStorage.getItem("datosEntrega")) || {};
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    let resumen = `<h3>Gracias por tu compra, ${datosEntrega.nombre}!</h3>`;
    resumen += `<p>Resumen de la compra:</p><ul>`;
    carrito.forEach(p => {
      resumen += `<li>${p.nombre} x ${p.cantidad} - $${p.precio * p.cantidad}</li>`;
    });
    resumen += `</ul><p>Total: $${total}</p><p>Método de pago: ${metodoPago}</p>`;

    localStorage.removeItem("carrito");

    Swal.fire({
      title: "¡Compra exitosa!",
      html: resumen,
      icon: "success",
      confirmButtonColor: "#1d3557"
    }).then(() => {
      window.location.href = "../index.html";
    });
  });
}

// 🏠 Página: index.html
if (document.getElementById("productos")) {
  document.getElementById("filtrar").addEventListener("click", () => {
    const nombre = document.getElementById("buscarProducto").value.toLowerCase();
    const maxPrecio = parseFloat(document.getElementById("filtrarPrecio").value);
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(nombre) &&
      (isNaN(maxPrecio) || p.precio <= maxPrecio)
    );
    renderizarProductos(filtrados);
  });

  document.getElementById("limpiarFiltros").addEventListener("click", () => {
    document.getElementById("buscarProducto").value = "";
    document.getElementById("filtrarPrecio").value = "";
    renderizarProductos();
  });
}
