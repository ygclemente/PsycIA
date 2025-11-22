// --- BOAS-VINDAS ---
window.onload = function () {
  const div = document.getElementById("boas-vindas");
  if (!div) return;

  const apelido = localStorage.getItem("apelido");
  const nome = localStorage.getItem("nomeUsuario");
  const genero = localStorage.getItem("generoUsuario");
  const nomeParaMostrar = apelido && apelido !== "" ? apelido : nome;

  if (nomeParaMostrar && nomeParaMostrar !== "anonimo") {
    let saudacao;
    if (genero === "masculino")
      saudacao = `Olá, ${nomeParaMostrar}! Seja bem-vindo 🧠✨`;
    else if (genero === "feminino")
      saudacao = `Olá, ${nomeParaMostrar}! Seja bem-vinda 🧠✨`;
    else saudacao = `Olá, ${nomeParaMostrar}! Seja bem-vindo🧠✨`;
    div.innerText = saudacao;
  } else {
    div.innerText = `Olá! Você está no modo anônimo 🌙`;
  }
};



// --- ENTER PARA ENVIAR ---
const inputMsg = document.getElementById("userInput");
if (inputMsg) {
  inputMsg.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      enviarMensagem();
    }
  });
}



// --- FUNÇÃO ENVIAR MENSAGEM ---
async function enviarMensagem(event) {
  event?.preventDefault();

  const input = document.getElementById("userInput");
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  const chat = document.getElementById("chatBox");
  const chatContainer = document.querySelector(".chat-container");

  // Se a página não tiver chat, evitar erros
  if (!chat) {
    console.warn("Página sem chat. Ignorando envio.");
    return;
  }

  // --- verificação de risco ---
  const palavrasDeRisco = [
    "me matar",
    "acabar com minha vida",
    "não quero mais viver",
    "me suicidar",
    "quero morrer",
    "vida não vale a pena",
    "tirar minha vida",
  ];

  const risco = palavrasDeRisco.some((p) =>
    texto.toLowerCase().includes(p)
  );

  if (risco) {
    const alerta = document.createElement("div");
    alerta.className = "message bot alerta";
    alerta.innerHTML = `
      💛 Parece que você está passando por um momento muito difícil.<br>
      Você <strong>não está sozinho(a)</strong>.<br>
      Procure ajuda imediatamente:<br>
      <strong>CVV – 188</strong> (ligação gratuita e anônima)<br>
      ou acesse <a href="https://cvv.org.br" target="_blank">cvv.org.br</a> 💬
    `;
    chat.appendChild(alerta);
    chat.scrollTop = chat.scrollHeight;
    input.value = "";
    return;
  }

  // Exibe chat
  if (chatContainer) chatContainer.style.display = "flex";

  // Mensagem do usuário
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = texto;
  chat.appendChild(userMsg);

  // "Digitando"
  const typingMsg = document.createElement("div");
  typingMsg.className = "digitando";
  typingMsg.innerHTML =
    '💬 PsicIA está digitando <div class="typing-dots"><span></span><span></span><span></span></div>';
  chat.appendChild(typingMsg);
  chat.scrollTop = chat.scrollHeight;

  // Chamada API
  let resposta = "Desculpe, não entendi.";
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          "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"
        }`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é PsicIA, uma IA que conversa como um amigo legal. Use linguagem leve, curta (até 500 caracteres), direta e acolhedora. Use emojis. Seja empático e racional.",
          },
          { role: "user", content: texto },
        ],
      }),
    });

    const data = await response.json();
    resposta =
      data?.choices?.[0]?.message?.content?.slice(0, 500) ||
      "Desculpe, não consegui entender.";
  } catch (err) {
    resposta = `Erro na API: ${err.message || err}`;
    console.error(err);
  }

  // Mensagem do bot digitando
  setTimeout(() => {
    typingMsg.remove();

    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    chat.appendChild(botMsg);

    let i = 0;
    function digitar() {
      if (i < resposta.length) {
        botMsg.textContent += resposta.charAt(i);
        i++;
        setTimeout(digitar, 1);
        chat.scrollTop = chat.scrollHeight;
      }
    }
    digitar();
  }, 1000);

  input.value = "";
}



// --- Navegação rápida ---
function abrirRespiracao() { window.location.href = "html/respiracao.html"; }
function abrirMeditacao() { window.location.href = "html/meditacao.html"; }
function abrirGratidao() { window.location.href = "html/gratidao.html"; }
function abrirDiario() { window.location.href = "html/diario.html"; }
function acharPsicologos() {
  if (!navigator.geolocation) return alert("Geolocalização não suportada.");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      window.open(
        `https://www.google.com/maps/search/psicólogos perto de mim/@${latitude},${longitude},14z`,
        "_blank"
      );
    },
    () => alert("Não foi possível obter sua localização.")
  );
}



// --- Dark Mode ---
if (localStorage.getItem("modoNoturno") === "ativo") {
  document.body.classList.add("dark-mode");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "modoNoturno",
    document.body.classList.contains("dark-mode") ? "ativo" : "inativo"
  );
}



// --- Perfil (correção total) ---
const modalPerfil = document.getElementById("modalPerfil");

function abrirPerfil() {
  if (modalPerfil) modalPerfil.style.display = "flex";
}

function fecharPerfil() {
  if (modalPerfil) modalPerfil.style.display = "none";
}

// Fecha clicando fora
if (modalPerfil) {
  modalPerfil.addEventListener("click", (event) => {
    if (event.target === modalPerfil) fecharPerfil();
  });

  const conteudoModal = modalPerfil.querySelector(".modal-content");
  if (conteudoModal) {
    conteudoModal.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
}

function logout() {
  localStorage.removeItem("nomeUsuario");
  localStorage.removeItem("generoUsuario");
  window.location.href = "html/login.html";
}



// --- Registro de Emoções ---
function registrarEmocao(emocao) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const historico =
    JSON.parse(localStorage.getItem("historicoEmocoes")) || [];

  historico.push({ data: hoje, emocao });
  localStorage.setItem("historicoEmocoes", JSON.stringify(historico));

  const msg = document.getElementById("mensagem-registrada");
  if (msg) {
    msg.textContent = `Sua emoção "${emocao}" foi registrada!`;
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 3000);
  }
}
  