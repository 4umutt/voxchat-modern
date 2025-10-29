class VoxChat {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.peers = new Map();
        this.isConnected = false;
        this.isMuted = false;
        this.isDeafened = false;
        this.userId = null;
        this.username = '';
        this.selectedAvatar = '1';
        this.particlesEnabled = true;
        this.particlesInterval = null;
        
        // Chat properties
        this.messages = [];
        this.messageCount = 0;
        this.isTyping = false;
        this.typingTimeout = null;
        this.currentTab = 'voice';
        
        // Gelişmiş avatar tanımları
        this.avatars = {
            '1': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'fas fa-user' },
            '2': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: 'fas fa-cat' },
            '3': { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: 'fas fa-rocket' },
            '4': { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: 'fas fa-leaf' },
            '5': { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: 'fas fa-star' },
            '6': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: 'fas fa-heart' },
            '7': { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon: 'fas fa-crown' },
            '8': { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: 'fas fa-magic' },
            '9': { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)', icon: 'fas fa-fire' },
            '10': { bg: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', icon: 'fas fa-bolt' },
            '11': { bg: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', icon: 'fas fa-gem' },
            '12': { bg: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)', icon: 'fas fa-dragon' }
        };
        
        this.initializeApp();
        this.createParticles();
        this.initializeChatSystem();
    }
    
    initializeApp() {
        // Modal elementleri
        this.loginModal = document.getElementById('loginModal');
        this.usernameInput = document.getElementById('usernameInput');
        this.enterChatBtn = document.getElementById('enterChatBtn');
        this.avatarOptions = document.querySelectorAll('.avatar-option');
        
        // Ana uygulama elementleri
        this.mainApp = document.getElementById('mainApp');
        this.joinBtn = document.getElementById('joinBtn');
        this.leaveBtn = document.getElementById('leaveBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.deafenBtn = document.getElementById('deafenBtn');
        this.status = document.getElementById('status');
        this.voiceUsers = document.getElementById('voiceUsers');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.remoteAudios = document.getElementById('remoteAudios');
        this.userCount = document.getElementById('userCount');
        this.currentUsername = document.getElementById('currentUsername');
        this.currentUserAvatar = document.getElementById('currentUserAvatar');
        
        // Chat elementleri
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messageCount = document.getElementById('messageCount');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Ayarlar elementleri
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.particlesToggle = document.getElementById('particlesToggle');
        this.micSensitivity = document.getElementById('micSensitivity');
        this.micValue = document.getElementById('micValue');
        
        this.initializeEvents();
        this.connectSocket();
    }
    
    initializeEvents() {
        // Modal events
        this.initializeModalEvents();
        
        // Main app events
        this.initializeAppEvents();
        
        // Settings events
        this.initializeSettingsEvents();
        
        // Keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Tab switching
        this.initializeTabSystem();
        
        // Chat events
        this.initializeChatEvents();
    }
    
    initializeModalEvents() {
        // Avatar seçimi - smooth animation
        this.avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.avatarOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.style.transform = '';
                });
                option.classList.add('selected');
                this.selectedAvatar = option.dataset.avatar;
                this.playSelectSound();
            });
            
            // Hover effects
            option.addEventListener('mouseenter', () => {
                if (!option.classList.contains('selected')) {
                    option.style.transform = 'scale(1.1) translateY(-3px)';
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (!option.classList.contains('selected')) {
                    option.style.transform = '';
                }
            });
        });
        
        // Giriş butonu
        this.enterChatBtn.addEventListener('click', () => this.enterChat());
        
        // Enter tuşu ile giriş
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enterChat();
        });
        
        // Real-time username validation
        this.usernameInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const btn = this.enterChatBtn;
            
            if (value.length < 2) {
                btn.style.opacity = '0.5';
                btn.style.transform = 'scale(0.98)';
            } else {
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
            }
        });
        
        // Auto focus with delay for better UX
        setTimeout(() => {
            this.usernameInput.focus();
        }, 500);
    }
    
    initializeAppEvents() {
        this.joinBtn.addEventListener('click', () => this.joinVoiceChannel());
        this.leaveBtn.addEventListener('click', () => this.leaveVoiceChannel());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.deafenBtn.addEventListener('click', () => this.toggleDeafen());
        
        // Volume slider with smooth updates
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.volumeValue.textContent = volume + '%';
            this.setMasterVolume(volume / 100);
            this.updateVolumeVisualizer(volume);
        });
        
        // Smooth volume animations
        this.volumeSlider.addEventListener('mousedown', () => {
            this.volumeSlider.style.transform = 'scale(1.02)';
        });
        
        this.volumeSlider.addEventListener('mouseup', () => {
            this.volumeSlider.style.transform = 'scale(1)';
        });
    }
    
    initializeSettingsEvents() {
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        
        this.particlesToggle.addEventListener('click', () => this.toggleParticles());
        
        this.micSensitivity.addEventListener('input', (e) => {
            const value = e.target.value;
            this.micValue.textContent = value + '%';
        });
        
        // Close settings on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
        
        // Close login modal on outside click
        this.loginModal.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                // Don't allow closing login modal
                return;
            }
        });
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + M - Toggle mute
            if (e.ctrlKey && e.key === 'm' && this.isConnected) {
                e.preventDefault();
                this.toggleMute();
            }
            
            // Ctrl + D - Toggle deafen
            if (e.ctrlKey && e.key === 'd' && this.isConnected) {
                e.preventDefault();
                this.toggleDeafen();
            }
            
            // Escape - Close modals
            if (e.key === 'Escape') {
                if (this.settingsModal.style.display !== 'none') {
                    this.hideSettings();
                }
            }
        });
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        
        this.particlesInterval = setInterval(() => {
            if (!this.particlesEnabled) return;
            
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position and properties
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Random colors
            const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 20000);
        }, 500);
    }
    
    toggleParticles() {
        this.particlesEnabled = !this.particlesEnabled;
        const particlesContainer = document.getElementById('particles');
        
        if (!this.particlesEnabled) {
            particlesContainer.innerHTML = '';
            this.particlesToggle.innerHTML = '<i class="fas fa-eye-slash"></i> Partiküller Kapalı';
        } else {
            this.particlesToggle.innerHTML = '<i class="fas fa-sparkles"></i> Partiküller Açık';
        }
    }
    
    showSettings() {
        this.settingsModal.style.display = 'flex';
        setTimeout(() => {
            this.settingsModal.style.opacity = '1';
        }, 10);
    }
    
    hideSettings() {
        this.settingsModal.style.opacity = '0';
        setTimeout(() => {
            this.settingsModal.style.display = 'none';
        }, 300);
    }
    
    enterChat() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            this.showNotification('Lütfen bir kullanıcı adı girin!', 'error');
            this.shakeElement(this.usernameInput);
            return;
        }
        
        if (username.length < 2) {
            this.showNotification('Kullanıcı adı en az 2 karakter olmalıdır!', 'error');
            this.shakeElement(this.usernameInput);
            return;
        }
        
        this.username = username;
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        // Kullanıcı bilgilerini güncelle
        this.currentUsername.textContent = username;
        this.updateUserAvatar(this.currentUserAvatar, this.selectedAvatar);
        
        // Smooth transition
        this.loginModal.style.opacity = '0';
        setTimeout(() => {
            this.loginModal.style.display = 'none';
            this.mainApp.style.display = 'flex';
            this.mainApp.style.opacity = '0';
            
            setTimeout(() => {
                this.mainApp.style.opacity = '1';
                this.showNotification(`Hoşgeldin ${username}! 🎉`, 'success');
            }, 100);
        }, 300);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 10001;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#8b5cf6'};
            color: white;
            padding: 18px 25px;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            transform: translateX(400px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border-left: 4px solid ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#7c3aed'};
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="margin-right: 10px;"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }
    
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        // Add shake animation to CSS if not exists
        if (!document.querySelector('#shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playSelectSound() {
        // Create a subtle click sound effect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    updateUserAvatar(element, avatarId) {
        const avatar = this.avatars[avatarId];
        const circle = element.querySelector('.avatar-circle');
        const icon = circle.querySelector('i');
        
        circle.style.background = avatar.bg;
        icon.className = avatar.icon;
        
        // Smooth animation
        circle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            circle.style.transform = 'scale(1)';
        }, 150);
    }
    
    updateVolumeVisualizer(volume) {
        this.volumeValue.style.transform = `scale(${1 + (volume / 1000)})`;
        setTimeout(() => {
            this.volumeValue.style.transform = 'scale(1)';
        }, 200);
    }
    
    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Socket bağlantısı kuruldu');
            this.updateStatus('Sunucuya bağlandı', 'connected');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Socket bağlantısı kesildi');
            this.updateStatus('Sunucudan bağlantı kesildi', 'disconnected');
            this.handleDisconnect();
        });
        
        this.socket.on('user-joined', (data) => {
            console.log('Kullanıcı katıldı:', data);
            this.handleUserJoined(data);
            this.showNotification(`${data.username || data.userId} kanala katıldı`, 'info');
        });
        
        this.socket.on('user-left', (data) => {
            console.log('Kullanıcı ayrıldı:', data);
            this.handleUserLeft(data);
            this.showNotification(`Bir kullanıcı kanaldan ayrıldı`, 'info');
        });
        
        this.socket.on('users-list', (users) => {
            this.updateUsersList(users);
        });
        
        this.socket.on('offer', (data) => {
            this.handleOffer(data);
        });
        
        this.socket.on('answer', (data) => {
            this.handleAnswer(data);
        });
        
        this.socket.on('ice-candidate', (data) => {
            this.handleIceCandidate(data);
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket hatası:', error);
            this.updateStatus('Bağlantı hatası: ' + error, 'disconnected');
            this.showNotification('Sunucu hatası: ' + error, 'error');
        });
        
        // Chat events
        this.socket.on('chat-message', (data) => {
            console.log('Chat mesajı alındı:', data);
            this.addMessage({...data, isOwn: false});
        });
        
        this.socket.on('typing-start', (data) => {
            if (data.userId !== this.userId) {
                this.showTypingIndicator(data.username);
            }
        });
        
        this.socket.on('typing-stop', (data) => {
            if (data.userId !== this.userId) {
                this.hideTypingIndicator();
            }
        });
    }
    
    async joinVoiceChannel() {
        try {
            this.updateStatus('Mikrofonunuza erişim isteniyor...', 'connecting');
            this.joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bağlanıyor...';
            
            // Mikrofon erişimi iste
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                },
                video: false
            });
            
            console.log('Mikrofon erişimi alındı');
            
            // UI'ı güncelle
            this.joinBtn.disabled = true;
            this.joinBtn.innerHTML = '<i class="fas fa-check"></i> Kanala Katıldın';
            this.leaveBtn.disabled = false;
            this.muteBtn.disabled = false;
            this.deafenBtn.disabled = false;
            this.isConnected = true;
            
            // Chat'i etkinleştir
            if (this.currentTab === 'chat') {
                this.chatInput.disabled = false;
                this.sendBtn.disabled = false;
            }
            
            // Sunucuya katılma isteği gönder
            this.socket.emit('join-voice', { 
                userId: this.userId,
                username: this.username,
                avatar: this.selectedAvatar
            });
            
            this.updateStatus('Sesli kanala katıldınız', 'connected');
            this.showNotification('Sesli kanala başarıyla katıldın! 🎤', 'success');
            
            // Add speaking detection
            this.addSpeakingDetection();
            
        } catch (error) {
            console.error('Mikrofon erişimi hatası:', error);
            let errorMessage = 'Mikrofon erişimi reddedildi';
            
            if (error.name === 'NotFoundError') {
                errorMessage = 'Mikrofon bulunamadı';
            } else if (error.name === 'NotAllowedError') {
                errorMessage = 'Mikrofon erişimi reddedildi';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Mikrofon başka bir uygulama tarafından kullanılıyor';
            }
            
            this.updateStatus(errorMessage, 'disconnected');
            this.showNotification(errorMessage, 'error');
            
            // Reset button
            this.joinBtn.innerHTML = '<i class="fas fa-headphones"></i> Sesli Kanala Katıl';
            this.joinBtn.disabled = false;
        }
    }
    
    addSpeakingDetection() {
        if (!this.localStream) return;
        
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(this.localStream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const checkSpeaking = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            
            const isSpeaking = average > 20;
            const currentUserElement = document.querySelector(`#user-${this.userId}`);
            
            if (currentUserElement) {
                if (isSpeaking) {
                    currentUserElement.classList.add('speaking');
                } else {
                    currentUserElement.classList.remove('speaking');
                }
            }
            
            if (this.isConnected) {
                requestAnimationFrame(checkSpeaking);
            }
        };
        
        checkSpeaking();
    }
    
    leaveVoiceChannel() {
        // Smooth exit animation
        this.leaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ayrılıyor...';
        
        setTimeout(() => {
            // Tüm peer bağlantılarını kapat
            this.peers.forEach((peer, peerId) => {
                peer.close();
            });
            this.peers.clear();
            
            // Local stream'i durdur
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
                this.localStream = null;
            }
            
            // Sunucuya ayrılma isteği gönder
            this.socket.emit('leave-voice', { userId: this.userId });
            
            // UI'ı güncelle
            this.joinBtn.disabled = false;
            this.joinBtn.innerHTML = '<i class="fas fa-headphones"></i> Sesli Kanala Katıl';
            this.leaveBtn.disabled = true;
            this.leaveBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Kanaldan Ayrıl';
            this.muteBtn.disabled = true;
            this.deafenBtn.disabled = true;
            this.isConnected = false;
            this.isMuted = false;
            this.isDeafened = false;
            
            this.muteBtn.classList.remove('muted');
            this.deafenBtn.classList.remove('deafened');
            
            // Remote audio elementlerini temizle
            this.remoteAudios.innerHTML = '';
            
            this.updateStatus('Sesli kanaldan ayrıldınız', 'disconnected');
            this.showNotification('Sesli kanaldan ayrıldın 👋', 'info');
        }, 500);
    }
    
    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMuted = !audioTrack.enabled;
                
                // UI animasyonu
                this.muteBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.muteBtn.style.transform = 'scale(1)';
                }, 150);
                
                // UI'ı güncelle
                if (this.isMuted) {
                    this.muteBtn.classList.add('muted');
                    this.showNotification('Mikrofon susturuldu 🔇', 'info');
                } else {
                    this.muteBtn.classList.remove('muted');
                    this.showNotification('Mikrofon açıldı 🎤', 'success');
                }
                
                // Mute durumunu diğer kullanıcılara bildir
                this.socket.emit('mute-status', { 
                    userId: this.userId, 
                    isMuted: this.isMuted 
                });
            }
        }
    }
    
    toggleDeafen() {
        this.isDeafened = !this.isDeafened;
        
        // UI animasyonu
        this.deafenBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.deafenBtn.style.transform = 'scale(1)';
        }, 150);
        
        // UI'ı güncelle
        if (this.isDeafened) {
            this.deafenBtn.classList.add('deafened');
            this.setMasterVolume(0);
            this.showNotification('Ses kapatıldı 🔇', 'info');
        } else {
            this.deafenBtn.classList.remove('deafened');
            this.setMasterVolume(this.volumeSlider.value / 100);
            this.showNotification('Ses açıldı 🔊', 'success');
        }
    }
    
    // WebRTC methods (keeping existing functionality)
    async handleUserJoined(data) {
        const { userId } = data;
        
        if (userId !== this.userId && this.isConnected) {
            const peerConnection = this.createPeerConnection(userId);
            this.peers.set(userId, peerConnection);
            
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, this.localStream);
                });
            }
            
            try {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                
                this.socket.emit('offer', {
                    to: userId,
                    from: this.userId,
                    offer: offer
                });
            } catch (error) {
                console.error('Offer oluşturma hatası:', error);
            }
        }
    }
    
    handleUserLeft(data) {
        const { userId } = data;
        
        if (this.peers.has(userId)) {
            this.peers.get(userId).close();
            this.peers.delete(userId);
        }
        
        const audioElement = document.getElementById(`audio-${userId}`);
        if (audioElement) {
            audioElement.remove();
        }
    }
    
    async handleOffer(data) {
        const { from, offer } = data;
        
        const peerConnection = this.createPeerConnection(from);
        this.peers.set(from, peerConnection);
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }
        
        try {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            this.socket.emit('answer', {
                to: from,
                from: this.userId,
                answer: answer
            });
        } catch (error) {
            console.error('Answer oluşturma hatası:', error);
        }
    }
    
    async handleAnswer(data) {
        const { from, answer } = data;
        
        const peerConnection = this.peers.get(from);
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(answer);
            } catch (error) {
                console.error('Answer işleme hatası:', error);
            }
        }
    }
    
    async handleIceCandidate(data) {
        const { from, candidate } = data;
        
        const peerConnection = this.peers.get(from);
        if (peerConnection && candidate) {
            try {
                await peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('ICE candidate ekleme hatası:', error);
            }
        }
    }
    
    createPeerConnection(peerId) {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        });
        
        peerConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    to: peerId,
                    from: this.userId,
                    candidate: event.candidate
                });
            }
        });
        
        peerConnection.addEventListener('track', (event) => {
            console.log('Remote track alındı:', peerId);
            const remoteStream = event.streams[0];
            this.addRemoteAudio(peerId, remoteStream);
        });
        
        peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Peer ${peerId} bağlantı durumu:`, peerConnection.connectionState);
            
            if (peerConnection.connectionState === 'failed') {
                console.log(`Peer ${peerId} bağlantısı başarısız oldu`);
                this.handleUserLeft({ userId: peerId });
            }
        });
        
        return peerConnection;
    }
    
    addRemoteAudio(userId, stream) {
        let audioElement = document.getElementById(`audio-${userId}`);
        
        if (!audioElement) {
            audioElement = document.createElement('audio');
            audioElement.id = `audio-${userId}`;
            audioElement.autoplay = true;
            audioElement.volume = this.isDeafened ? 0 : (this.volumeSlider.value / 100);
            this.remoteAudios.appendChild(audioElement);
        }
        
        audioElement.srcObject = stream;
    }
    
    setMasterVolume(volume) {
        if (this.isDeafened) return;
        
        const audioElements = this.remoteAudios.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = volume;
        });
    }
    
    updateUsersList(users) {
        this.userCount.textContent = `${users.length} kullanıcı aktif`;
        
        if (users.length === 0) {
            this.voiceUsers.innerHTML = `
                <div class="empty-channel">
                    <i class="fas fa-user-friends"></i>
                    <p>Kanal boş... İlk sen katıl!</p>
                </div>
            `;
            return;
        }
        
        this.voiceUsers.innerHTML = '';
        
        users.forEach((user, index) => {
            const userElement = document.createElement('div');
            userElement.className = 'voice-user';
            userElement.id = `user-${user.id}`;
            userElement.style.animationDelay = `${index * 0.1}s`;
            
            if (user.isMuted) {
                userElement.classList.add('muted');
            }
            
            const avatarId = user.avatar || '1';
            const avatar = this.avatars[avatarId];
            const displayName = user.id === this.userId ? 'Sen' : (user.username || user.id);
            
            userElement.innerHTML = `
                <div class="avatar-circle" style="background: ${avatar.bg}">
                    <i class="${avatar.icon}"></i>
                </div>
                <div class="username">${displayName}</div>
                <div class="user-status ${user.isMuted ? 'status-muted' : 'status-active'}">
                    <i class="fas ${user.isMuted ? 'fa-microphone-slash' : 'fa-microphone'}"></i>
                    ${user.isMuted ? 'Susturuldu' : 'Aktif'}
                </div>
            `;
            
            // Add entrance animation
            userElement.style.opacity = '0';
            userElement.style.transform = 'translateY(20px) scale(0.9)';
            
            this.voiceUsers.appendChild(userElement);
            
            // Animate in
            setTimeout(() => {
                userElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                userElement.style.opacity = '1';
                userElement.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
    }
    
    updateStatus(message, type = '') {
        const statusSpan = this.status.querySelector('span');
        statusSpan.textContent = message;
        this.status.className = 'connection-status ' + type;
        
        // Status animation
        this.status.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.status.style.transform = 'scale(1)';
        }, 200);
    }
    
    handleDisconnect() {
        this.isConnected = false;
        this.peers.clear();
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        this.joinBtn.disabled = false;
        this.joinBtn.innerHTML = '<i class="fas fa-headphones"></i> Sesli Kanala Katıl';
        this.leaveBtn.disabled = true;
        this.muteBtn.disabled = true;
        this.deafenBtn.disabled = true;
        
        this.remoteAudios.innerHTML = '';
        this.voiceUsers.innerHTML = `
            <div class="empty-channel">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Bağlantı kesildi... Yeniden deneyin</p>
            </div>
        `;
        
        this.showNotification('Sunucu bağlantısı kesildi 😔', 'error');
    }
    
    // ========================
    // Chat System Methods
    // ========================
    
    initializeChatSystem() {
        // Chat input'u başlangıçta devre dışı
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        
        // Mesaj sayacını güncelle
        this.updateMessageCount();
    }
    
    initializeTabSystem() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    initializeChatEvents() {
        // Send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Typing indicator
        this.chatInput.addEventListener('input', () => this.handleTyping());
        
        // Auto-resize input
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.tabContents.forEach(content => {
            const isActive = content.id === `${tabName}-tab`;
            content.classList.toggle('active', isActive);
        });
        
        this.currentTab = tabName;
        
        // Enable/disable chat input based on connection
        if (tabName === 'chat' && this.isConnected) {
            this.chatInput.disabled = false;
            this.sendBtn.disabled = false;
            setTimeout(() => this.chatInput.focus(), 100);
        }
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || !this.isConnected) return;
        
        // Clear input
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        
        // Send to server
        this.socket.emit('chat-message', {
            userId: this.userId,
            username: this.username,
            avatar: this.selectedAvatar,
            message: message,
            timestamp: Date.now()
        });
        
        // Add to local messages immediately
        this.addMessage({
            userId: this.userId,
            username: this.username,
            avatar: this.selectedAvatar,
            message: message,
            timestamp: Date.now(),
            isOwn: true
        });
    }
    
    addMessage(data) {
        const { userId, username, avatar, message, timestamp, isOwn = false } = data;
        
        // Remove empty chat if exists
        const emptyChat = this.chatMessages.querySelector('.empty-chat');
        if (emptyChat) {
            emptyChat.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isOwn ? 'my-message' : ''}`;
        
        const avatarData = this.avatars[avatar] || this.avatars['1'];
        const timeStr = new Date(timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-circle" style="background: ${avatarData.bg}">
                    <i class="${avatarData.icon}"></i>
                </div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">${username}</span>
                    <span class="message-timestamp">${timeStr}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        // Add message to container
        this.chatMessages.appendChild(messageEl);
        
        // Update message count
        this.messageCount++;
        this.updateMessageCount();
        
        // Auto-scroll to bottom
        this.scrollToBottom();
        
        // Show notification if not in chat tab
        if (this.currentTab !== 'chat' && !isOwn) {
            this.showNotification(`${username}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`, 'info');
        }
    }
    
    handleTyping() {
        if (!this.isConnected) return;
        
        // Clear previous timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Send typing start if not already typing
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing-start', {
                userId: this.userId,
                username: this.username
            });
        }
        
        // Set timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.socket.emit('typing-stop', {
                userId: this.userId
            });
        }, 2000);
    }
    
    showTypingIndicator(username) {
        this.typingIndicator.innerHTML = `<span></span>${username} yazıyor...`;
        this.typingIndicator.classList.add('active');
    }
    
    hideTypingIndicator() {
        this.typingIndicator.classList.remove('active');
    }
    
    updateMessageCount() {
        if (this.messageCount) {
            this.messageCount.textContent = `${this.messageCount} mesaj`;
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    // Başlangıçta ana uygulamayı gizle
    document.getElementById('mainApp').style.display = 'none';
    
    // Smooth loading animation
    setTimeout(() => {
        // VoxChat'i başlat
        new VoxChat();
    }, 500);
});