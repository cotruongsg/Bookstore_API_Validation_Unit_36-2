const express = require("express");
const Book = require("../models/book");

const router = new express.Router();

const { validate } = require("jsonschema");
const bookSchemaNew = require("../schemas/bookSchemaNew");
const bookSchemaUpdate = require("../schemas/bookSchemaUpdate");


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const validation = validate(req.body,bookSchemaNew)
    if(!validation.valid){
      return next({
        status : 400,
        error : validation.errors.map(e => e.stack)
      })
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body) {
      return next({
        status: 400,
        message: "Not allowed"
      });
    }
    const validation = validate(req.body,bookSchemaUpdate)
    if(!validation.valid){
      return next({
        status : 400,
        error : validation.errors.map(e => e.stack)
      })
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[isbn]   bookData => {book: updatedPartialBook}  */

router.patch("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body) {
      return next({
        status: 400,
        message: "Not allowed"
      });
    }
    const data = req.body;

  // Validate the data using JSON Schema if needed
  // Check if provided properties match the ones defined in the JSON Schema
  const schemaProperties = Object.keys(bookSchemaUpdate.properties);
  const providedProperties = Object.keys(data);

  // !schemaProperties.includes(prop) is a condition that evaluates to true 
  // if the current property (prop) is NOT allowed by the JSON schema, and false if it is allowed.
  const invalidProperties = providedProperties.filter(prop => !schemaProperties.includes(prop));
   if (invalidProperties.length > 0) {
     return res.status(400).json({
       error: `Invalid properties provided: ${invalidProperties.join(", ")}`
     });
   }

  const updatedBook = await Book.partialUpdate(req.params.isbn, data);
    return res.json({ book: updatedBook });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
