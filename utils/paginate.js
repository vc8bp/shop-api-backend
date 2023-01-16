const paginate = (model) => async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
  
    const count = await model.countDocuments();
    const pages = Math.ceil(count / limit);
    const results = {
        data: await model.find().skip(startIndex).limit(limit).exec(),
        meta: {
            total: count,
            pages: pages,
            page: page,
            limit: limit,
            prev_page: page > 1 ? page - 1 : null,
            next_page: page < pages ? page + 1 : null
        }
    }
    res.paginatedResults = results;
    next();
}

module.exports = paginate;