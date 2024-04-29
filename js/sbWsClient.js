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

    if (data.streamerColor) {
        const streamerColorRGBA = hexToRGBA(data.streamerColor, 0.8);
        document.documentElement.style.setProperty('--streamer-color', data.streamerColor);
        document.documentElement.style.setProperty('--streamer-color-adjusted', streamerColorRGBA);
    }
    if (data.chatColor) {
        const chatColorRGBA = hexToRGBA(data.chatColor, 0.8);
        document.documentElement.style.setProperty('--chat-color', data.chatColor);
        document.documentElement.style.setProperty('--chat-color-adjusted', chatColorRGBA);
    }

    const optionsContainer = document.getElementById('voteOptionsContainer');
    if (optionsContainer) {
        optionsContainer.className = ''; 
        optionsContainer.classList.add('voteOptions-' + data.votePosition); 
    } else {
        console.error('voteOptionsContainer not found');
    }
}

function hexToRGBA(hex, opacity) {
    if (hex.length === 9) { 
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16),
            a = parseFloat((parseInt(hex.slice(7, 9), 16) / 255).toFixed(2));       
        a = (a * opacity).toFixed(2);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return hex.slice(0, 7); 
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
    const totalVotesElement = document.getElementById('totalVotesAndCountdown');
    let totalVotes = data.totalVotes || 0;  

    if (totalVotesElement) {
        const timeRemainingMatch = totalVotesElement.textContent.match(/Time Remaining: \d+s/);
        const timeRemainingText = timeRemainingMatch ? timeRemainingMatch[0] : 'Time Remaining: --';
        totalVotesElement.textContent = `${timeRemainingText} | Total Votes: ${totalVotes}`;
        totalVotesElement.dataset.totalVotes = totalVotes; 
    }

    Object.keys(data).forEach(key => {
        if (key.includes("pollOption")) {
            const voteCountElementId = key + "VoteCount";  
            const voteCountElement = document.getElementById(voteCountElementId);
            if (voteCountElement) {
                const voteCount = parseInt(data[key], 10);
                voteCountElement.textContent = voteCount;

                const percentageWidth = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(2) + '%' : '0%';
                const optionElement = voteCountElement.closest('.vote-option-popup');
                if (optionElement) {
                    optionElement.style.setProperty('--fill-width', percentageWidth);
                }
            } else {
                console.error('Vote count element not found for ID:', voteCountElementId);
            }
        }
    });
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
