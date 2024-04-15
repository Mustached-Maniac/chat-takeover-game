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

    svgContainer.addEventListener('click', function(event) {
        let target = event.target;

        if (target.tagName !== 'path') {
            return;
        }

        if (target === startPlace || target === endPlace) {
            resetState(target);
        } else {
            if (!startPlace) {
                startPlace = target;
                setTransform(startPlace, 'left');
            } else if (!endPlace) {
                endPlace = target;
                setTransform(endPlace, 'right');
            }
        }
        applyBlurEffect(); // Call this to manage blur state
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
    element.style.fill = position === 'left' ? 'red' : 'green';
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';
    element.parentNode.appendChild(element);
}

function applyBlurEffect() {
    const paths = document.querySelectorAll('#svgMapContainer path');
    if (startPlace && endPlace) {
        paths.forEach(path => {
            if (path !== startPlace && path !== endPlace) {
                path.classList.add('blur');
            }
        });
    } else {
        paths.forEach(path => {
            path.classList.remove('blur');
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
        console.log('Reset BBox:', resetBBox);

        if (element === startPlace) {
            startPlace = null;
        } else if (element === endPlace) {
            endPlace = null;
        }

        // Now check if blur should be applied or removed
        applyBlurEffect();
    }, 0);
}

document.addEventListener('DOMContentLoaded', loadSVGMap);
