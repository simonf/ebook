'use strict';

var express = require('express');
var controller = require('./book.controller');

var router = express.Router();

router.get('/', controller.paths);
router.get('/candidates/:id', controller.candidates);
router.get('/book/:id', controller.book);
router.post('/ignore',controller.ignore);
router.post('/match',controller.ignore);
router.post('/book',controller.updateBook);

module.exports = router;