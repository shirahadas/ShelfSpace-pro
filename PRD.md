# Product Requirements Document (PRD)

# ShelfSpace – Book Discovery & Personal Library

---

## 1. Product Overview

ShelfSpace is a responsive web application that allows users to discover books using the Google Books API, save books to a personal library, organize reading progress, and track reading statistics.

The application provides a simple and modern interface without requiring user registration or a backend server.

---

## 2. Problem Statement

Book lovers often search across multiple websites to find books and keep track of what they want to read.

There is a need for a lightweight application that combines book discovery with personal library management in one place.

---

## 3. Project Goals

The application should enable users to:

- Search books by title, author or ISBN.
- View detailed information about each book.
- Save books locally.
- Mark favorite books.
- Organize books by reading status.
- Track personal reading statistics.
- Provide a clean and responsive user experience.

---

## 4. Target Audience

- Students
- Book readers
- Casual readers
- People looking for reading recommendations
- Users who want a simple reading tracker

---

## 5. Functional Requirements

### Book Search

- Search books using the Google Books API.
- Display search results.
- Support pagination (Load More).
- Display book cover, title, author and publication year.

### Filters

- Filter by language.
- Filter by ebook type.
- Sort by relevance or newest.

### Book Details

Display:

- Cover image
- Title
- Authors
- Description
- Categories
- Publisher
- Publication date
- ISBN
- Number of pages
- Preview link

### Personal Library

Users can:

- Save books.
- Remove books.
- Mark favorites.
- Update reading status:
  - Want to Read
  - Reading
  - Finished

### Dashboard

Display:

- Total books
- Favorite books
- Currently reading
- Finished books
- Reading progress
- Recently added books

### Theme

Support:

- Dark Mode
- Light Mode

### Persistence

Store data using LocalStorage:

- Library
- Favorites
- Reading status
- Recent searches
- Theme

---

## 6. Non-Functional Requirements

- Responsive design
- Modern user interface
- Fast loading
- Accessible navigation
- Mobile friendly
- No backend required

---

## 7. Technologies

- HTML5
- CSS3
- JavaScript (ES6)
- Google Books API
- Fetch API
- LocalStorage
- GitHub Pages
- Font Awesome

---

## 8. API

Google Books API

Endpoint:

https://www.googleapis.com/books/v1/volumes

Search example:

https://www.googleapis.com/books/v1/volumes?q=harry+potter

---

## 9. Data Stored

Each saved book stores:

- id
- title
- authors
- publisher
- description
- categories
- thumbnail
- ISBN
- language
- page count
- preview link
- favorite
- reading status
- added date

---

## 10. Success Criteria

The project is considered complete when:

- Book search works correctly.
- API data is displayed successfully.
- Books can be saved.
- Favorites work.
- Reading status updates correctly.
- Dashboard statistics are accurate.
- LocalStorage persists data.
- Responsive design works.
- GitHub Pages deployment succeeds.
