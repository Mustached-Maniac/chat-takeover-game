let startPlace = null; // Variable to store the start place state
    let endPlace = null; // Variable to store the end place state

    function loadSVGMap() {
        const svgContainer = document.getElementById('svgMapContainer');
        const svgURL = 'assets/Lower_48_Map.svg';

        fetch(svgURL)
            .then(response => response.text())
            .then(svgData => {
                svgContainer.innerHTML = svgData;
                // Initialize state interactions after SVG is loaded
                initializeStateInteractions();
            })
            .catch(error => console.error('Error loading the SVG:', error));
    }
    function initializeStateInteractions() {
        // Select all path elements within the SVG
        const paths = document.querySelectorAll('#svgMapContainer svg path');
    
        // Add click event listener to each path element
        paths.forEach(path => {
            path.addEventListener('click', () => {
                // Log the id attribute of the clicked state
                console.log('Clicked state:', path.getAttribute('id'));
    
                // Check if a start place has been selected
                if (startPlace === null) {
                    // Set start place
                    startPlace = path;
                    // Append startPlace to selectPlacesContainer
                    selectPlacesContainer.appendChild(startPlace.cloneNode(true));
                    // Enlarge and move startPlace to the left box
                    enlargeAndMoveToBox(startPlace, 'left');
                } else if (endPlace === null) { // Check if an end place has been selected
                    // Set end place
                    endPlace = path;
                    // Append endPlace to selectPlacesContainer
                    selectPlacesContainer.appendChild(endPlace.cloneNode(true));
                    // Enlarge and move endPlace to the right box
                    enlargeAndMoveToBox(endPlace, 'right');
    
                    // Bring selectPlacesContainer to the front
                    selectPlacesContainer.style.zIndex = 1;
                } else {
                    // Reset start and end places if both are already set
                    resetPlaces();
                }
            });
        });
    
        // Add click event listener to selectPlacesContainer to reset selected states
        selectPlacesContainer.addEventListener('click', () => {
            resetPlaces();
            // Set z-index back to -1 to send selectPlacesContainer to the back
            selectPlacesContainer.style.zIndex = -1;
        });
    }
    
    function enlargeAndMoveToBox(state, boxPosition) {
        const svgWidth = 1920; // Width of the SVG
        const svgHeight = 1080; // Height of the SVG
        const boxWidth = 640; // Width of the box
        const boxMargin = 20; // Margin between boxes
    
        // Enlarge and move the state
        if (boxPosition === 'left') {
            const stateX = (svgWidth / 2 - boxWidth - boxMargin) / 2; // Calculate X position for the left box
            const stateY = svgHeight / 2; // Y position is centered
            state.setAttribute('transform', `scale(2) translate(${stateX}, ${stateY})`);
        } else if (boxPosition === 'right') {
            const stateX = svgWidth / 2 + (svgWidth / 2 - boxWidth - boxMargin) / 2; // Calculate X position for the right box
            const stateY = svgHeight / 2; // Y position is centered
            state.setAttribute('transform', `scale(2) translate(${stateX}, ${stateY})`);
        }
    }
    
    function resetPlaces() {
        // Reset transformation attributes
        startPlace.setAttribute('transform', '');
        endPlace.setAttribute('transform', '');
    
        // Append startPlace and endPlace back to their original parent containers
        startPlace.parentNode.appendChild(startPlace);
        endPlace.parentNode.appendChild(endPlace);
    
        // Reset variables
        startPlace = null;
        endPlace = null;
    }
    
    // Load the SVG map when the document is ready
    document.addEventListener('DOMContentLoaded', loadSVGMap);