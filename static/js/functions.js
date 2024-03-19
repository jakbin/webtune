/*
	When the bandcamp link is pressed, stop all propagation so AmplitudeJS doesn't
	play the song.
*/

function addCssInSongList() {
    let bandcampLinks = document.getElementsByClassName('bandcamp-link');

    for( var i = 0; i < bandcampLinks.length; i++ ){
        bandcampLinks[i].addEventListener('click', function(e){
            e.stopPropagation();
        });
    }

    let songElements = document.getElementsByClassName('song');

    for( var i = 0; i < songElements.length; i++ ){
    	/*
    		Ensure that on mouseover, CSS styles don't get messed up for active songs.
    	*/
    	songElements[i].addEventListener('mouseover', function(){
    		this.style.backgroundColor = '#00A0FF';

    		this.querySelectorAll('.song-meta-data .song-title')[0].style.color = '#FFFFFF';
    		this.querySelectorAll('.song-meta-data .song-artist')[0].style.color = '#FFFFFF';

    		if( !this.classList.contains('amplitude-active-song-container') ){
    			this.querySelectorAll('.play-button-container')[0].style.display = 'block';
    		}

    		// this.querySelectorAll('img.bandcamp-grey')[0].style.display = 'none';
    		// this.querySelectorAll('img.bandcamp-white')[0].style.display = 'block';
    		this.querySelectorAll('.song-duration')[0].style.color = '#FFFFFF';
    	});

    	/*
    		Ensure that on mouseout, CSS styles don't get messed up for active songs.
    	*/
    	songElements[i].addEventListener('mouseout', function(){
    		this.style.backgroundColor = '#FFFFFF';
    		this.querySelectorAll('.song-meta-data .song-title')[0].style.color = '#272726';
    		this.querySelectorAll('.song-meta-data .song-artist')[0].style.color = '#607D8B';
    		this.querySelectorAll('.play-button-container')[0].style.display = 'none';
    		// this.querySelectorAll('img.bandcamp-grey')[0].style.display = 'block';
    		// this.querySelectorAll('img.bandcamp-white')[0].style.display = 'none';
    		this.querySelectorAll('.song-duration')[0].style.color = '#607D8B';
    	});

    	/*
    		Show and hide the play button container on the song when the song is clicked.
    	*/
    	songElements[i].addEventListener('click', function(){
    		this.querySelectorAll('.play-button-container')[0].style.display = 'none';
    	});
    }
}

function loadSongsList() {
    return new Promise((resolve, reject) => {
    fetch('/songs_list').then(response => response.json()).then(data => {
        const songs = data.songs;
        const songsContainer = document.getElementById('amplitude-right');
        songsContainer.innerHTML = '';
        
        const jsonArray = songs;
        jsonArray.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        if (songs.length === 0) {
            songsContainer.innerHTML = "<h1>No song found, please set correct music folder !!</h1>";
        } else {
            songs.forEach(song => {
                const songContainer = document.createElement('div');
                songContainer.classList.add('song', 'amplitude-song-container', 'amplitude-play-pause');
                songContainer.setAttribute('data-amplitude-song-index', songs.indexOf(song));

                const songNowPlayingIconContainer = document.createElement('div');
                songNowPlayingIconContainer.classList.add('song-now-playing-icon-container');

                const playButtonContainer = document.createElement('div');
                playButtonContainer.classList.add('play-button-container');

                const nowPlayingImg = document.createElement('img');
                nowPlayingImg.classList.add('now-playing');
                nowPlayingImg.src = '../static/img/now-playing.svg';

                songNowPlayingIconContainer.appendChild(playButtonContainer);
                songNowPlayingIconContainer.appendChild(nowPlayingImg);

                const songMetaData = document.createElement('div');
                songMetaData.classList.add('song-meta-data');

                const songTitle = document.createElement('span');
                songTitle.classList.add('song-title');
                songTitle.textContent = song.name;

                const songArtist = document.createElement('span');
                songArtist.classList.add('song-artist');
                songArtist.textContent = song.artist;

                const fileName = document.createElement('span');
                fileName.classList.add('file-name');
                fileName.style.display = 'none';
                fileName.textContent = song.file_name;

                songMetaData.appendChild(songTitle);
                songMetaData.appendChild(songArtist);
                songMetaData.appendChild(fileName);

                const songDuration = document.createElement('span');
                songDuration.classList.add('song-duration');
                songDuration.textContent = song.duration;

                songContainer.appendChild(songNowPlayingIconContainer);
                songContainer.appendChild(songMetaData);
                songContainer.appendChild(songDuration);

                songsContainer.appendChild(songContainer);
            });
        }
        resolve(true);
    }).catch(error => {
        console.error('Error:', error);
        reject(false);
    });
    });
};

addCssInSongList();

let songs;

function getSongs() {
    return fetch('/songs')
        .then(res => res.json())
        .then(data => {
            songs = data;
            const jsonArray = songs;
            jsonArray.sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
        });
}

function loadSongs() {
    return getSongs().then(() => {
        Amplitude.init({
            "bindings": {
                39: 'next',
                37: 'prev',
                32: 'play_pause',
            },
            continue_next: true,
            "songs": songs,
        });
    });
}

loadSongsList()
    .then(success => {
        console.log("Songs loaded successfully:", success);
        loadSongs();
    })
    .catch(error => {
        console.error("Error loading songs:", error);
    });


// Define the onDeleteButtonClick function separately
function onDeleteButtonClick(songName) {
    console.log("Delete button clicked for song:", songName);
    const data = { songName: songName };

    const options = { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) };

    fetch('/deleteSong', options)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Response:', data);
        // Handle the response data here
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle errors here
    });

    loadSongsList()
        .then(success => {
            console.log("Songs loaded successfully:", success);
            loadSongs();
        })
        .catch(error => {
            console.error("Error loading songs:", error);
        });
}

document.addEventListener("contextmenu", function(event) {
    // Prevent the default context menu
    event.preventDefault();

    // Check if the clicked element is a song container
    var clickedElement = event.target.closest(".song");
    if (clickedElement) {
        // Find the song name
        var songName = clickedElement.querySelector(".file-name").textContent;

        // Show the custom context menu
        var customMenu = document.getElementById("custom-menu");
        customMenu.style.display = "block";

        // Position the custom menu at the click location
        customMenu.style.top = event.clientY + "px";
        customMenu.style.left = event.clientX + "px";

        // Remove any existing click event listener for the delete button
        var deleteButton = document.getElementById("delete-button");
        deleteButton.removeEventListener("click", onDeleteButtonClick); // Remove any existing listener

        // Add a click event listener to the delete button, passing the song name
        deleteButton.addEventListener("click", function() {
            onDeleteButtonClick(songName); // Call the function with the songName parameter
        });
    } else {
        // Hide the custom menu if clicked outside a song
        document.getElementById("custom-menu").style.display = "none";
    }
});

// Hide the custom menu when clicking anywhere outside of it
document.addEventListener("click", function(event) {
    if (!event.target.closest(".song")) {
        document.getElementById("custom-menu").style.display = "none";
    }
});