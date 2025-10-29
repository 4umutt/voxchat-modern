const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Static dosyaları serve et
app.use(express.static(__dirname));

// Ana sayfa route'u
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Bağlı kullanıcıları takip et
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log(`Kullanıcı bağlandı: ${socket.id}`);
    
    // Kullanıcı sesli kanala katıldığında
    socket.on('join-voice', (data) => {
        const { userId, username, avatar } = data;
        
        // Kullanıcıyı kaydet
        connectedUsers.set(socket.id, {
            socketId: socket.id,
            userId: userId,
            username: username || userId,
            avatar: avatar || '1',
            isMuted: false,
            joinTime: new Date()
        });
        
        // Mevcut kullanıcılara yeni kullanıcıyı bildir
        socket.broadcast.emit('user-joined', {
            userId: userId,
            username: username,
            avatar: avatar,
            socketId: socket.id
        });
        
        // Yeni kullanıcıya mevcut kullanıcı listesini gönder
        const usersList = Array.from(connectedUsers.values()).map(user => ({
            id: user.userId,
            username: user.username,
            avatar: user.avatar,
            socketId: user.socketId,
            isMuted: user.isMuted
        }));
        
        socket.emit('users-list', usersList);
        
        // Diğer kullanıcılara güncel listeyi gönder
        socket.broadcast.emit('users-list', usersList);
        
        console.log(`Kullanıcı sesli kanala katıldı: ${username} (${userId})`);
    });
    
    // Kullanıcı sesli kanaldan ayrıldığında
    socket.on('leave-voice', (data) => {
        const { userId } = data;
        
        // Kullanıcıyı kaldır
        connectedUsers.delete(socket.id);
        
        // Diğer kullanıcılara bildir
        socket.broadcast.emit('user-left', {
            userId: userId,
            socketId: socket.id
        });
        
        // Güncel kullanıcı listesini gönder
        const usersList = Array.from(connectedUsers.values()).map(user => ({
            id: user.userId,
            username: user.username,
            avatar: user.avatar,
            socketId: user.socketId,
            isMuted: user.isMuted
        }));
        
        socket.broadcast.emit('users-list', usersList);
        
        console.log(`Kullanıcı sesli kanaldan ayrıldı: ${userId}`);
    });
    
    // Kullanıcı mute/unmute durumunu güncellemek
    socket.on('mute-status', (data) => {
        const { userId, isMuted } = data;
        
        // Kullanıcının mute durumunu güncelle
        const user = connectedUsers.get(socket.id);
        if (user) {
            user.isMuted = isMuted;
            
            // Güncel kullanıcı listesini tüm kullanıcılara gönder
            const usersList = Array.from(connectedUsers.values()).map(user => ({
                id: user.userId,
                username: user.username,
                avatar: user.avatar,
                socketId: user.socketId,
                isMuted: user.isMuted
            }));
            
            io.emit('users-list', usersList);
        }
        
        console.log(`Kullanıcı ${userId} mute durumunu değiştirdi: ${isMuted}`);
    });
    
    // Chat mesajları
    socket.on('chat-message', (data) => {
        const { userId, username, avatar, message, timestamp } = data;
        console.log(`Chat mesajı: ${username}: ${message}`);
        
        // Mesajı gönderen kullanıcı hariç herkese gönder
        socket.broadcast.emit('chat-message', {
            userId,
            username,
            avatar,
            message,
            timestamp
        });
    });
    
    // Typing indicators
    socket.on('typing-start', (data) => {
        const { userId, username } = data;
        console.log(`${username} yazıyor...`);
        
        socket.broadcast.emit('typing-start', {
            userId,
            username
        });
    });
    
    socket.on('typing-stop', (data) => {
        const { userId } = data;
        console.log(`Kullanıcı ${userId} yazmayı durdurdu`);
        
        socket.broadcast.emit('typing-stop', {
            userId
        });
    });
    
    // WebRTC Signaling - Offer
    socket.on('offer', (data) => {
        const { to, from, offer } = data;
        console.log(`Offer gönderildi: ${from} -> ${to}`);
        
        // Hedef kullanıcının socket ID'sini bul
        const targetUser = Array.from(connectedUsers.values()).find(user => user.userId === to);
        
        if (targetUser) {
            io.to(targetUser.socketId).emit('offer', {
                from: from,
                offer: offer
            });
        } else {
            console.log(`Hedef kullanıcı bulunamadı: ${to}`);
            socket.emit('error', `Hedef kullanıcı bulunamadı: ${to}`);
        }
    });
    
    // WebRTC Signaling - Answer
    socket.on('answer', (data) => {
        const { to, from, answer } = data;
        console.log(`Answer gönderildi: ${from} -> ${to}`);
        
        // Hedef kullanıcının socket ID'sini bul
        const targetUser = Array.from(connectedUsers.values()).find(user => user.userId === to);
        
        if (targetUser) {
            io.to(targetUser.socketId).emit('answer', {
                from: from,
                answer: answer
            });
        } else {
            console.log(`Hedef kullanıcı bulunamadı: ${to}`);
            socket.emit('error', `Hedef kullanıcı bulunamadı: ${to}`);
        }
    });
    
    // WebRTC Signaling - ICE Candidate
    socket.on('ice-candidate', (data) => {
        const { to, from, candidate } = data;
        console.log(`ICE candidate gönderildi: ${from} -> ${to}`);
        
        // Hedef kullanıcının socket ID'sini bul
        const targetUser = Array.from(connectedUsers.values()).find(user => user.userId === to);
        
        if (targetUser) {
            io.to(targetUser.socketId).emit('ice-candidate', {
                from: from,
                candidate: candidate
            });
        } else {
            console.log(`Hedef kullanıcı bulunamadı: ${to}`);
        }
    });
    
    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
        console.log(`Kullanıcı bağlantısı kesildi: ${socket.id}`);
        
        // Kullanıcıyı kayıtlardan sil
        const user = connectedUsers.get(socket.id);
        if (user) {
            // Diğer kullanıcılara bildir
            socket.broadcast.emit('user-left', {
                userId: user.userId,
                socketId: socket.id
            });
            
            // Kullanıcıyı kaldır
            connectedUsers.delete(socket.id);
            
            // Güncel kullanıcı listesini gönder
            const usersList = Array.from(connectedUsers.values()).map(user => ({
                id: user.userId,
                username: user.username,
                avatar: user.avatar,
                socketId: user.socketId,
                isMuted: user.isMuted
            }));
            
            socket.broadcast.emit('users-list', usersList);
            
            console.log(`Kullanıcı temizlendi: ${user.username} (${user.userId})`);
        }
    });
    
    // Hata durumları
    socket.on('error', (error) => {
        console.error(`Socket hatası: ${socket.id}`, error);
    });
});

// Sunucuyu başlat
server.listen(PORT, () => {
    console.log('==========================================');
    console.log('🎤 Discord Sesli Sohbet Sunucusu');
    console.log('==========================================');
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`📊 Bağlı kullanıcı sayısı: ${connectedUsers.size}`);
    console.log('==========================================');
});

// Düzenli olarak istatistikleri göster
setInterval(() => {
    if (connectedUsers.size > 0) {
        console.log(`📊 Aktif kullanıcı sayısı: ${connectedUsers.size}`);
        console.log(`👥 Kullanıcılar: ${Array.from(connectedUsers.values()).map(u => u.username).join(', ')}`);
    }
}, 30000); // Her 30 saniyede bir

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Sunucu kapatılıyor...');
    server.close(() => {
        console.log('✅ Sunucu başarıyla kapatıldı');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Sunucu kapatılıyor...');
    server.close(() => {
        console.log('✅ Sunucu başarıyla kapatıldı');
        process.exit(0);
    });
});

module.exports = { app, server, io };