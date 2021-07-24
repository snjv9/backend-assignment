const express = require('express')
const router = express.Router()
const bill = require('./model/orders')
const ObjectId = require('mongoose').Types.ObjectId;
const nodemailer = require('nodemailer')
const {readFileSync, writeFileSync} = require('fs')

//Fething all invoices
router.get('/', async (req,res)=>{
    try{
        const invoice =  await bill.find()
        
        res.json(invoice)
    }
    catch(err){
        console.log(err)
    }
})

//Generating new invoice
router.post('/', async (req,res)=>{

    const { customerName,workHours,workRelatedExpenses,materials,dueDate,status } = req.body
    const changeDate = new Date(dueDate);
    if (!customerName || !workHours || !workRelatedExpenses || !materials || !changeDate ||!status) {
    return res
        .status(400)
        .json({ success: false, msg: 'Please provide all values including customerName,workHours,workRelatedExpenses,materials,dueDate,status' })
    }
    const rate = 100;
    const labour = 300;
    const payment = "Send Checks to 23,  First Street, Banker's Colony, Hyderabad"
    const totalAmount = (workHours*rate)+labour+materials+workRelatedExpenses;
    const newInvoice = new bill({customerName:customerName,workHours:workHours,rate:rate,labour:labour,workRelatedExpenses:workRelatedExpenses,materials:materials,totalAmount:totalAmount,dueDate:changeDate,status:status,payment:payment})        
    res.send(newInvoice);

    await newInvoice.save(function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log(result);
        }
    });
    res.end()
} )

//Fething invoices of particular kind
router.get('/:parameter', async (req,res)=>{
        const {parameter} = req.params
    try{
        if(parameter === "Paid" || parameter === "Outstanding" || parameter === "Late"){
            const invoices = await bill.find({status:parameter})
            
            if(Object.keys(invoices).length <1){
                return res.json({success:true,message:`No ${parameter} invoices`})
            }
            else if(parameter === 'Late'){
                const lateInvoices = invoices.map(invoice => invoice.customerName)
                return res.status(200).json({success:true,message:`${[...lateInvoices]} have not Paid`,data:invoices})
            }
            res.status(200).json({success:true,data:invoices})
        }
        else{
            res.json({message:"Please enter correct status Paid Outstanding Late"})
        }
        
    }
    catch(err){
        console.log(err)
    }        
})

//Updating the status of a particular invoice
router.patch('/:id',async (req,res)=>{
    const {id} = req.params;
    const {status} = req.body;
    try{
        if(ObjectId.isValid(id)){
            const invoice = await bill.findById(id)
            invoice.status = status
            const newInvoice = await invoice.save()
            return res.status(200).json({success:true, data:newInvoice})
        }
        else{
            return res.status(404).json({success:false, msg:`No invoice with id = ${id}`});
        }
    }
    catch(err){
        console.log(err)
    }
    
})

//Delete an invoice
router.delete('/:id',async (req,res)=>{
    if(ObjectId.isValid(id)){
        try{
            const {id} = req.params
            await bill.findByIdAndDelete(id)
            res.status(200).json({success:true,message:`${id} successfully deleted`})
            res.end();
        }
        catch(err){
            console.log(err)
        }
    }    
    else{
        return res.status(404).json({success:false, msg:`No invoice with id = ${id}`});
    }               
})

//sending invoice to particular email

const transporter = nodemailer.createTransport({
    service:"hotmail",
    auth:{
        user:"demo_assignment@outlook.com",
        pass:"12345678@abc"
    }

});
router.post('/send/:id',async (req,res)=>{
    const {id} = req.params;
    const {to,subject,text} = req.body;
    if(ObjectId.isValid(id)){
        try{
            const invoice = await bill.findById(id);
            const jsonstr = JSON.stringify(invoice);
            writeFileSync('./results.txt',jsonstr)
    
            const mailData = {
                from:"demo_assignment@outlook.com",
                to: to,
                subject: subject,
                text: text,
                attachments:[
                    {
                        filename: 'results.txt',
                        path:'./results.txt'
                    }
                ]
            };
            transporter.sendMail(mailData,(err,info)=>{
                if(err){
                    return console.log(err);
                }
                res.status(200).json({success:true,message:"Mail Sent",message_id:info.messageId});        
            });
        }
        catch(err){
            console.log(err)
        }
    }
    else{
        return res.status(404).json({success:false, msg:`No invoice with id = ${id}`});
    }
    
        
});


module.exports = router