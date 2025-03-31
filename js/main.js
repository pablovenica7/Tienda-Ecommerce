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
    card.className = "card-producto";

    card.innerHTML = `
      <div class="imagen-container">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="overlay" id="overlay-${producto.id}">
          <div class="talles">
            <p>TALLE</p>
            <button class="talle">M</button>
            <button class="talle">L</button>
            <button class="talle">XL</button>
          </div>
          <button class="agregar" data-id="${producto.id}">Agregar al carrito</button>
        </div>
      </div>
      <div class="info">
        <h3>${producto.nombre}</h3>
        <p class="precio">$${producto.precio.toLocaleString()}</p>
        <p class="cuotas">${producto.cuotas}</p>
        <div class="acciones">
          <button class="comprar" data-id="${producto.id}">COMPRAR</button>
          <button class="ver">VER</button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });

  document.querySelectorAll(".comprar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      document.getElementById(`overlay-${id}`).classList.add("mostrar");
    });
  });

  document.querySelectorAll(".agregar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      agregarAlCarrito(id);
      Swal.fire("¡Agregado exitosamente!", "", "success");
      document.getElementById(`overlay-${id}`).classList.remove("mostrar");
    });
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

// index.html - Filtros
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

// carrito.html
const carritoDOM = document.getElementById("carrito");
if (carritoDOM) {
  renderizarCarrito();

  if (carrito.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Tu carrito está vacío",
      text: "Agregá productos antes de continuar con la compra",
      confirmButtonText: "Volver al catálogo"
    }).then(() => {
      location.href = "../index.html";
    });
  }

  const calcularBtn = document.getElementById("calcularCuotas");
  if (calcularBtn) calcularBtn.addEventListener("click", calcularCuotas);

  const vaciarBtn = document.getElementById("vaciarCarrito");
  if (vaciarBtn) {
    vaciarBtn.addEventListener("click", () => {
      Swal.fire({
        title: "¿Seguro que querés vaciar el carrito?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          carrito = [];
          guardarCarrito();
          renderizarCarrito();
        }
      });
    });
  }
}

// datos_entrega.html
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

// forma_pago.html
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

    const fecha = new Date().toLocaleDateString();
    const cuotas = document.getElementById("cuotas")?.value;
    const totalConInteres = (cuotas && cuotas > 1) ? (total * (cuotas == 3 ? 1.05 : cuotas == 6 ? 1.1 : 1.2)).toFixed(2) : total;
    const cuotaValor = cuotas && cuotas > 1 ? (totalConInteres / cuotas).toFixed(2) : null;

    let resumen = `<h3>Gracias por tu compra, ${datosEntrega.nombre}!</h3>`;
    resumen += `<p>Resumen:</p><ul>`;
    carrito.forEach(p => {
      resumen += `<li>${p.nombre} x ${p.cantidad} - $${p.precio * p.cantidad}</li>`;
    });
    resumen += `</ul><p>Total: $${total}</p><p>Método de pago: ${metodoPago}</p>`;
    resumen += `<p>Fecha de compra: ${fecha}</p>`;
    if (cuotaValor) {
      resumen += `<p>Pago en ${cuotas} cuotas de $${cuotaValor}</p>`;
    }

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
