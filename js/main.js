let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

fetch("./bd/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    const productosDOM = document.getElementById("productos");
    if (productosDOM) renderizarProductos();
  });

const guardarCarrito = () => localStorage.setItem("carrito", JSON.stringify(carrito));

function renderizarProductos(productosFiltrados = productos) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  productosFiltrados.forEach(producto => {
    const card = document.createElement("div");
    card.className = "card";

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.textContent = `Precio: $${producto.precio}`;

    const boton = document.createElement("button");
    boton.textContent = "Agregar";
    boton.addEventListener("click", function () {
      agregarAlCarrito(producto.id);
    });

    card.appendChild(nombre);
    card.appendChild(precio);
    card.appendChild(boton);
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
    item.textContent = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;

    const btnSumar = document.createElement("button");
    btnSumar.textContent = "+";
    btnSumar.addEventListener("click", function () {
      sumarUnidad(producto.id);
    });

    const btnRestar = document.createElement("button");
    btnRestar.textContent = "-";
    btnRestar.addEventListener("click", function () {
      restarUnidad(producto.id);
    });

    item.appendChild(btnSumar);
    item.appendChild(btnRestar);
    contenedor.appendChild(item);
    total += producto.precio * producto.cantidad;
  });

  const totalDOM = document.getElementById("total");
  if (totalDOM) totalDOM.innerText = total;
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
  if (document.getElementById("carrito")) renderizarCarrito();
  Swal.fire("Producto agregado", producto.nombre, "success");
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

// Página: index.html (catálogo)
const productosDOM = document.getElementById("productos");
if (productosDOM) {
  const filtrarBtn = document.getElementById("filtrar");
  const limpiarBtn = document.getElementById("limpiarFiltros");

  if (filtrarBtn && limpiarBtn) {
    filtrarBtn.addEventListener("click", () => {
      const nombre = document.getElementById("buscarProducto").value.toLowerCase();
      const maxPrecio = parseFloat(document.getElementById("filtrarPrecio").value);
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(nombre) && (isNaN(maxPrecio) || p.precio <= maxPrecio)
      );
      renderizarProductos(filtrados);
    });

    limpiarBtn.addEventListener("click", () => {
      document.getElementById("buscarProducto").value = "";
      document.getElementById("filtrarPrecio").value = "";
      renderizarProductos();
    });
  }
}

// Página: carrito.html
const carritoDOM = document.getElementById("carrito");
if (carritoDOM) {
  renderizarCarrito();
  const calcularBtn = document.getElementById("calcularCuotas");
  if (calcularBtn) calcularBtn.addEventListener("click", calcularCuotas);
}

// Página: datos_entrega.html
const formEntrega = document.getElementById("formEntrega");
if (formEntrega) {
  formEntrega.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const direccion = document.getElementById("direccion").value;

    const datosEntrega = { nombre, email, direccion };
    localStorage.setItem("datosEntrega", JSON.stringify(datosEntrega));

    location.href = "forma_pago.html";
  });
}

// Página: forma_pago.html
const formPago = document.getElementById("formPago");
if (formPago) {
  formPago.addEventListener("submit", function (e) {
    e.preventDefault();

    const metodoPago = document.getElementById("metodoPago").value;
    if (!metodoPago) {
      Swal.fire("Falta seleccionar un método de pago", "Por favor, elegí una opción", "warning");
      return;
    }

    const datosEntrega = JSON.parse(localStorage.getItem("datosEntrega")) || {};
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    let resumen = `<h3>Gracias por tu compra, ${datosEntrega.nombre}!</h3>`;
    resumen += `<p>Resumen:</p><ul>`;
    carrito.forEach(p => {
      resumen += `<li>${p.nombre} x ${p.cantidad} - $${p.precio * p.cantidad}</li>`;
    });
    resumen += `</ul><p>Total: $${total}</p><p>Método de pago: ${metodoPago}</p>`;

    localStorage.removeItem("carrito");

    Swal.fire({
      title: "¡Compra exitosa!",
      html: resumen,
      icon: "success",
      confirmButtonText: "Volver al inicio",
      confirmButtonColor: "#1d3557"
    }).then(() => {
      location.href = "../index.html";
    });
  });
}
