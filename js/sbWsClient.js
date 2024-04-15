let ws;

function connectws() {
    if ("WebSocket" in window) {
        console.info("Connecting to Streamer.Bot");
        ws = new WebSocket("ws://127.0.0.1:8080");
        bindEvents();
    } else {
        console.error("WebSocket NOT supported by your Browser!");
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
    };

    ws.onmessage = (event) => {
        const wsdata = JSON.parse(event.data);
        if (wsdata.status === "ok" || wsdata.event.source == null) {
            return;
        }
        handleSVGMapInteraction(wsdata);
    };

    ws.onclose = () => {
        console.error("WebSocket connection closed unexpectedly! Attempting to reconnect...");
        setTimeout(connectws, 10000);
    };
}

function handleSVGMapInteraction(wsdata) {
    if (wsdata.event.source === "General" && wsdata.event.type === "Custom") {
        let team = wsdata.data.currentTeam;  // 'team' should be either 'teamStreamer' or 'teamChat'
        let startColor = mapState.teamColors[team];

        if (wsdata.data.startPlace) {
            mapState.setPlace(wsdata.data.startPlace, 'start', startColor, wsdata.data.turnResult === "success", team);
        }
        if (wsdata.data.endPlace) {
            let endColor = wsdata.data.turnResult === "success" ? startColor : mapState.teamColors.default;
            mapState.setPlace(wsdata.data.endPlace, 'end', endColor, wsdata.data.turnResult === "success", team);
        }
    }
}

connectws();
