// Function to load the SVG map and add it to the HTML document
function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    // Adjusted path to reference SVG file from the "assets" folder, considering the location of the JavaScript file in the "js" folder
    const svgURL = 'assets/Full_US_Map.svg';


    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            // Initialize event listeners after SVG is loaded
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

// Function to add interaction events to each state in the SVG
function initializeStateInteractions() {
    const states = document.querySelectorAll('#svgMapContainer path'); // Assuming each state is a path element
    states.forEach(state => {
        state.addEventListener('mouseenter', () => {
            state.style.fill = '#00ff00'; // Example: Change color to green on hover
        });
        state.addEventListener('mouseleave', () => {
            state.style.fill = ''; // Reset color on mouse leave
        });
    });
}

// Load the SVG map when the document is ready
document.addEventListener('DOMContentLoaded', loadSVGMap);

