'use strict';

const weatherApp = {
  selectedLocations: {},
  addDialogContainer: document.getElementById('addDialogContainer'),
};

function toggleAddDialog() {
  weatherApp.addDialogContainer.classList.toggle('visible');
}

function addLocation() {
  toggleAddDialog();
  const select = document.getElementById('selectCityToAdd');
  const selected = select.options[select.selectedIndex];
  const geo = selected.value;
  const label = selected.textContent;
  const location = {
    label: label,
    geo: geo
  };
  const card = getForecastCard(location);
  getForecastFromNetwork(geo).then((forecast) => {
    renderForecast(card, forecast);
  });
  weatherApp.selectedLocations[geo] = location;
  saveLocationList(weatherApp.selectedLocations);
}

function removeLocation(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  if (weatherApp.selectedLocations[parent.id]) {
    delete weatherApp.selectedLocations[parent.id];
    saveLocationList(weatherApp.selectedLocations);
  }
}

function renderForecast(card, data) {
  if (!data) {
    // There's no data, skip the update.
    return;
  }

  const cardLastUpdatedElem = card.querySelector('.card-last-updated');
  const cardLastUpdated = cardLastUpdatedElem.textContent;
  const lastUpdated = parseInt(cardLastUpdated);

  if (lastUpdated >= data.currently.time) {
    return;
  }
  cardLastUpdatedElem.textContent = data.currently.time;

  card.querySelector('.description').textContent = data.currently.summary;
  const forecastFrom = luxon.DateTime
    .fromSeconds(data.currently.time)
    .setZone(data.timezone)
    .toFormat('DDDD t');
  card.querySelector('.date').textContent = forecastFrom;
  card.querySelector('.current .icon')
    .className = `icon ${data.currently.icon}`;
  card.querySelector('.current .temperature .value')
    .textContent = Math.round(data.currently.temperature);
  card.querySelector('.current .humidity .value')
    .textContent = Math.round(data.currently.humidity * 100);
  card.querySelector('.current .wind .value')
    .textContent = Math.round(data.currently.windSpeed);
  card.querySelector('.current .wind .direction')
    .textContent = Math.round(data.currently.windBearing);
  const sunrise = luxon.DateTime
    .fromSeconds(data.daily.data[0].sunriseTime)
    .setZone(data.timezone)
    .toFormat('t');
  card.querySelector('.current .sunrise .value').textContent = sunrise;
  const sunset = luxon.DateTime
    .fromSeconds(data.daily.data[0].sunsetTime)
    .setZone(data.timezone)
    .toFormat('t');
  card.querySelector('.current .sunset .value').textContent = sunset;

  const futureTiles = card.querySelectorAll('.future .oneday');
  futureTiles.forEach((tile, index) => {
    const forecast = data.daily.data[index + 1];
    const forecastFor = luxon.DateTime
      .fromSeconds(forecast.time)
      .setZone(data.timezone)
      .toFormat('ccc');
    tile.querySelector('.date').textContent = forecastFor;
    tile.querySelector('.icon').className = `icon ${forecast.icon}`;
    tile.querySelector('.temp-high .value')
      .textContent = Math.round(forecast.temperatureHigh);
    tile.querySelector('.temp-low .value')
      .textContent = Math.round(forecast.temperatureLow);
  });

  const spinner = card.querySelector('.card-spinner');
  if (spinner) {
    card.removeChild(spinner);
  }
}

function getForecastFromNetwork(coords) {
  return fetch(`/forecast/${coords}`)
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

function getForecastFromCache(coords) {
  if (!('caches' in window)) {
    return null;
  }
  const url = `${window.location.origin}/forecast/${coords}`;
  return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });
}

function getForecastCard(location) {
  const id = location.geo;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.getElementById('weather-template').cloneNode(true);
  newCard.querySelector('.location').textContent = location.label;
  newCard.setAttribute('id', id);
  newCard.querySelector('.remove-city')
    .addEventListener('click', removeLocation);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}

function updateData() {
  Object.keys(weatherApp.selectedLocations).forEach((key) => {
    const location = weatherApp.selectedLocations[key];
    const card = getForecastCard(location);
    getForecastFromCache(location.geo)
      .then((forecast) => {
        renderForecast(card, forecast);
      });
    getForecastFromNetwork(location.geo)
      .then((forecast) => {
        renderForecast(card, forecast);
      });
  });
}

function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  if (!locations || Object.keys(locations).length === 0) {
    const key = '40.7720232,-73.9732319';
    locations = {};
    locations[key] = {
      label: 'New York City',
      geo: '40.7720232,-73.9732319'
    };
  }
  return locations;
}

function init() {
  weatherApp.selectedLocations = loadLocationList();
  updateData();
  document.getElementById('butRefresh').addEventListener('click', updateData);
  document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogCancel')
    .addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogAdd')
    .addEventListener('click', addLocation);
}

init();