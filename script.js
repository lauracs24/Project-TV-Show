let allShows = [];
let allEpisodes = [];

let showSearchTerm = "";
let episodeSearchTerm = "";
let selectedEpisodeId = "all";
let selectedShowId = "";
let currentView = "shows";

let isLoadingShows = true;
let isLoadingEpisodes = false;
let hasError = false;
let errorMessage = "";

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
  isLoadingShows = true;
  hasError = false;
  errorMessage = "";
  renderPage();

  try {
    const shows = await fetchData("https://api.tvmaze.com/shows");

    allShows = shows.sort((showA, showB) =>
      showA.name.localeCompare(showB.name, undefined, {
        sensitivity: "base",
      }),
    );

    isLoadingShows = false;
    renderPage();
  } catch (error) {
    isLoadingShows = false;
    hasError = true;
    errorMessage = "Sorry, something went wrong while loading shows.";
    renderPage();
  }
}

async function loadEpisodesForShow(showId) {
  isLoadingEpisodes = true;
  hasError = false;
  errorMessage = "";
  selectedEpisodeId = "all";
  episodeSearchTerm = "";
  renderPage();

  try {
    const episodes = await fetchData(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    allEpisodes = episodes;
    isLoadingEpisodes = false;
    currentView = "episodes";
    renderPage();
  } catch (error) {
    isLoadingEpisodes = false;
    hasError = true;
    errorMessage = "Sorry, something went wrong while loading episodes.";
    renderPage();
  }
}

function renderPage() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const pageTitle = document.createElement("h1");
  pageTitle.textContent = "TV Show Project";
  rootElem.appendChild(pageTitle);

  if (hasError) {
    const errorElem = document.createElement("p");
    errorElem.className = "error-message";
    errorElem.textContent = errorMessage;
    rootElem.appendChild(errorElem);
    return;
  }

  if (isLoadingShows) {
    const loadingElem = document.createElement("p");
    loadingElem.textContent = "Loading shows, please wait...";
    rootElem.appendChild(loadingElem);
    return;
  }

  if (currentView === "shows") {
    renderShowsView(rootElem);
    return;
  }

  renderEpisodesView(rootElem);
}

function renderShowsView(rootElem) {
  const controls = createShowControls();
  rootElem.appendChild(controls);

  const filteredShows = getFilteredShows();

  const resultsCount = document.createElement("p");
  resultsCount.className = "results-count";
  resultsCount.textContent = `Found ${filteredShows.length} / ${allShows.length} show(s)`;
  rootElem.appendChild(resultsCount);

  const showsContainer = document.createElement("section");
  showsContainer.className = "shows-container";

  filteredShows.forEach((show) => {
    const showCard = createShowCard(show);
    showsContainer.appendChild(showCard);
  });

  rootElem.appendChild(showsContainer);

  const sourceParagraph = document.createElement("p");
  sourceParagraph.className = "source-text";
  sourceParagraph.innerHTML =
    'Data originally comes from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';

  rootElem.appendChild(sourceParagraph);
}

function renderEpisodesView(rootElem) {
  const backLink = document.createElement("button");
  backLink.className = "back-button";
  backLink.type = "button";
  backLink.textContent = "← Back to shows";
  backLink.addEventListener("click", handleBackToShows);

  rootElem.appendChild(backLink);

  const selectedShow = getSelectedShow();

  if (selectedShow) {
    const showHeading = document.createElement("h2");
    showHeading.className = "selected-show-heading";
    showHeading.textContent = selectedShow.name;
    rootElem.appendChild(showHeading);
  }

  const controls = createEpisodeControls();
  rootElem.appendChild(controls);

  if (isLoadingEpisodes) {
    const loadingElem = document.createElement("p");
    loadingElem.textContent = "Loading episodes, please wait...";
    rootElem.appendChild(loadingElem);
    return;
  }

  const filteredEpisodes = getFilteredEpisodes();

  const resultsCount = document.createElement("p");
  resultsCount.className = "results-count";
  resultsCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;
  rootElem.appendChild(resultsCount);

  const episodeContainer = document.createElement("section");
  episodeContainer.className = "episode-container";

  filteredEpisodes.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    episodeContainer.appendChild(episodeCard);
  });

  rootElem.appendChild(episodeContainer);

  const sourceParagraph = document.createElement("p");
  sourceParagraph.className = "source-text";
  sourceParagraph.innerHTML =
    'Data originally comes from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';

  rootElem.appendChild(sourceParagraph);
}

function createShowControls() {
  const controlsWrapper = document.createElement("section");
  controlsWrapper.className = "controls";

  const searchGroup = document.createElement("div");
  searchGroup.className = "control-group";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "show-search-input");
  searchLabel.textContent = "Search shows";

  const searchInput = document.createElement("input");
  searchInput.id = "show-search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search by name, genre, or summary";
  searchInput.value = showSearchTerm;
  searchInput.addEventListener("input", handleShowSearchInput);

  searchGroup.append(searchLabel, searchInput);
  controlsWrapper.appendChild(searchGroup);

  return controlsWrapper;
}

function createEpisodeControls() {
  const controlsWrapper = document.createElement("section");
  controlsWrapper.className = "controls";

  const searchGroup = document.createElement("div");
  searchGroup.className = "control-group";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "episode-search-input");
  searchLabel.textContent = "Search episodes";

  const searchInput = document.createElement("input");
  searchInput.id = "episode-search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search by episode name or summary";
  searchInput.value = episodeSearchTerm;
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

  episodeSelect.value = selectedEpisodeId;

  selectGroup.append(selectLabel, episodeSelect);
  controlsWrapper.append(searchGroup, selectGroup);

  return controlsWrapper;
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  const header = document.createElement("div");
  header.className = "show-card-header";

  const nameButton = document.createElement("button");
  nameButton.type = "button";
  nameButton.className = "show-name-button";
  nameButton.textContent = show.name;
  nameButton.addEventListener("click", function () {
    handleShowClick(show.id);
  });

  header.appendChild(nameButton);

  const content = document.createElement("div");
  content.className = "show-card-content";

  const image = document.createElement("img");
  image.className = "show-image";
  image.src = show.image ? show.image.medium : "";
  image.alt = show.name;

  const summary = document.createElement("div");
  summary.className = "show-summary";
  summary.innerHTML = show.summary || "";

  const details = document.createElement("div");
  details.className = "show-details";

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating && show.rating.average ? show.rating.average : "N/A"}`;

  const genres = document.createElement("p");
  genres.textContent = `Genres: ${show.genres.join(", ")}`;

  const status = document.createElement("p");
  status.textContent = `Status: ${show.status}`;

  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime || "N/A"}`;

  details.append(rating, genres, status, runtime);
  content.append(image, summary, details);
  card.append(header, content);

  return card;
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h3");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = episode.name;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";

  card.append(title, image, summary);
  return card;
}

function handleShowSearchInput(event) {
  showSearchTerm = event.target.value.toLowerCase();
  renderPage();
}

function handleEpisodeSearchInput(event) {
  episodeSearchTerm = event.target.value.toLowerCase();
  renderPage();
}

function handleEpisodeSelect(event) {
  selectedEpisodeId = event.target.value;
  renderPage();
}

function handleShowClick(showId) {
  selectedShowId = String(showId);
  loadEpisodesForShow(selectedShowId);
}

function handleBackToShows() {
  currentView = "shows";
  selectedEpisodeId = "all";
  episodeSearchTerm = "";
  renderPage();
}

function getFilteredShows() {
  return allShows.filter((show) => {
    const nameText = show.name.toLowerCase();
    const genresText = show.genres.join(" ").toLowerCase();
    const summaryText = stripHtml(show.summary || "").toLowerCase();

    return (
      nameText.includes(showSearchTerm) ||
      genresText.includes(showSearchTerm) ||
      summaryText.includes(showSearchTerm)
    );
  });
}

function getFilteredEpisodes() {
  return allEpisodes.filter((episode) => {
    const matchesSelectedEpisode =
      selectedEpisodeId === "all" || String(episode.id) === selectedEpisodeId;

    const matchesSearch =
      episode.name.toLowerCase().includes(episodeSearchTerm) ||
      stripHtml(episode.summary || "")
        .toLowerCase()
        .includes(episodeSearchTerm);

    return matchesSelectedEpisode && matchesSearch;
  });
}

function getSelectedShow() {
  return allShows.find((show) => String(show.id) === selectedShowId);
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
