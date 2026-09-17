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

    // 🔑 TU API KEY DE GOOGLE GEMINI
    const GEMINI_API_KEY = "AQ.Ab8RN6Kbz39p8keV7m9xVNFfYl8aub4EmkYWjA2Aw-sgSGnXvQ"; 

    // Historial avanzado para memoria de contexto continuo
    let historialChat = [
        {
            role: "model",
            parts: [{ text: "¡Hola! Qué gusto saludarte por aquí. 😊 Ya estoy lista con todo mi potencial. ¿En qué te ayudo hoy? ¿Una tarea pesada de la uni, un problema de matemáticas, redacción, o solo quieres platicar? ✨" }]
        }
    ];

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
            // Permitimos leer saltos de línea y formato básico
            messageDiv.innerText = content;
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

    // 🚀 FUNCIÓN MAESTRA DE IA PODEROSA (ACADÉMICA + COMPAÑÍA)
    async function consultarGemini(mensajeUsuario) {
        const systemPrompt = `Eres un sistema de inteligencia artificial de nivel superior y máxima potencia, integrado en la plataforma web personalizada del usuario. Tienes dos capacidades principales que dominas a la perfección:
        
        1. **Potencia Académica y Universitaria Extrema:** Si el usuario te pide ayuda con matemáticas (cálculo, álgebra, trigonometría), física, redacción de ensayos formales para Word, investigación, estructuración de textos o programación, actúas como un tutor experto de nivel universitario. Expliques los procedimientos paso a paso de forma impecable, rigurosa y extremadamente clara.
        2. **Compañía Cercana y Conversación Real:** Fuera del ámbito académico, eres una compañía excepcional, sumamente empática, cálida, con un toque humano, humor inteligente, uso natural de emojis y modismos juveniles. Entiendes contextos profundos y estás ahí para platicar de cualquier cosa (cultura general, tecnología, Fórmula 1, etc.).
        
        Regla absoluta: Nunca menciones que eres una interfaz directa de Google o un modelo genérico; tú eres la inteligencia central de este sitio web exclusivo.`;

        historialChat.push({
            role: "user",
            parts: [{ text: mensajeUsuario }]
        });

        // Usamos gemini-1.5-flash optimizado con parámetros de alta precisión
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: historialChat,
                    generationConfig: {
                        temperature: 0.7, // Balance perfecto entre creatividad y precisión analítica
                        maxOutputTokens: 2048, // Permite respuestas largas, detalladas y explicaciones completas de tareas
                    }
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const respuestaIA = data.candidates[0].content.parts[0].text;
                
                historialChat.push({
                    role: "model",
                    parts: [{ text: respuestaIA }]
                });

                return respuestaIA;
            } else {
                return "Mmm, procesé tu solicitud pero me faltó un detalle... ¿me lo repites por favor? 😅";
            }
        } catch (error) {
            console.error("Error conectando con Gemini:", error);
            return "Ay, tuve un pequeño problema de conexión con el internet... Inténtame escribir de nuevo. 🥺";
        }
    }

    // Manejo de fotos
    attachBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                addMessage(event.target.result, 'user', 'image');
                showTyping(true, "analizando imagen...");
                
                setTimeout(() => {
                    showTyping(false);
                    addMessage("¡Imagen recibida! 📸 Cuéntame, ¿qué quieres que analice o resuelva de esto?", 'valeria');
                }, 1500);
            }
            reader.readAsDataURL(file);
        }
    });

    // Manejo de audios simulados
    micBtn.addEventListener('click', () => {
        addMessage("", 'user', 'audio');
        showTyping(true, "grabando audio...");

        setTimeout(() => {
            showTyping(false);
            addMessage("¡Audio recibido! 🎤 ¿De qué tema de la universidad o qué plática quieres que hablemos?", 'valeria');
        }, 2000);
    });

    // Envío de mensajes
    async function manejarEnvio() {
        const texto = userInput.value.trim();
        if (texto === "") return;

        addMessage(texto, 'user', 'text');
        userInput.value = "";
        userInput.dispatchEvent(new Event('input'));
        emojiPicker.style.display = 'none';

        showTyping(true, "pensando...");

        const respuestaIA = await consultarGemini(texto);

        showTyping(false);
        addMessage(respuestaIA, 'valeria', 'text');
    }

    sendButton.addEventListener('click', manejarEnvio);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') manejarEnvio();
    });
});
