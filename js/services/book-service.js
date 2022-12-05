'use strict'

const STORAGE_KEY = 'booksDB'
const READ_STORAGE_KEY = 'readBookDB'
const PAGE_SIZE = 2

var gBooks
var gNextId = 1
var gPageIdx = 0
var gFilterBy = { selectFilter: 'all', searchFilter: '' }
var gSortBy = 'title'


_createBooks()

function nextPage() {
    gPageIdx++
}

function prevPage() {
    if (gPageIdx === 0) return true
    gPageIdx--
}

function checkLastPage() {
    if ((gPageIdx + 1) * PAGE_SIZE >= getFilteredBooks().length) return true
}

function changePage(pageIdx) {
    gPageIdx = pageIdx
}

function getCurrPage() {
    return gPageIdx
}

function getBooks() {
    const books = getFilteredBooks()
    const startIdx = gPageIdx * PAGE_SIZE
    return books.slice(startIdx, startIdx + PAGE_SIZE)
}

function getPages() {
    console.log('getFilteredBooks:', getFilteredBooks())
    return Math.ceil(getFilteredBooks().length / PAGE_SIZE)
}

function getFilteredBooks() {
    var filteredBooks
    if (gFilterBy.selectFilter === 'all') filteredBooks = gBooks
    else if (gFilterBy.selectFilter === 'maxPrice') filteredBooks = _getMostExpensiveBooks()
    else filteredBooks = _getLowestRatedBooks()
    var books = filteredBooks.filter(book => book.title.toLocaleLowerCase().includes(gFilterBy.searchFilter.toLocaleLowerCase()))
    return books
}

function _getMostExpensiveBooks() {
    const sortedByPriceBooks = gBooks.sort((a, b) => b.price - a.price)
    const highestBookPrice = sortedByPriceBooks[0].price
    return sortedByPriceBooks.filter(book => book.price === highestBookPrice)
}

function _getLowestRatedBooks() {
    const sortedByRatingBooks = gBooks.sort((a, b) => a.rating - b.rating)
    const lowestBookRating = sortedByRatingBooks[0].rating
    return sortedByRatingBooks.filter(book => book.rating === lowestBookRating)
}

function addBook(title, price) {
    const book = _createBook(makeId(), title, price)
    gBooks.push(book)
    _saveBooksToStorage()
}

function deleteBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId)
    gBooks.splice(bookIdx, 1)
    _saveBooksToStorage()
}

function updateBook(bookId, bookPrice) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId)
    gBooks[bookIdx].price = bookPrice
    _saveBooksToStorage()
}

function updateRating(value) {
    const readBook = loadFromStorage(READ_STORAGE_KEY)
    const bookIdx = gBooks.findIndex(book => book.id === readBook.id)
    gBooks[bookIdx].rating += value
    _saveBooksToStorage(STORAGE_KEY, gBooks)
    return gBooks[bookIdx].rating
}

function setBooksFilter(filterBy) {
    gPageIdx = 0
    if (filterBy.selectFilter !== undefined) gFilterBy.selectFilter = filterBy.selectFilter
    if (filterBy.searchFilter !== undefined) gFilterBy.searchFilter = filterBy.searchFilter
    return gFilterBy
}

function getSortByKey() {
    return gSortBy
}

function setBooksSort(sortBy) {
    if (sortBy.title !== undefined) {
        gBooks.sort((b1, b2) => b1.title.localeCompare(b2.title) * sortBy.title)
        gSortBy = 'title'
    } else if (sortBy.price !== undefined) {
        gBooks.sort((b1, b2) => (b1.price - b2.price) * sortBy.price)
        gSortBy = 'price'
    }
}

function getBookById(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId)
    return gBooks[bookIdx]
}

function saveBookToStorage(book) {
    saveToStorage(READ_STORAGE_KEY, book)
}

function _createBooks() {
    var books = loadFromStorage(STORAGE_KEY)
    if (!books || !books.length) {
        books = [
            (_createBook(makeId(), 'Learning Laravel', 18.90)),
            (_createBook(makeId(), 'Beginning with Laravel', 6.65)),
            (_createBook(makeId(), 'Java for developers', 7.20))
        ]
    }
    gBooks = books
    _saveBooksToStorage()
}

function _createBook(id, title, price, rating = 0) {
    return {
        id,
        title,
        price,
        rating
    }
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}

// Should add findBookById func