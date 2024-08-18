const socket = io();

const userName = prompt("Please enter your name:");

const durationOptions = { 1: 60000, 5: 300000, 10: 600000 }; // Durations in milliseconds
const durationChoice = prompt("Choose duration: 1 min, 5 min, or 10 min");
const duration = durationOptions[durationChoice];

if (duration) {
    startLocationSharing(duration);
} else {
    alert("Invalid duration selected.");
}

function startLocationSharing(duration) {
    if (userName && navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("send-location", { latitude, longitude, name: userName });
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        // Stop location sharing after the specified duration
        setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            console.log("Location sharing has been stopped.");
            // Optionally, inform the server that the user has stopped sharing
            socket.emit("stop-sharing", { id: socket.id });
        }, duration);
    }
}


const map = L.map("map").setView([0,0], 6);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"Real Time Tracker"
}).addTo(map)

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, name } = data;
    map.setView([latitude, longitude]);

    
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div><b>${name}</b></div>`, 
        iconSize:null,
    });

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        markers[id].on('click', function() {
            map.flyTo([latitude, longitude], 18, { 
                animate: true,
                duration: 1.5
            });
        });
    }
});
socket.on("user-disconnect",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[data.id];
    }
})

socket.on("stop-sharing", (data) => {
    if (markers[data.id]) {
        map.removeLayer(markers[data.id]);
        delete markers[data.id];
    }
});