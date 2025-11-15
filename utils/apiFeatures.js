class APIFeatures {
  constructor(mongooseQuery, query) {
    this.mongooseQuery = mongooseQuery;
    this.query = query;
  }

  //! 1) Filtering Logic
  filter() {
    const queryStringObject = { ...this.query };
    const excludedFields = ["page", "limit", "sort", "fields", "search"];
    //! Remove excluded fields from the query string object
    excludedFields.forEach((field) => delete queryStringObject[field]);

    //! {{baseURL}}/api/v1/products?priceAfterDiscount[lte]=120
    //! Convert operators (gte, gt, lte, lt) => ($gte, $gt, $lte, $lt)
    let queryString = JSON.stringify(queryStringObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));

    return this;
  }

  //! 2) Sorting Logic
  sort() {
    if (this.query.sort) {
      this.query.sort = this.query.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(this.query.sort);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }

    return this;
  }

  //! 3) Field Limiting Logic
  fields() {
    if (this.query.fields) {
      this.query.fields = this.query.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(this.query.fields);
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }

  //! 4) Searching Logic
  search(searchedFields) {
    if (this.query.search) {
      const searchedQuery = {};
      searchedQuery.$or = searchedFields.map((fieldName) => ({
        [fieldName]: {
          $regex: this.query.search.trim(),
          $options: "i"
        }
      })); //! Case-insensitive search for each field name
      this.mongooseQuery = this.mongooseQuery.find(searchedQuery);
    }

    return this;
  }

  //! 5) Pagination Logic
  // paginate(totalDocuments) {
  //   const page = parseInt(this.query.page, 10) || 1; //! Default page = 1
  //   const limit = parseInt(this.query.limit, 10) || 5; //! Default limit = 5
  //   const skip = (page - 1) * limit;
  //   const endIndex = page * limit;

  //   //! Pagination result object
  //   const pagination = {
  //     currentPage: page,
  //     limit,
  //     totalDocuments,
  //     numberOfPages: Math.round(totalDocuments / limit)
  //   };

  //   //! Next page
  //   if (endIndex < totalDocuments) {
  //     pagination.hasNextPage = true;
  //     pagination.next = page + 1;
  //   } else {
  //     pagination.hasNextPage = false;
  //     pagination.next = null;
  //   }

  //   //! Previous page
  //   if (skip > 0) {
  //     pagination.hasPrevPage = true;
  //     pagination.prev = page - 1;
  //   } else {
  //     pagination.hasPrevPage = false;
  //     pagination.prev = null;
  //   }

  //   //! Range (start and end index)
  //   pagination.startIndex = skip + 1;
  //   pagination.endIndex = Math.min(endIndex, totalDocuments);

  //   //! Attach pagination & apply skip/limit on mongoose query
  //   this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
  //   this.paginationResult = pagination;

  //   return this;
  // }

  //! 6) Population Logic
  populate(populateName) {
    this.mongooseQuery = this.mongooseQuery.populate(populateName);

    return this;
  }
}

module.exports = APIFeatures;
