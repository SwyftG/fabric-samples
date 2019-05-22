/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

const DigitBook = require('./book.js');
const BookList = require('./booklist.js');

/**
 */
class DigitBookContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.bookList = new BookList(this);
    }

}

/**
 * Define digit book smart contract by extending Fabric Contract class
 *
 */
class DigitBookContract extends Contract {

    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.papernet.digitbook');
    }

    /**
     * Define a custom context for digit book
    */
    createContext() {
        return new DigitBookContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue digit book
     *
     * @param {Context} ctx the transaction context
     * @param {String} bookStore digit book bookstore
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     * @param {String} issueDateTime book issued data
     * @param {String} bookPrice book's price
     * @param {String} bookContent book's content
    */
    async issue(ctx, bookStore, bookNumber, bookName, issueDateTime, bookPrice, bookContent) {

        // let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        // let book = await ctx.bookList.getBook(bookKey);
        // if (book) {
        //     throw new Error('Book: ' + bookNumber + bookName + ' has been issued.');
        // }

        // create an instance of the digit book
        let newbook = DigitBook.createInstance(bookStore, bookNumber, bookName, issueDateTime, bookPrice, bookContent);

        // Smart contract moves book into UNPUBLISHED state
        newbook.setUnpublished();

        // Set the owner is current bookstore
        newbook.setOwner(bookStore);

        // Add the book to the list of all similar digit books in the ledger world state
        await ctx.bookList.addBook(newbook);

        // Must return a serialized book to caller of smart contract
        return newbook.toBuffer();
    }

    /**
     * Publish a digit book (called only by BookStore)
     *
     * @param {Context} ctx the transaction context
     * @param {String} curBookStore digit book's bookstore
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     * @param {String} bookPrice book's price
     */
    async publish(ctx, curBookStore, bookNumber, bookName, bookPrice) {

        // Retrieve the current book using key fields provided
        let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        let book = await ctx.bookList.getBook(bookKey);

        // Validate current bookstore
        if (book.getBookStore() !== curBookStore) {
            throw new Error('Publish Book: ' + bookNumber + bookName + ' is not owned by ' + curBookStore);
        }

        // Valiedate the book's state
        // The book's state should be UNPIBLISHED or RETURNED
        // Then set the state tobe PUBLISHED
        if (book.isUnpublished() || book.isReturned()) {
            book.setPublished();
        }

        // Set the Owner and book price
        if (book.isPublished()) {
            book.setOwner(curBookStore);
            book.setBookPrice(bookPrice);
        }

        // Update the book's info.
        await ctx.bookList.updateBook(book);
        return book.toBuffer();
    }

    /**
     * Buy digit book
     *
     * @param {Context} ctx the transaction context
     * @param {String} bookStore digit book be selled in bookstore
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     * @param {String} newOwner buyer
     * @param {String} price The buyer's price for the book
    */
    async buy(ctx, bookStore, bookNumber, bookName, newOwner, price) {

        // Retrieve the current book using key fields provided
        let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        let book = await ctx.bookList.getBook(bookKey);

        // Validate current book's bookstore
        if (book.getBookStore() !== bookStore) {
            throw new Error('Book ' + bookNumber + bookName + ' is not owned by ' + bookStore + ' bookstore.');
        }

        // Validate current book's owner
        if (book.getBookStore() != book.getOwner()) {
            throw new Error('Book ' + bookNumber + bookName + ' is not available to buy at bookstore' + book.getBookStore());
        }

        // Check whether the book is available to sell.
        if (!book.isPublished()) {
            throw new Error('Book ' + bookNumber + bookName + ' is unavailable to buy. Current state = ' + book.getCurrentState() + '. Is Not PUBLISHED.');
        } else {
            book.setTrading();
        }

        //Trading
        if (book.isTrading()) {
            // Check the price and buyer's money.
            if (Number(book.getBookPrice()) <= Number(price)) {
                book.setSelled();
                book.setOwner(newOwner);
            } else {
                throw new Error('Money to buy book ' + bookNumber + bookName + ' is not enough. Price is: ' + book.getBookPrice() + ', Money is: ' + price);
            }
        } else {
            throw new Error('Book ' + bookNumber + bookName + ' is not trading. Current state = ' +book.getCurrentState());
        }

        // Update the paper
        await ctx.bookList.updateBook(book);
        return book.toBuffer();
    }

    /**
     * return digit book
     *
     * @param {Context} ctx the transaction context
     * @param {String} bookStore digit book should be returned to
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     * @param {String} returnOwner who return the book
    */
    async return(ctx, bookStore, bookNumber, bookName, returnOwner) {

        let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        let book = await ctx.bookList.getBook(bookKey);

        // Check paper is not RETURNED
        if (book.isReturned()) {
            throw new Error('Book ' + bookNumber + bookName + ' already returned.');
        }

        // Verify that the return owns the digit book before return it
        if (book.getBookStore() !== bookStore) {
            throw new Error('Book ' + bookNumber + bookName + ' is not buyed from bookStore: ' + bookStore);
        }

        // Change the book's state
        if (book.isSelled()) {
            book.setReturing();
        } else {
            throw new Error('Book ' + bookNumber + bookName + ' state is not seled: ' + book.getCurrentState());
        }

        if (book.isReturning()) {
            if (book.getOwner() === returnOwner) {
                 book.setOwner(book.getBookStore());
                 book.setReturned();
            } else {
                throw new Error('Return owner '+ returnOwner + ' does not own book ' + bookNumber + bookName);
            }
        }

        await ctx.bookList.updateBook(book);
        return book.toBuffer();
    }

    /**
     * read get the digit's content
     *
     * @param {Context} ctx the transaction context
     * @param {String} owner digit book's owner
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     */
    async read(ctx, owner, bookNumber, bookName) {

        let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        let book = await ctx.bookList.getBook(bookKey);

        // Verity book's state
        if (book.isTrading() || book.isReturning()) {
            throw new Error('Book ' + bookNumber + bookName + ' is not readable. currentState: ' + book.getCurrentState());
        }

        // Verity book's owner.
        if (book.getOwner() !== owner) {
            throw new Error('Book ' + bookNumber + bookName + ' is not owned by ' + owner +', who do not have access right.');
        }

        return book.toBuffer();
    }
}

module.exports = DigitBookContract;
