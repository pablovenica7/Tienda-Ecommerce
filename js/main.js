let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

fetch("./bd/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderizarProductos();
  })
  .catch(() => {
    Swal.fire("Error al cargar productos", "", "error");
  });

const guardarCarrito = () => localStorage.setItem("carrito", JSON.stringify(carrito));

function renderizarProductos(productosFiltrados = productos) {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  productosFiltrados.forEach(producto => {
    const card = document.createElement("div");
    card.className = "card-producto";

    const esZapatilla = producto.nombre.toLowerCase().includes("zapatilla");
    const talles = esZapatilla
      ? ["40", "42", "44"]
      : ["M", "L", "XL"];

    card.innerHTML = `
      <div class="imagen-container">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="overlay" id="overlay-${producto.id}">
          <div class="talles" data-id="${producto.id}">
            <p>TALLE</p>
            ${talles.map(t => `<button class="talle">${t}</button>`).join("")}
          </div>
          <button class="agregar" data-id="${producto.id}">Agregar al carrito</button>
        </div>
      </div>
      <div class="info">
        <h3>${producto.nombre}</h3>
        <p class="precio">$${producto.precio.toLocaleString()}</p>
        <div class="acciones">
          <button class="comprar" data-id="${producto.id}">COMPRAR</button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });

  inicializarEventosProducto();
}

function inicializarEventosProducto() {
  document.querySelectorAll(".comprar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      document.getElementById(`overlay-${id}`).classList.add("mostrar");
    });
  });

  document.querySelectorAll(".talle").forEach(btn => {
    btn.addEventListener("click", () => {
      const contenedor = btn.parentElement;
      contenedor.querySelectorAll(".talle").forEach(b => b.classList.remove("seleccionado"));
      btn.classList.add("seleccionado");
    });
  });

  document.querySelectorAll(".agregar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      const talleSeleccionado = document.querySelector(`#overlay-${id} .talle.seleccionado`);
      if (!talleSeleccionado) {
        Swal.fire("Seleccioná un talle antes de continuar", "", "warning");
        return;
      }
      const talle = talleSeleccionado.textContent;
      agregarAlCarrito(id, talle);
      document.getElementById(`overlay-${id}`).classList.remove("mostrar");
    });
  });
}

const inputBuscar = document.getElementById("buscarProducto");
const inputPrecio = document.getElementById("filtrarPrecio");
const btnFiltrar = document.getElementById("filtrar");
const btnLimpiar = document.getElementById("limpiarFiltros");

if (btnFiltrar) btnFiltrar.addEventListener("click", aplicarFiltros);
if (btnLimpiar) btnLimpiar.addEventListener("click", () => renderizarProductos());

function aplicarFiltros() {
  const texto = inputBuscar.value.toLowerCase().trim();
  const precioMax = parseFloat(inputPrecio.value);
  let filtrados = productos;

  if (texto) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(texto));
  if (!isNaN(precioMax)) filtrados = filtrados.filter(p => p.precio <= precioMax);

  renderizarProductos(filtrados);
}

function agregarAlCarrito(id, talle) {
  const producto = productos.find(p => p.id === id);
  const nombreConTalle = `${producto.nombre} ${talle}`;
  const enCarrito = carrito.find(p => p.nombre === nombreConTalle);

  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, nombre: nombreConTalle, cantidad: 1 });
  }

  guardarCarrito();
  if (document.getElementById("carrito")) renderizarCarrito();
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
    btnSumar.addEventListener("click", () => sumarUnidad(producto.nombre));

    const btnRestar = document.createElement("button");
    btnRestar.textContent = "-";
    btnRestar.addEventListener("click", () => restarUnidad(producto.nombre));

    item.appendChild(btnSumar);
    item.appendChild(btnRestar);
    contenedor.appendChild(item);

    total += producto.precio * producto.cantidad;
  });

  const totalDOM = document.getElementById("total");
  if (totalDOM) totalDOM.innerText = total;
}

function sumarUnidad(nombre) {
  const producto = carrito.find(p => p.nombre === nombre);
  producto.cantidad++;
  guardarCarrito();
  renderizarCarrito();
}

function restarUnidad(nombre) {
  const producto = carrito.find(p => p.nombre === nombre);
  producto.cantidad--;
  if (producto.cantidad === 0) {
    carrito = carrito.filter(p => p.nombre !== nombre);
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

const carritoDOM = document.getElementById("carrito");
if (carritoDOM) {
  renderizarCarrito();
  if (carrito.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Tu carrito está vacío",
      text: "Agregá productos antes de continuar con la compra",
      confirmButtonText: "Volver al catálogo"
    }).then(() => location.href = "../index.html");
  }
  const calcularBtn = document.getElementById("calcularCuotas");
  if (calcularBtn) calcularBtn.addEventListener("click", calcularCuotas);
}

const formEntrega = document.getElementById("formEntrega");
if (formEntrega) {
  formEntrega.addEventListener("submit", function (e) {
    e.preventDefault();
    const datosEntrega = {
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido")?.value || "",
      telefono: document.getElementById("telefono")?.value || "",
      codigoPostal: document.getElementById("codigoPostal")?.value || "",
      provincia: document.getElementById("provincia")?.value || "",
      calle: document.getElementById("calle")?.value || "",
      numero: document.getElementById("numero")?.value || "",
      departamento: document.getElementById("departamento")?.value || "",
      barrio: document.getElementById("barrio")?.value || "",
      ciudad: document.getElementById("ciudad")?.value || "",
      dni: document.getElementById("dni").value
    };
    localStorage.setItem("datosEntrega", JSON.stringify(datosEntrega));
    location.href = "../pages/forma_pago.html";
  });
}

const formPago = document.getElementById("formPago");
if (formPago) {
  const metodoPago = document.getElementById("metodoPago");
  const datosTransferencia = document.getElementById("datosTransferencia");
  const datosTarjeta = document.getElementById("datosTarjeta");

  metodoPago.addEventListener("change", () => {
    const valor = metodoPago.value;
    if (datosTransferencia) datosTransferencia.style.display = valor === "Transferencia" ? "block" : "none";
    if (datosTarjeta) datosTarjeta.style.display = valor === "Tarjeta" ? "block" : "none";
    document.querySelectorAll("#datosTarjeta input")
      .forEach(input => input.required = valor === "Tarjeta");
  });

  formPago.addEventListener("submit", function (e) {
    e.preventDefault();
    const metodoPagoValue = metodoPago.value;
    if (!metodoPagoValue) {
      Swal.fire("Falta seleccionar un método de pago", "Por favor, elegí una opción", "warning");
      return;
    }
    const datosEntrega = JSON.parse(localStorage.getItem("datosEntrega")) || {};
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const fecha = new Date().toLocaleDateString();

    let resumen = `<h3>Gracias por tu compra, ${datosEntrega.nombre}!</h3>`;
    resumen += `<p>Resumen:</p><ul>`;
    carrito.forEach(p => {
      resumen += `<li>${p.nombre} x ${p.cantidad} - $${p.precio * p.cantidad}</li>`;
    });
    resumen += `</ul><p>Total: $${total}</p><p>Método de pago: ${metodoPagoValue}</p>`;
    resumen += `<p>Fecha de compra: ${fecha}</p>`;

    localStorage.removeItem("carrito");

    Swal.fire({
      title: "¡Compra exitosa!",
      html: resumen,
      icon: "success",
      confirmButtonText: "Volver al inicio",
      confirmButtonColor: "#1d3557",
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(result => {
      if (result.isConfirmed) {
        location.href = "../index.html";
      }
    });
  });
}

