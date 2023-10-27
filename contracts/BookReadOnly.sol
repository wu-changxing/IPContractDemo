// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract BookReadOnly
{
    string public bookTitle;
    string public bookAuthor;
    uint public bookID;
    address payable public ownerPayable;
    address public ownerAddress;
    uint public bookPrice;
    bool public forSale;

    function setNewOwner(address _ownerAddress) public
    {
        ownerAddress = _ownerAddress;
    }

    constructor(uint _bookID, string memory _bookTitle, string memory _bookAuthor,
                address payable _ownerPayable, address _ownerAddress, uint _bookPrice) public payable
    {
        bookID = _bookID;
        bookTitle = _bookTitle;
        bookAuthor = _bookAuthor;
        ownerPayable = _ownerPayable;
        ownerAddress = _ownerAddress;
        bookPrice = _bookPrice;
        forSale = false;
    }
}