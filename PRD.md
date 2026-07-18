# Product Requirements Document — ShelfSpace

## 1. Product Overview
ShelfSpace is a responsive web application for discovering books and managing a personal reading library.

## 2. Problem and Goal
Users often search for books across multiple websites. ShelfSpace provides one place to search real book data, save books, manage reading statuses and view progress.

## 3. Target Users
- Students
- Casual readers
- Book lovers
- Users who want a simple reading list without creating an account

## 4. Main Usage Scenario
1. Search by title, author or ISBN.
2. Retrieve results from the Google Books API.
3. Filter and sort the results.
4. Open a book details modal.
5. Save the book, mark it as favorite or assign a reading status.
6. Keep the data after refreshing the browser.
7. View personal reading statistics.

## 5. Scope

### In Scope
- Google Books API search
- Language and ebook filters
- Sorting by relevance or newest
- Load More pagination
- Book details modal
- Personal library
- Favorites
- Reading statuses
- LocalStorage persistence
- Recent searches
- Dashboard statistics
- Dark and light themes
- Responsive design
- Loading, error and empty states

### Out of Scope
- Registration and login
- Backend server
- Cloud synchronization
- Payment processing
- Social features
- Reviews and comments
- Cross-device synchronization

## 6. Technical Choices
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Google Books API
- LocalStorage
- GitHub Pages
- Font Awesome
- Google Fonts

## 7. Data
External API:
`https://www.googleapis.com/books/v1/volumes`

Main book fields:
- id
- title
- authors
- publisher
- publishedDate
- description
- pageCount
- categories
- rating
- language
- thumbnail
- previewLink
- isbn

Local fields:
- favorite
- status
- addedAt

## 8. Definition of Done
- Search works with real API data.
- Filters, sorting and pagination work.
- Book details can be opened.
- Books can be saved, favorited and assigned a status.
- LocalStorage persists data after refresh.
- Library filtering works.
- Dashboard statistics match saved data.
- Recent searches and theme are persisted.
- The interface is responsive.
- The project includes PRD.md, tasks.md and README.md.
- The repository has gradual commits.
- The application is deployed with GitHub Pages.
