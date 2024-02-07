import { Router } from "express";
import { TextAbout } from "../db/schemas/Text.js";



const router = Router()



router.get('/', (req, res) => {
    TextAbout.find({}).then(result => res.json(result)).catch(err => console.log(err))
})
router.get('/:id', (req, res) => {


    TextAbout.findOne({_id: req.params.id}).then(result => res.json(result)).catch(err => console.log(err))
})


router.post('/addText', async(req, res) => {
    const {text} = req.body

    try{
       const newText = new TextAbout({text:text})
       await newText.save()
       res
       .status(200)
       .json({ message: "Text created successfully", newText });
   } catch (error) {
     console.error("Error creating text:", error);
     res.status(500).json({ error: "Error creating text" });
   }

})

router.delete('/deleteText/:id', (req, res) => {
    const {id} = req.params
    TextAbout.deleteOne({_id: id}).then((result) => 
    res
    .status(200)
    .json({message: `Text deleted successfully`})
    ).catch(err => console.log(err))

})

router.put('/updateText/:id', (req, res) => {
    const {id} = req.params
    const {text} = req.body
    TextAbout.updateOne({_id: id},{$set: {text: text}})
    .then(result => res.status(200).json({message: `Text updated successfully`,result}))
    .catch(err => console.log(err))
})





export {router as textRouter}