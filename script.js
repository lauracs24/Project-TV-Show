let allShows = [];
let allEpisodes = [];
let searchTerm = "";
let selectedEpisodeId = "all";
let selectedShowId = "";

const cache = {};

function setup() {
  loadShows();
}

async function fetchData(url) {
  if (cache[url]) {
    return cache[url];
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load data");
  }

  const data = await response.json();
  cache[url] = data;
  return data;
}

async function loadShows() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading shows, please wait...</p>";

  try {
    const shows = await fetchData("https://api.tvmaze.com/shows");

    allShows = shows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    if (allShows.length > 0) {
      selectedShowId = String(allShows[0].id);
      await loadEpisodesForShow(selectedShowId);
    } else {
      rootElem.innerHTML = "<p>No shows found.</p>";
    }
  } catch (error) {
    rootElem.innerHTML =
      "<p>Sorry, something went wrong while loading shows.</p>";
  }
}

async function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes, please wait...</p>";

  try {
    const episodes = await fetchData(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    allEpisodes = episodes;
    searchTerm = "";
    selectedEpisodeId = "all";
    makePageForEpisodes(getFilteredEpisodes());
  } catch (error) {
    rootElem.innerHTML =
      "<p>Sorry, something went wrong while loading episodes.</p>";
  }
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const pageTitle = document.createElement("h1");
  pageTitle.textContent = "TV Show Project";

  const controls = document.createElement("section");
  controls.className = "controls";

  const showGroup = document.createElement("div");
  showGroup.className = "control-group";

  const showLabel = document.createElement("label");
  showLabel.setAttribute("for", "show-select");
  showLabel.textContent = "Select show";

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.addEventListener("change", handleShowSelect);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.value = selectedShowId;
  showGroup.append(showLabel, showSelect);

  const searchGroup = document.createElement("div");
  searchGroup.className = "control-group";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "search-input");
  searchLabel.textContent = "Search episodes";

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search by episode name or summary";
  searchInput.value = searchTerm;
  searchInput.addEventListener("input", handleSearchInput);

  searchGroup.append(searchLabel, searchInput);

  const episodeGroup = document.createElement("div");
  episodeGroup.className = "control-group";

  const episodeLabel = document.createElement("label");
  episodeLabel.setAttribute("for", "episode-select");
  episodeLabel.textContent = "Select episode";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.addEventListener("change", handleEpisodeSelect);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeSelect.value = selectedEpisodeId;
  episodeGroup.append(episodeLabel, episodeSelect);

  controls.append(showGroup, searchGroup, episodeGroup);

  const resultsCount = document.createElement("p");
  resultsCount.className = "results-count";
  resultsCount.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episode(s)`;

  const episodeContainer = document.createElement("section");
  episodeContainer.className = "episode-container";

  episodeList.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    episodeContainer.appendChild(episodeCard);
  });

  const sourceParagraph = document.createElement("p");
  sourceParagraph.className = "source-text";
  sourceParagraph.innerHTML =
    'Data originally comes from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';

  rootElem.append(
    pageTitle,
    controls,
    resultsCount,
    episodeContainer,
    sourceParagraph
  );
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = episode.name;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";

  card.append(title, image, summary);
  return card;
}

function handleShowSelect(event) {
  selectedShowId = event.target.value;
  loadEpisodesForShow(selectedShowId);
}

function handleSearchInput(event) {
  searchTerm = event.target.value.toLowerCase();
  makePageForEpisodes(getFilteredEpisodes());
}

function handleEpisodeSelect(event) {
  selectedEpisodeId = event.target.value;
  makePageForEpisodes(getFilteredEpisodes());
}

function getFilteredEpisodes() {
  return allEpisodes.filter((episode) => {
    const matchesSelectedEpisode =
      selectedEpisodeId === "all" || String(episode.id) === selectedEpisodeId;

    const matchesSearch =
      episode.name.toLowerCase().includes(searchTerm) ||
      stripHtml(episode.summary || "")
        .toLowerCase()
        .includes(searchTerm);

    return matchesSelectedEpisode && matchesSearch;
  });
}

function stripHtml(htmlText) {
  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = htmlText;
  return temporaryElement.textContent || temporaryElement.innerText || "";
}

function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
