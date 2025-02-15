const productos = [
    { nombre: "Remera", precio: 20000 },
    { nombre: "Pantalon", precio: 30000 },
    { nombre: "Zapatilla", precio: 50000 },
    { nombre: "Gorra", precio: 15000 }
];

let carrito = [];
let contadorCarrito = 0;

function mostrarProductos(productos) {
    console.log("Productos disponibles:");
    for (let i = 0; i < 4; i++) {
        console.log(i + 1 + ". " + productos[i].nombre + " - $" + productos[i].precio);
    }
}

function agregarAlCarrito(productoNombre, productos, carrito) {
    let producto = null;
    for (let i = 0; i < 4; i++) {
        if (productos[i].nombre === productoNombre) {
            producto = productos[i];
            break;
        }
    }

    if (producto) {
        carrito.push(producto);
        contadorCarrito++;
        alert(producto.nombre + " agregado al carrito.");
    } else {
        alert("Producto no encontrado. Intente nuevamente.");
    }
}

function calcularTotal(carrito) {
    let total = 0;
    for (let i = 0; i < contadorCarrito; i++) {
        total += carrito[i].precio;
    }
    return total;
}

function finalizarCompra(carrito) {
    if (contadorCarrito === 0) {
        alert("El carrito esta vacio. Agregue productos antes de finalizar la compra.");
        return;
    }
    
    let total = calcularTotal(carrito);
    alert("Total de la compra: $" + total + " Gracias por su compra!");
    console.log("Compra finalizada. Detalles del carrito:");
    for (let i = 0; i < contadorCarrito; i++) {
        console.log(i + 1 + ". " + carrito[i].nombre + " - $" + carrito[i].precio);
    }
    console.log("Total: $" + total);
}

mostrarProductos(productos);
let continuar = true;
while (continuar) {
    let productoNombre = prompt("Ingrese el nombre del producto que desea comprar:");
    agregarAlCarrito(productoNombre, productos, carrito);
    continuar = confirm("¿Desea agregar otro producto?");
}
finalizarCompra(carrito);
