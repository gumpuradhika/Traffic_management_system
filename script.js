const roads = [
    "Main Road",
    "Market Road",
    "Station Road",
    "College Road"
];

const traffic = roads.map((name, index) => ({
    name: name,
    vehicles: 0,
    signal: "Red",
    emergency: false
}));

let automaticMode = false;
let signalIndex = 0;
let emergencyCount = 0;
let timer = null;
let logs = [];

const signalGrid = document.getElementById("signalGrid");
const trafficTable = document.getElementById("trafficTable");
const activityLog = document.getElementById("activityLog");
const autoBtn = document.getElementById("autoBtn");

function addLog(message) {
    const time = new Date().toLocaleTimeString();

    logs.unshift(`${time} - ${message}`);
    logs = logs.slice(0, 10);

    activityLog.innerHTML = "";

    if (logs.length === 0) {
        activityLog.innerHTML = "<li>No activities yet.</li>";
        return;
    }

    logs.forEach(message => {
        const li = document.createElement("li");
        li.textContent = message;
        activityLog.appendChild(li);
    });
}

function setSignal(index, color) {
    traffic[index].signal = color;
    renderSignals();
    renderTable();
    updateStats();
}

function renderSignals() {
    signalGrid.innerHTML = "";

    traffic.forEach((road, index) => {
        const card = document.createElement("article");
        card.className = "signal-card";

        const signalClass = road.signal.toLowerCase();

        card.innerHTML = `
            <h3>${road.name}</h3>
            <p>Intersection ${index + 1}</p>

            <div class="traffic-light">
                <div class="light red ${
                    signalClass === "red" ? "on" : ""
                }"></div>
                <div class="light yellow ${
                    signalClass === "yellow" ? "on" : ""
                }"></div>
                <div class="light green ${
                    signalClass === "green" ? "on" : ""
                }"></div>
            </div>

            <div class="signal-status">${road.signal} Light</div>

            <div class="signal-buttons">
                <button class="red-btn" data-color="Red"
                    data-index="${index}">Red</button>
                <button class="yellow-btn" data-color="Yellow"
                    data-index="${index}">Yellow</button>
                <button class="green-btn" data-color="Green"
                    data-index="${index}">Green</button>
            </div>
        `;

        signalGrid.appendChild(card);
    });
}

function getTrafficStatus(count) {
    if (count < 10) {
        return "Low";
    } else if (count < 20) {
        return "Medium";
    } else {
        return "High";
    }
}

function renderTable() {
    trafficTable.innerHTML = "";

    traffic.forEach(road => {
        const status = getTrafficStatus(road.vehicles);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${road.name}</td>
            <td>${road.vehicles}</td>
            <td>${road.signal}</td>
            <td>
                <span class="status ${status.toLowerCase()}">
                    ${status}
                </span>
            </td>
        `;

        trafficTable.appendChild(row);
    });
}

function updateStats() {
    const total = traffic.reduce(
        (sum, road) => sum + road.vehicles, 0
    );

    const highestCount = Math.max(
        ...traffic.map(road => road.vehicles)
    );

    document.getElementById("totalVehicles").textContent = total;

    document.getElementById("congestion").textContent =
        getTrafficStatus(highestCount);

    document.getElementById("emergencyCount").textContent =
        emergencyCount;
}

function updateClock() {
    document.getElementById("clock").textContent =
        new Date().toLocaleString();
}

signalGrid.addEventListener("click", event => {
    const button = event.target.closest("button[data-color]");

    if (!button) return;

    if (automaticMode) {
        alert("Stop Automatic Mode before manual control.");
        return;
    }

    const index = Number(button.dataset.index);
    const color = button.dataset.color;

    traffic[index].emergency = false;
    setSignal(index, color);
    addLog(`${traffic[index].name} signal changed to ${color}.`);
});

document.getElementById("addBtn").addEventListener("click", () => {
    const index = Number(document.getElementById("roadSelect").value);
    const type = document.getElementById("vehicleType").value;

    traffic[index].vehicles++;

    renderTable();
    updateStats();

    addLog(`${type} added to ${traffic[index].name}.`);
});

function stopAutomaticMode() {
    automaticMode = false;

    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    autoBtn.textContent = "Start Automatic Mode";
}

autoBtn.addEventListener("click", () => {
    if (automaticMode) {
        stopAutomaticMode();
        addLog("Automatic mode stopped.");
        return;
    }

    automaticMode = true;
    signalIndex = 0;

    autoBtn.textContent = "Stop Automatic Mode";

    traffic.forEach(road => {
        road.emergency = false;
        road.signal = "Red";
    });

    traffic[signalIndex].signal = "Green";

    renderSignals();
    renderTable();

    addLog("Automatic traffic signal mode started.");

    timer = setInterval(() => {
        traffic.forEach(road => {
            road.signal = "Red";
            road.emergency = false;
        });

        signalIndex = (signalIndex + 1) % traffic.length;
        traffic[signalIndex].signal = "Green";

        renderSignals();
        renderTable();

        addLog(`${traffic[signalIndex].name} signal is Green.`);
    }, 5000);
});

document.getElementById("emergencyBtn").addEventListener("click", () => {
    const index = Number(document.getElementById("roadSelect").value);

    if (automaticMode) {
        stopAutomaticMode();
    }

    traffic.forEach(road => {
        road.signal = "Red";
        road.emergency = false;
    });

    traffic[index].signal = "Green";
    traffic[index].emergency = true;

    emergencyCount++;

    autoBtn.textContent = "Start Automatic Mode";

    renderSignals();
    renderTable();
    updateStats();

    addLog(`Emergency priority granted to ${traffic[index].name}.`);
    alert(`Emergency priority granted to ${traffic[index].name}!`);
});

document.getElementById("resetBtn").addEventListener("click", () => {
    stopAutomaticMode();

    traffic.forEach(road => {
        road.vehicles = 0;
        road.signal = "Red";
        road.emergency = false;
    });

    emergencyCount = 0;
    signalIndex = 0;
    logs = [];

    renderSignals();
    renderTable();
    updateStats();

    addLog("Traffic data has been reset.");
});

document.getElementById("clearLogBtn").addEventListener("click", () => {
    logs = [];
    activityLog.innerHTML = "";
    addLog("Activity log cleared.");
});

document.getElementById("activeSignals").textContent = traffic.length;

renderSignals();
renderTable();
updateStats();
updateClock();
setInterval(updateClock, 1000);

addLog("Traffic Management System initialized.");