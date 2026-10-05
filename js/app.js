document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let expeditionsData = [];
    let activeExpeditionFilter = 'all';
    let activeStopId = null;
    let markers = [];
    let polylines = [];
    let map = null;
    let vehicleMarker = null;
    let currentVehiclePos = null;
    let animationAnimationFrameId = null;
    let tourPlaying = false;
    let tourInterval = null;
    let currentTourIndex = 0;
    let visibleStops = [];

    // DOM Elements
    const stopsListEl = document.getElementById('stops-list');
    const searchInput = document.getElementById('stop-search');
    const statsSummaryEl = document.getElementById('stats-summary');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const infoModalBtn = document.getElementById('info-modal-btn');
    const infoModal = document.getElementById('info-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryImg = document.getElementById('gallery-img');
    const galleryCaption = document.getElementById('gallery-caption');
    const closeGalleryBtn = document.querySelector('.close-gallery');

    // Timeline Tour Controls
    const prevStopBtn = document.getElementById('prev-stop-btn');
    const playTourBtn = document.getElementById('play-tour-btn');
    const playBtnText = document.getElementById('play-btn-text');
    const nextStopBtn = document.getElementById('next-stop-btn');
    const tourIndicator = document.getElementById('tour-indicator');

    // Initialize Map using OpenStreetMap standard tile layer with Czech attribution
    function initMap() {
        map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([20.0, 10.0], 3);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; přispěvatelé <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        // Custom Vehicle Marker using real silver Tatra T87 icon graphics
        const tatraIcon = L.divIcon({
            className: 'tatra-animated-marker',
            html: `<div class="tatra-vehicle-badge" title="Tatra T87 - Hanzelka & Zikmund">
                <img src="images/tatra87_badge.png" alt="Tatra T87" class="tatra-img-badge">
            </div>`,
            iconSize: [50, 32],
            iconAnchor: [25, 16]
        });

        // Default initial vehicle position (Praha)
        currentVehiclePos = [50.0755, 14.4378];
        vehicleMarker = L.marker(currentVehiclePos, { icon: tatraIcon, zIndexOffset: 1000 }).addTo(map);
        vehicleMarker.bindTooltip("<b>Tatra T87</b><br>Vůz Hanzelka & Zikmund", { permanent: false, direction: 'top' });
    }

    // Smoothly animate Tatra vehicle from current location to target location
    function animateVehicleTo(targetLat, targetLng, durationMs = 1500, onComplete = null) {
        if (!vehicleMarker || !currentVehiclePos) return;

        if (animationAnimationFrameId) {
            cancelAnimationFrame(animationAnimationFrameId);
        }

        const startLat = currentVehiclePos[0];
        const startLng = currentVehiclePos[1];
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1.0);

            // Smooth easeInOutQuad easing
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const lat = startLat + (targetLat - startLat) * easeProgress;
            const lng = startLng + (targetLng - startLng) * easeProgress;

            currentVehiclePos = [lat, lng];
            vehicleMarker.setLatLng(currentVehiclePos);

            if (progress < 1.0) {
                animationAnimationFrameId = requestAnimationFrame(step);
            } else {
                animationAnimationFrameId = null;
                if (onComplete) onComplete();
            }
        }

        animationAnimationFrameId = requestAnimationFrame(step);
    }

    // Load Journey Data
    async function fetchJourneysData() {
        try {
            const response = await fetch('data/journeys.json');
            if (!response.ok) {
                throw new Error('Chyba při načítání souboru data/journeys.json');
            }
            const data = await response.json();
            expeditionsData = data.expeditions || [];
            renderApp();
        } catch (error) {
            console.error('Chyba při načítání dat o cestách:', error);
            stopsListEl.innerHTML = `<div style="padding:1rem; color:red;">Chyba při načítání dat o cestách: ${error.message}</div>`;
        }
    }

    // Render / Refresh Application State
    function renderApp() {
        clearMap();
        visibleStops = getAllFilteredStops();
        renderSidebarStops(visibleStops);
        renderMapFeatures();
        updateStatsSummary();
    }

    // Get Filtered Stops based on Expedition Filter and Search Query
    function getAllFilteredStops() {
        const query = searchInput.value.trim().toLowerCase();
        let stops = [];

        expeditionsData.forEach(exp => {
            if (activeExpeditionFilter === 'all' || activeExpeditionFilter === exp.id) {
                exp.stops.forEach(stop => {
                    const matchSearch = query === '' ||
                        stop.name.toLowerCase().includes(query) ||
                        stop.country.toLowerCase().includes(query) ||
                        stop.date.toLowerCase().includes(query) ||
                        stop.description.toLowerCase().includes(query);

                    if (matchSearch) {
                        stops.push({
                            ...stop,
                            expeditionId: exp.id,
                            expeditionTitle: exp.title,
                            expeditionColor: exp.color
                        });
                    }
                });
            }
        });

        return stops;
    }

    // Clear Markers and Polylines from Map
    function clearMap() {
        markers.forEach(m => map.removeLayer(m.marker));
        markers = [];
        polylines.forEach(p => map.removeLayer(p));
        polylines = [];
    }

    // Render Markers & Route Lines on Map
    function renderMapFeatures() {
        expeditionsData.forEach(exp => {
            if (activeExpeditionFilter === 'all' || activeExpeditionFilter === exp.id) {
                const routeCoords = exp.stops.map(stop => [stop.lat, stop.lng]);

                // Render Route Polyline
                const polyline = L.polyline(routeCoords, {
                    color: exp.color,
                    weight: 4,
                    opacity: 0.8,
                    dashArray: exp.id === 'expedition-2' ? '8, 8' : null
                }).addTo(map);

                polylines.push(polyline);

                // Render Stop Markers
                exp.stops.forEach((stop, index) => {
                    const isVisibleInFilter = visibleStops.some(s => s.id === stop.id);
                    if (!isVisibleInFilter) return;

                    const isStartOrEnd = index === 0 || index === exp.stops.length - 1;
                    const markerColor = exp.color;

                    const customIcon = L.divIcon({
                        className: 'custom-leaflet-marker',
                        html: `<div class="custom-marker" style="background-color: ${markerColor}; width: ${isStartOrEnd ? '24px' : '18px'}; height: ${isStartOrEnd ? '24px' : '18px'}; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.4); border: 2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">${isStartOrEnd ? '<i class="fa-solid fa-flag" style="font-size:8px;"></i>' : ''}</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);

                    // Build Popup Content with image fallback handling
                    const photoHtml = (stop.photos && stop.photos.length > 0)
                        ? `<img src="${stop.photos[0].url}" alt="${stop.photos[0].caption}" class="popup-thumb" data-photo-url="${stop.photos[0].url}" data-photo-caption="${stop.photos[0].caption}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60';">`
                        : '';

                    const popupContent = `
                        <div class="popup-content">
                            <div class="popup-country">${stop.country}</div>
                            <h3>${stop.name}</h3>
                            <div class="popup-date"><i class="fa-regular fa-calendar-days"></i> ${stop.date}</div>
                            <p>${stop.description}</p>
                            ${photoHtml}
                        </div>
                    `;

                    marker.bindPopup(popupContent);

                    // Marker click handler
                    marker.on('click', () => {
                        selectStop(stop.id, false);
                    });

                    markers.push({
                        id: stop.id,
                        marker: marker,
                        data: stop
                    });
                });
            }
        });

        // Delegate photo thumbnail clicks inside Leaflet popups
        map.on('popupopen', () => {
            const popupThumbs = document.querySelectorAll('.popup-thumb');
            popupThumbs.forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    const url = e.target.getAttribute('data-photo-url');
                    const caption = e.target.getAttribute('data-photo-caption');
                    openGallery(url, caption);
                });
            });
        });
    }

    // Render Sidebar List
    function renderSidebarStops(stops) {
        if (stops.length === 0) {
            stopsListEl.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Žádná zastávka neodpovídá zadanému filtru.</div>`;
            return;
        }

        stopsListEl.innerHTML = stops.map(stop => `
            <div class="stop-item ${stop.expeditionId} ${stop.id === activeStopId ? 'active' : ''}" data-stop-id="${stop.id}">
                <div class="stop-header">
                    <span class="stop-title">${stop.name}</span>
                    <span class="stop-country">${stop.country}</span>
                </div>
                <div class="stop-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${stop.date}</span>
                    ${stop.photos && stop.photos.length > 0 ? '<span><i class="fa-solid fa-camera"></i> Foto</span>' : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners to sidebar items
        document.querySelectorAll('.stop-item').forEach(item => {
            item.addEventListener('click', () => {
                const stopId = item.getAttribute('data-stop-id');
                selectStop(stopId, true);
            });
        });
    }

    // Select Stop (Fly to location on map, animate Tatra vehicle, open popup, highlight in sidebar)
    function selectStop(stopId, panMap = true) {
        activeStopId = stopId;
        const stopIndex = visibleStops.findIndex(s => s.id === stopId);
        if (stopIndex !== -1) {
            currentTourIndex = stopIndex;
            updateTourIndicator(visibleStops[stopIndex]);
        }

        // Highlight in sidebar
        document.querySelectorAll('.stop-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-stop-id') === stopId);
        });

        const activeItem = document.querySelector(`.stop-item[data-stop-id="${stopId}"]`);
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Pan map, animate Tatra vehicle & open popup
        const targetMarkerObj = markers.find(m => m.id === stopId);
        if (targetMarkerObj) {
            const targetLat = targetMarkerObj.data.lat;
            const targetLng = targetMarkerObj.data.lng;

            // Animate Tatra T87 vehicle movement
            animateVehicleTo(targetLat, targetLng, 1400);

            if (panMap) {
                map.flyTo([targetLat, targetLng], 7, {
                    duration: 1.2
                });
                setTimeout(() => {
                    targetMarkerObj.marker.openPopup();
                }, 1300);
            } else {
                targetMarkerObj.marker.openPopup();
            }
        }
    }

    // Update Statistics Header
    function updateStatsSummary() {
        const totalStops = visibleStops.length;
        const activeExp = expeditionsData.find(e => e.id === activeExpeditionFilter);

        let statsText = `Zobrazeno ${totalStops} zastávek`;
        if (activeExp) {
            statsText += ` (${activeExp.distance}, ${activeExp.vehicle})`;
        } else {
            statsText += ` (Celkově ~250 000 km)`;
        }
        statsSummaryEl.textContent = statsText;
    }

    // Tour Player Functionality
    function toggleTour() {
        if (tourPlaying) {
            stopTour();
        } else {
            startTour();
        }
    }

    function startTour() {
        if (visibleStops.length === 0) return;
        tourPlaying = true;
        playBtnText.textContent = 'Pozastavit';
        playTourBtn.querySelector('i').className = 'fa-solid fa-pause';

        if (currentTourIndex < 0 || currentTourIndex >= visibleStops.length) {
            currentTourIndex = 0;
        }

        selectStop(visibleStops[currentTourIndex].id, true);

        tourInterval = setInterval(() => {
            currentTourIndex = (currentTourIndex + 1) % visibleStops.length;
            selectStop(visibleStops[currentTourIndex].id, true);
        }, 4500);
    }

    function stopTour() {
        tourPlaying = false;
        playBtnText.textContent = 'Přehrát cestu';
        playTourBtn.querySelector('i').className = 'fa-solid fa-play';
        if (tourInterval) {
            clearInterval(tourInterval);
            tourInterval = null;
        }
    }

    function nextStop() {
        stopTour();
        if (visibleStops.length === 0) return;
        currentTourIndex = (currentTourIndex + 1) % visibleStops.length;
        selectStop(visibleStops[currentTourIndex].id, true);
    }

    function prevStop() {
        stopTour();
        if (visibleStops.length === 0) return;
        currentTourIndex = (currentTourIndex - 1 + visibleStops.length) % visibleStops.length;
        selectStop(visibleStops[currentTourIndex].id, true);
    }

    function updateTourIndicator(stop) {
        if (stop) {
            tourIndicator.textContent = `${currentTourIndex + 1}/${visibleStops.length}: ${stop.name} (${stop.country})`;
        } else {
            tourIndicator.textContent = 'Vyberte zastávku nebo spusťte prohlídku';
        }
    }

    // Open Photo Gallery Viewer
    function openGallery(url, caption) {
        galleryImg.src = url;
        galleryCaption.textContent = caption || '';
        galleryModal.classList.add('active');
    }

    function closeGallery() {
        galleryModal.classList.remove('active');
    }

    // Filter Buttons Listener
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeExpeditionFilter = btn.getAttribute('data-expedition');
            stopTour();
            renderApp();

            // Reset map view based on filter
            if (activeExpeditionFilter === 'all') {
                map.setView([20.0, 10.0], 3);
            } else if (activeExpeditionFilter === 'expedition-1') {
                map.setView([0.0, -20.0], 3);
            } else if (activeExpeditionFilter === 'expedition-2') {
                map.setView([35.0, 80.0], 3);
            }
        });
    });

    // Search Input Listener
    searchInput.addEventListener('input', () => {
        stopTour();
        renderApp();
    });

    // Tour Controls Listeners
    playTourBtn.addEventListener('click', toggleTour);
    nextStopBtn.addEventListener('click', nextStop);
    prevStopBtn.addEventListener('click', prevStop);

    // Modal Dialogs Listeners
    infoModalBtn.addEventListener('click', () => {
        infoModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        infoModal.classList.remove('active');
    });

    closeGalleryBtn.addEventListener('click', closeGallery);

    window.addEventListener('click', (e) => {
        if (e.target === infoModal) infoModal.classList.remove('active');
        if (e.target === galleryModal) closeGallery();
    });

    // Tabs inside info modal
    tabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            tabBtns.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = content.id === targetTab ? 'block' : 'none';
            });
        });
    });

    // Start App Initialization
    initMap();
    fetchJourneysData();
});
