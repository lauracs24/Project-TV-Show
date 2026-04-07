// Level 100 - show all episodes on the page

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const card = document.createElement("div");

    // Title + episode code
    const title = document.createElement("h2");
    title.textContent =
      episode.name +
      " - " +
      formatEpisodeCode(episode);

    // Image
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = episode.name;

    // Summary
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    // Add everything to card
    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);

    // Add card to page
    rootElem.appendChild(card);
  });
}

// Format like S01E02
function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return "S" + season + "E" + number;
}

window.onload = setup;
