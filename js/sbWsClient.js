let ws;

function connectws() {
    if ("WebSocket" in window) {
        ws = new WebSocket("ws://127.0.0.1:8080");
        bindEvents();
    } else {
        console.error("Your Browser does not support Websockets");
    }
}

function bindEvents() {
    ws.onopen = () => {
        ws.send(JSON.stringify({
            request: "Subscribe",
            id: "takeover-game",
            events: {
                general: ["Custom"],
                Twitch: ["ChatMessage", "RewardRedemption"],
                YouTube: ["Message", "SuperChat"],
            },
        }));
        console.info("Successfully opened WebSocket connection and subscribed to selected events.");
    };

    ws.onmessage = (event) => {
        const wsdata = JSON.parse(event.data);
        if (wsdata.status === "ok" || wsdata.event.source == null) {
            console.log("Received 'ok' status or null source.");
            return;
        }
        handleWebSocketData(wsdata);
    };

    ws.onclose = () => {
        console.error("WebSocket connection closed unexpectedly! Attempting to reconnect...");
        setTimeout(connectws, 10000);
    };
}

function handleWebSocketData(wsdata) {
    if (wsdata.event.source === "General" && wsdata.event.type === "Custom") {
        if (wsdata.data.options) {
            displayVoteOptions(wsdata.data);
        }
        if (wsdata.data.streamerColor || wsdata.data.streamerStartPlace) {
            updateMapState(wsdata.data);
        }
        if (wsdata.data.startPlace || wsdata.data.endPlace) {
            updateMapMovements(wsdata.data);
        }
        if (wsdata.data.totalVotes !== undefined || Object.keys(wsdata.data).some(key => key.includes('VoteCount'))) {
            updateVoteCounts(wsdata.data);
        }
    }
}

function updateMapState(data) {
    console.log('Updating map colors and bases:', data);

    if (!mapState.teamsBases) {
        console.error('Map state teamsBases is not initialized.');
        mapState.teamsBases = { teamStreamer: null, teamChat: null };
    }

    mapState.teamColors.teamStreamer = data.streamerColor;
    mapState.teamColors.teamChat = data.chatColor;
    mapState.teamsBases.teamStreamer = data.streamerStartPlace;
    mapState.teamsBases.teamChat = data.chatStartPlace;

    mapState.setHomeBase('teamStreamer', data.streamerStartPlace);
    mapState.setHomeBase('teamChat', data.chatStartPlace);

    document.documentElement.style.setProperty('--streamer-color', data.streamerColor);
    const optionsContainer = document.getElementById('voteOptionsContainer');
    if (optionsContainer) {
        optionsContainer.className = ''; 
        optionsContainer.classList.add('voteOptions-' + data.votePosition); 
    } else {
        console.error('voteOptionsContainer not found');
    }
}

function displayVoteOptions(data) {
    const optionsContainer = document.getElementById('voteOptionsContainer');
    if (!optionsContainer) {
        console.error('Vote options container is not found on the page.');
        return;
    }

    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('active');

    const options = data.options;
    let pollDuration = data.pollDuration;

    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'vote-option-popup';
        optionElement.innerHTML = `
            <span class="vote-prompt">!vote ${index + 1}:&nbsp;&nbsp;</span>
            <span>${option.content}&nbsp;&nbsp;</span>
            <span class="vote-count" id="pollOption${index + 1}VoteCount">0</span>
        `;
        optionsContainer.appendChild(optionElement);
    });
  
    const totalVotesElement = document.createElement('div');
    totalVotesElement.id = 'totalVotesAndCountdown';
    totalVotesElement.textContent = `Time Remaining: ${pollDuration}s | Total Votes: 0`;
    optionsContainer.appendChild(totalVotesElement);

    let countdownInterval = setInterval(() => {
        pollDuration -= 1;
        const totalVotesMatch = totalVotesElement.textContent.match(/Total Votes: (\d+)/);
        const currentTotalVotes = totalVotesMatch ? totalVotesMatch[1] : '0';
    
        totalVotesElement.textContent = `Time Remaining: ${pollDuration}s | Total Votes: ${currentTotalVotes}`;
    
        if (pollDuration <= 0) {
            clearInterval(countdownInterval);
            optionsContainer.classList.remove('active');
            optionsContainer.innerHTML = '';
        }
    }, 1000);
    
}

function updateVoteCounts(data) {
    Object.keys(data).forEach(key => {
        if (key.startsWith("pollOption") && key.endsWith("VoteCount")) {
            const voteCountElement = document.getElementById(key);
            if (voteCountElement) {
                voteCountElement.textContent = data[key];
                voteCountElement.style.visibility = 'visible'; 
            } else {
                console.error('Vote count element not found for:', key);
            }
        }
    });
    if (data.totalVotes !== undefined) {
        const totalVotesElement = document.getElementById('totalVotesAndCountdown');
        if (totalVotesElement) {
            const timeRemainingMatch = totalVotesElement.textContent.match(/Time Remaining: \d+s/);
            const timeRemainingText = timeRemainingMatch ? timeRemainingMatch[0] : 'Time Remaining: --';
            totalVotesElement.textContent = `${timeRemainingText} | Total Votes: ${data.totalVotes}`;
        }
    }
}

function updateMapMovements(data) {
    let team = data.currentTeam;
    let startColor = mapState.teamColors[team];

    if (data.startPlace) {
        mapState.setPlace(data.startPlace, 'start', startColor, data.turnResult === "success", team);
    }
    if (data.endPlace) {
        let endColor = data.turnResult === "success" ? startColor : mapState.teamColors.default;
        mapState.setPlace(data.endPlace, 'end', endColor, data.turnResult === "success", team);
    }
}

connectws();
