const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

const STORAGE_KEYS = {
  library: "shelfspace_library",
  recentSearches: "shelfspace_recent_searches",
  theme: "shelfspace_theme",
};

const state = {
  currentView: "discover",
  currentQuery: "popular fiction",
  books: [],
  library: loadStorage(STORAGE_KEYS.library, []),
  recentSearches: loadStorage(STORAGE_KEYS.recentSearches, []),
  libraryFilter: "all",
  startIndex: 0,
  totalResults: 0,
  isLoading: false,
};

const elements = {
  navigationLinks: document.querySelectorAll("[data-view-link]"),
  views: document.querySelectorAll(".view"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  recentSearches: document.getElementById("recentSearches"),
  languageFilter: document.getElementById("languageFilter"),
  typeFilter: document.getElementById("typeFilter"),
  sortFilter: document.getElementById("sortFilter"),
  resultsTitle: document.getElementById("resultsTitle"),
  resultCount: document.getElementById("resultCount"),
  booksGrid: document.getElementById("booksGrid"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  errorMessage: document.getElementById("errorMessage"),
  emptyState: document.getElementById("emptyState"),
  loadMoreButton: document.getElementById("loadMoreButton"),
  libraryTabs: document.querySelectorAll(".library-tab"),
  libraryGrid: document.getElementById("libraryGrid"),
  libraryEmptyState: document.getElementById("libraryEmptyState"),
  totalBooksStatistic: document.getElementById("totalBooksStatistic"),
  favoriteBooksStatistic: document.getElementById("favoriteBooksStatistic"),
  readingBooksStatistic: document.getElementById("readingBooksStatistic"),
  finishedBooksStatistic: document.getElementById("finishedBooksStatistic"),
  readingProgress: document.getElementById("readingProgress"),
  recentBooks: document.getElementById("recentBooks"),
  bookModal: document.getElementById("bookModal"),
  modalBody: document.getElementById("modalBody"),
  themeToggle: document.getElementById("themeToggle"),
  toast: document.getElementById("toast"),
};

document.addEventListener("DOMContentLoaded", initializeApplication);

function initializeApplication() {
  applySavedTheme();
  registerEventListeners();
  renderRecentSearches();
  renderLibrary();
  renderDashboard();
  fetchBooks(true);
}

function registerEventListeners() {
  elements.searchForm.addEventListener("submit", handleSearch);
  elements.loadMoreButton.addEventListener("click", () => fetchBooks(false));
  elements.themeToggle.addEventListener("click", toggleTheme);

  [elements.languageFilter, elements.typeFilter, elements.sortFilter].forEach(
    (element) => element.addEventListener("change", () => fetchBooks(true))
  );

  elements.libraryTabs.forEach((tab) => {
    tab.addEventListener("click", () => updateLibraryFilter(tab));
  });

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBookModal();
  });
}

function handleSearch(event) {
  event.preventDefault();

  const query = elements.searchInput.value.trim();

  if (!query) {
    showToast("Please enter a book title, author or ISBN.");
    return;
  }

  state.currentQuery = query;
  saveRecentSearch(query);
  switchView("discover");
  fetchBooks(true);
}

async function fetchBooks(resetResults = true) {
  if (state.isLoading) return;

  state.isLoading = true;
  showLoadingState();

  if (resetResults) {
    state.startIndex = 0;
    state.books = [];
    elements.booksGrid.innerHTML = "";
  }

  try {
    const response = await fetch(buildRequestUrl());

    if (!response.ok) {
      throw new Error(`Google Books API returned status ${response.status}`);
    }

    const data = await response.json();
    const newBooks = (data.items || []).map(normalizeBookData);

    state.books = resetResults ? newBooks : [...state.books, ...newBooks];
    state.totalResults = data.totalItems || 0;
    state.startIndex += newBooks.length;

    updateSearchHeading();
    renderBookResults();
    updateLoadMoreButton(newBooks.length);
  } catch (error) {
    console.error("Book search failed:", error);
    showErrorState("The books could not be loaded. Please try again.");
  } finally {
    state.isLoading = false;
    elements.loadingState.classList.add("hidden");
  }
}

function buildRequestUrl() {
  const parameters = new URLSearchParams({
    q: state.currentQuery,
    startIndex: String(state.startIndex),
    maxResults: "20",
    orderBy: elements.sortFilter.value,
    printType: "books",
  });

  if (elements.languageFilter.value) {
    parameters.set("langRestrict", elements.languageFilter.value);
  }

  if (elements.typeFilter.value) {
    parameters.set("filter", elements.typeFilter.value);
  }

  return `${GOOGLE_BOOKS_API}?${parameters.toString()}`;
}

function normalizeBookData(item) {
  const info = item.volumeInfo || {};
  const sale = item.saleInfo || {};

  return {
    id: item.id,
    title: info.title || "Untitled Book",
    subtitle: info.subtitle || "",
    authors: info.authors || ["Unknown Author"],
    publisher: info.publisher || "Unknown Publisher",
    publishedDate: info.publishedDate || "Unknown Publication Date",
    description:
      removeHtmlTags(info.description) ||
      "No description is available for this book.",
    pageCount: info.pageCount || null,
    categories: info.categories || [],
    averageRating: info.averageRating || null,
    language: info.language || "Unknown",
    thumbnail: createSecureImageUrl(
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ""
    ),
    previewLink: info.previewLink || "",
    isbn:
      info.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_13"
      )?.identifier ||
      info.industryIdentifiers?.[0]?.identifier ||
      "",
    isEbook: Boolean(sale.isEbook),
  };
}

function renderBookResults() {
  hideAllSearchStates();

  if (state.books.length === 0) {
    elements.emptyState.classList.remove("hidden");
    elements.loadMoreButton.classList.add("hidden");
    return;
  }

  elements.booksGrid.innerHTML = state.books.map(createBookCard).join("");
}

function createBookCard(book) {
  const savedBook = findLibraryBook(book.id);
  const isFavorite = Boolean(savedBook?.favorite);
  const isSaved = Boolean(savedBook);

  return `
    <article class="book-card">
      <div class="book-cover-wrapper">
        ${createBookCover(book)}
        <button
          type="button"
          class="favorite-button ${isFavorite ? "active" : ""}"
          data-favorite-id="${escapeAttribute(book.id)}"
          aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
        >
          <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
        </button>
      </div>

      <div class="book-card-content">
        <div class="book-card-meta">
          <span>${escapeHtml(book.categories[0] || "General")}</span>
          <span>${escapeHtml(formatPublicationYear(book.publishedDate))}</span>
        </div>

        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-author">${escapeHtml(book.authors.join(", "))}</p>

        <div class="book-card-actions">
          <button type="button" class="details-button" data-details-id="${escapeAttribute(book.id)}">
            View Details
          </button>
          <button type="button" class="save-button ${isSaved ? "saved" : ""}" data-save-id="${escapeAttribute(book.id)}">
            <i class="fa-solid ${isSaved ? "fa-check" : "fa-plus"}"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function createBookCover(book) {
  if (book.thumbnail) {
    return `<img class="book-cover" src="${escapeAttribute(book.thumbnail)}" alt="Cover of ${escapeAttribute(book.title)}" loading="lazy" />`;
  }

  return `
    <div class="missing-book-cover">
      <div>
        <i class="fa-solid fa-book-open"></i>
        <span>${escapeHtml(book.title)}</span>
      </div>
    </div>
  `;
}

function updateSearchHeading() {
  elements.resultsTitle.textContent =
    state.currentQuery === "popular fiction"
      ? "Trending Books"
      : `Results for “${state.currentQuery}”`;

  elements.resultCount.textContent =
    `${state.totalResults.toLocaleString()} results`;
}

function updateLoadMoreButton(numberOfNewBooks) {
  const hasMore =
    state.startIndex < state.totalResults && numberOfNewBooks > 0;

  elements.loadMoreButton.classList.toggle("hidden", !hasMore);
}

function showLoadingState() {
  hideAllSearchStates();
  elements.loadingState.classList.remove("hidden");
}

function showErrorState(message) {
  hideAllSearchStates();
  elements.errorMessage.textContent = message;
  elements.errorState.classList.remove("hidden");
  elements.loadMoreButton.classList.add("hidden");
}

function hideAllSearchStates() {
  elements.loadingState.classList.add("hidden");
  elements.errorState.classList.add("hidden");
  elements.emptyState.classList.add("hidden");
}

function handleDocumentClick(event) {
  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) {
    event.preventDefault();
    switchView(viewLink.dataset.viewLink);
    return;
  }

  const favoriteButton = event.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favoriteId);
    return;
  }

  const saveButton = event.target.closest("[data-save-id]");
  if (saveButton) {
    addBookToLibrary(saveButton.dataset.saveId);
    return;
  }

  const detailsButton = event.target.closest("[data-details-id]");
  if (detailsButton) {
    openBookModal(detailsButton.dataset.detailsId);
    return;
  }

  const recentSearchButton = event.target.closest("[data-search-query]");
  if (recentSearchButton) {
    const query = recentSearchButton.dataset.searchQuery;
    elements.searchInput.value = query;
    state.currentQuery = query;
    fetchBooks(true);
    return;
  }

  if (event.target.closest("[data-close-modal]")) {
    closeBookModal();
  }
}

function handleDocumentChange(event) {
  const statusSelect = event.target.closest("[data-status-id]");
  if (!statusSelect) return;

  const bookId = statusSelect.dataset.statusId;
  const selectedStatus = statusSelect.value;

  if (selectedStatus === "remove") {
    removeBookFromLibrary(bookId);
  } else {
    updateReadingStatus(bookId, selectedStatus);
  }
}

function findBook(bookId) {
  return (
    state.books.find((book) => book.id === bookId) ||
    state.library.find((book) => book.id === bookId)
  );
}

function findLibraryBook(bookId) {
  return state.library.find((book) => book.id === bookId);
}

function addBookToLibrary(bookId, status = "want-to-read") {
  if (findLibraryBook(bookId)) {
    showToast("This book is already in your library.");
    return;
  }

  const selectedBook = findBook(bookId);
  if (!selectedBook) return;

  state.library.unshift({
    ...selectedBook,
    favorite: false,
    status,
    addedAt: new Date().toISOString(),
  });

  saveLibrary();
  showToast(`“${selectedBook.title}” was added to your library.`);
}

function toggleFavorite(bookId) {
  const selectedBook = findBook(bookId);
  if (!selectedBook) return;

  let libraryBook = findLibraryBook(bookId);

  if (!libraryBook) {
    libraryBook = {
      ...selectedBook,
      favorite: true,
      status: "want-to-read",
      addedAt: new Date().toISOString(),
    };
    state.library.unshift(libraryBook);
  } else {
    libraryBook.favorite = !libraryBook.favorite;
  }

  saveLibrary();
  showToast(
    libraryBook.favorite
      ? "Book added to favorites."
      : "Book removed from favorites."
  );
}

function updateReadingStatus(bookId, newStatus) {
  let libraryBook = findLibraryBook(bookId);

  if (!libraryBook) {
    const selectedBook = findBook(bookId);
    if (!selectedBook) return;

    libraryBook = {
      ...selectedBook,
      favorite: false,
      status: newStatus,
      addedAt: new Date().toISOString(),
    };
    state.library.unshift(libraryBook);
  } else {
    libraryBook.status = newStatus;
  }

  saveLibrary();
  showToast(`Reading status changed to ${formatReadingStatus(newStatus)}.`);
}

function removeBookFromLibrary(bookId) {
  state.library = state.library.filter((book) => book.id !== bookId);
  saveLibrary();
  closeBookModal();
  showToast("Book removed from your library.");
}

function saveLibrary() {
  localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(state.library));
  renderBookResults();
  renderLibrary();
  renderDashboard();

  const openBookId = elements.modalBody.dataset.bookId;
  if (
    openBookId &&
    !elements.bookModal.classList.contains("hidden") &&
    findBook(openBookId)
  ) {
    openBookModal(openBookId);
  }
}

function switchView(viewName) {
  state.currentView = viewName;

  elements.views.forEach((view) => {
    view.classList.toggle("active-view", view.id === `${viewName}View`);
  });

  elements.navigationLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === viewName);
  });

  if (viewName === "library") renderLibrary();
  if (viewName === "dashboard") renderDashboard();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateLibraryFilter(selectedTab) {
  state.libraryFilter = selectedTab.dataset.libraryFilter;

  elements.libraryTabs.forEach((tab) => {
    tab.classList.toggle("active", tab === selectedTab);
  });

  renderLibrary();
}

function renderLibrary() {
  const filteredBooks = state.library.filter((book) => {
    if (state.libraryFilter === "all") return true;
    if (state.libraryFilter === "favorite") return book.favorite;
    return book.status === state.libraryFilter;
  });

  elements.libraryGrid.innerHTML = filteredBooks.map(createBookCard).join("");
  elements.libraryEmptyState.classList.toggle("hidden", filteredBooks.length > 0);
}

function renderDashboard() {
  const statistics = {
    total: state.library.length,
    favorites: state.library.filter((book) => book.favorite).length,
    wantToRead: state.library.filter((book) => book.status === "want-to-read").length,
    reading: state.library.filter((book) => book.status === "reading").length,
    finished: state.library.filter((book) => book.status === "finished").length,
  };

  elements.totalBooksStatistic.textContent = statistics.total;
  elements.favoriteBooksStatistic.textContent = statistics.favorites;
  elements.readingBooksStatistic.textContent = statistics.reading;
  elements.finishedBooksStatistic.textContent = statistics.finished;

  const progressItems = [
    { label: "Want to Read", value: statistics.wantToRead },
    { label: "Currently Reading", value: statistics.reading },
    { label: "Finished", value: statistics.finished },
    { label: "Favorites", value: statistics.favorites },
  ];

  elements.readingProgress.innerHTML = progressItems
    .map((item) => {
      const percentage = statistics.total
        ? Math.round((item.value / statistics.total) * 100)
        : 0;

      return `
        <div class="progress-item">
          <div class="progress-heading">
            <span>${item.label}</span>
            <span>${item.value} books · ${percentage}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const recentlyAdded = [...state.library]
    .sort(
      (firstBook, secondBook) =>
        new Date(secondBook.addedAt) - new Date(firstBook.addedAt)
    )
    .slice(0, 5);

  elements.recentBooks.innerHTML = recentlyAdded.length
    ? recentlyAdded
        .map(
          (book) => `
            <button type="button" class="recent-book-item" data-details-id="${escapeAttribute(book.id)}">
              ${
                book.thumbnail
                  ? `<img src="${escapeAttribute(book.thumbnail)}" alt="" />`
                  : `<span class="recent-book-placeholder"><i class="fa-solid fa-book"></i></span>`
              }
              <span class="recent-book-information">
                <strong>${escapeHtml(book.title)}</strong>
                <small>${escapeHtml(formatReadingStatus(book.status))}</small>
              </span>
            </button>
          `
        )
        .join("")
    : `<p>Add books to see your recent activity.</p>`;
}

function openBookModal(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  const libraryBook = findLibraryBook(bookId);
  elements.modalBody.dataset.bookId = bookId;

  elements.modalBody.innerHTML = `
    <div class="book-modal-layout">
      <div>
        ${
          book.thumbnail
            ? `<img class="book-modal-cover" src="${escapeAttribute(book.thumbnail)}" alt="Cover of ${escapeAttribute(book.title)}" />`
            : `<div class="book-modal-placeholder"><i class="fa-solid fa-book-open"></i></div>`
        }
      </div>

      <div class="book-modal-information">
        <span class="section-label">${escapeHtml(book.categories[0] || "Book Details")}</span>
        <h2 id="modalTitle">${escapeHtml(book.title)}</h2>
        <p class="book-modal-author">By ${escapeHtml(book.authors.join(", "))}</p>

        <div class="book-detail-tags">
          <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(book.publishedDate)}</span>
          ${book.pageCount ? `<span>${book.pageCount} pages</span>` : ""}
          ${book.averageRating ? `<span><i class="fa-solid fa-star"></i> ${book.averageRating}</span>` : ""}
          <span>${escapeHtml(String(book.language).toUpperCase())}</span>
          ${book.isbn ? `<span>ISBN ${escapeHtml(book.isbn)}</span>` : ""}
        </div>

        <p class="book-modal-description">${escapeHtml(shortenText(book.description, 1000))}</p>

        <div class="reading-status-control">
          <label>
            Reading Status
            <select data-status-id="${escapeAttribute(book.id)}">
              ${
                libraryBook
                  ? ""
                  : `<option value="" selected disabled>Add to library...</option>`
              }
              <option value="want-to-read" ${libraryBook?.status === "want-to-read" ? "selected" : ""}>Want to Read</option>
              <option value="reading" ${libraryBook?.status === "reading" ? "selected" : ""}>Currently Reading</option>
              <option value="finished" ${libraryBook?.status === "finished" ? "selected" : ""}>Finished</option>
              ${libraryBook ? `<option value="remove">Remove from Library</option>` : ""}
            </select>
          </label>
        </div>

        <div class="book-modal-actions">
          <button type="button" data-favorite-id="${escapeAttribute(book.id)}">
            <i class="${libraryBook?.favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
            ${libraryBook?.favorite ? "Remove Favorite" : "Add Favorite"}
          </button>

          ${
            book.previewLink
              ? `<a href="${escapeAttribute(book.previewLink)}" target="_blank" rel="noopener noreferrer">Preview Book</a>`
              : `<button type="button" disabled>Preview Unavailable</button>`
          }
        </div>
      </div>
    </div>
  `;

  elements.bookModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeBookModal() {
  elements.bookModal.classList.add("hidden");
  elements.modalBody.innerHTML = "";
  delete elements.modalBody.dataset.bookId;
  document.body.style.overflow = "";
}

function saveRecentSearch(query) {
  state.recentSearches = [
    query,
    ...state.recentSearches.filter(
      (savedQuery) => savedQuery.toLowerCase() !== query.toLowerCase()
    ),
  ].slice(0, 5);

  localStorage.setItem(
    STORAGE_KEYS.recentSearches,
    JSON.stringify(state.recentSearches)
  );

  renderRecentSearches();
}

function renderRecentSearches() {
  const searches =
    state.recentSearches.length > 0
      ? state.recentSearches
      : ["Cyber Security", "Harry Potter", "Business Strategy"];

  const label = state.recentSearches.length > 0 ? "Recent:" : "Try:";

  elements.recentSearches.innerHTML = `
    <span class="recent-search-label">${label}</span>
    ${searches
      .map(
        (query) => `
          <button type="button" class="recent-search-button" data-search-query="${escapeAttribute(query)}">
            ${escapeHtml(query)}
          </button>
        `
      )
      .join("")}
  `;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  document.documentElement.dataset.theme = savedTheme;
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem(STORAGE_KEYS.theme, newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  elements.themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
}

let toastTimeout;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function loadStorage(storageKey, fallbackValue) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch (error) {
    console.error(`Could not read ${storageKey}:`, error);
    return fallbackValue;
  }
}

function createSecureImageUrl(imageUrl) {
  return imageUrl
    ? imageUrl.replace(/^http:/, "https:").replace("&edge=curl", "")
    : "";
}

function removeHtmlTags(htmlText) {
  if (!htmlText) return "";

  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = htmlText;

  return temporaryElement.textContent || temporaryElement.innerText || "";
}

function shortenText(text, maximumLength) {
  return text.length <= maximumLength
    ? text
    : `${text.slice(0, maximumLength).trim()}…`;
}

function formatPublicationYear(publicationDate) {
  return /^\d{4}/.test(publicationDate)
    ? publicationDate.slice(0, 4)
    : publicationDate;
}

function formatReadingStatus(status) {
  const labels = {
    "want-to-read": "Want to Read",
    reading: "Currently Reading",
    finished: "Finished",
  };

  return labels[status] || "Saved";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
