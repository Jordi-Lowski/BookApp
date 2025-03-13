// Book Tracker App - Main JavaScript

// Global state
const state = {
    books: [],
    currentPage: 'home',
    currentFilter: 'all',
    currentVocabularyBook: null,
    goals: [],
    vocabulary: {}
};

// DOM Elements
const elements = {
    navLinks: document.querySelectorAll('nav a'),
    pages: document.querySelectorAll('.page'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    booksList: document.getElementById('books-list'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    searchOptions: document.querySelectorAll('input[name="search-type"]'),
    searchResults: document.getElementById('search-results'),
    addFirstBookButton: document.getElementById('add-first-book'),
    createGoalButton: document.getElementById('create-goal-btn'),
    currentGoalCard: document.getElementById('current-goal-card'),
    pastGoals: document.getElementById('past-goals'),
    vocabularyBooksList: document.getElementById('vocabulary-books-list'),
    vocabularyBookTitle: document.getElementById('vocabulary-book-title'),
    addVocabularyButton: document.getElementById('add-vocabulary-btn'),
    vocabularyList: document.getElementById('vocabulary-list'),
    // Modals
    addBookModal: document.getElementById('add-book-modal'),
    addGoalModal: document.getElementById('add-goal-modal'),
    addVocabularyModal: document.getElementById('add-vocabulary-modal'),
    closeModalButtons: document.querySelectorAll('.close-modal'),
    saveBookButton: document.getElementById('save-book-btn'),
    saveGoalButton: document.getElementById('save-goal-btn'),
    saveVocabularyButton: document.getElementById('save-vocabulary-btn'),
    // Book Modal Fields
    bookCoverPreview: document.getElementById('book-cover-preview'),
    bookTitlePreview: document.getElementById('book-title-preview'),
    bookAuthorPreview: document.getElementById('book-author-preview'),
    bookIsbnPreview: document.getElementById('book-isbn-preview'),
    bookStatusOptions: document.querySelectorAll('input[name="book-status"]'),
    // Goal Modal Fields
    goalYear: document.getElementById('goal-year'),
    goalBooks: document.getElementById('goal-books'),
    // Vocabulary Modal Fields
    vocabularyWord: document.getElementById('vocabulary-word'),
    vocabularyTranslation: document.getElementById('vocabulary-translation'),
    vocabularyContext: document.getElementById('vocabulary-context')
};

// Initialize the app
function init() {
    loadData();
    setupEventListeners();
    renderBooks();
    renderGoals();
    renderVocabularyBooks();
}

// Load data from localStorage
function loadData() {
    const savedBooks = localStorage.getItem('bookTrackerBooks');
    const savedGoals = localStorage.getItem('bookTrackerGoals');
    const savedVocabulary = localStorage.getItem('bookTrackerVocabulary');
    
    if (savedBooks) {
        state.books = JSON.parse(savedBooks);
    }
    
    if (savedGoals) {
        state.goals = JSON.parse(savedGoals);
    }
    
    if (savedVocabulary) {
        state.vocabulary = JSON.parse(savedVocabulary);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('bookTrackerBooks', JSON.stringify(state.books));
    localStorage.setItem('bookTrackerGoals', JSON.stringify(state.goals));
    localStorage.setItem('bookTrackerVocabulary', JSON.stringify(state.vocabulary));
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            changePage(page);
        });
    });
    
    // Filter buttons
    elements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            changeFilter(filter);
        });
    });
    
    // Search button
    elements.searchButton.addEventListener('click', searchBooks);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
    
    // Add first book button
    elements.addFirstBookButton.addEventListener('click', () => {
        openModal(elements.addBookModal);
    });
    
    // Create goal button
    elements.createGoalButton.addEventListener('click', () => {
        const currentYear = new Date().getFullYear();
        elements.goalYear.value = currentYear;
        elements.goalBooks.value = 12; // Default to 1 book per month
        openModal(elements.addGoalModal);
    });
    
    // Add vocabulary button
    elements.addVocabularyButton.addEventListener('click', () => {
        elements.vocabularyWord.value = '';
        elements.vocabularyTranslation.value = '';
        elements.vocabularyContext.value = '';
        openModal(elements.addVocabularyModal);
    });
    
    // Close modal buttons
    elements.closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Save buttons
    elements.saveBookButton.addEventListener('click', saveBook);
    elements.saveGoalButton.addEventListener('click', saveGoal);
    elements.saveVocabularyButton.addEventListener('click', saveVocabulary);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Change page
function changePage(page) {
    state.currentPage = page;
    
    // Update navigation
    elements.navLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update pages
    elements.pages.forEach(pageElement => {
        if (pageElement.id === page) {
            pageElement.classList.add('active');
        } else {
            pageElement.classList.remove('active');
        }
    });
}

// Change filter
function changeFilter(filter) {
    state.currentFilter = filter;
    
    // Update filter buttons
    elements.filterButtons.forEach(button => {
        if (button.getAttribute('data-filter') === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    renderBooks();
}

// Render books
function renderBooks() {
    const filteredBooks = state.books.filter(book => {
        if (state.currentFilter === 'all') return true;
        return book.status === state.currentFilter;
    });
    
    if (filteredBooks.length === 0) {
        elements.booksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>${state.books.length === 0 ? 'Du hast noch keine Bücher hinzugefügt.' : 'Keine Bücher mit diesem Filter gefunden.'}</p>
                <button class="btn primary" id="add-book-btn">Buch hinzufügen</button>
            </div>
        `;
        
        document.getElementById('add-book-btn').addEventListener('click', () => {
            openModal(elements.addBookModal);
        });
    } else {
        let booksHTML = '';
        
        filteredBooks.forEach(book => {
            let statusClass = '';
            let statusText = '';
            
            switch (book.status) {
                case 'read':
                    statusClass = 'status-read';
                    statusText = 'Gelesen';
                    break;
                case 'reading':
                    statusClass = 'status-reading';
                    statusText = 'Lese ich';
                    break;
                case 'to-read':
                    statusClass = 'status-to-read';
                    statusText = 'Möchte ich lesen';
                    break;
            }
            
            booksHTML += `
                <div class="book-card" data-id="${book.id}">
                    <div class="book-cover">
                        <img src="${book.cover || 'images/book-placeholder.svg'}" alt="${book.title}">
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <span class="book-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });
        
        elements.booksList.innerHTML = booksHTML;
        
        // Add event listeners to book cards
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.getAttribute('data-id');
                const book = state.books.find(b => b.id === bookId);
                if (book) {
                    showBookDetails(book);
                }
            });
        });
    }
}

// Search books using Google Books API
async function searchBooks() {
    const query = elements.searchInput.value.trim();
    if (!query) return;
    
    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    let searchQuery = '';
    
    switch (searchType) {
        case 'title':
            searchQuery = `intitle:${query}`;
            break;
        case 'author':
            searchQuery = `inauthor:${query}`;
            break;
        case 'isbn':
            searchQuery = `isbn:${query}`;
            break;
        default:
            searchQuery = query;
    }
    
    elements.searchResults.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Suche nach Büchern...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20`);
        const data = await response.json();
        
        if (data.totalItems === 0 || !data.items) {
            elements.searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Keine Bücher gefunden. Versuche es mit einem anderen Suchbegriff.</p>
                </div>
            `;
            return;
        }
        
        let resultsHTML = '';
        
        data.items.forEach(item => {
            const book = item.volumeInfo;
            const cover = book.imageLinks ? book.imageLinks.thumbnail : 'images/book-placeholder.svg';
            const title = book.title || 'Unbekannter Titel';
            const authors = book.authors ? book.authors.join(', ') : 'Unbekannter Autor';
            const isbn = book.industryIdentifiers ? 
                book.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier : 
                'Keine ISBN';
            
            resultsHTML += `
                <div class="book-card search-result" data-id="${item.id}">
                    <div class="book-cover">
                        <img src="${cover}" alt="${title}">
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${title}</h3>
                        <p class="book-author">${authors}</p>
                        <button class="btn primary add-book-btn">Hinzufügen</button>
                    </div>
                </div>
            `;
        });
        
        elements.searchResults.innerHTML = resultsHTML;
        
        // Add event listeners to add buttons
        document.querySelectorAll('.add-book-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = button.closest('.book-card');
                const bookId = card.getAttribute('data-id');
                const bookData = data.items.find(item => item.id === bookId);
                
                if (bookData) {
                    const book = bookData.volumeInfo;
                    const cover = book.imageLinks ? book.imageLinks.thumbnail : 'images/book-placeholder.svg';
                    const title = book.title || 'Unbekannter Titel';
                    const authors = book.authors ? book.authors.join(', ') : 'Unbekannter Autor';
                    const isbn = book.industryIdentifiers ? 
                        book.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier : 
                        'Keine ISBN';
                    
                    elements.bookCoverPreview.src = cover;
                    elements.bookTitlePreview.textContent = title;
                    elements.bookAuthorPreview.textContent = authors;
                    elements.bookIsbnPreview.textContent = `ISBN: ${isbn}`;
                    
                    // Store book data for saving
                    elements.addBookModal.setAttribute('data-book', JSON.stringify({
                        id: bookId,
                        title,
                        author: authors,
                        isbn,
                        cover
                    }));
                    
                    openModal(elements.addBookModal);
                }
            });
        });
    } catch (error) {
        console.error('Error searching books:', error);
        elements.searchResults.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Fehler bei der Suche. Bitte versuche es später erneut.</p>
            </div>
        `;
    }
}

// Show book details
function showBookDetails(book) {
    elements.bookCoverPreview.src = book.cover || 'images/book-placeholder.svg';
    elements.bookTitlePreview.textContent = book.title;
    elements.bookAuthorPreview.textContent = book.author;
    elements.bookIsbnPreview.textContent = `ISBN: ${book.isbn || '-'}`;
    
    // Set the correct status
    elements.bookStatusOptions.forEach(option => {
        if (option.value === book.status) {
            option.checked = true;
        }
    });
    
    // Store book data for updating
    elements.addBookModal.setAttribute('data-book', JSON.stringify(book));
    elements.addBookModal.setAttribute('data-mode', 'edit');
    
    openModal(elements.addBookModal);
}

// Save book
function saveBook() {
    const mode = elements.addBookModal.getAttribute('data-mode') || 'add';
    const bookData = JSON.parse(elements.addBookModal.getAttribute('data-book') || '{}');
    const status = document.querySelector('input[name="book-status"]:checked').value;
    
    if (mode === 'edit') {
        // Update existing book
        const bookIndex = state.books.findIndex(b => b.id === bookData.id);
        if (bookIndex !== -1) {
            state.books[bookIndex].status = status;
            saveData();
            renderBooks();
            updateGoals();
            closeModal(elements.addBookModal);
        }
    } else {
        // Add new book
        const newBook = {
            ...bookData,
            status,
            addedDate: new Date().toISOString(),
            id: bookData.id || `book_${Date.now()}`
        };
        
        state.books.push(newBook);
        saveData();
        renderBooks();
        updateGoals();
        closeModal(elements.addBookModal);
        
        // If we're on the search page, go to home page
        if (state.currentPage === 'search') {
            changePage('home');
        }
    }
}

// Render goals
function renderGoals() {
    const currentYear = new Date().getFullYear();
    const currentGoal = state.goals.find(goal => goal.year === currentYear);
    
    if (currentGoal) {
        const readBooks = state.books.filter(book => {
            const bookDate = new Date(book.addedDate);
            return book.status === 'read' && bookDate.getFullYear() === currentYear;
        }).length;
        
        const progress = (readBooks / currentGoal.books) * 100;
        const progressCapped = Math.min(progress, 100);
        
        elements.currentGoalCard.innerHTML = `
            <div class="goal-info">
                <h4>${currentGoal.year} Leseziel</h4>
                <p>${readBooks} von ${currentGoal.books} Büchern gelesen</p>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressCapped}%"></div>
                </div>
            </div>
            <div class="goal-stats">
                <span>${Math.round(progress)}% geschafft</span>
                <span>${currentGoal.books - readBooks} übrig</span>
            </div>
        `;
    } else {
        elements.currentGoalCard.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <p>Du hast noch kein Leseziel festgelegt.</p>
                <button class="btn primary" id="create-goal-btn">Ziel erstellen</button>
            </div>
        `;
        
        document.getElementById('create-goal-btn').addEventListener('click', () => {
            const currentYear = new Date().getFullYear();
            elements.goalYear.value = currentYear;
            elements.goalBooks.value = 12; // Default to 1 book per month
            openModal(elements.addGoalModal);
        });
    }
    
    // Render past goals
    const pastGoals = state.goals.filter(goal => goal.year !== currentYear)
        .sort((a, b) => b.year - a.year); // Sort by year descending
    
    if (pastGoals.length === 0) {
        elements.pastGoals.innerHTML = '<p class="text-muted">Keine vergangenen Ziele.</p>';
    } else {
        let pastGoalsHTML = '';
        
        pastGoals.forEach(goal => {
            const readBooks = state.books.filter(book => {
                const bookDate = new Date(book.addedDate);
                return book.status === 'read' && bookDate.getFullYear() === goal.year;
            }).length;
            
            const progress = (readBooks / goal.books) * 100;
            const progressCapped = Math.min(progress, 100);
            
            pastGoalsHTML += `
                <div class="goal-card">
                    <div class="goal-info">
                        <h4>${goal.year} Leseziel</h4>
                        <p>${readBooks} von ${goal.books} Büchern gelesen</p>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressCapped}%"></div>
                        </div>
                    </div>
                    <div class="goal-stats">
                        <span>${Math.round(progress)}% geschafft</span>
                    </div>
                </div>
            `;
        });
        
        elements.pastGoals.innerHTML = pastGoalsHTML;
    }
}

// Save goal
function saveGoal() {
    const year = parseInt(elements.goalYear.value);
    const books = parseInt(elements.goalBooks.value);
    
    if (!year || !books) {
        alert('Bitte fülle alle Felder aus.');
        return;
    }
    
    // Check if goal for this year already exists
    const existingGoalIndex = state.goals.findIndex(goal => goal.year === year);
    
    if (existingGoalIndex !== -1) {
        // Update existing goal
        state.goals[existingGoalIndex].books = books;
    } else {
        // Add new goal
        state.goals.push({
            year,
            books,
            createdDate: new Date().toISOString()
        });
    }
    
    saveData();
    renderGoals();
    closeModal(elements.addGoalModal);
}

// Update goals when books change
function updateGoals() {
    renderGoals();
    renderVocabularyBooks();
}

// Render vocabulary books
function renderVocabularyBooks() {
    const booksWithVocabulary = Object.keys(state.vocabulary);
    
    if (booksWithVocabulary.length === 0) {
        elements.vocabularyBooksList.innerHTML = `
            <li class="empty-state">
                <p>Keine Bücher mit Vokabeln.</p>
            </li>
        `;
        elements.addVocabularyButton.disabled = true;
    } else {
        let booksHTML = '';
        
        booksWithVocabulary.forEach(bookId => {
            const book = state.books.find(b => b.id === bookId);
            if (book) {
                const isActive = state.currentVocabularyBook === bookId;
                booksHTML += `
                    <li class="${isActive ? 'active' : ''}" data-id="${bookId}">
                        ${book.title}
                    </li>
                `;
            }
        });
        
        elements.vocabularyBooksList.innerHTML = booksHTML;
        
        // Add event listeners to book items
        document.querySelectorAll('#vocabulary-books-list li').forEach(item => {
            item.addEventListener('click', () => {
                const bookId = item.getAttribute('data-id');
                selectVocabularyBook(bookId);
            });
        });
        
        // If no book is selected, select the first one
        if (!state.currentVocabularyBook && booksWithVocabulary.length > 0) {
            selectVocabularyBook(booksWithVocabulary[0]);
        } else if (state.currentVocabularyBook) {
            // Refresh the current book's vocabulary
            renderVocabulary();
        }
    }
}

// Select vocabulary book
function selectVocabularyBook(bookId) {
    state.currentVocabularyBook = bookId;
    
    // Update active class
    document.querySelectorAll('#vocabulary-books-list li').forEach(item => {
        if (item.getAttribute('data-id') === bookId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update book title
    const book = state.books.find(b => b.id === bookId);
    if (book) {
        elements.vocabularyBookTitle.textContent = book.title;
        elements.addVocabularyButton.disabled = false;
    }
    
    renderVocabulary();
}

// Render vocabulary
function renderVocabulary() {
    if (!state.currentVocabularyBook || !state.vocabulary[state.currentVocabularyBook]) {
        elements.vocabularyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-language"></i>
                <p>Keine Vokabeln für dieses Buch.</p>
            </div>
        `;
        return;
    }
    
    const vocabulary = state.vocabulary[state.currentVocabularyBook];
    
    if (vocabulary.length === 0) {
        elements.vocabularyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-language"></i>
                <p>Keine Vokabeln für dieses Buch.</p>
            </div>
        `;
    } else {
        let vocabularyHTML = '';
        
        vocabulary.forEach((item, index) => {
            vocabularyHTML += `
                <div class="vocabulary-item" data-index="${index}">
                    <div class="vocabulary-word">${item.word}</div>
                    ${item.translation ? `<div class="vocabulary-translation">${item.translation}</div>` : ''}
                    ${item.context ? `<div class="vocabulary-context">${item.context}</div>` : ''}
                    <div class="vocabulary-actions">
                        <button class="btn secondary edit-vocabulary-btn"><i class="fas fa-edit"></i></button>
                        <button class="btn secondary delete-vocabulary-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        
        elements.vocabularyList.innerHTML = vocabularyHTML;
        
        // Add event listeners to vocabulary items
        document.querySelectorAll('.edit-vocabulary-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = button.closest('.vocabulary-item');
                const index = parseInt(item.getAttribute('data-index'));
                editVocabulary(index);
            });
        });
        
        document.querySelectorAll('.delete-vocabulary-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = button.closest('.vocabulary-item');
                const index = parseInt(item.getAttribute('data-index'));
                deleteVocabulary(index);
            });
        });
    }
}

// Save vocabulary
function saveVocabulary() {
    const word = elements.vocabularyWord.value.trim();
    const translation = elements.vocabularyTranslation.value.trim();
    const context = elements.vocabularyContext.value.trim();
    
    if (!word) {
        alert('Bitte gib mindestens ein Wort ein.');
        return;
    }
    
    if (!state.currentVocabularyBook) {
        alert('Bitte wähle zuerst ein Buch aus.');
        return;
    }
    
    // Initialize vocabulary array for this book if it doesn't exist
    if (!state.vocabulary[state.currentVocabularyBook]) {
        state.vocabulary[state.currentVocabularyBook] = [];
    }
    
    const editIndex = elements.addVocabularyModal.getAttribute('data-edit-index');
    
    if (editIndex !== null && editIndex !== undefined) {
        // Edit existing vocabulary
        const index = parseInt(editIndex);
        state.vocabulary[state.currentVocabularyBook][index] = {
            word,
            translation,
            context,
            updatedDate: new Date().toISOString()
        };
    } else {
        // Add new vocabulary
        state.vocabulary[state.currentVocabularyBook].push({
            word,
            translation,
            context,
            addedDate: new Date().toISOString()
        });
    }
    
    saveData();
    renderVocabulary();
}

// Edit vocabulary
function editVocabulary(index) {
    const vocabulary = state.vocabulary[state.currentVocabularyBook][index];
    
    elements.vocabularyWord.value = vocabulary.word;
    elements.vocabularyTranslation.value = vocabulary.translation || '';
    elements.vocabularyContext.value = vocabulary.context || '';
    
    elements.addVocabularyModal.setAttribute('data-edit-index', index);
    openModal(elements.addVocabularyModal);
}

// Delete vocabulary
function deleteVocabulary(index) {
    if (confirm('Möchtest du diese Vokabel wirklich löschen?')) {
        state.vocabulary[state.currentVocabularyBook].splice(index, 1);
        
        // If no vocabulary left for this book, remove the book from vocabulary
        if (state.vocabulary[state.currentVocabularyBook].length === 0) {
            delete state.vocabulary[state.currentVocabularyBook];
            state.currentVocabularyBook = null;
            renderVocabularyBooks();
        } else {
            renderVocabulary();
        }
    }
}

// Open modal
function openModal(modal) {
    // Reset edit index if opening vocabulary modal
    if (modal === elements.addVocabularyModal) {
        modal.removeAttribute('data-edit-index');
    }
    
    // Reset mode if opening book modal
    if (modal === elements.addBookModal) {
        modal.removeAttribute('data-mode');
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal(modal) {
    modal.classList.remove('active');
}

// Translate vocabulary using Google Translate API
async function translateWord(word, sourceLang = 'en', targetLang = 'de') {
    try {
        // In a real app, you would use a translation API here
        // For this demo, we'll just return a placeholder
        console.log(`Would translate "${word}" from ${sourceLang} to ${targetLang}`);
        return `Übersetzung von "${word}"`;
    } catch (error) {
        console.error('Error translating word:', error);
        return '';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);