// Data de hoje
function formatarData() {
    const hoje = new Date();
    const opcoes = { day:'2-digit', month:'long', year:'numeric' };
    document.getElementById("dataHoje").innerText = hoje.toLocaleDateString("pt-BR", opcoes);
}

// Carregar entradas salvas
function carregarEntradas() {
    const entradas = JSON.parse(localStorage.getItem('entradasDiario')) || [];
    const section = document.getElementById('entradas');
    section.innerHTML = '';
    entradas.slice().reverse().forEach(entrada => adicionarEntradaNaTela(entrada));
}

// Adicionar entrada na tela
function adicionarEntradaNaTela({ data, reflexao, meta, passo }) {
    const div = document.createElement('div');
    div.className = 'entrada';
    div.innerHTML = `
        <div class="data">${data}</div>
        <div><b>Reflexão:</b> ${reflexao}</div>
        <div><b>Meta:</b> ${meta}</div>
        <div><b>Pequeno passo:</b> ${passo}</div>
    `;
    document.getElementById('entradas').appendChild(div);
}

// Salvar nova entrada
document.addEventListener("DOMContentLoaded", function() {
    formatarData();
    carregarEntradas();

    document.getElementById('diario-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const reflexao = document.getElementById('reflexao').value.trim();
        const meta = document.getElementById('meta').value.trim();
        const passo = document.getElementById('passo').value.trim();
        if (!reflexao || !meta || !passo) {
            document.getElementById("feedback").innerText = "Preencha todos os campos!";
            setTimeout(()=>document.getElementById("feedback").innerText="",2000);
            return;
        }
        const data = document.getElementById("dataHoje").innerText;
        const novaEntrada = { data, reflexao, meta, passo };
        const entradas = JSON.parse(localStorage.getItem('entradasDiario')) || [];
        entradas.push(novaEntrada);
        localStorage.setItem('entradasDiario', JSON.stringify(entradas));
        document.getElementById("feedback").innerText = "✔ Entrada salva!";
        setTimeout(()=>document.getElementById("feedback").innerText="",2000);
        document.getElementById('reflexao').value = '';
        document.getElementById('meta').value = '';
        document.getElementById('passo').value = '';
        carregarEntradas();
    });
});
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

