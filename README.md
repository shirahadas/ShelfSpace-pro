# ShelfSpace

ShelfSpace is a responsive book discovery and personal reading dashboard powered by the Google Books API.

## Features
- Search by title, author or ISBN
- Real Google Books API data
- Language and ebook filters
- Sorting and pagination
- Book details modal
- Personal library
- Favorites
- Reading statuses
- LocalStorage persistence
- Dashboard statistics
- Recent searches
- Dark and light themes
- Responsive design

## Technologies
HTML5, CSS3, Vanilla JavaScript, Fetch API, Google Books API, LocalStorage and GitHub Pages.

## Run Locally
Open `index.html` directly, or run the project with Live Server in Visual Studio Code.

## Data Source
The application uses:
`https://www.googleapis.com/books/v1/volumes`

## LocalStorage Keys
- `shelfspace_library`
- `shelfspace_recent_searches`
- `shelfspace_theme`

## Project Structure
```text
ShelfSpace/
├── index.html
├── style.css
├── script.js
├── PRD.md
├── tasks.md
└── README.md
```

## Known Limitations
- Internet connection is required for searches.
- Some books may have missing images or metadata.
- Saved data is limited to the current browser.
- Clearing browser storage removes saved data.

## Deployment
Deploy from the `main` branch and `/(root)` using GitHub Pages.

Live URL:
`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

## Documentation
- [PRD](PRD.md)
- [Tasks](tasks.md)
