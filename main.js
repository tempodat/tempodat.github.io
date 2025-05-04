// Toggle for coordinate visibility
const DEBUG = true;

function getDateTime() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');

  const day    = pad(d.getUTCDate());
  const month  = pad(d.getUTCMonth() + 1);
  const year   = d.getUTCFullYear();
  const hour   = pad(d.getUTCHours());
  const minute = pad(d.getUTCMinutes());

  return `${day}/${month}/${year}, ${hour}:${minute} GMT`;
}

function newPinTemplateText() {
  if (lastLatLng) {
    return `,
    {
        "latitude": ${lastLatLng.lat.toFixed(5)},
        "longitude": ${lastLatLng.lng.toFixed(5)},
        "datetime": "${getDateTime()}",
        "content": ""
    }`;
  }
}


// Create map object with OSM tiles
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let debugControl;
let lastLatLng = null;
if (DEBUG) {
  // Create coordinate widget in the bottom left corner
  debugControl = L.control({ position: 'bottomleft' });
  debugControl.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'mouse-coords');
    this.update();
    return this._div;
  };
  debugControl.update = function(latlng) {
    if (latlng) {
      lastLatLng = latlng;
      this._div.innerHTML = `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}<br />Press C to copy to clipboard`;
    } else {
      lastLatLng = null;
      this._div.innerHTML = 'Move mouse over map to see coordinates.';
    }
  };
  debugControl.addTo(map);

  // Register mouse events to update coordinate widget 
  map.on('mousemove', e => debugControl.update(e.latlng));
  map.on('mouseout', () => debugControl.update());

  // Register 'C' button click to copy coordinates to clipboard
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'c' && lastLatLng) {
      const pintemplate = newPinTemplateText();
      navigator.clipboard.writeText(pintemplate)
        .then(() => console.log('Copied pin template'))
        .catch(err => console.error('Copy failed', err));
    }
  });
}

// Create and populate marker cluster group
// TODO stress-test
const markers = L.markerClusterGroup({
  // optional cluster settings:
  // maxClusterRadius: 50,
  // spiderfyOnMaxZoom: true,
  // showCoverageOnHover: false
});

// Load pin data from pins.json
console.log("Fetching pin data");
fetch('pins.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    // Create and populate pins
    data.forEach(pin => {
      const m = L.marker([pin.latitude, pin.longitude]);
      m.bindPopup(
        `<div>
           <strong>${pin.datetime}</strong><br/>
           <p>${pin.content}</p>
         </div>`
      );
      markers.addLayer(m);
    });
    map.addLayer(markers);
    console.log(`Successfully loaded ${data.length} pins.`)
  })
  .catch(err => {
    console.error("Failed to load pins:", err);
    alert("Could not load pin data.");
  });