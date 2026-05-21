// ===================================================
// 1. INICIALIZAÇÃO DO PLACAR, XP E ESTRUTURA DO MODAL
// ===================================================
const placarDinheiro = document.createElement('div');
placarDinheiro.className = 'placar-berries';
placarDinheiro.innerHTML = `<h5>Recompensa Coletada</h5><div class="valor-total" id="total-berries">฿ 0</div>`;
document.body.appendChild(placarDinheiro);

const placarXp = document.createElement('div');
placarXp.className = 'placar-nivel';
placarXp.innerHTML = `
    <h6>Patente Pirata</h6>
    <div class="titulo-patente" id="nome-patente">Recruta Clevel</div>
    <div class="barra-xp-container"><div class="barra-xp-preenchimento" id="progresso-xp"></div></div>
`;
document.body.appendChild(placarXp);

const lightbox = document.createElement('div');
lightbox.className = 'modal-lightbox';
lightbox.id = 'modal-lightbox';
lightbox.innerHTML = `<div class="modal-conteudo"><span class="modal-fechar" id="modal-fechar">&times;</span><img id="modal-img" src="" alt="Ampliada"><div id="modal-legenda" class="modal-legenda"></div></div>`;
document.body.appendChild(lightbox);

const modalImg = document.getElementById('modal-img');
const modalLegenda = document.getElementById('modal-legenda');
const totalBerriesElement = document.getElementById('total-berries');
const progressoXpElement = document.getElementById('progresso-xp');
const nomePatenteElement = document.getElementById('nome-patente');
const modalLightboxElement = document.getElementById('modal-lightbox');
const btnFecharModal = document.getElementById('modal-fechar');

// Banco de dados de recompensas oficiais do anime
const valoresRecompensas = { 
    "Monkey D. Luffy": 3000000000, 
    "Roronoa Zoro": 1111000000, 
    "Nami": 366000000, 
    "Vinsmoke Sanji": 1032000000, 
    "Usopp": 500000000, 
    "Tony Tony Chopper": 1000, 
    "Nico Robin": 930000000, 
    "Brook": 383000000, 
    "Franky": 394000000, 
    "Jinbe": 1100000000 
};

let recompensaAcumulada = 0, pirataXp = 0;
const tripulantesVistos = new Set(), paginasVistas = new Set();
let conquistasLiberadas = { desbravador: false, recrutador: false, yonkou: false, supremo: false };

// Carrega os valores salvos anteriormente no navegador (para não perder os Berries ao mudar de página)
if(localStorage.getItem('berries')) {
    recompensaAcumulada = parseInt(localStorage.getItem('berries'));
    totalBerriesElement.innerText = `฿ ${recompensaAcumulada.toLocaleString('pt-BR')}`;
}
if(localStorage.getItem('xp')) {
    pirataXp = parseInt(localStorage.getItem('xp'));
    progressoXpElement.style.width = pirataXp + "%";
    atualizarNomePatente();
}

function ganharXP(quantidade) {
    if (pirataXp >= 100) return;
    pirataXp += quantidade;
    if (pirataXp > 100) pirataXp = 100;
    
    localStorage.setItem('xp', pirataXp);
    progressoXpElement.style.width = pirataXp + "%";
    atualizarNomePatente();
}

function atualizarNomePatente() {
    if (pirataXp >= 30 && pirataXp < 70) nomePatenteElement.innerText = "Supernova";
    if (pirataXp >= 70 && pirataXp < 100) { nomePatenteElement.innerText = "Comandante"; nomePatenteElement.style.color = "#a855f7"; }
    if (pirataXp >= 100 && !conquistasLiberadas.supremo) {
        conquistasLiberadas.supremo = true;
        nomePatenteElement.innerText = "Yonkou 🏴‍☠️";
        nomePatenteElement.style.color = "#ef4444";
        setTimeout(() => dispararNotificacao("Lenda dos Mares", "Você atingiu o nível máximo de Haki e virou um Imperador Yonkou!"), 500);
    }
}

function adicionarBerries(quantidade) {
    recompensaAcumulada += quantidade;
    localStorage.setItem('berries', recompensaAcumulada); // Salva para o jogo.html ler
    totalBerriesElement.innerText = `฿ ${recompensaAcumulada.toLocaleString('pt-BR')}`;
}

// ===================================================
// 2. CLIQUE NAS IMAGENS (AMPLIAR E GANHAR RECOMPENSA)
// ===================================================
document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('click', function() {
        const nomePersonagem = this.querySelector('.nome-personagem').innerText;
        const srcImagem = this.querySelector('.frente img').src;
        const valorRecompensa = valoresRecompensas[nomePersonagem] || 0;

        // 1. Abre o modal com a imagem expandida
        modalImg.src = srcImagem;
        modalLightboxElement.classList.add('ativo');

        // 2. Verifica se o usuário já coletou esse pirata para não pontuar infinitamente
        if (!tripulantesVistos.has(nomePersonagem)) {
            tripulantesVistos.add(nomePersonagem);
            
            // Soma o valor da recompensa do bando ao placar de Berries
            adicionarBerries(valorRecompensa);
            ganharXP(8); // Dá XP por descobrir um tripulante
            
            modalLegenda.innerHTML = `
                <h3 style="color: #fbbf24; font-size: 1.5rem;">${nomePersonagem}</h3>
                <p style="color: #10b981; font-weight: bold; font-size: 1.2rem; margin-top: 5px;">
                    💰 Recompensa Reivindicada: ฿ ${valorRecompensa.toLocaleString('pt-BR')}!
                </p>
            `;
            
            verificarConquistas();
        } else {
            // Se já foi visto, apenas mostra os detalhes normais sem pagar de novo
            modalLegenda.innerHTML = `
                <h3 style="color: #fbbf24;">${nomePersonagem}</h3>
                <p style="color: #9ca3af; margin-top: 5px;">Recompensa já coletada anteriormente: ฿ ${valorRecompensa.toLocaleString('pt-BR')}</p>
            `;
        }
    });
});

// Fechar o Modal clicando no X ou fora da imagem
btnFecharModal.addEventListener('click', () => modalLightboxElement.classList.remove('ativo'));
modalLightboxElement.addEventListener('click', (e) => { if(e.target === modalLightboxElement) modalLightboxElement.classList.remove('ativo'); });

// ===================================================
// 3. EFEITOS DO MOUSE (FAÍSCAS) E ANIMAÇÃO DO HAKI
// ===================================================
window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.15) {
        const faisca = document.createElement('div'); faisca.className = 'faisca-ouro';
        faisca.style.left = e.clientX + 'px'; faisca.style.top = e.clientY + 'px';
        document.body.appendChild(faisca); setTimeout(() => faisca.remove(), 600);
    }
});

let tempoCliqueInicial = 0;
window.addEventListener('mousedown', () => { tempoCliqueInicial = Date.now(); });

window.addEventListener('mouseup', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A' || e.target.closest('.card-3d')) return;
    
    const duracaoClique = Date.now() - tempoCliqueInicial;
    const haki = document.createElement('div');

    if (duracaoClique > 600) { 
        haki.className = 'onda-haki-avancado';
        ganharXP(5); 
    } else {
        haki.className = 'onda-haki'; 
    }

    haki.style.left = e.pageX + 'px'; haki.style.top = e.pageY + 'px';
    document.body.appendChild(haki); setTimeout(() => haki.remove(), 600);
});

// ===================================================
// 4. ÁREA DE NOTIFICAÇÕES DE CONQUISTAS GAMER
// ===================================================
const containerNotificacao = document.createElement('div');
containerNotificacao.className = 'area-conquistas'; document.body.appendChild(containerNotificacao);

function dispararNotificacao(titulo, desc) {
    const box = document.createElement('div'); box.className = 'alerta-conquista';
    box.innerHTML = `<div class="medalha">🏆</div><div><h4>${titulo}</h4><p>${desc}</p></div>`;
    containerNotificacao.appendChild(box);
    setTimeout(() => { box.style.opacity = '0'; box.style.transform = 'translateX(50px)'; box.style.transition = 'all 0.5s ease'; setTimeout(() => box.remove(), 500); }, 4000);
}

function verificarConquistas() {
    if (!conquistasLiberadas.recrutador && tripulantesVistos.size >= 3) { 
        conquistasLiberadas.recrutador = true; 
        dispararNotificacao("Recrutador de Elite", "Você inspecionou as fichas de combate da tripulação e coletou Berries!"); 
    }
}

// ===================================================
// 5. ROLETA DE CARGOS PIRATA (APENAS 1 BOTÃO)
// ===================================================
const painelControle = document.querySelector('.painel-controle');
if (painelControle) {
    const btnRoleta = document.createElement('button'); 
    btnRoleta.className = 'btn-interativo btn-roleta'; 
    btnRoleta.innerText = '🎲 Meu Cargo Pirata'; 
    painelControle.appendChild(btnRoleta);

    const cargos = [
        { nome: "Capitão", desc: "Você lidera o bando com espírito livre!", cor: "#ef4444" }, 
        { nome: "Espadachim", desc: "Você treina para ser o maior combatente do mundo!", cor: "#10b981" }, 
        { nome: "Navegador(a)", desc: "Sua inteligência guia o navio pelas tormentas!", cor: "#3b82f6" }, 
        { nome: "Cozinheiro", desc: "Suas mãos protegem a cozinha e seus chutes quebram tudo!", cor: "#f59e0b" }, 
        { nome: "Arqueólogo(a)", desc: "Você decifra mistérios antigos e o Século Perdido!", cor: "#14b8a6" }, 
        { nome: "Médico(a)", desc: "Você busca a cura para todas as doenças do planeta!", cor: "#ec4899" }
    ];

    btnRoleta.addEventListener('click', () => {
        btnRoleta.disabled = true; let voltas = 0; modalImg.src = "image/one-piece-logo.png"; modalLightboxElement.classList.add('ativo');
        const intervalo = setInterval(() => {
            const randomCargo = cargos[Math.floor(Math.random() * cargos.length)];
            modalLegenda.innerHTML = `<span style="color:${randomCargo.cor}; font-size:24px; font-weight:900;">Sorteando: ${randomCargo.nome}</span>`; voltas++;
            if (voltas > 12) {
                clearInterval(intervalo); const resultado = cargos[Math.floor(Math.random() * cargos.length)];
                modalLegenda.innerHTML = `<div style="text-align:center; padding:10px;"><h2 style="color:${resultado.cor}; font-size:2rem; font-weight:900; margin-bottom:10px;">Você é o ${resultado.nome}!</h2><p style="font-size:1.1rem; color:#cbd5e1; line-height:1.5;">${resultado.desc}</p></div>`;
                btnRoleta.disabled = false; ganharXP(10);
                if (!conquistasLiberadas.yonkou) { conquistasLiberadas.yonkou = true; setTimeout(() => dispararNotificacao("Destino Selado", "Você definiu sua própria função na Grand Line!"), 800); }
            }
        }, 120);
    });
}

// ===================================================
// 6. MECÂNICAS DE SCROLL REVEAL E BUSCA
// ===================================================
const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('show'); if (entry.target.classList.contains('container')) { const cards = entry.target.querySelectorAll('.card-3d'); cards.forEach((card, i) => setTimeout(() => card.classList.add('show'), i * 120)); } else if (entry.target.tagName === 'SECTION') { const titulo = entry.target.querySelector('h1.hidden'); const paragrafo = entry.target.querySelector('p.hidden'); if (titulo) setTimeout(() => titulo.classList.add('show'), 150); if (paragrafo) setTimeout(() => paragrafo.classList.add('show'), 350); } } else { entry.target.classList.remove('show'); entry.target.querySelectorAll('.hidden').forEach(el => el.classList.remove('show')); } }); }, { threshold: 0.1 });
document.querySelectorAll('section, .container, .painel-controle').forEach(el => observer.observe(el));

const inputBusca = document.getElementById('busca-pirata'); 
if (inputBusca) { 
    inputBusca.addEventListener('input', (e) => { 
        const termo = e.target.value.toLowerCase().trim(); 
        document.querySelectorAll('.card-3d').forEach(card => { 
            const nomePirata = card.getAttribute('data-nome'); 
            if (nomePirata && nomePirata.includes(termo)) card.style.display = "block"; 
            else card.style.display = "none"; 
        }); 
    }); 
}

const btnSom = document.getElementById('btn-som'); const somMar = document.getElementById('som-mar'); if (btnSom && somMar) { btnSom.addEventListener('click', () => { if (somMar.paused) { somMar.play().catch(() => console.log("Permissão necessária.")); btnSom.innerText = "静 🔇 Desligar"; btnSom.style.background = "#ef4444"; } else { somMar.pause(); btnSom.innerText = "🎵 Som do Mar"; btnSom.style.background = "rgba(15, 23, 42, 0.6)"; } }); }
