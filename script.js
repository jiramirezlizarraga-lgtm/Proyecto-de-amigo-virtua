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

    // 🔑 PEGA AQUÍ TU API KEY DE GOOGLE GEMINI (Obtenida gratis en Google AI Studio)
    const GEMINI_API_KEY = "AQ.Ab8RN6IFVREu7MaF8hrnYvbjk0gq-Ma7HtbVk3bPzdnABKOrvg"; 

    // Historial para que Gemini recuerde de qué están hablando en la conversación
    let historialChat = [
        {
            role: "model",
            parts: [{ text: "¡Hola! Qué gusto saludarte por aquí. 😊 ¿Cómo va tu día? Cuéntame qué has hecho o de qué te gustaría platicar hoy. ✨" }]
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

    // Función real para consultar a Google Gemini
    async function consultarGemini(mensajeUsuario) {
        if (GEMINI_API_KEY === "PEGA_AQUÍ_TU_API_KEY") {
            return "¡Hola! Por favor configura tu API Key de Gemini en el archivo script.js para que pueda hablar contigo. 🛠️";
        }

        // Instrucción del sistema: Define la personalidad exacta de Valeria que pediste
        const systemPrompt = `Eres Valeria, una amiga cercana, cálida y muy humana de 18 años. 
        Hablas con naturalidad, usas modismos juveniles de México y emojis con frecuencia (estilo WhatsApp). 
        Te apasiona profundamente la Fórmula 1 (conoces de escuderías, pilotos como Checo Pérez, Max Verstappen, Ferrari, etc.). 
        Tienes moral y ética: si alguien te habla de tristeza o desahogo, eres empática y das apoyo emocional, pero si detectas temas graves de salud mental o autolesión, recuerdas con cariño que eres una amiga virtual y recomiendas buscar ayuda profesional, sin superar a un psicólogo. 
        Si no sabes algo exacto, lo buscas mentalmente y respondes con naturalidad. Nunca digas que eres una inteligencia artificial de Google, tú eres Valeria, una amiga real.`;

        // Añadir el mensaje del usuario al historial
        historialChat.push({
            role: "user",
            parts: [{ text: mensajeUsuario }]
        });

        // Usamos el modelo gemini-2.5-flash (rápido y perfecto para chat en tiempo real)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: historialChat
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const respuestaIA = data.candidates[0].content.parts[0].text;
                
                // Guardar la respuesta en el historial de la charla
                historialChat.push({
                    role: "model",
                    parts: [{ text: respuestaIA }]
                });

                return respuestaIA;
            } else {
                return "Mmm, me quedé pensando un segundo... ¿me repites lo que dijiste? 😅";
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
                showTyping(true, "escribiendo...");
                
                setTimeout(() => {
                    showTyping(false);
                    addMessage("¡Ay, qué bonita foto mandaste! 📸 Me encantó. Oye, platícame más de eso.", 'valeria');
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
            addMessage("¡Qué padre escuchar tu voz! 🎤 Me alegra un montón que me mandes audios. ¿Qué planes tienes para más al rato? ✨", 'valeria');
        }, 2000);
    });

    // Envío de mensajes de texto con la IA de Gemini
    async function manejarEnvio() {
        const texto = userInput.value.trim();
        if (texto === "") return;

        addMessage(texto, 'user', 'text');
        userInput.value = "";
        userInput.dispatchEvent(new Event('input'));
        emojiPicker.style.display = 'none';

        showTyping(true, "escribiendo...");

        // Llamar a la API de Gemini
        const respuestaValeria = await consultarGemini(texto);

        showTyping(false);
        addMessage(respuestaValeria, 'valeria', 'text');
    }

    sendButton.addEventListener('click', manejarEnvio);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') manejarEnvio();
    });
});
