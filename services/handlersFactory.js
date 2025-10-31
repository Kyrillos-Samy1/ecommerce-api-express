const slugify = require("slugify");
const mongoose = require("mongoose");
const APIError = require("../utils/apiError");
const APIFeatures = require("../utils/apiFeatures");

//! Handler To Create One Document
exports.createDocumnet =
  (CreateDocumnetModel, FactoryName) => async (req, res, next) => {
    if (req.body.name) req.body.slug = slugify(req.body.name);
    if (req.body.title) req.body.slug = slugify(req.body.title);
    if (req.body.expireAt)
      req.body.expireAt = new Date(req.body.expireAt).toISOString();

    try {
      const createdDocument = await CreateDocumnetModel.create(req.body);

      res.status(201).json({
        data: createdDocument,
        message: `${FactoryName} Created Successfully!`
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

      const documentsCount = await GetAllDocumentsModel.countDocuments(
        apiFeatures.mongooseQuery.getFilter()
      );

      apiFeatures
        .paginate(documentsCount)
        .filter()
        .sort()
        .fields()
        .search(ListOfSearchedFields)
        .populate(ListOfPopulate);

      //! Execute query
      const { mongooseQuery, paginationResult } = apiFeatures;
      const documents = await mongooseQuery.find(filteredSubDocuments);

      if (documents.length === 0) {
        return next(new APIError(`No ${FactoryName} Found!`, 404, "Not Found"));
      }

      res.status(200).json({
        paginationResult,
        results: documents.length,
        data: documents,
        message: `${FactoryName} Fetched Successfully!`
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
    selectedFields
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
        data: fetchedDocument,
        message: `${FactoryName} Fetched Successfully!`
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
  (UpdatingModel, FactoryName, ParamName) => async (req, res, next) => {
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
        data: updatedDocument,
        message: `${FactoryName} Updated Successfully!`
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
  (DeletingModel, FactoryName, ParamName) => async (req, res, next) => {
    const documentId = req.params[ParamName] || req.user._id;
    try {
      const deletedDocument =
        await DeletingModel.findByIdAndDelete(documentId).select("-__v");

      res.status(200).json({
        data: deletedDocument,
        message: `${FactoryName} Deleted Successfully!`
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
