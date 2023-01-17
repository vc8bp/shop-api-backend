class Features {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const s = this.queryStr.s
        const ss = this.queryStr.s ? (
            {$or: [
                {"title": {$regex: s, $options: "i"}},
                {"productno": {$regex: s, $options: "i"}},
                {"desc": {$regex: s, $options: "i"}},
                {"categories": {$in: [s]}}
              ]},
            {
            title: 1,
            _id: 1
            }
        ) : {}
        this.query = this.query.find(ss)
        return this.query
    }
}

module.exports = Features