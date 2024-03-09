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

                // const bandcampLink = document.createElement('a');
                // bandcampLink.classList.add('bandcamp-link');
                // bandcampLink.href = 'https://switchstancerecordings.bandcamp.com/track/risin-high-feat-raashan-ahmad';
                // bandcampLink.target = '_blank';

                // const bandcampGreyImg = document.createElement('img');
                // bandcampGreyImg.classList.add('bandcamp-grey');
                // bandcampGreyImg.src = '../static/img/bandcamp-grey.svg';

                // const bandcampWhiteImg = document.createElement('img');
                // bandcampWhiteImg.classList.add('bandcamp-white');
                // bandcampWhiteImg.src = '../static/img/bandcamp-white.svg';

                // bandcampLink.appendChild(bandcampGreyImg);
                // bandcampLink.appendChild(bandcampWhiteImg);

                const songDuration = document.createElement('span');
                songDuration.classList.add('song-duration');
                songDuration.textContent = song.duration;

                songContainer.appendChild(songNowPlayingIconContainer);
                songContainer.appendChild(songMetaData);
                // songContainer.appendChild(bandcampLink);
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
