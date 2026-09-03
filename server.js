const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos de la carpeta public
app.use(express.static('public'));

const tiktokUsername = "deibidblitz";
const tiktokChat = new WebcastPushConnection(tiktokUsername);

// Función para conectar a TikTok de forma segura sin tumbar el servidor
function connectTikTok() {
    tiktokChat.connect().then(state => {
        console.log(`[TikTok] Conectado exitosamente a la sala de: ${state.roomInfo.owner.uniqueId}`);
    }).catch(err => {
        console.error("[TikTok] Error al conectar (reintentando en 10s):", err.message);
        // Intentar reconectar automáticamente después de 10 segundos si falla
        setTimeout(connectTikTok, 10000);
    });
}

// Escuchar eventos del chat de TikTok
tiktokChat.on('chat', data => {
    console.log(`[CHAT] ${data.uniqueId}: ${data.comment}`);
    io.emit('nuevo-mensaje', {
        user: data.uniqueId,
        avatar: data.profilePictureUrl,
        comment: data.comment
    });
});

// Iniciar la conexión a TikTok
connectTikTok();

// Usar el puerto dinámico de Render o 3000 localmente
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
