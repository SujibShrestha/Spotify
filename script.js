const SERVER = window.location.origin;
const currentSong = new Audio();
let currFolder = "";
let songs = [];

/**
 * Fetches /{folder}/, parses the HTML directory listing,
 * extracts all “.mp3” links, decodes them, renders the list,
 * and returns the array of filenames.
 */
async function getSongs(folder) {
  // folder is "songs/hph"
  currFolder = folder;

  // fetch the static manifest.json
  const manifestUrl = `/${folder}/manifest.json`;
  let res = await fetch(manifestUrl);
  if (!res.ok) {
    console.error("Could not load manifest:", res.status, res.statusText);
    songs = [];
  } else {
    songs = await res.json();  // array of filenames
  }

  renderSongList();
  return songs;
}


/**
 * Builds the <li>…</li> markup and installs one click‐handler
 * on the UL for delegated “play-this-track” behavior.
 */
function renderSongList() {
  const ul = document.querySelector(".songs ul");
  ul.innerHTML = songs.map(song => `
    <li data-track="${song}">
      <img class="invert" height="30" width="30" src="music.svg" alt="music" />
      <div class="info">
        <div>${song}</div>
        <div>Sujib</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img src="play.svg" class="invert" height="30" width="30" alt="playnow">
      </div>
    </li>
  `).join("");

  // delegate all <li> clicks to a single handler
  ul.onclick = e => {
    const li = e.target.closest("li[data-track]");
    if (!li) return;
    playMusic(li.dataset.track);
  };
}

/**
 * Plays (or pauses) the given track, relative to your HTTP server.
 */
function playMusic(track, pause = false) {
  currentSong.src = `${SERVER}/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.getElementById("play")?.setAttribute("src", "pause.svg");
  }
  document.querySelector(".songinfo").textContent = track.replace(".mp3","");
  document.querySelector(".songtime").textContent = "00:00/00:00";
}

// ————————————————————————————————————————————————————————————

async function main() {
  await getSongs("songs/hph");
  playMusic(songs[0], true);

  // toggle play/pause button
  document.getElementById("play").onclick = () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  };

  // update time & progress
  currentSong.ontimeupdate = () => {
    document.querySelector(".songtime").textContent = 
      `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    let pct = (currentSong.currentTime/currentSong.duration)*100;
    document.querySelector(".circle").style.left = `${pct}%`;
  };

  // seekbar click
  document.querySelector(".seekbar").onclick = e => {
    let pct = e.offsetX / e.currentTarget.clientWidth;
    currentSong.currentTime = currentSong.duration * pct;
  };

  // nav drawer
  document.querySelector(".ham").onclick = () => 
    document.querySelector(".left").style.left = "0%";
  document.querySelector(".x").onclick = () => 
    document.querySelector(".left").style.left = "-100%";

  // prev / next
  document.getElementById("previous").onclick = () => {
    let idx = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
    playMusic(idx>0 ? songs[idx-1] : songs[songs.length-1]);
  };
  document.getElementById("next").onclick = () => {
    let idx = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
    playMusic(idx < songs.length-1 ? songs[idx+1] : songs[0]);
  };

  // volume
  document.querySelector(".volume input").oninput = e => 
    currentSong.volume = e.target.value;

  // load folder/album cards
  document.querySelectorAll(".card").forEach(card => {
    card.onclick = () => getSongs(`songs/${card.dataset.folder}`);
  });
}

function secondsToMinutesSeconds(sec) {
  let m = Math.floor(sec/60), s = Math.floor(sec%60);
  return `${m}:${s<10?"0"+s:s}`;
}

main();
