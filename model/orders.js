const mongoose = require('mongoose')


const invoiceSchema = new mongoose.Schema({
    customerName: String,
    workHours: Number,
    rate: Number,
    labour:Number,
    workRelatedExpenses: Number,
    materials: Number,
    totalAmount:Number,
    dueDate: Date,
    status: String,
    payment:String
})

module.exports = mongoose.model("bill",invoiceSchema);