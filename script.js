// --- 1. Selectors ---
const audio = document.getElementById('audio-element');
const playPauseBtn = document.getElementById('play-pause-btn');
const previousBtn = document.getElementById('previous-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const timeDisplay = document.getElementById('time-display');
// New Selectors
const currentTrackTitle = document.getElementById('current-track-title');
const currentTrackArtist = document.getElementById('current-track-artist');
const coverArt = document.getElementById('cover-art');
const volumeBar = document.getElementById('volume-bar');
const songListEl = document.getElementById('song-list');
const themeToggle = document.getElementById('theme-toggle');
const uploadBtn = document.getElementById('upload-btn');
const songUploadInput = document.getElementById('song-upload');

// --- 2. Data & State ---
let songs = []; // Will be populated by fetch
let currentSongIndex = 0;
let isPlaying = false;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs')) || [];

// --- Simulated External Data (Database/API) ---
// IMPORTANT: You must have these files in an 'audio' and 'images' folder respectively.
const simulatedApiData = [
    { 
        id: 1, 
        title: 'The Road Ahead', 
        artist: 'Artist One', 
        src: 'track1.mp3', 
        cover: 'cover1.jpg' 
    },
    { 
        id: 2, 
        title: 'Quiet Reflection', 
        artist: 'Artist Two', 
        src: 'track2.mp3', 
        cover: 'cover2.jpg' 
    },
    { 
        id: 3, 
        title: 'Coding Flow State', 
        artist: 'Artist Three', 
        src: 'track3.mp3', 
        cover: 'cover3.jpg' 
    }
];


// --- 3. Core Functions ---

// Helper: Format time (seconds to M:SS)
const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// Simulate fetching data
async function fetchSongs() {
    currentTrackTitle.textContent = "Loading tracks...";
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Combine default and uploaded songs
    songs = [...simulatedApiData, ...uploadedSongs];
    
    if (songs.length === 0) {
        currentTrackTitle.textContent = "No songs loaded";
        currentTrackArtist.textContent = "Upload songs to get started";
    } else {
        console.log('Songs loaded successfully.');
    }

    // Initialize volume based on slider position
    audio.volume = volumeBar.value;
    
    // Initialize player with the first song if available
    if (songs.length > 0) {
        loadSong(currentSongIndex);
    }
    renderSongList();
}

// Render the song list in the UI
function renderSongList() {
    songListEl.innerHTML = ''; 
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('song-item');
        
        // Display title and artist with delete button for uploaded songs
        if (song.isUploaded) {
            li.innerHTML = `
                <div>
                    <div>${song.title}</div>
                    <small>${song.artist}</small>
                </div>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
            `;
            
            // Add delete functionality
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSong(index);
            });
        } else {
            li.innerHTML = `
                <div>${song.title}</div>
                <small>${song.artist}</small>
            `;
        }
        
        li.dataset.index = index;
        
        // Highlight currently loaded song
        if (index === currentSongIndex) {
            li.classList.add('active');
        }

        // Click list item to play
        li.addEventListener('click', () => {
            loadSong(index);
            playSong();
        });
        songListEl.appendChild(li);
    });
}

// Load a specific song data into the player
function loadSong(index) {
    currentSongIndex = index;
    const song = songs[currentSongIndex];

    // Load Audio info
    audio.src = song.src;
    currentTrackTitle.textContent = song.title;
    currentTrackArtist.textContent = song.artist;
    
    // Load Cover Art
    // We use a placeholder if the image fails to load
    coverArt.src = song.cover;
    coverArt.onerror = function() {
        this.style.display='none';//src = 'https://via.placeholder.com/150?text=No+Cover'; 
    };

    // Update active status in the list view
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.song-item[data-index="${index}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Reset progress bar
    progressBar.value = 0;
    audio.load();
    
    // Wait for metadata to get duration
    audio.onloadedmetadata = () => {
        progressBar.max = audio.duration;
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    };
}

// Delete a song from uploaded songs
function deleteSong(index) {
    if (songs[index].isUploaded) {
        const songTitle = songs[index].title;
        
        // Remove from uploaded songs
        uploadedSongs = uploadedSongs.filter(s => s.id !== songs[index].id);
        
        // Remove from songs array
        songs.splice(index, 1);
        
        // Update localStorage
        localStorage.setItem('uploadedSongs', JSON.stringify(
            uploadedSongs.map(s => ({...s, src: ''}))
        ));
        
        // Adjust current song index if needed
        if (currentSongIndex >= songs.length && songs.length > 0) {
            currentSongIndex = 0;
        }
        
        // Reload song list and player
        renderSongList();
        if (songs.length > 0) {
            loadSong(currentSongIndex);
        } else {
            currentTrackTitle.textContent = "No songs loaded";
            currentTrackArtist.textContent = "Upload songs to get started";
        }
        
        console.log('Song deleted:', songTitle);
    }
}

// --- 4. Event Listeners & Controls ---

// Play/Pause
function playSong() {
    // Attempt to play. Browsers require user interaction first, 
    // so this might fail if called automatically on page load.
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(error => {
           console.log("Playback prevented by browser policy unless interacted with.");
        });
    }
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

playPauseBtn.addEventListener('click', () => {
    isPlaying ? pauseSong() : playSong();
});

// Next/Previous Navigation
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

nextBtn.addEventListener('click', nextSong);
previousBtn.addEventListener('click', previousSong);

// Progress Bar Updates
audio.addEventListener('timeupdate', () => {
    // Only update if the user isn't currently dragging the slider
    progressBar.value = audio.currentTime;
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});

// Seeking (Dragging progress bar)
progressBar.addEventListener('input', () => {
    audio.currentTime = progressBar.value;
});

// Volume Control
volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Auto-play next song when current ends
audio.addEventListener('ended', nextSong);

// --- Theme Toggle ---
function initTheme() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    initTheme();
});

// --- File Upload Functionality ---
uploadBtn.addEventListener('click', () => {
    songUploadInput.click();
});

songUploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
        // Check if file is audio
        if (!file.type.startsWith('audio/')) {
            console.warn('Skipping non-audio file:', file.name);
            return;
        }

        // Create a URL for the audio file
        const fileUrl = URL.createObjectURL(file);
        
        // Extract filename without extension as title
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        
        // Create song object
        const newSong = {
            id: Date.now() + Math.random(),
            title: fileName,
            artist: 'Uploaded',
            src: fileUrl,
            cover: 'https://via.placeholder.com/200?text=Uploaded+Music',
            isUploaded: true
        };
        
        // Add to uploaded songs and songs list
        uploadedSongs.push(newSong);
        songs.push(newSong);
        
        console.log('Song uploaded:', newSong.title);
    });
    
    // Save uploaded songs (store only metadata, not blob URLs)
    localStorage.setItem('uploadedSongs', JSON.stringify(
        uploadedSongs.map(s => ({...s, src: ''})) // Don't save blob URLs
    ));
    
    renderSongList();
    
    // Reset file input
    songUploadInput.value = '';
});

// --- 5. Initialization ---
initTheme();
fetchSongs();