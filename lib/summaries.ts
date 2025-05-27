import fs from 'fs';
import path from 'path';

const SUMMARIES_FILE = path.join(process.cwd(), 'data', 'summaries.json');

export interface Summary {
  id: string;
  title: string;
  date: string;
  summary: string;
  transcript: string;
  meetingId: string;
}

export const saveSummary = async (summary: Omit<Summary, 'id'>) => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Read existing summaries
    let summaries: Summary[] = [];
    if (fs.existsSync(SUMMARIES_FILE)) {
      const data = fs.readFileSync(SUMMARIES_FILE, 'utf-8');
      summaries = JSON.parse(data);
    }

    // Add new summary
    const newSummary: Summary = {
      ...summary,
      id: crypto.randomUUID(),
    };
    summaries.push(newSummary);

    // Save updated summaries
    fs.writeFileSync(SUMMARIES_FILE, JSON.stringify(summaries, null, 2));
    return newSummary;
  } catch (error) {
    console.error('Error saving summary:', error);
    throw error;
  }
};

export const getSummaries = async (): Promise<Summary[]> => {
  try {
    if (!fs.existsSync(SUMMARIES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUMMARIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading summaries:', error);
    return [];
  }
}; 