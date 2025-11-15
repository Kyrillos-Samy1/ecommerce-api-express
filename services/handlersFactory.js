const slugify = require("slugify");
const mongoose = require("mongoose");
const APIError = require("../utils/apiError");
const APIFeatures = require("../utils/apiFeatures");

//! Handler To Create One Document
exports.createDocumnet =
  (CreateDocumnetModel, FactoryName, sanitizeData) =>
  async (req, res, next) => {
    if (req.body.name) req.body.slug = slugify(req.body.name);
    if (req.body.title) req.body.slug = slugify(req.body.title);
    if (req.body.expireAt)
      req.body.expireAt = new Date(req.body.expireAt).toISOString();

    try {
      const createdDocument = await CreateDocumnetModel.create(req.body);

      res.status(201).json({
        message: `${FactoryName} Created Successfully!`,
        data: sanitizeData ? sanitizeData(createdDocument) : createdDocument
      });
    } catch (err) {
      return next(
        new APIError(
          `Error Creating New ${FactoryName}: ${err.message}`,
          500,
          err.name
        )
      );
    }
  };

//! Handler To Get All Documents With (Search, Filtration, Sorting, Field Limiting, Population, Pagination)
exports.getAllDocuments =
  (
    GetAllDocumentsModel,
    FactoryName,
    ListOfPopulate,
    ListOfSearchedFields,
    ParamName
  ) =>
  async (req, res, next) => {
    const filteredSubDocuments = {};

    try {
      //! If paramId is provided in the params, filter the subDocuments
      if (req.params[ParamName]) {
        const documentId = req.params[ParamName];
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
          return next(
            new APIError(
              `Invalid ${FactoryName} ID Format: ${documentId}`,
              400,
              "Invalid ID"
            )
          );
        }
        filteredSubDocuments[ParamName.replace("Id", "")] = documentId;
      }

      //! Build the mongoose query
      const apiFeatures = new APIFeatures(
        GetAllDocumentsModel.find(),
        req.query
      );

      apiFeatures
        .filter()
        .sort()
        .fields()
        .search(ListOfSearchedFields)
        .populate(ListOfPopulate);

      //! Execute query first to get filtered documents
      const documents =
        await apiFeatures.mongooseQuery.find(filteredSubDocuments);

      if (documents.length === 0) {
        return next(new APIError(`No ${FactoryName} Found!`, 404, "Not Found"));
      }

      //! Pagination after getting filtered documents
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 5;
      const totalDocuments = await GetAllDocumentsModel.countDocuments();
      const results = documents.length;
      const numberOfPages = Math.ceil(results / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, results);
      const paginatedData = documents.slice(startIndex, endIndex);

      const paginationResult = {
        currentPage: page,
        limit,
        totalDocuments,
        numberOfPages,
        hasNextPage: page < numberOfPages,
        next: page < numberOfPages ? page + 1 : null,
        hasPrevPage: page > 1,
        prev: page > 1 ? page - 1 : null,
        startIndex: startIndex + 1,
        endIndex
      };

      res.status(200).json({
        paginationResult,
        results: paginatedData.length,
        message: `${FactoryName} Fetched Successfully!`,
        data: paginatedData
      });
    } catch (err) {
      return next(
        new APIError(
          `Error Fetching All ${FactoryName} With Pagination: ${err.message}`,
          500,
          err.name
        )
      );
    }
  };

//! Handler To Get One Document By Id
exports.getDocumentById =
  (
    GetDocumentByIdModel,
    FactoryName,
    ListOfPopulate,
    ParamName,
    selectedFields,
    sanitizeData
  ) =>
  async (req, res, next) => {
    const documentId = req.params[ParamName];

    try {
      const fetchedDocument = await GetDocumentByIdModel.findById(documentId)
        .select(selectedFields || "-__v")
        .populate(ListOfPopulate);

      if (!fetchedDocument) {
        return next(new APIError(`${FactoryName} not found`, 404));
      }

      res.status(200).json({
        message: `${FactoryName} Fetched Successfully!`,
        data: sanitizeData ? sanitizeData(fetchedDocument) : fetchedDocument
      });
    } catch (err) {
      console.error(err);
      return next(
        new APIError(
          `Error Fetching All ${FactoryName} By ID: ${err.message}`,
          500,
          err.name
        )
      );
    }
  };

//! Handler To Update One Document
exports.updateOneDocument =
  (UpdatingModel, FactoryName, ParamName, sanitizeData) =>
  async (req, res, next) => {
    const body = req.body;
    const documentId = req.params[ParamName];

    if (body.name) body.slug = slugify(body.name);
    if (body.title) body.slug = slugify(body.title);

    if (body.expireAt) body.expireAt = new Date(body.expireAt).toISOString();

    try {
      const updatedDocument = await UpdatingModel.findByIdAndUpdate(
        { _id: documentId },
        body,
        { new: true, runValidators: true }
      ).select("-__v");

      res.status(200).json({
        message: `${FactoryName} Updated Successfully!`,
        data: sanitizeData ? sanitizeData(updatedDocument) : updatedDocument
      });
    } catch (err) {
      next(
        new APIError(
          `Error updating ${FactoryName}: ${err.message}`,
          500,
          err.name
        )
      );
    }
  };

//! Handler To Delete One Document
exports.deleteOneDocument =
  (DeletingModel, FactoryName, ParamName, sanitizeData) =>
  async (req, res, next) => {
    const documentId = req.params[ParamName] || req.user._id;
    try {
      const deletedDocument = await DeletingModel.findOneAndDelete({
        _id: documentId
      }).select("-__v");

      res.status(200).json({
        message: `${FactoryName} Deleted Successfully!`,
        data: sanitizeData ? sanitizeData(deletedDocument) : deletedDocument
      });
    } catch (err) {
      console.error(err);
      return next(
        new APIError(
          `Error Deleting ${FactoryName}: ${err.message}`,
          500,
          err.name
        )
      );
    }
  };
