// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// imports
import "./BookFactory.sol";
import "./Transfer.sol";

contract UserApp {
    BookFactory public bookFactory;
    Transfer public transferC;

    constructor(address _bookfactoryAddress, address _transferContractAddress) {
        bookFactory = BookFactory(_bookfactoryAddress);
        transferC = Transfer(_transferContractAddress);
    }

    // publish new book
    function publishBook(
        string memory _bookTitle,
        string memory _bookAuthor,
        uint256 _bookPrice
    ) public {
        bookFactory.newBook(_bookTitle, _bookAuthor, _bookPrice, msg.sender);
    }

    // buy book
    function buyBook(address _bookAddress) public payable {
        Book book = Book(_bookAddress);

        // checks
        require(book.forSale() == true, "Book is not for sale!");
        require(
            msg.value >= book.bookPrice(),
            "Need to send exact amount of szabo!"
        );

        // buy the book
        transferC.buy(bookFactory, book, msg.sender);
    }

    // sell book
    function sellBook(address _bookAddress) public {
        Book book = Book(_bookAddress);

        // checks
        require(
            msg.sender == book.ownerAddress(),
            "Only owner (publisher) put book up for sale!"
        );

        // put book up for sale
        transferC.sell(book);
    }

    // remove book off the market
    function offMarket(address _bookAddress) public {
        Book book = Book(_bookAddress);

        // checks
        require(
            msg.sender == book.ownerAddress(),
            "Only owner (publisher) can mark book as off market!"
        );

        // put book off the market
        transferC.offmarket(book);
    }
}
