const currentSong = new Audio();
let currFolder;
let songs;
async function getSongs(folder) {
console.log(folder);
  currFolder=folder;
  let a = await fetch(`/Spotify/${folder}/`);
  
  let response = await a.text();
console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

 songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
    }
  }

  let songUL = document.querySelector(".songs ul");
songUL.innerHTML=""
  let songListHTML = "";
  for (const song of songs) {
    songListHTML += `
      <li>
        <img class="invert" height="30" width="30" src="music.svg" alt="music" />
        <div class="info">
          <div>${song}</div>
          <div>Sujib</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="play.svg" class="invert" height="30" width="30" alt="playnow">
        </div>
      </li>`;
  }
  songUL.innerHTML = songListHTML;

  document.querySelectorAll(".songs li").forEach((e) => {
    e.addEventListener("click", () => {
      let songName = e.querySelector(".info div:first-child").textContent.trim();
      playMusic(songName);
    });
  });

 
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/Spotify/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    let playButton = document.getElementById("play");
    if (playButton) {
      playButton.src = "pause.svg";
    }
  }
  document.querySelector(".songinfo").innerHTML = track.replace(".mp3", "");
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function main() {
 await getSongs("songs/hph");
  playMusic(songs[0], true);
  
  let play = document.getElementById("play");
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });


  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    let progress = (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector(".circle").style.left = `${progress}%`;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    let newTime = (currentSong.duration * percent) / 100;
    currentSong.currentTime = newTime;
    document.querySelector(".circle").style.left = `${percent}%`;
  });

  document.querySelector(".ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });
  document.querySelector(".x").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    console.log("Previous is clicked");
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop()); // Extract filename
    let index = songs.indexOf(currentTrack);

    if (index > 0) {
        playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length-1]);
        console.log("Already at the first song.");
    }
});

next.addEventListener("click", () => {
    console.log("Next is clicked");
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop()); // Extract filename
    let index = songs.indexOf(currentTrack);

    if (index !== -1 && index < songs.length - 1) {
        playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);

        console.log("Already at the last song.");
    }
});

document.querySelector(".volume input").addEventListener("input", (e) => {
  currentSong.volume = e.target.value;
});



//load folder/album
Array.from(document.getElementsByClassName("card")).forEach(e=>{
  e.addEventListener("click", async item=>{
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
  
  })
})

}

function secondsToMinutesSeconds(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

main();
