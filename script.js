let allEpisodes = [];
let searchTerm = "";
let selectedEpisodeId = "all";

function setup() {
  allEpisodes = getAllEpisodes();
  createPageStructure();
  renderEpisodesView();
}

function createPageStructure() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const pageTitle = document.createElement("h1");
  pageTitle.textContent = "TV Show Project";

  const controls = document.createElement("section");
  controls.className = "controls";

  const searchGroup = document.createElement("div");
  searchGroup.className = "control-group";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "episode-search-input");
  searchLabel.textContent = "Search episodes";

  const searchInput = document.createElement("input");
  searchInput.id = "episode-search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search by episode name or summary";
  searchInput.addEventListener("input", handleEpisodeSearchInput);

  searchGroup.append(searchLabel, searchInput);

  const selectGroup = document.createElement("div");
  selectGroup.className = "control-group";

  const selectLabel = document.createElement("label");
  selectLabel.setAttribute("for", "episode-select");
  selectLabel.textContent = "Select episode";

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

  selectGroup.append(selectLabel, episodeSelect);
  controls.append(searchGroup, selectGroup);

  const resultsCount = document.createElement("p");
  resultsCount.className = "results-count";
  resultsCount.id = "results-count";

  const episodeContainer = document.createElement("section");
  episodeContainer.className = "episode-container";
  episodeContainer.id = "episode-container";

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

function renderEpisodesView() {
  const filteredEpisodes = getFilteredEpisodes();

  const resultsCount = document.getElementById("results-count");
  resultsCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;

  const episodeContainer = document.getElementById("episode-container");
  episodeContainer.innerHTML = "";

  filteredEpisodes.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    episodeContainer.appendChild(episodeCard);
  });

  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.value = selectedEpisodeId;
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

function handleEpisodeSearchInput(event) {
  searchTerm = event.target.value.toLowerCase();
  renderEpisodesView();
}

function handleEpisodeSelect(event) {
  selectedEpisodeId = event.target.value;
  renderEpisodesView();
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
