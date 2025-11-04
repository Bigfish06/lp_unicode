const PDFDocument=require('pdfkit')
const Document=require('../models/document-model')

const exportPDF=async(req,res)=>{
    try {
        const {id}=req.params
        const document = await Document.findById(id)
        .populate('createdBy', 'name email')
        .populate('access.view', 'name')
        .populate('access.edit', 'name')
        .populate('requests.user', 'name email');

        
        // now we'll create pdf and attach it to res
        const pdf = new PDFDocument()
        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition','attachment;filename=docPDF')
        // streams the pdf directly to res
        pdf.pipe(res)

        pdf
        .fontSize(20).text(document.title)
        .moveDown()     // like \n
        .fontSize(12).text(`Created by: ${document.createdBy.name}`)
        .moveDown()
        .fontSize(14).text('Content')
        .moveDown()
        .fontSize(12).text(document.content)
        .moveDown()
        .fontSize(14).text('Access')
        .moveDown()
        .fontSize(12).text(`Viewers: ${document.access.view.map(v=>v.name).join(', ')}`)
        .moveDown()
        .fontSize(12).text(`Editors: ${document.access.edit.map(e=>e.name).join(', ')}`)
        .moveDown()
        .fontSize(14).text(`Requests`)
        .moveDown()
        // requests is an array
        document.requests.forEach((r)=>{
            pdf.fontSize(12).text(`User: ${r.user.name}, Type: ${r.type}, Status: ${r.status}`)
        })
        
        pdf.end()
    } catch (error) {
        res.status(500).json({data:error.message, message:"Failed to export PDF"})
    }
    
}

module.exports=exportPDF