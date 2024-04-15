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

    findSvgElement: function(identifier) {
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
      
    setPlace: function(identifier, type, color, success, team) {
        // Clear any previous transform timeouts
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
            setTransform(this.endPlace, 'right', this.teamColors.default);
            this.transformTimeoutId = setTimeout(() => {
                const reFetchedElement = this.findSvgElement(identifier);
                if (!reFetchedElement) {
                    console.error("Failed to re-fetch the element for transformation:", identifier);
                    return;
                }
                setTransform(reFetchedElement, 'right', success ? color : this.teamColors.default);
            }, 4000);
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
            resetState(this.endPlace, this.lastActionSuccessful ? this.teamColors[this.currentTeam] : this.teamColors.default);
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
    svgContainer.addEventListener('click', function(event) {
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

    // Reset the transition to prevent any CSS transition for initial color set
    element.style.transition = 'none';
    element.style.fill = color;  // Set color without transition

    // Force reflow to apply the fill color instantly before transitioning
    element.getBoundingClientRect();

    // Now set up the transition for the transform property only
    element.style.transition = 'transform 0.5s ease';
    element.style.opacity = "1.0";  // Ensure element is fully opaque

    // Calculate the transform values
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

    // Apply the transform with the transition
    setTimeout(() => {
        element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        element.style.transformOrigin = `${elementCenterX}px ${elementCenterY}px`;
    }, 0); // The timeout ensures the transition takes effect after reflow

    element.parentNode.appendChild(element); // This also helps in stacking context
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
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';
    element.style.transform = '';
    element.style.fill = color;
    setTimeout(() => {
        element.style.transition = '';
        applyBlurEffect();
    }, 0);
}

document.addEventListener('DOMContentLoaded', loadSVGMap);
