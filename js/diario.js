/* diario.js
   Funcionalidade do diário: salvar, listar, ver, editar, excluir.
   Usa localStorage com a chave "psicia_diario_entries".
*/

(function () {
  const STORAGE_KEY = "psicia_diario_entries";

  // Seleções dos elementos (assume a estrutura do seu HTML)
  const textoBoxes = document.querySelectorAll(".grid-inputs .box .texto");
  const btns = document.querySelectorAll(".acoes .btn-acao");

  // Mapear botões pelo texto (para evitar dependência de ordem)
  const btnSalvar = Array.from(btns).find(b => b.textContent.trim().toLowerCase() === "salvar");
  const btnVer = Array.from(btns).find(b => b.textContent.trim().toLowerCase().includes("anota"));
  const btnMetas = Array.from(btns).find(b => b.textContent.trim().toLowerCase() === "metas");
  const btnDias = Array.from(btns).find(b => b.textContent.trim().toLowerCase().includes("anteriores"));

  // Helpers de storage
  function lerEntradas() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Erro ao ler entradas:", e);
      return [];
    }
  }

  function salvarEntradas(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  // Pegar valores das 3 caixas
  function pegarValores() {
    const [dia, metas, grat] = Array.from(textoBoxes).map(t => t.value.trim());
    return { dia, metas, grat };
  }

  // Limpar caixas
  function limparCaixas() {
    textoBoxes.forEach(t => t.value = "");
  }

  // Criar entrada e salvar
  function criarEntrada() {
    const { dia, metas, grat } = pegarValores();
    if (!dia && !metas && !grat) {
      alert("Escreva algo antes de salvar (pelo menos em um dos campos).");
      return;
    }

    const entradas = lerEntradas();
    const nova = {
      id: gerarId(),
      dataCriacao: new Date().toISOString(),
      dia,
      metas,
      grat
    };

    entradas.unshift(nova); // adiciona no começo
    salvarEntradas(entradas);
    limparCaixas();
    mostrarToast("Entrada salva com sucesso!");
  }

  // Toast simples
  function mostrarToast(msg, dur = 2200) {
    const t = document.createElement("div");
    t.className = "psicia-toast";
    t.textContent = msg;
    Object.assign(t.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      background: "#071e3d",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "10px",
      zIndex: 99999,
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
      fontWeight: 600
    });
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = "0.0", dur - 300);
    setTimeout(() => t.remove(), dur);
  }

  // Modal / overlay para mostrar listas e visualizações
  function criarOverlay() {
    // Se já existir, zera
    let overlay = document.getElementById("psicia-overlay");
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.id = "psicia-overlay";
    overlay.innerHTML = `
      <div class="psicia-modal">
        <button class="psicia-close" title="Fechar">&times;</button>
        <div class="psicia-modal-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Estilos rápidos (inline para garantir funcionamento)
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(2,12,28,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99998
    });

    const modal = overlay.querySelector(".psicia-modal");
    Object.assign(modal.style, {
      width: "min(950px, 94%)",
      maxHeight: "86vh",
      overflow: "auto",
      background: "#ffffff",
      borderRadius: "14px",
      padding: "18px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)"
    });

    const closeBtn = overlay.querySelector(".psicia-close");
    Object.assign(closeBtn.style, {
      position: "absolute",
      right: "18px",
      top: "12px",
      background: "#071e3d",
      color: "#fff",
      border: "none",
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      fontSize: "22px",
      cursor: "pointer"
    });

    closeBtn.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    return overlay.querySelector(".psicia-modal-body");
  }

  // Renderizar lista de entradas (com opções ver/editar/excluir)
  function renderLista(filter = null) {
    const body = criarOverlay();
    const entradas = lerEntradas();
    let filtradas = entradas;

    if (filter === "metas") {
      filtradas = entradas.filter(e => e.metas && e.metas.trim().length > 0);
    } else if (filter === "anteriores") {
      // mantém todas ( já são anteriores ), mas lista com data decrescente
      filtradas = entradas;
    }

    if (!filtradas.length) {
      body.innerHTML = `<p style="text-align:center;padding:30px;color:#052959;font-weight:600">Nenhuma entrada encontrada.</p>`;
      return;
    }

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "12px";

    filtradas.forEach(entry => {
      const card = document.createElement("div");
      Object.assign(card.style, {
        borderLeft: "4px solid #0097b2",
        background: "#f6fbff",
        padding: "12px 14px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      });

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";

      const hTitle = document.createElement("div");
      hTitle.innerHTML = `<strong style="color:#052959">Entrada — ${new Date(entry.dataCriacao).toLocaleString()}</strong>`;
      header.appendChild(hTitle);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "8px";

      const verBtn = document.createElement("button");
      verBtn.textContent = "Ver";
      verBtn.className = "psicia-small";
      verBtn.onclick = () => mostrarEntrada(entry.id);

      const editarBtn = document.createElement("button");
      editarBtn.textContent = "Editar";
      editarBtn.className = "psicia-small";
      editarBtn.onclick = () => editarEntrada(entry.id);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Excluir";
      delBtn.className = "psicia-small danger";
      delBtn.onclick = () => {
        if (confirm("Deseja realmente excluir esta entrada?")) {
          excluirEntrada(entry.id);
          // atualizar display
          renderLista(filter);
        }
      };

      [verBtn, editarBtn, delBtn].forEach(b => {
        Object.assign(b.style, {
          padding: "6px 10px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: 700
        });
      });

      Object.assign(delBtn.style, { background: "#ff6b6b", color: "#fff" });
      Object.assign(editarBtn.style, { background: "#071e3d", color: "#fff" });
      Object.assign(verBtn.style, { background: "#0097b2", color: "#fff" });

      actions.appendChild(verBtn);
      actions.appendChild(editarBtn);
      actions.appendChild(delBtn);
      header.appendChild(actions);

      // resumo curto
      const resumo = document.createElement("div");
      resumo.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="min-width:200px"><strong>Como foi seu dia</strong><div style="margin-top:6px;color:#071e3d">${truncate(entry.dia)}</div></div>
          <div style="min-width:200px"><strong>Metas</strong><div style="margin-top:6px;color:#071e3d">${truncate(entry.metas)}</div></div>
          <div style="min-width:200px"><strong>Gratidão</strong><div style="margin-top:6px;color:#071e3d">${truncate(entry.grat)}</div></div>
        </div>
      `;

      card.appendChild(header);
      card.appendChild(resumo);
      list.appendChild(card);
    });

    body.innerHTML = "";
    body.appendChild(list);

    // estilos pequenos para botões
    const style = document.createElement("style");
    style.innerHTML = `
      .psicia-small { font-family: "Poppins", sans-serif; }
      .psicia-small.danger { background: #ff6b6b; }
    `;
    body.appendChild(style);
  }

  function truncate(text, n = 140) {
    if (!text) return "<i>— vazio —</i>";
    return text.length > n ? text.slice(0, n) + "..." : text;
  }

  // Mostrar apenas uma entrada em detalhe (no mesmo overlay)
  function mostrarEntrada(id) {
    const entradas = lerEntradas();
    const ent = entradas.find(e => e.id === id);
    if (!ent) return alert("Entrada não encontrada.");

    const body = criarOverlay();
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <h3 style="margin:0;color:#052959">Entrada de ${new Date(ent.dataCriacao).toLocaleString()}</h3>
        <div><strong>Como foi seu dia</strong><div style="margin-top:6px;padding:12px;border-radius:10px;background:#f6fbff;border-left:4px solid #0097b2">${escapeHtml(ent.dia)}</div></div>
        <div><strong>Metas do dia</strong><div style="margin-top:6px;padding:12px;border-radius:10px;background:#f6fbff;border-left:4px solid #0097b2">${escapeHtml(ent.metas)}</div></div>
        <div><strong>Gratidão do dia</strong><div style="margin-top:6px;padding:12px;border-radius:10px;background:#f6fbff;border-left:4px solid #0097b2">${escapeHtml(ent.grat)}</div></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px">
          <button id="psicia-edit-detail" style="padding:8px 12px;border-radius:8px;border:none;background:#071e3d;color:#fff;cursor:pointer">Editar</button>
          <button id="psicia-close-detail" style="padding:8px 12px;border-radius:8px;border:none;background:#0097b2;color:#fff;cursor:pointer">Fechar</button>
        </div>
      </div>
    `;

    document.getElementById("psicia-overlay").querySelector(".psicia-close").style.display = "none";
    document.getElementById("psicia-close-detail").addEventListener("click", () => {
      const ov = document.getElementById("psicia-overlay");
      if (ov) ov.remove();
    });
    document.getElementById("psicia-edit-detail").addEventListener("click", () => {
      const ov = document.getElementById("psicia-overlay");
      if (ov) ov.remove();
      editarEntrada(id);
    });
  }

  // Editar: pré-carrega valores nas caixas principais para edição
  function editarEntrada(id) {
    const entradas = lerEntradas();
    const ent = entradas.find(e => e.id === id);
    if (!ent) return alert("Entrada não encontrada para edição.");

    const [boxDia, boxMetas, boxGrat] = Array.from(textoBoxes);
    boxDia.value = ent.dia || "";
    boxMetas.value = ent.metas || "";
    boxGrat.value = ent.grat || "";


    sessionStorage.setItem("psicia_edicao_id", id);
    mostrarToast("Modo edição ativado — ao salvar, esta entrada será atualizada.");
    
    window.scrollTo({ top: document.querySelector(".diario-psicia").offsetTop - 20, behavior: "smooth" });
  }

  
  function excluirEntrada(id) {
    let entradas = lerEntradas();
    entradas = entradas.filter(e => e.id !== id);
    salvarEntradas(entradas);
    mostrarToast("Entrada excluída.");
  }

 
  function salvarOuAtualizar() {
    const idEdicao = sessionStorage.getItem("psicia_edicao_id");
    const { dia, metas, grat } = pegarValores();

    if (!dia && !metas && !grat) {
      alert("Escreva algo antes de salvar.");
      return;
    }

    const entradas = lerEntradas();

    if (idEdicao) {
     
      const idx = entradas.findIndex(e => e.id === idEdicao);
      if (idx === -1) {
        alert("ID de edição inválido — salvando como nova entrada.");
      } else {
        entradas[idx] = {
          ...entradas[idx],
          dia,
          metas,
          grat,
          dataModificacao: new Date().toISOString()
        };
        salvarEntradas(entradas);
        sessionStorage.removeItem("psicia_edicao_id");
        limparCaixas();
        mostrarToast("Entrada atualizada.");
        return;
      }
    }

    
    criarEntrada();
  }

  
  function mostrarMetas() {
    renderLista("metas");
  }

  
  function mostrarAnteriores() {
    renderLista("anteriores");
  }

  function escapeHtml(str) {
    if (!str) return "<i>— vazio —</i>";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\n", "<br>");
  }

  
  function init() {
    if (btnSalvar) btnSalvar.addEventListener("click", salvarOuAtualizar);
    if (btnVer) btnVer.addEventListener("click", () => renderLista(null));
    if (btnMetas) btnMetas.addEventListener("click", mostrarMetas);
    if (btnDias) btnDias.addEventListener("click", mostrarAnteriores);

 
    textoBoxes.forEach(t => {
      t.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter") {
          salvarOuAtualizar();
        }
      });
    });


    carregarPreview();
  }

 
  function carregarPreview() {
    const entradas = lerEntradas();
    if (!entradas.length) return;

    // cria área de preview se não existir
    let prev = document.querySelector(".psicia-preview-area");
    if (!prev) {
      prev = document.createElement("div");
      prev.className = "psicia-preview-area";
      prev.style.maxWidth = "1150px";
      prev.style.margin = "10px auto 40px";
      prev.style.display = "flex";
      prev.style.gap = "10px";
      prev.style.flexWrap = "wrap";
      document.querySelector(".diario-psicia").insertAdjacentElement("afterend", prev);
    }

    prev.innerHTML = "";
    entradas.slice(0,3).forEach(e => {
      const card = document.createElement("div");
      card.style.flex = "1 1 300px";
      card.style.background = "#fff";
      card.style.borderLeft = "4px solid #0097b2";
      card.style.padding = "10px 12px";
      card.style.borderRadius = "10px";
      card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
      card.innerHTML = `<strong style="color:#052959">${new Date(e.dataCriacao).toLocaleDateString()}</strong>
                        <div style="margin-top:6px;color:#071e3d">${truncate(e.dia,120)}</div>
                        <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">
                          <button style="padding:6px 8px;border-radius:8px;border:none;background:#0097b2;color:#fff;cursor:pointer" data-id="${e.id}" class="psicia-preview-view">Ver</button>
                        </div>`;
      prev.appendChild(card);
    });

    prev.querySelectorAll(".psicia-preview-view").forEach(b => {
      b.addEventListener("click", (ev) => {
        const id = ev.currentTarget.getAttribute("data-id");
        mostrarEntrada(id);
      });
    });
  }

  // Inicia
  init();

})();
