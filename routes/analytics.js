const route = require("express").Router()
const Product = require("../models/product")
const ConfirmOrder = require("../models/ConfirmOrders")
route.get('/topproducts', async (req, res) => {
    try {
        const products = await Product.aggregate([
            {$sort: {"purchasedCount": -1}},
            {$limit: 5},
            {$project: {img: 1, title: 1, purchasedCount: 1, price: 1}},
            {$addFields: {revenue: {$multiply: ["$price", "$purchasedCount"]}}}
        ])
        res.status(200).json(products)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "internal server error"})
    }
})


// Sales statistics route
route.get('/sales', async (req, res) => {
    try {
        const data = await ConfirmOrder.aggregate([
            { $group: {
                _id: null,
                totalRevenue: { $sum: '$price' },
                totalProductsSold: { $sum: { $size: '$products' } },
                averageOrderValue: { $avg: '$price' },
                maxOrderValue: {$max: "$price"}
            } }
        ]);

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "internal server error"})
    }
});
module.exports = route;



route.get('/popularsizecolor', async (req, res) => {
    try {
        const results = await Product.aggregate([
            {
                $facet: {
                    sizes: [
                        {$unwind: "$size"},
                        {$group: {_id: "$size", count: {$sum: 1}}},
                        {$sort: {count: -1}},
                        {$limit: 5},
                        {$project: {_id: 1, count: 1}}
                    ],
                    colors: [
                        {$unwind: "$color"},
                        {$group: {_id: "$color", count: {$sum: 1}}},
                        {$sort: {count: -1}},
                        {$limit: 5},
                        {$project: {_id: 1, count: 1}}
                    ]
                }
            }
        ]);
        res.status(200).json(results);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "internal server error"})
    }
})

