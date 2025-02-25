import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const kidId = req.query.id as string;

  const kidsFilePath = path.join(process.cwd(), 'db/kids.txt');

  try {
    const data = await fs.promises.readFile(kidsFilePath, 'utf8');
    const kidBlocks = data.split('// Kid #').filter(block => block.trim());
    const updatedKidBlocks = kidBlocks.filter(block => {
      const lines = block.split('\n').filter(line => line.trim());
      const kidData: { [key: string]: string } = {};
      lines.forEach(line => {
        const [key, value] = line.split(':').map(part => part.trim());
        if (key && value) {
          kidData[key.replace(' ', '')] = value;
        }
      });
      return kidData['KidID'] !== kidId;
    });

    const updatedData = updatedKidBlocks.map(block => `// Kid #${block}`).join('\n\n');

    await fs.promises.writeFile(kidsFilePath, updatedData, 'utf8');

    res.status(200).json({ message: 'Kid deleted successfully' });
  } catch (error) {
    console.error('Error deleting kid:', error);
    res.status(500).json({ error: 'Failed to delete kid' });
  }
}
