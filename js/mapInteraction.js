const mapState = {
    startPlace: null,
    endPlace: null,
    endPlaceIdentifier: null,

    findSvgElement: function(identifier) {
        let element = document.getElementById(identifier);
        if (element) return element;
        element = document.querySelector(`[data-id="${identifier}"]`);
        if (element) return element;
        return document.querySelector(`[data-name="${identifier}"]`);
    },

    setPlace: function(identifier, type) {
        const svgElement = this.findSvgElement(identifier);
        if (svgElement) {
            if (type === 'start') {
                this.startPlace = svgElement;
                setTransform(this.startPlace, 'left');
                applyBlurEffect();
                if (this.endPlaceIdentifier) {
                    setTimeout(() => this.setPlace(this.endPlaceIdentifier, 'end'), 1000);
                }
            } else if (type === 'end') {
                this.endPlace = svgElement;
                setTransform(this.endPlace, 'right');
                applyBlurEffect();
                setTimeout(() => this.resetAllPlaces(), 5000);
            }
        } else {
            console.error(`${type} place element not found:`, identifier);
        }
    },

    resetAllPlaces: function() {
        if (this.startPlace) resetState(this.startPlace);
        if (this.endPlace) resetState(this.endPlace);
        this.startPlace = null;
        this.endPlace = null;
        applyBlurEffect();
    }
};

function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgURL = 'assets/Lower_48_Map.svg';
    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

function initializeStateInteractions() {
    const svgContainer = document.getElementById('svgMapContainer');
    svgContainer.addEventListener('click', function(event) {
        let target = event.target;
        if (target.tagName !== 'path') return;

        if (target === mapState.startPlace || target === mapState.endPlace) {
            resetState(target);
        } else {
            if (!mapState.startPlace) {
                mapState.startPlace = target;
                setTransform(mapState.startPlace, 'left');
            } else if (!mapState.endPlace) {
                mapState.endPlace = target;
                setTransform(mapState.endPlace, 'right');
            }
            applyBlurEffect();
        }
    });
}

function setTransform(element, position) {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgRect = svgContainer.getBoundingClientRect();
    const scale = 2; // The scale factor for enlargement

    element.style.transform = '';
    const bbox = element.getBBox();
    const elementCenterX = bbox.x + bbox.width / 2;
    const elementCenterY = bbox.y + bbox.height / 2;
    const fixedPositions = {
        left: { x: svgRect.width * 0.15, y: svgRect.height * 0.25 },
        right: { x: svgRect.width * 0.40, y: svgRect.height * 0.25 }
    };
    const offsetX = position === 'left' ? fixedPositions.left.x - elementCenterX : fixedPositions.right.x - elementCenterX;
    const offsetY = position === 'left' ? fixedPositions.left.y - elementCenterY : fixedPositions.right.y - elementCenterY;

    element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    element.style.transformOrigin = `${elementCenterX}px ${elementCenterY}px`;
    element.style.fill = position === 'left' ? 'red' : 'green';
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';
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

function resetState(element) {
    element.style.transition = 'none';
    element.style.transform = '';
    element.style.fill = 'blue';
    setTimeout(() => {
        element.style.transition = '';
        const resetBBox = element.getBBox();
        if (element === mapState.startPlace) {
            mapState.startPlace = null;
        } else if (element === mapState.endPlace) {
            mapState.endPlace = null;
        }
        applyBlurEffect();
    }, 0);
}

document.addEventListener('DOMContentLoaded', loadSVGMap);
