// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// imports
import "./Book.sol";
import "./BookReadOnly.sol";

contract BookFactory {
    // array of book contracts / put _bookID to retreive book address
    Book[] public books;

    // array of book (read only) contracts / put _bookID to retrieve book (read only) address
    BookReadOnly[] public booksReadOnly;

    // to initialize new book contract
    function newBook(
        string memory _bookTitle,
        string memory _bookAuthor,
        uint256 _bookPrice,
        address _sender
    ) public {
        // pointer to book contract
        Book book = new Book(
            books.length,
            _bookTitle,
            _bookAuthor,
            payable(_sender),
            _sender,
            (_bookPrice * (1e12 wei))
        );

        // push book contract pointer to array
        books.push(book);
    }

    function numBooks()  public view returns (uint256){
        return books.length;
    }

    function numBooksReadOnly() public view returns (uint256){
        return booksReadOnly.length;
    }
    // to initialize new book (read only) contract
    function newBookReadOnly(
        string memory _bookTitle,
        string memory _bookAuthor,
        uint256 _bookPrice,
        address _sender
    ) public {
        // pointer to book (read only) contract
        BookReadOnly bookReadOnly = new BookReadOnly(
            booksReadOnly.length,
            _bookTitle,
            _bookAuthor,
            payable(_sender),
            _sender,
            (_bookPrice * (1e12 wei))
        );

        // push book (read only) contract pointer to array
        booksReadOnly.push(bookReadOnly);
    }

    // get book
    function getBook(uint256 number) public view returns (address) {
        return address(books[number]);
    }
}
