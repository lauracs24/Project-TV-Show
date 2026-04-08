// Level 200 - refactor before adding new features

let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const pageTitle = document.createElement("h1");
  pageTitle.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeContainer = document.createElement("section");
  episodeContainer.className = "episode-container";

  episodeList.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    episodeContainer.appendChild(episodeCard);
  });

  rootElem.appendChild(pageTitle);
  rootElem.appendChild(episodeContainer);
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = episode.name;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary;

  card.appendChild(title);
  card.appendChild(image);
  card.appendChild(summary);

  return card;
}

function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
