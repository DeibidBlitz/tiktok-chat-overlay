const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const tiktokUsername = "deibidblitz"; 
const tiktokChat = new WebcastPushConnection(tiktokUsername);

tiktokChat.connect().then(state => {
    console.log(`[TikTok] Conectado exitosamente a la sala de: ${state.roomInfo.owner.uniqueId}`);
}).catch(err => {
    console.error("[TikTok] Error al conectar:", err);
});

tiktokChat.on('chat', data => {
    console.log(`[CHAT] ${data.uniqueId}:${data.comment}`);
    io.emit('nuevo-mensaje', {
        user: data.uniqueId,
        avatar: data.profilePictureUrl,
        comment: data.comment
    });
});

app.use(express.static('public'));

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor beta corriendo en: http://localhost:${PORT}`);
});