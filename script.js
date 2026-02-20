/* ===============================
   MAP INITIALIZATION
================================ */

let map = L.map('map').setView([20.5937, 78.9629], 5);

let marker;
let watchId = null;
let currentMode = "live";
let currentLayer;

/* ===============================
   MAP STYLES (Google-like)
================================ */

// 🟦 Streets (MapTiler - Google style)
let streets = L.tileLayer(
  'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Y08IHXTQVKiXiK1grhZg',
  {
    attribution: '&copy; MapTiler & OpenStreetMap'
  }
);

// 🌍 Satellite
let satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri'
  }
);

// 🧭 Hybrid (Satellite + Labels)
let hybrid = L.layerGroup([
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  ),
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
  )
]);

// ⛰️ Terrain (Google terrain-like)
let terrain = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenTopoMap contributors'
  }
);

// 🌑 Dark
let dark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; CartoDB'
  }
);

// 🤍 Light Minimal
let light = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; CartoDB'
  }
);

// 🚀 Voyager (Startup modern look)
let voyager = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; CartoDB'
  }
);

/* DEFAULT STYLE */
currentLayer = streets;
currentLayer.addTo(map);


/* ===============================
   CHANGE MAP STYLE
================================ */

function changeMapStyle() {

  let style = document.getElementById("mapStyle").value;

  map.removeLayer(currentLayer);

  if (style === "streets") currentLayer = streets;
  else if (style === "satellite") currentLayer = satellite;
  else if (style === "hybrid") currentLayer = hybrid;
  else if (style === "terrain") currentLayer = terrain;
  else if (style === "dark") currentLayer = dark;
  else if (style === "light") currentLayer = light;
  else if (style === "voyager") currentLayer = voyager;

  currentLayer.addTo(map);
}


/* ===============================
   UPDATE LOCATION INFO
================================ */

function updateInfo(lat, lon) {

  document.getElementById("lat").innerText = lat;
  document.getElementById("lon").innerText = lon;

  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon]).addTo(map);
  }

  map.setView([lat, lon], 15);

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {

      document.getElementById("pincode").innerText =
        data.address.postcode || "Not found";

      document.getElementById("address").innerText =
        data.display_name || "Unknown";
    });
}


/* ===============================
   SWITCH APP MODE
================================ */

function switchMode(mode) {

  currentMode = mode;

  // button active style
  document.querySelectorAll(".mode-buttons button")
    .forEach(btn => btn.classList.remove("active"));

  document.getElementById(mode + "Btn")
    .classList.add("active");

  // search UI toggle
  document.getElementById("searchUI")
    .classList.toggle("hidden", mode !== "search");

  // stop previous tracking
  if (watchId) navigator.geolocation.clearWatch(watchId);

  // start live tracking
  if (mode === "live") {

    watchId = navigator.geolocation.watchPosition(pos => {
      updateInfo(
        pos.coords.latitude,
        pos.coords.longitude
      );
    });

  }
}


/* ===============================
   PIN MODE (MAP CLICK)
================================ */

map.on("click", function (e) {

  if (currentMode === "pin") {
    updateInfo(e.latlng.lat, e.latlng.lng);
  }

});


/* ===============================
   SEARCH LOCATION
================================ */

function searchLocation() {

  let query = document.getElementById("searchInput").value;

  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {

      if (data.length > 0) {
        updateInfo(data[0].lat, data[0].lon);
      }

    });
}


/* ===============================
   START APP
================================ */

switchMode("live");