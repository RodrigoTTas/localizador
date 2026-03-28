// ── Elementos do DOM ──
const elHora = document.getElementById('hora');
const elData = document.getElementById('data');
const elDiaSemana = document.getElementById('diaSemana');
const elLocalizacao = document.getElementById('localizacao');
const elCoordenadas = document.getElementById('coordenadas');

// ── Nomes em português ──
const diasSemana = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ── Relógio e Data ──
function pad(n) {
  return String(n).padStart(2, '0');
}

function atualizarRelogio() {
  const agora = new Date();

  // Hora com dois-pontos piscando
  const h = pad(agora.getHours());
  const m = pad(agora.getMinutes());
  const s = pad(agora.getSeconds());
  elHora.innerHTML =
    `${h}<span class="colon-blink">:</span>${m}<span class="colon-blink">:</span>${s}`;

  // Data DD/MM/AAAA
  const dia = pad(agora.getDate());
  const mes = pad(agora.getMonth() + 1);
  const ano = agora.getFullYear();
  elData.textContent = `${dia}/${mes}/${ano}`;

  // Dia da semana e mês por extenso
  elDiaSemana.textContent =
    `${diasSemana[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${ano}`;
}

// Atualiza a cada segundo
atualizarRelogio();
setInterval(atualizarRelogio, 1000);

// ── Geolocalização ──
function obterLocalizacao() {
  if (!navigator.geolocation) {
    elLocalizacao.textContent = 'Geolocalização não suportada';
    return;
  }

  elLocalizacao.innerHTML = '<span class="loading">Obtendo localização…</span>';

  navigator.geolocation.getCurrentPosition(sucesso, erro, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000
  });
}

function sucesso(posicao) {
  const lat = posicao.coords.latitude;
  const lon = posicao.coords.longitude;

  elCoordenadas.textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;

  // Geocoding reverso usando API gratuita do OpenStreetMap (Nominatim)
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`;

  fetch(url, { headers: { 'User-Agent': 'LocalizadorApp/1.0' } })
    .then(res => {
      if (!res.ok) throw new Error('Erro na API');
      return res.json();
    })
    .then(dados => {
      const end = dados.address || {};
      const cidade = end.city || end.town || end.village || end.municipality || '';
      const estado = end.state || '';
      const pais = end.country || '';

      const partes = [cidade, estado, pais].filter(Boolean);
      elLocalizacao.textContent = partes.join(', ') || dados.display_name || 'Local desconhecido';
    })
    .catch(() => {
      elLocalizacao.textContent = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
    });
}

function erro(err) {
  const mensagens = {
    1: 'Permissão negada pelo usuário',
    2: 'Localização indisponível',
    3: 'Tempo de requisição esgotado'
  };
  elLocalizacao.textContent = mensagens[err.code] || 'Erro ao obter localização';
  elCoordenadas.textContent = '';
}

// Iniciar
obterLocalizacao();
