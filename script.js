// Level 200 - refactor + search + episode selector

let allEpisodes = [];
let searchTerm = "";
let selectedEpisodeId = "all";

function setup() {
  allEpisodes = getAllEpisodes();
  renderPage();
}

function renderPage() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const filteredEpisodes = getFilteredEpisodes();

  const pageTitle = document.createElement("h1");
  pageTitle.textContent = "TV Show Episodes";

  const controls = createControls();

  const resultsCount = document.createElement("p");
  resultsCount.className = "results-count";
  resultsCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;

  const episodeContainer = document.createElement("section");
  episodeContainer.className = "episode-container";

  filteredEpisodes.forEach((episode) => {
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

function createControls() {
  const controlsWrapper = document.createElement("section");
  controlsWrapper.className = "controls";

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

  episodeSelect.value = selectedEpisodeId;

  selectGroup.append(selectLabel, episodeSelect);

  controlsWrapper.append(searchGroup, selectGroup);
  return controlsWrapper;
}

function handleSearchInput(event) {
  searchTerm = event.target.value.toLowerCase();
  renderPage();
}

function handleEpisodeSelect(event) {
  selectedEpisodeId = event.target.value;
  renderPage();
}

function getFilteredEpisodes() {
  return allEpisodes.filter((episode) => {
    const matchesSelectedEpisode =
      selectedEpisodeId === "all" || String(episode.id) === selectedEpisodeId;

    const matchesSearch =
      episode.name.toLowerCase().includes(searchTerm) ||
      stripHtml(episode.summary).toLowerCase().includes(searchTerm);

    return matchesSelectedEpisode && matchesSearch;
  });
}

function stripHtml(htmlText) {
  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = htmlText;
  return temporaryElement.textContent || temporaryElement.innerText || "";
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = episode.name;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary;

  card.append(title, image, summary);
  return card;
}

function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
