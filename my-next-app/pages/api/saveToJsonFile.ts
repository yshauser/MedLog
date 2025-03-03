import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
// import { group } from 'console';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log ('in save tasks');
  const { filename, data, type } = req.body;
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing fileName' });
  }

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing data' });
  }
  
  let DATA_FILE_PATH = path.join(process.cwd(), '..','public','db', `${filename}.json`);  ;
  if (type === 'users'){
    DATA_FILE_PATH = path.join(process.cwd(), '..','src','users', `${filename}.json`);
  }
  console.log ('Processing request: ', {filename, type, data});

    // Ensure the directory exists
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });

    // Read existing data if the file exists
    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf8');
      existingData = JSON.parse(fileContent);
      // console.log ('Existing Data', {existingData});
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error reading file:', readError);
        return res.status(500).json({ error: 'Failed to read existing data' });
      }
      // File does not exist; will create a new one
      console.log('File does not exist. Initializing new data file.');
      existingData = [];
    }
    console.log ('Existing Data after try', {existingData});

  if (req.method === 'GET') {
    try {
      res.status(200).json(existingData);
    } catch (error) {
      console.error('Error reading existing data:', error);
      res.status(200).json([]); // Return empty array if file doesn't exist
    }
  } else if (req.method === 'POST') {
    try {
      console.log ('save tasks POST');
      if (type === 'suspension') {
        console.log ('med data suspension');
        // Ensure `medicines` and `suspension` are initialized
        if (!existingData.medicines){
          existingData.medicines = {suspension:[], caplets: [], granules: []};
        }else if (!Array.isArray(existingData.medicines.suspension)){
          existingData.medicines.suspension = [];
        }

        const updatedEntry = req.body.data;
        const existingIndex = existingData.medicines.suspension.findIndex((entry: { id: string }) => entry.id === updatedEntry.id);
        if (existingIndex !== -1) {
          // Overwrite the existing entry
          console.log ('index suspension', {existingIndex, updatedEntry})
          existingData.medicines.suspension[existingIndex] = updatedEntry;
        } else {
         existingData.medicines.suspension.push(data);
        }
        // await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        // res.status(200).json({ success: true });

      } else if (type === 'caplets') {
          console.log ('med data caplets');
          if (!existingData.medicines){
            existingData.medicines = {suspension:[], caplets: [], granules: []};
          }else if (!Array.isArray(existingData.medicines.caplets)){
            existingData.medicines.caplets = [];
          }
        const updatedEntry = req.body.data;
        const existingIndex = existingData.medicines.caplets.findIndex((entry: { id: string }) => entry.id === updatedEntry.id);
        if (existingIndex !== -1) {
          // Overwrite the existing entry
          console.log ('index caplets', {existingIndex, updatedEntry})
          existingData.medicines.caplets[existingIndex] = updatedEntry;
        } else {
          existingData.medicines.caplets.push(data);
        }
        // await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        // res.status(200).json({ success: true });
      } else if (type === 'granules') {
        console.log ('med data granules');
        if (!existingData.medicines){
          existingData.medicines = {suspension:[], caplets: [], granules: []};
        }else if (!Array.isArray(existingData.medicines.granules)){
          existingData.medicines.granules = [];
        }

        const updatedEntry = req.body.data;
        const existingIndex = existingData.medicines.granules.findIndex((entry: { id: string }) => entry.id === updatedEntry.id);
        if (existingIndex !== -1) {
          // Overwrite the existing entry
          console.log ('index granules', {existingIndex, updatedEntry})
          existingData.medicines.granules[existingIndex] = updatedEntry;
        } else {
          existingData.medicines.granules.push(data);
        }
        // await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        // res.status(200).json({ success: true });
          
      } else if (type === 'users') {
        console.log ('users data', {existingData});
        if (!existingData.families){
          existingData.medicines = {families:[]};
        }else if (!Array.isArray(existingData.families)){
          existingData.families = [];
        }

        const updatedEntry = req.body.data.flat();
        const existingIndex = existingData.families.findIndex((entry: { id: string }) => entry.id === updatedEntry.id);
        if (existingIndex !== -1) {
          // Overwrite the existing entry
          console.log ('index families', {existingIndex, updatedEntry})
          existingData.families[existingIndex] = updatedEntry;
        } else {
          console.log ('else', {existingIndex, updatedEntry});
          // existingData.families.push(data);
          existingData.families = updatedEntry;
        }

      } else  {
        console.log ('type not suspension, caplets not granules', {data});
        const updatedEntry = req.body.data;
        const existingIndex = existingData.findIndex((entry: { id: string }) => entry.id === updatedEntry.id);
        if (existingIndex !== -1) {
          existingData[existingIndex] = updatedEntry;
          console.log ('Overwrite the existing entry', {existingIndex, updatedEntry});
        } else {
          console.log ('Else POST');
          if (type === 'kids-order'|| type === 'scheduled'){
            // empty the existing data so the kids-list will replace the exisiting data
            // existingData = [];
            console.log ('kids-order/scheduled - no need for []');
            existingData = updatedEntry;
          }else if (type === 'log'){
            existingData = updatedEntry.flat();
          }else{
            // Add as a new entry
            console.log ('existingIndex', {existingIndex, updatedEntry})
            existingData.push(updatedEntry);
          }
        }
        // existingData.push(data);
        // await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        // res.status(200).json({ success: true });
      }
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
    res.status(200).json({ success: true });
    
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else if (req.method === 'DELETE') {
      // assume that the entry is removed in the app, so the data is already updated
      console.log ('DELETE action updated data: ', data);
      if (type === 'suspension') {
        console.log('med data suspension');
        if (!existingData.medicines) {
          existingData.medicines = { suspension: [], caplets: [], granules:[] };
        }      
        if (!Array.isArray(existingData.medicines.suspension)) {
          existingData.medicines.suspension = [];
        }
        existingData.medicines.suspension = data; // Assign directly instead of push
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        res.status(200).json({ success: true });
      
      } else if (type === 'caplets') {
        console.log('med data caplets');
        if (!existingData.medicines) {
          existingData.medicines = { suspension: [], caplets: [] ,  granules:[]};
        }
        existingData.medicines.caplets = data; // Fix: Assign directly
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        res.status(200).json({ success: true });     

      } else if (type === 'granules') {
        console.log('med data granules');
        if (!existingData.medicines) {
          existingData.medicines = { suspension: [], caplets: [],  granules:[] };
        }
        existingData.medicines.granules = data; // Fix: Assign directly
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));
        res.status(200).json({ success: true });     
      
      } else {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
        res.status(200).json({ success: true });
      }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
}
