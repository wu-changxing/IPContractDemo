// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// imports
import "./Book.sol";
import "./BookFactory.sol";

contract Transfer {
    // buy book and ownership to read (not allowed for resale)
    function buy(
        BookFactory _bookFactory,
        Book _book,
        address _senderAddress
    ) public payable {
        // create a new book contract for buyer (for proof; non-resale)
        _bookFactory.newBookReadOnly(
            _book.bookTitle(),
            _book.bookAuthor(),
            _book.bookPrice(),
            _senderAddress
        );

        // transfer buyer -> owner (money)
        // money send into owner account
        _book.ownerPayable().transfer(msg.value);
    }

    // put book up for selling
    function sell(Book _book) public {
        // turn on book for sale
        _book.setForSale(true);
    }

    // put book off market
    function offmarket(Book _book) public {
        // turn off book for sale
        _book.setForSale(false);
    }
}