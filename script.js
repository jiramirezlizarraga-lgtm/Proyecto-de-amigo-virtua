document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const micBtn = document.getElementById('micBtn');
    const attachBtn = document.getElementById('attachBtn');
    const imageInput = document.getElementById('imageInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const headerStatus = document.getElementById('headerStatus');
    const emojiToggleBtn = document.getElementById('emojiToggleBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiBtns = document.querySelectorAll('.emoji-btn');

    let memoriaConversacion = { ultimoTema: null, nombreUsuario: null };

    userInput.addEventListener('input', () => {
        if (userInput.value.trim().length > 0) {
            sendButton.style.display = 'flex';
            micBtn.style.display = 'none';
        } else {
            sendButton.style.display = 'none';
            micBtn.style.display = 'flex';
        }
    });

    emojiToggleBtn.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
    });

    emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value += btn.textContent;
            userInput.focus();
            userInput.dispatchEvent(new Event('input'));
        });
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiToggleBtn.contains(e.target)) {
            emojiPicker.style.display = 'none';
        }
    });

    function addMessage(content, sender, type = 'text') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        if (type === 'text') {
            messageDiv.textContent = content;
        } else if (type === 'image') {
            const img = document.createElement('img');
            img.src = content;
            img.classList.add('chat-img');
            messageDiv.appendChild(img);
        } else if (type === 'audio') {
            messageDiv.innerHTML = `
                <div class="audio-msg">
                    <button class="audio-play-btn">▶</button>
                    <div class="audio-wave"></div>
                    <span style="font-size:0.75rem; color:#667781;">0:04</span>
                </div>
            `;
        }

        if (typingIndicator && typingIndicator.parentNode === chatMessages) {
            chatMessages.insertBefore(messageDiv, typingIndicator);
        } else {
            chatMessages.appendChild(messageDiv);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping(show, texto = "escribiendo...") {
        headerStatus.textContent = show ? texto : "en línea";
        if (typingIndicator) {
            typingIndicator.style.display = show ? 'block' : 'none';
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Funcionalidad para abrir la Galería o la Cámara según el dispositivo
    attachBtn.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                addMessage(event.target.result, 'user', 'image');
                showTyping(true, "grabando audio...");
                
                setTimeout(() => {
                    showTyping(false);
                    addMessage("¡Ay, qué bonita foto mandaste! 📸 Me encantó. ¿Qué es?", 'valeria');
                }, 2000);
            }
            reader.readAsDataURL(file);
        }
    });

    micBtn.addEventListener('click', () => {
        addMessage("", 'user', 'audio');
        showTyping(true, "grabando audio...");

        setTimeout(() => {
            showTyping(false);
            const respuestasAudio = [
                "¡Ay, qué lindo escucharte! 🎤 Me da mucha alegría recibir tus audios. Oye, ¿qué más me cuentas?",
                "Jajaja me da risa tu tono de voz por audios. Oye, ¿hiciste planes para hoy? 🎧✨",
            ];
            addMessage(respuestasAudio[Math.floor(Math.random() * respuestasAudio.length)], 'valeria');
        }, 2200);
    });

    function obtenerRespuestaValeria(textoUsuario) {
        const text = textoUsuario.toLowerCase();

        if (text.includes('suicid') || text.includes('hacerme daño') || text.includes('quitarme la vida') || text.includes('morir')) {
            return "Ay, me das mucha preocupación al leer eso... 🫂 Escúchame bien: te quiero mucho, pero soy una amiga virtual y no puedo reemplazar a un psicólogo. Por favor, busca ayuda profesional o llama a una línea de emergencia. ❤️";
        }

        if (text.includes('f1') || text.includes('formula 1') || text.includes('carrera') || text.includes('checo') || text.includes('verstappen')) {
            return "¡Ay, me fascina que hablemos de esto! 🏎️💨 La F1 es una locura total. ¿A qué piloto apoyas tú en esta temporada?";
        }

        if (text.includes('triste') || text.includes('mal') || text.includes('llorar') || text.includes('😢')) {
            return "Ay, ven acá virtualmente... 🫂 Siento mucho que estés pasando por un momento feo. Si quieres desahogarte, aquí estoy con todo el corazón. 💖";
        }

        if (text.includes('hola') || text.includes('buenas')) {
            return "¡Hola! Qué gusto saludarte por aquí. 😊 ¿Qué andas haciendo hoy? ✨";
        }

        const gen = [
            "Oye, qué interesante lo que dices... 🤔 Platícame más de eso.",
            "Jajaja ¡qué ocurrencia! Pero tiene todo el sentido del mundo. 😂",
            "Siento que le atinas a algo importante con eso. ¿Desde cuándo te llama la atención? 😉"
        ];
        return gen[Math.floor(Math.random() * gen.length)];
    }

    function manejarEnvio() {
        const texto = userInput.value.trim();
        if (texto === "") return;

        addMessage(texto, 'user', 'text');
        userInput.value = "";
        userInput.dispatchEvent(new Event('input'));
        emojiPicker.style.display = 'none';

        showTyping(true, "escribiendo...");

        setTimeout(() => {
            showTyping(false);
            const respuesta = obtenerRespuestaValeria(texto);
            addMessage(respuesta, 'valeria', 'text');
        }, 1200);
    }

    sendButton.addEventListener('click', manejarEnvio);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') manejarEnvio();
    });
});