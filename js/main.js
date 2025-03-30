let productos = [];

fetch("./bd/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderizarProductos();
  });

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const guardarCarrito = () => localStorage.setItem("carrito", JSON.stringify(carrito));

const renderizarProductos = (productosFiltrados = productos) => {
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
};

const renderizarCarrito = () => {
  const contenedor = document.getElementById("carrito");
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
  document.getElementById("total").innerText = total;
};

const agregarAlCarrito = (id) => {
  const producto = productos.find(p => p.id === id);
  const enCarrito = carrito.find(p => p.id === id);
  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito();
  renderizarCarrito();
};

const sumarUnidad = (id) => {
  const producto = carrito.find(p => p.id === id);
  producto.cantidad++;
  guardarCarrito();
  renderizarCarrito();
};

const restarUnidad = (id) => {
  const producto = carrito.find(p => p.id === id);
  producto.cantidad--;
  if (producto.cantidad === 0) {
    carrito = carrito.filter(p => p.id !== id);
  }
  guardarCarrito();
  renderizarCarrito();
};

const calcularCuotas = () => {
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cuotas = parseInt(document.getElementById("cuotas").value);
  let interes = 1;
  if (cuotas === 3) interes = 1.05;
  if (cuotas === 6) interes = 1.10;
  if (cuotas === 12) interes = 1.20;
  const cuota = (total * interes / cuotas).toFixed(2);
  document.getElementById("pagoCuotas").innerText = `Pago en ${cuotas} cuotas de $${cuota}`;
};

const mostrarEntrega = () => {
  if (carrito.length === 0) {
    Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
    return;
  }
  document.getElementById("entrega").style.display = "block";
};

const mostrarPago = (e) => {
  e.preventDefault();
  document.getElementById("entrega").style.display = "none";
  document.getElementById("pago").style.display = "block";
};

const finalizarCompra = (e) => {
  e.preventDefault();
  const metodoPago = document.getElementById("metodoPago").value;
  if (!metodoPago) return;
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  document.getElementById("pago").style.display = "none";
  Swal.fire({
    icon: "success",
    title: "¡Gracias por tu compra!",
    text: "Tu pedido ha sido procesado exitosamente."
  });
};

document.getElementById("filtrar").addEventListener("click", () => {
  const nombre = document.getElementById("buscarProducto").value.toLowerCase();
  const maxPrecio = parseFloat(document.getElementById("filtrarPrecio").value);
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(nombre) && (isNaN(maxPrecio) || p.precio <= maxPrecio));
  renderizarProductos(filtrados);
});

document.getElementById("limpiarFiltros").addEventListener("click", () => {
  document.getElementById("buscarProducto").value = "";
  document.getElementById("filtrarPrecio").value = "";
  renderizarProductos();
});

document.getElementById("calcularCuotas").addEventListener("click", calcularCuotas);
document.getElementById("agregarDatosEntrega").addEventListener("click", mostrarEntrega);
document.getElementById("formEntrega").addEventListener("submit", mostrarPago);
document.getElementById("formPago").addEventListener("submit", finalizarCompra);

renderizarCarrito();
