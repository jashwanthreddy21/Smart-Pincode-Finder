let map = L.map('map').setView([20.5937,78.9629],5);

let marker;
let watchId=null;
let currentMode="live";
let currentLayer;

/* MAP STYLES */
let streets = L.tileLayer(
'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Y08IHXTQVKiXiK1grhZg'
);

let satellite = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
);

let hybrid = L.layerGroup([
  satellite,
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png')
]);

let terrain = L.tileLayer(
'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
);

let dark = L.tileLayer(
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
);

let light = L.tileLayer(
'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
);

let voyager = L.tileLayer(
'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
);

currentLayer=streets;
currentLayer.addTo(map);

/* CHANGE STYLE */
function changeMapStyle(){
  let s=document.getElementById("mapStyle").value;
  map.removeLayer(currentLayer);

  if(s==="streets") currentLayer=streets;
  else if(s==="satellite") currentLayer=satellite;
  else if(s==="hybrid") currentLayer=hybrid;
  else if(s==="terrain") currentLayer=terrain;
  else if(s==="dark") currentLayer=dark;
  else if(s==="light") currentLayer=light;
  else currentLayer=voyager;

  currentLayer.addTo(map);
}

/* UPDATE INFO */
function updateInfo(lat,lon){

  document.getElementById("resultPanel")
    .classList.remove("hidden");

  document.getElementById("lat").innerText = lat;
  document.getElementById("lon").innerText = lon;

  // ⭐ instant feedback (feels fast)
  document.getElementById("pincode").innerText = "Loading...";
  document.getElementById("address").innerText = "Fetching location...";

  if(marker) marker.setLatLng([lat,lon]);
  else marker=L.marker([lat,lon]).addTo(map);

  map.setView([lat,lon],15);

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
  .then(r=>r.json())
  .then(d=>{
    document.getElementById("pincode").innerText =
      d.address.postcode || "Not found";

    document.getElementById("address").innerText =
      d.display_name || "Unknown";
  });
}

/* MODE SWITCH */
function switchMode(mode){

  currentMode = mode;

  document.querySelectorAll(".mode-buttons button")
    .forEach(b=>b.classList.remove("active"));

  document.getElementById(mode+"Btn")
    .classList.add("active");

  document.getElementById("searchUI")
    .classList.toggle("hidden", mode!=="search");

  if(watchId) navigator.geolocation.clearWatch(watchId);

  /* hide result for pin/search */
  if(mode==="pin" || mode==="search"){
    document.getElementById("resultPanel")
      .classList.add("hidden");
  }

  if(mode==="live"){
    watchId = navigator.geolocation.watchPosition(p=>{
      updateInfo(
        p.coords.latitude,
        p.coords.longitude
      );
    });
  }
}

/* PIN MODE */
map.on("click",e=>{
  if(currentMode==="pin"){
    updateInfo(e.latlng.lat,e.latlng.lng);
  }
});

/* SEARCH */
function searchLocation(){
  let q=document.getElementById("searchInput").value;
  if(!q) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
  .then(r=>r.json())
  .then(d=>{
    if(d.length) updateInfo(d[0].lat,d[0].lon);
  });
}

switchMode("live");
