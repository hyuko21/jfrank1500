'use strict';

let deferredInstallPrompt = null;
const botaoInstalacao = document.getElementById('butInstall');

botaoInstalacao.addEventListener('click', function (evt) {
  console.log('install.click');
  deferredInstallPrompt.prompt();
  evt.srcElement.setAttribute('hidden', true);
  deferredInstallPrompt.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('Usuario aceitou a instalacao', choice);
      } else {
        console.log('Usuario cancelou a instalacao', choice);
      }
      deferredInstallPrompt = null;
    });
});

window.addEventListener('beforeinstallprompt', function (evt) {
  console.log('beforeinstallprompt');
  deferredInstallPrompt = evt;
  botaoInstalacao.removeAttribute('hidden');
});

window.addEventListener('appinstalled', function (evt) {
  console.log('Aplicativo foi instalado.', evt);
});