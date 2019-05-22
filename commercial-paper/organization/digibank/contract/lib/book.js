/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate commercial paper state values
const bookState = {
    UNPUBLISHED: 1,
    PUBLISHED: 2,
    TRADING: 3,
    SELLED: 4,
    RETURNING: 5,
    RETURNED:6
};

/**
 * DigitBook class extends State class
 * Class will be used by application and smart contract to define a book
 */
class DigitBook extends State {

    constructor(obj) {
        super(DigitBook.getClass(), [obj.bookNumber, obj.bookName]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getBookStore() {
        return this.bookStore;
    }

    setBookStore(newBookStore) {
        this.bookStore = newBookStore;
    }

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    getBookPrice() {
        return this.bookPrice;
    }

    setBookPrice(newPrice) {
        this.bookPrice = newPrice;
    }

    getbookName() {
        return this.bookName;
    }

    getBookContent() {
        return this.bookContent;
    }

    /**
     * Useful methods to encapsulate commercial paper states
     */
    setUnpublished() {
        this.currentState = bookState.UNPUBLISHED;
    }

    setPublished() {
        this.currentState = bookState.PUBLISHED;
    }

    setTrading() {
        this.currentState = bookState.TRADING;
    }

    setSelled() {
        this.currentState = bookState.SELLED;
    }

    setReturing() {
        this.currentState = bookState.RETURNING;
    }

    setReturned() {
        this.currentState = bookState.RETURNED;
    }

    isUnpublished() {
        return this.currentState === bookState.UNPUBLISHED;
    }

    isPublished() {
        return this.currentState === bookState.PUBLISHED;
    }

    isTrading() {
        return this.currentState === bookState.TRADING;
    }

    isSelled() {
        return this.currentState === bookState.SELLED;
    }

    isReturning() {
        return this.currentState === bookState.RETURNING;
    }

    isReturned() {
        return this.currentState === bookState.RETURNED;
    }

    static fromBuffer(buffer) {
        return DigitBook.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to book
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, DigitBook);
    }

    /**
     * Factory method to create a digit book object
     */
    static createInstance(bookStore, bookNumber, bookName, issueDateTime, bookPrice, bookContent) {
        return new DigitBook({ bookStore, bookNumber, bookName, issueDateTime, bookPrice, bookContent });
    }

    static getClass() {
        return 'org.papernet.digitbook';
    }
}

module.exports = DigitBook;
