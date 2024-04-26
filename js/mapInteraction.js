const mapState = {
    startPlace: null,
    endPlace: null,
    endPlaceIdentifier: null,
    lastActionSuccessful: false,
    currentTeam: null,
    transformTimeoutId: null,
    teamColors: {
        teamStreamer: "#FF0000",
        teamChat: "#39FF14",
        default: "#EADDCA",
    },
    teamsBases: {
        teamStreamer: null,
        teamChat: null
    },

    findSvgElement: function (identifier) {
        let normalizedIdentifier = identifier.toUpperCase();

        let element = document.getElementById(normalizedIdentifier) ||
            document.querySelector(`[data-id="${normalizedIdentifier}"]`) ||
            document.querySelector(`[data-name="${identifier}"]`);

        if (!element) {
            console.error("Element not found for identifier:", identifier);
            return null;
        }
        return element;
    },
    
    setHomeBase: function(team, identifier) {
        const svgElement = this.findSvgElement(identifier);
        if (!svgElement) {
            console.error("Home base place element not found:", identifier);
            return;
        }

        svgElement.style.fill = this.teamColors[team]; // Update the color of the home base
        console.log(`Set ${team} home base at ${identifier} to ${this.teamColors[team]}`); // Debug output
    },

    setPlace: function(identifier, type, color, success, team) {
        clearTimeout(this.transformTimeoutId);
    
        const svgElement = this.findSvgElement(identifier);
        if (!svgElement) {
            console.error(`${type} place element not found:`, identifier);
            return;
        }
    
        this.currentTeam = team;
        this.lastActionSuccessful = success;
    
        if (type === 'start') {
            this.startPlace = svgElement;
            let startColor = this.teamColors[team];
            setTransform(this.startPlace, 'left', startColor);
        } else if (type === 'end') {
            this.endPlace = svgElement;
            let currentColor = this.endPlace.style.fill;
            let isDefaultOrBackground = !currentColor || currentColor === this.teamColors.default || currentColor === "rgb(249, 249, 249)";
            let initialEndColor = isDefaultOrBackground ? this.teamColors.default : currentColor;
    
            this.endPlace.style.fill = initialEndColor;
            setTransform(this.endPlace, 'right', initialEndColor);
    
            if (success) {
                this.transformTimeoutId = setTimeout(() => {
                    const reFetchedElement = this.findSvgElement(identifier);
                    if (!reFetchedElement) {
                        console.error("Failed to re-fetch the element for transformation:", identifier);
                        return;
                    }
                    setTransform(reFetchedElement, 'right', color);
                }, 4000);
            }
        }
        applyBlurEffect();
        this.resetTimeoutId = setTimeout(() => this.resetAllPlaces(), 3000);
    },
     
    resetAllPlaces: function() {
        clearTimeout(this.transformTimeoutId);
        if (this.startPlace) {
            resetState(this.startPlace, this.teamColors[this.currentTeam]);
        }
        if (this.endPlace) {
            let colorForReset = this.lastActionSuccessful ? this.teamColors[this.currentTeam] : this.endPlace.style.fill;
            resetState(this.endPlace, colorForReset);
        }
        this.startPlace = null;
        this.endPlace = null;
        applyBlurEffect();
    },    
};

function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgURL = 'assets/Lower_48_Map.svg';
    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            console.log("SVG loaded successfully");
            initializeStateInteractions();
        })
        .catch(error => {
            console.error('Error loading the SVG:', error);
        });
}

function initializeStateInteractions() {
    const svgContainer = document.getElementById('svgMapContainer');
    svgContainer.addEventListener('click', function (event) {
        let target = event.target;
        if (target.tagName !== 'path') return;

        if (target === mapState.startPlace || target === mapState.endPlace) {
            resetState(target, mapState.teamColors.default);
        } else {
            if (!mapState.startPlace) {
                mapState.startPlace = target;
                setTransform(mapState.startPlace, 'left', mapState.teamColors.teamStreamer);
            } else if (!mapState.endPlace) {
                mapState.endPlace = target;
                setTransform(mapState.endPlace, 'right', mapState.teamColors.default);
            }
            applyBlurEffect();
        }
    });
}

function setTransform(element, position, color) {
    if (!element) {
        console.error("Attempted to transform a non-existent element.");
        return;
    }

    element.style.transition = 'none';
    element.style.fill = color;

    element.getBoundingClientRect();


    element.style.transition = 'transform 0.5s ease';
    element.style.opacity = "1.0";


    const svgContainer = document.getElementById('svgMapContainer');
    const svgRect = svgContainer.getBoundingClientRect();
    const scale = 2;

    const fixedPositions = {
        left: { x: svgRect.width * 0.15, y: svgRect.height * 0.25 },
        right: { x: svgRect.width * 0.40, y: svgRect.height * 0.25 }
    };

    const bbox = element.getBBox();
    const elementCenterX = bbox.x + bbox.width / 2;
    const elementCenterY = bbox.y + bbox.height / 2;
    const offsetX = position === 'left' ? fixedPositions.left.x - elementCenterX : fixedPositions.right.x - elementCenterX;
    const offsetY = position === 'left' ? fixedPositions.left.y - elementCenterY : fixedPositions.right.y - elementCenterY;


    setTimeout(() => {
        element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        element.style.transformOrigin = `${elementCenterX}px ${elementCenterY}px`;
    }, 0);

    element.parentNode.appendChild(element);
}

function applyBlurEffect() {
    const paths = document.querySelectorAll('#svgMapContainer path');
    if (!mapState.startPlace && !mapState.endPlace) {
        paths.forEach(path => path.classList.remove('blur'));
    } else {
        paths.forEach(path => {
            if (path !== mapState.startPlace && path !== mapState.endPlace) {
                path.classList.add('blur');
            } else {
                path.classList.remove('blur');
            }
        });
    }
}

function resetState(element, color) {
    console.log(`Resetting state for element with new color: ${color}`); // Debug output
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';
    element.style.transform = '';
    element.style.fill = color;
    setTimeout(() => {
        element.style.transition = '';
        applyBlurEffect();
    }, 0);
}

document.addEventListener('DOMContentLoaded', loadSVGMap);
