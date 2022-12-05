'use strict'

var gDisplayState = 'table'

function onInit() {
    renderFilterByQueryStringParams()
    renderReadByQueryStringParams()
    renderBooks()
    renderAdvancedPaging()
}

function renderBooks() {
    const books = getBooks()
    console.log('books:', books)
    // <table class="books-table">
    // </table>

    if (gDisplayState === 'table') {
        var strHTML = `<table class="books-table"><thead> <th>Id</th><th onclick="onSortBy('title')">Title</th><th onclick="onSortBy('price')">Price</th> 
    <th>Actions</th><th>Rating</th></thead><tbody>`
        var strHTMLs = books.map(book => `<tr>
        <td class="book-id-td">${book.id}</td>
        <td class='title-td'>${book.title}</td>
        <td class="${book.id}-price price-td">${book.price}</td>
        <td class="btns-td">
        <button onclick="onReadBook('${book.id}')" class="read-btn">Read</button>
        <button onclick="onUpdateBook('${book.id}')" class="update-btn">Update</button>
        <button onclick="onDeleteBook('${book.id}')" class="delete-btn">Delete</button>
        </td>
        <td class="rating-td">${book.rating}</td>`)

        strHTML += strHTMLs.join('')
        strHTML += `</tbody></table>`
        document.querySelector('.books-container').innerHTML = strHTML
    } else {
        var strHTMLs = books.map(book => `
    <article class="book-preview">
    <h3>${book.title}</h3>
    <h4 class="${book.id}-price">${book.price}$</h4>
    <button onclick="onReadBook('${book.id}')" class="read-btn">Read</button>
    <button onclick="onUpdateBook('${book.id}')" class="update-btn">Update</button>
    <button onclick="onDeleteBook('${book.id}')" class="delete-btn">Delete</button>
    <h2>Rate: ${book.rating}</h2>
    </article>`)
        document.querySelector('.books-container').innerHTML = strHTMLs.join('')
    }
}

function onChangeDisplay(display) {
    gDisplayState = display
    renderBooks()
}


function renderAdvancedPaging() {
    const pages = getPages()
    var strHTML = ''
    for (var i = 0; i < pages; i++) {
        strHTML += `<button onclick="onAdvancedPaging(${i})" class="paging-btn">${i} </button>`
    }
    const elAdvancedPagingContainer = document.querySelector('.advanced-paging-container')
    elAdvancedPagingContainer.innerHTML = strHTML
}

function onDeleteBook(bookId) {
    console.log('bookId:', bookId)
    deleteBook(bookId)
    renderBooks()
    renderAdvancedPaging()
}

function toggleAddModalDisplay() {
    const elAddBookModal = document.querySelector('.add-book-modal')
    elAddBookModal.classList.toggle('open')
}

function onAddBook() {
    const elBookTitle = document.querySelector('.add-book-title')
    const elBookPrice = document.querySelector('.add-book-price')
    addBook(elBookTitle.value, elBookPrice.value)
    renderBooks()
    renderAdvancedPaging()
    toggleAddModalDisplay()
    elBookTitle.value = ''
    elBookPrice.value = ''
}



function onUpdateBook(bookId) {
    const elBookPrice = document.querySelector(`.${bookId}-price`)
    elBookPrice.innerHTML = `<input class="new-book-price" type="text" placeholder="Enter new price"/><button class="done-price-btn" onclick="onUpdateBookPrice('${bookId}')">Done</button>`
}

function onUpdateBookPrice(bookId) {
    const elNewBookPrice = document.querySelector('.new-book-price')
    updateBook(bookId, elNewBookPrice.value)
    renderBooks()
}

function onReadBook(bookId) {
    const book = getBookById(bookId)
    saveBookToStorage(book)
    const elModal = document.querySelector('.read-modal')
    elModal.querySelector('.book-title').innerText = book.title
    elModal.querySelector('.book-price').innerText = book.price + '$'
    elModal.querySelector('.book-rating').innerText = book.rating
    elModal.classList.add('open')
    const queryStringParams = `?selectedBookId=${bookId}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onUpdateRating(value) {
    const readBookRating = updateRating(value)
    document.querySelector('.book-rating').innerText = readBookRating
    renderBooks()
}

function onCloseReadModal() {
    const queryStringParams = new URLSearchParams(window.location.search)
    queryStringParams.delete('selectedBookId')
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
    document.querySelector('.read-modal').classList.remove('open')
}

function onSetFilterBy(filterBy) {
    filterBy = setBooksFilter(filterBy)
    renderBooks()
    renderAdvancedPaging()
    onChangePage()

    const queryStringParams = `?selectFilter=${filterBy.selectFilter}&searchFilter=${filterBy.searchFilter}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onSortBy(key = getSortByKey()) {
    const isDescending = document.querySelector('.sort-desc').checked
    const sortBy = {
        [key]: (isDescending) ? -1 : 1
    }
    console.log('sortBy:', sortBy)
    setBooksSort(sortBy)
    renderBooks()
}

function onPrevPage() {
    const isFirstPage = prevPage()
    if (isFirstPage) return
    renderBooks()
    onChangePage()
}

function onNextPage() {
    nextPage()
    renderBooks()
    onChangePage()
}

function onAdvancedPaging(pageIdx) {
    changePage(pageIdx)
    renderBooks()
    onChangePage()
}

function onChangePage() {
    const elPrevPageBtn = document.querySelector('.prev-page-btn')
    const elNextPageBtn = document.querySelector('.next-page-btn')
    const isLastPage = checkLastPage()
    elNextPageBtn.disabled = (isLastPage) ? true : false
    elNextPageBtn.style.opacity = (isLastPage) ? '0' : '1'
    elPrevPageBtn.style.opacity = (!getCurrPage()) ? '0' : '1'
}

function renderFilterByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const filterBy = {
        selectFilter: queryStringParams.get('selectFilter') || 'all',
        searchFilter: queryStringParams.get('searchFilter') || ''
    }
    if (!filterBy.selectFilter && !filterBy.searchFilter) return
    document.querySelector('.select-filter').value = filterBy.selectFilter
    document.querySelector('.search-filter').value = filterBy.searchFilter
    setBooksFilter(filterBy)
}

function renderReadByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const readBookId = queryStringParams.get('selectedBookId')
    if (!readBookId) return
    onReadBook(readBookId)
}