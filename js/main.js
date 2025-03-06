const productos = [
    { id: 1, nombre: "Camiseta", precio: 5000 },
    { id: 2, nombre: "Pantalón", precio: 8000 },
    { id: 3, nombre: "Zapatillas", precio: 12000 },
    { id: 4, nombre: "Gorra", precio: 2500 },
    { id: 5, nombre: "Buzo", precio: 10000 },
];

const obtenerCarrito = () => JSON.parse(localStorage.getItem("carrito")) || [];
let carrito = obtenerCarrito();

const guardarCarrito = () => localStorage.setItem("carrito", JSON.stringify(carrito));

const renderizarProductos = (productosFiltrados = productos) => {
    let contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productosFiltrados.forEach(producto => {
        let card = document.createElement("div");
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
    let contenedorCarrito = document.getElementById("carrito");
    let total = document.getElementById("total");

    contenedorCarrito.innerHTML = "";
    let totalCompra = 0;

    carrito.forEach((producto, index) => {
        let item = document.createElement("li");
        item.innerHTML = `${producto.nombre} - $${producto.precio} 
                          <button onclick="eliminarDelCarrito(${index})">X</button>`;
        contenedorCarrito.appendChild(item);
        totalCompra += producto.precio;
    });

    total.innerText = totalCompra;
};

const agregarAlCarrito = (id) => {
    let producto = productos.find(p => p.id === id);
    carrito.push(producto);
    guardarCarrito();
    renderizarCarrito();
};

const eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    guardarCarrito();
    renderizarCarrito();
};

document.getElementById("comprar").addEventListener("click", () => {
    let mensajeCompra = document.getElementById("mensajeCompra");

    if (carrito.length === 0) {
        mensajeCompra.innerText = "El carrito está vacío. Agrega productos antes de comprar.";
        mensajeCompra.style.color = "red";
    } else {
        mensajeCompra.innerText = "¡Compra realizada con éxito! Gracias por tu compra.";
        mensajeCompra.style.color = "green";

        carrito = [];
        guardarCarrito();
        renderizarCarrito();
    }
});

document.getElementById("filtrar").addEventListener("click", () => {
    let filtroNombre = document.getElementById("buscarProducto").value.toLowerCase();
    let filtroPrecio = parseFloat(document.getElementById("filtrarPrecio").value);

    let productosFiltrados = productos.filter(producto => 
        (producto.nombre.toLowerCase().includes(filtroNombre)) && 
        (isNaN(filtroPrecio) || producto.precio <= filtroPrecio)
    );

    renderizarProductos(productosFiltrados);
});

document.getElementById("limpiarFiltros").addEventListener("click", () => {
    document.getElementById("buscarProducto").value = "";
    document.getElementById("filtrarPrecio").value = "";
    renderizarProductos();
});

document.getElementById("calcularCuotas").addEventListener("click", () => {
    let totalCompra = carrito.reduce((total, producto) => total + producto.precio, 0);
    let cuotas = parseInt(document.getElementById("cuotas").value);

    let interes = 1;
    if (cuotas === 3) interes = 1.05;
    if (cuotas === 6) interes = 1.10;
    if (cuotas === 12) interes = 1.20;

    let pagoMensual = (totalCompra * interes / cuotas).toFixed(2);
    document.getElementById("pagoCuotas").innerText = `Pago en ${cuotas} cuotas: $${pagoMensual} por mes`;
});

renderizarProductos();
renderizarCarrito();


