
    /* 
    ========================================= 
        PART 1: SIDEBAR TOGGLE LOGIC
    =========================================   
    */
    function initSidebar() {   
        // Select the necessary elements from the DOM
        const toggleBtn = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');

        // Check if these elements actually exist on the current page to avoid errors
        if (toggleBtn && sidebar) {
            
            // Event Listener: When the arrow button is clicked
            toggleBtn.addEventListener('click', (event) => {
                // 'stopPropagation' prevents the click event from bubbling up to the document.
                // Without this, the document click listener (below) would fire immediately 
                // and close the sidebar right after we opened it.
                event.stopPropagation();
                
                // Toggle the 'active' class on the sidebar
                // In CSS, .sidebar-container.active { transform: translateX(0); }
                sidebar.classList.toggle('active');
            });
        }

        // Event Listener: Clicking anywhere else on the document closes the sidebar
        document.addEventListener('click', (event) => {
            // We only want to close the sidebar if:
            // 1. The sidebar exists and is currently open ('active').
            // 2. The click happened OUTSIDE the sidebar (!sidebar.contains(event.target)).
            // 3. The click was NOT on the toggle button itself.
            if (sidebar && sidebar.classList.contains('active') && 
                !sidebar.contains(event.target) && 
                event.target !== toggleBtn) {
                
                sidebar.classList.remove('active');
            }
        });
    }

    /* 
    ========================================= 
        PART 2: SMART TABLE SEARCH LOGIC 
    ========================================= 
    */
    
    function initTableSearch() {
        // Select the search input box and the main data table
        const searchInput = document.getElementById('tableSearch');
        const table = document.querySelector('table');
        
        // Only run this logic if the search bar and table exist on this page
        if (searchInput && table) {
            
            // Select all table rows specifically inside the <tbody> (ignoring the header row)
            const rows = table.querySelectorAll('tbody tr');
            
            // Dynamically create a "No Results" message element using JavaScript
            // This is better than hiding it in HTML because we create it only when needed.
            const noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.textContent = 'No matching products found.';
            
            // Insert this new message div immediately after the table in the DOM
            table.parentElement.appendChild(noResultsMsg); 

            // Event Listener: Fires every time a user releases a key in the input box ('keyup')
            searchInput.addEventListener('keyup', (event) => {
                
                // 1. Get the user's input
                // 2. Convert to Lowercase: Ensures "ARM" matches "arm" (Case-Insensitive)
                // 3. Trim: Removes accidental spaces at the start or end
                const term = event.target.value.toLowerCase().trim();
                
                // Counter to track how many rows are still visible
                let visibleCount = 0;

                // Loop through every row in the table
                rows.forEach(row => {
                    // Get all the text content inside this specific row
                    // (e.g., "STM32F103... 32-bit ARM Cortex...")
                    const rowText = row.textContent.toLowerCase();
                    
                    // STRING PROCESSING: Check if the row's text contains the search term
                    if (rowText.includes(term)) {
                        // STYLE MANIPULATION: If it matches, reset display to default (show it)
                        row.style.display = ''; 
                        visibleCount++; // Increment our counter
                    } else {
                        // STYLE MANIPULATION: If it doesn't match, hide it entirely
                        row.style.display = 'none';
                    }
                });

                // Logic to handle the "No Results" state
                if (visibleCount === 0) {
                    // If no rows matched, show the "No Results" message
                    noResultsMsg.style.display = 'block';
                    // Also hide the table header so it doesn't look weird floating there
                    table.style.display = 'none'; 
                } else {
                    // If results were found, hide the message
                    noResultsMsg.style.display = 'none';
                    // Show the table (and its header) again
                    table.style.display = ''; 
                }
            });
        }
    }
    /* 
    ========================================= 
        PART 3: DRAGGABLE IMAGE TRACK
    ========================================= 
    */
    function initGallery() {
        const track = document.getElementById("image-track");
        const galleryContainer = document.getElementById("interactive-gallery-container");

        if (track && galleryContainer) {
            
            // 1. MOUSE DOWN: Record where the click started
            const handleOnDown = e => {
                track.dataset.mouseDownAt = e.clientX;
            }

            // 2. MOUSE UP: Save the progress so it doesn't reset next time
            const handleOnUp = () => {
                track.dataset.mouseDownAt = "0";  
                track.dataset.prevPercentage = track.dataset.percentage;
            }

            // 3. MOUSE MOVE: Calculate distance and move the track
            const handleOnMove = e => {
                // If mouse isn't pressed (mouseDownAt is "0"), do nothing
                if(track.dataset.mouseDownAt === "0") return;

                const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
                    maxDelta = window.innerWidth; // Sensitivity factor

                // Calculate percentage moved
                const percentage = (mouseDelta / maxDelta) * -100,
                    nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
                
                // Constrain between -100% and 0% (so you can't drag it off screen forever)
                const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

                // Save current percentage for the next loop
                track.dataset.percentage = nextPercentage;

                // ANIMATE THE TRACK
                track.animate({
                    transform: `translate(${nextPercentage}%, -50%)`
                }, { duration: 1200, fill: "forwards" });

                // PARALLAX EFFECT ON IMAGES
                // As the track moves left, the images inside pan right (object-position)
                for(const image of track.getElementsByClassName("track-image")) {
                    image.animate({
                        objectPosition: `${100 + (nextPercentage * 1.2)}% center`
                    }, { duration: 1200, fill: "forwards" });
                }
            }

            // Attach listeners to the Container (so it only works in that section)
            // using 'window' for move/up ensures smoothly handling if you drag outside the box
            galleryContainer.onmousedown = e => handleOnDown(e);
            galleryContainer.ontouchstart = e => handleOnDown(e.touches[0]);
            
            window.onmouseup = e => handleOnUp(e);
            window.ontouchend = e => handleOnUp(e.touches[0]);
            
            window.onmousemove = e => handleOnMove(e);
            window.ontouchmove = e => handleOnMove(e.touches[0]);
        }
    }

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initTableSearch();
    initGallery();
});