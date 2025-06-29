import formidable from 'formidable';
import fs from 'fs';
import { parseT12, parseRentRoll } from '../../utils/financialParser';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      // Handle both array and object cases for files
      const t12File = Array.isArray(files.t12) ? files.t12[0] : files.t12;
      const rentRollFile = Array.isArray(files.rentRoll) ? files.rentRoll[0] : files.rentRoll;
      const t12Path = t12File.filepath;
      const rentRollPath = rentRollFile.filepath;

      const noi = parseT12(fs.readFileSync(t12Path, 'utf-8'));
      const units = parseRentRoll(fs.readFileSync(rentRollPath, 'utf-8'));

      const capRate = 0.07;
      const valuation = noi / capRate;

      res.status(200).json({
        valuation: `Valuation: $${valuation.toLocaleString()} \nNOI: $${noi.toLocaleString()} \nCap Rate: ${capRate * 100}% \nTop 3 Comps: (placeholder)`
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse financials' });
    }
  });
}
