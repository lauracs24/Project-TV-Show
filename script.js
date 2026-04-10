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
  if (cache[url]) return cache[url];

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load data");

  const data = await response.json();
  cache[url] = data;
  return data;
}

async function loadShows() {
  isLoadingShows = true;
  hasError = false;
  renderPage();

  try {
    const shows = await fetchData("https://api.tvmaze.com/shows");

    allShows = shows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    isLoadingShows = false;
    renderPage();
  } catch {
    isLoadingShows = false;
    hasError = true;
    errorMessage = "Error loading shows";
    renderPage();
  }
}

async function loadEpisodesForShow(showId) {
  isLoadingEpisodes = true;
  selectedEpisodeId = "all";
  episodeSearchTerm = "";
  renderPage();

  try {
    const episodes = await fetchData(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    allEpisodes = episodes;
    currentView = "episodes";
    isLoadingEpisodes = false;
    renderPage();
  } catch {
    hasError = true;
    errorMessage = "Error loading episodes";
    renderPage();
  }
}

function renderPage() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "TV Show Project";
  root.appendChild(title);

  if (hasError) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    root.appendChild(error);
    return;
  }

  if (isLoadingShows) {
    const loading = document.createElement("p");
    loading.textContent = "Loading shows...";
    root.appendChild(loading);
    return;
  }

  if (currentView === "shows") {
    renderShows(root);
  } else {
    renderEpisodes(root);
  }
}

function renderShows(root) {
  const input = document.createElement("input");
  input.id = "show-search-input";
  input.placeholder = "Search shows";
  input.value = showSearchTerm;

  input.addEventListener("input", (e) => {
    showSearchTerm = e.target.value.toLowerCase();
    renderPage();

    const input = document.getElementById("show-search-input");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  root.appendChild(input);

  const filtered = allShows.filter((show) =>
    (show.name + show.genres.join(" ") + (show.summary || ""))
      .toLowerCase()
      .includes(showSearchTerm)
  );

  filtered.forEach((show) => {
    const btn = document.createElement("button");
    btn.textContent = show.name;
    btn.onclick = () => {
      selectedShowId = show.id;
      loadEpisodesForShow(show.id);
    };
    root.appendChild(btn);
  });
}

function renderEpisodes(root) {
  const back = document.createElement("button");
  back.textContent = "← Back to shows";
  back.onclick = () => {
    currentView = "shows";
    renderPage();
  };

  root.appendChild(back);

  const input = document.createElement("input");
  input.id = "episode-search-input";
  input.placeholder = "Search episodes";
  input.value = episodeSearchTerm;

  input.addEventListener("input", (e) => {
    episodeSearchTerm = e.target.value.toLowerCase();
    renderPage();

    const input = document.getElementById("episode-search-input");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  root.appendChild(input);

  if (isLoadingEpisodes) {
    root.appendChild(document.createTextNode("Loading episodes..."));
    return;
  }

  const filtered = allEpisodes.filter((ep) =>
    (ep.name + (ep.summary || ""))
      .toLowerCase()
      .includes(episodeSearchTerm)
  );

  filtered.forEach((ep) => {
    const div = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = ep.name;

    const img = document.createElement("img");
    img.src = ep.image?.medium || "";

    const summary = document.createElement("div");
    summary.innerHTML = ep.summary || "";

    div.append(title, img, summary);
    root.appendChild(div);
  });
}

window.onload = setup;
