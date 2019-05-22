/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const DigitBook = require('./book.js');

class BookList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.papernet.digitbooklist');
        this.use(DigitBook);
    }

    async addBook(book) {
        return this.addState(book);
    }

    async getBook(bookKey) {
        return this.getState(bookKey);
    }

    async updateBook(book) {
        return this.updateState(book);
    }
}


module.exports = BookList;
