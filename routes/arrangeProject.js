// routes/api.js

import { Router } from 'express';
const router = Router();
import {Project} from '../db/schemas/Project.js';

router.post('/updateOrder', async (req, res) => {
  const { arrangedData } = req.body;

  try {
    // Update the order for each item in the database
    for (const item of arrangedData) {
      await Project.findByIdAndUpdate(item._id, { linkId: item.linkId });
    }

    res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export {router as arrangedProjects};
