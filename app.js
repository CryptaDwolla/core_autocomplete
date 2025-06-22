const searchInput = document.getElementById("search-input");
const autocompleteResults = document.getElementById("autocomplete-results");
const repositoriesList = document.getElementById("repositories-list");

let addedRepositories = [];

async function searchRepositories(query) {
  if (!query) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&per_page=5`
    );

    if (!response.ok) {
      throw new Error("Не удалось получить репозитории");
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Ошибка поиска репозиториев:", error);
    return [];
  }
}

function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const handleSearchInput = debounce(async (event) => {
  const query = event.target.value;

  if (!query) {
    autocompleteResults.style.display = "none";
    return;
  }

  const repositories = await searchRepositories(query);

  if (repositories.length > 0) {
    renderAutocompleteResults(repositories);
    autocompleteResults.style.display = "block";
  } else {
    autocompleteResults.style.display = "none";
  }
}, 300);

function renderAutocompleteResults(repositories) {
  autocompleteResults.innerHTML = "";

  repositories.forEach((repo) => {
    const item = document.createElement("li");
    item.className = "autocomplete-item";
    item.textContent = `${repo.full_name}`;

    item.addEventListener("click", () => {
      addRepository(repo);
      searchInput.value = "";
      autocompleteResults.style.display = "none";
    });

    autocompleteResults.appendChild(item);
  });
}

function addRepository(repository) {
  if (addedRepositories.some((repo) => repo.id === repository.id)) {
    return;
  }

  addedRepositories.push(repository);
  renderRepositoriesList();
}

function removeRepository(repositoryId) {
  addedRepositories = addedRepositories.filter(
    (repo) => repo.id !== repositoryId
  );
  renderRepositoriesList();
}

function renderRepositoriesList() {
  repositoriesList.innerHTML = "";

  addedRepositories.forEach((repo) => {
    const card = document.createElement("li");
    card.className = "repository-card";

    const info = document.createElement("ul");
    info.className = "repository-info";

    const name = document.createElement("li");
    name.className = "repository-name";
    name.textContent = `Name: ${repo.name}`;

    const owner = document.createElement("li");
    owner.className = "repository-owner";
    owner.textContent = `Owner: ${repo.owner.login}`;

    const stars = document.createElement("li");
    stars.className = "repository-stars";
    stars.textContent = `Stars: ${repo.stargazers_count}`;

    info.appendChild(name);
    info.appendChild(owner);
    info.appendChild(stars);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.addEventListener("click", () => {
      removeRepository(repo.id);
    });

    card.appendChild(info);
    card.appendChild(removeBtn);

    repositoriesList.appendChild(card);
  });
}

document.addEventListener("click", (event) => {
  if (
    !searchInput.contains(event.target) &&
    !autocompleteResults.contains(event.target)
  ) {
    autocompleteResults.style.display = "none";
  }
});

searchInput.addEventListener("input", handleSearchInput);

renderRepositoriesList();
