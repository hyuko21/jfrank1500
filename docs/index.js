'use strict';

const URL_API = 'https://api.icndb.com/jokes/random/10?escape=javascript';

function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("myOverlay").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("myOverlay").style.display = "none";
}

let perguntarSeInstala = null;
const botaoInstalacao = document.getElementById('instalar');
botaoInstalacao.addEventListener('click', function (evt) {
  console.log('install.click');
  perguntarSeInstala.prompt();
  evt.srcElement.setAttribute('hidden', true);
  perguntarSeInstala.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('Usuario aceitou a instalacao', choice);
      } else {
        console.log('Usuario cancelou a instalacao', choice);
      }
      perguntarSeInstala = null;
    });
});

window.addEventListener('beforeinstallprompt', function (evt) {
  console.log('beforeinstallprompt');
  perguntarSeInstala = evt;
  botaoInstalacao.removeAttribute('hidden');
});

window.addEventListener('appinstalled', function (evt) {
  console.log('Aplicativo foi instalado.', evt);
});


async function localizarDadosDaRede() {
  try {
    const response = await fetch(URL_API);
    return response.json();
  } catch (e) {
    return null;
  }
}

async function localizarDadosDoCache() {
  if (!('caches' in window)) {
    return null;
  }
  try {
    const response = await caches.match(URL_API);
    if (response) {
      return response.json();
    }
    return null;
  } catch (err) {
    console.error('Erro recuperando dados do cache', err);
    return null;
  }
}

function atualizarLista(lista) {
  document.querySelector('#lista').innerHTML = "";
  lista.value.forEach(item => {
    criarCartao(item.id, "#" + item.id, item.joke);
  });
}

function localizarDados() {
  localizarDadosDoCache()
    .then((lista) => {
      if (lista) {
        console.log('CACHE', lista);
        atualizarLista(lista)
      }
    });
  localizarDadosDaRede()
    .then((lista) => {
      if (lista) {
        console.log('REDE', lista);
        atualizarLista(lista)
      }
    });
}

function criarCartao(id, titulo, descricao) {
  const novoCartao = document.getElementById('TEMPLATE_LINHA').cloneNode(true);
  novoCartao.querySelector('.nome').textContent = titulo;
  novoCartao.querySelector('.descricao').textContent = descricao;
  novoCartao.setAttribute('id', id);
  document.querySelector('#lista').appendChild(novoCartao);
  return novoCartao;
}

function init() {
  localizarDados();
  document.getElementById('atualizar').addEventListener('click', localizarDados);
}

init();