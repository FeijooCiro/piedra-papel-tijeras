const http = require('http')
const fs = require('fs')
const mime = {
  'html': 'text/html',
  'css': 'text/css',
  'jpg': 'image/jpg',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg3',
  'mp4': 'video/mp4'
}

const servidor = http.createServer((pedido, respuesta) => {
  const url = new URL('http://localhost:8888' + pedido.url)
  let camino = 'public' + url.pathname
  if (camino == 'public/')
    camino = 'public/index.html'
  encaminar(pedido, respuesta, camino)
})

servidor.listen(8888)

function encaminar(pedido, respuesta, camino) {
  console.log(camino)
  switch (camino) {
    case 'public/jugar': {
      if (pedido.method === 'POST') {
        jugar(pedido, respuesta);
      } else {
        respuesta.writeHead(405, { 'Content-Type': 'text/plain' });
        respuesta.end('Método no permitido');
      }
      break;
    }
    default: {
      fs.stat(camino, error => {
        if (!error) {
          fs.readFile(camino, (error, contenido) => {
            if (error) {
              respuesta.writeHead(500, { 'Content-Type': 'text/plain' });
              respuesta.write('Error interno');
              respuesta.end();
            } else {
              const vec = camino.split('.');
              const extension = vec[vec.length - 1];
              const mimearchivo = mime[extension];
              respuesta.writeHead(200, { 'Content-Type': mimearchivo });
              respuesta.write(contenido);
              respuesta.end();
            }
          });
        } else {
          respuesta.writeHead(404, { 'Content-Type': 'text/html' });
          respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');
          respuesta.end();
        }
      });
    }
  }
}

function jugar(pedido, respuesta) {
  let info = '';
  pedido.on('data', datosparciales => {
    info += datosparciales;
  });
  pedido.on('end', () => {
    const datos = new URLSearchParams(info);
    const opcionUsuario = datos.get('opcion');
    const opciones = ['piedra', 'papel', 'tijera'];
    const opcionComputadora = opciones[Math.floor(Math.random() * 3)];
    const resultado = determinarGanador(opcionUsuario, opcionComputadora);

    respuesta.writeHead(200, { 'Content-Type': 'text/plain' });
    respuesta.write(`El servidor ha elegido: ${opcionComputadora}\n`);
    respuesta.write(resultado);
    respuesta.end();
  });
}

function determinarGanador(opcionUsuario, opcionComputadora) {
  if (opcionUsuario === opcionComputadora) {
    return 'Empate!';
  } else if (
    (opcionUsuario === 'p' && opcionComputadora === 'tijera') ||
    (opcionUsuario === 'a' && opcionComputadora === 'piedra') ||
    (opcionUsuario === 't' && opcionComputadora === 'papel')
  ) {
    return 'You Win!';
  } else {
    return 'You Loose!';
  }
}

console.log('Servidor web iniciado');
