let startPlace = null;
let endPlace = null;

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

    // Use event delegation for path clicks
    svgContainer.addEventListener('click', function(event) {
        let target = event.target;
        console.log('Clicked on:', target.tagName, 'with id:', target.id);

        // Proceed only if a path was clicked
        if (target.tagName !== 'path') {
            return;
        }

        // If the path is already the startPlace or endPlace, reset it
        if (target === startPlace || target === endPlace) {
            resetState(target);
            if (target === startPlace) startPlace = null;
            if (target === endPlace) endPlace = null;
        } else {
            // Set as startPlace or endPlace
            if (!startPlace) {
                startPlace = target;
                setTransform(startPlace, 'left');
            } else if (!endPlace) {
                endPlace = target;
                setTransform(endPlace, 'right');
            }
        }
    });
}

function setTransform(element, position) {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgRect = svgContainer.getBoundingClientRect();
    const scale = 2; // The scale factor for enlargement

    // Remove any existing transformations to get the true position
    element.style.transform = '';

    // Get the position of the element within the SVG
    const bbox = element.getBBox();

    // Fixed positions in the SVG container
    const fixedPositions = {
        left: { x: svgRect.width * 0.15, y: svgRect.height * 0.5 },
        right: { x: svgRect.width * 0.55, y: svgRect.height * 0.5 }
    };

    // Calculate the center of the state element
    const elementCenterX = bbox.x + bbox.width / 2;
    const elementCenterY = bbox.y + bbox.height / 2;

    // Calculate the difference from the center of the state to the fixed position
    let offsetX, offsetY;
    if (position === 'left') {
        offsetX = fixedPositions.left.x - elementCenterX;
        offsetY = fixedPositions.left.y - elementCenterY;
    } else { // 'right'
        offsetX = fixedPositions.right.x - elementCenterX;
        offsetY = fixedPositions.right.y - elementCenterY;
    }

    // Apply the transformation with scale
    element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    element.style.transformOrigin = `${elementCenterX}px ${elementCenterY}px`;
    element.style.fill = 'red'; // Set distinct color on active

    // Log for debugging
    console.log('Transform applied to ' + (position === 'left' ? 'startPlace' : 'endPlace') + ':', element.style.transform);

    // Set the transition to ensure smooth movement
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';

    // Re-append the element to its parent to ensure it is on top
    element.parentNode.appendChild(element);
}

function resetState(element) {
    console.log('Resetting element:', element);

    element.style.transition = 'none';
    element.style.transform = '';
    element.style.fill = 'blue';  // Change to another distinct color on reset

    setTimeout(() => {
        element.style.transition = '';
    }, 0);

    // Log after reset
    const resetBBox = element.getBBox();
    console.log('Reset BBox:', resetBBox);
}

document.addEventListener('DOMContentLoaded', loadSVGMap);
