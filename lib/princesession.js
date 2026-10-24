import { fileURLToPath } from 'url';
import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import fetch from 'node-fetch';

async function PrinceSessionSavedCredentials(txt) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Validate Dropbox URL
  const isDropbox = txt.startsWith('Prince~') && txt.includes('scl/fi/') && txt.includes('?rlkey=');
  if (!isDropbox) {
    console.error('Invalid input: Not a valid Dropbox URL.');
    throw new Error('Invalid Dropbox URL format');
  }

  // Download from Dropbox
  let dropboxCode = txt.replace('Prince~', '');
  
  // 🔧 FIX: Remove any existing dl=0 or dl=1 parameters first
  dropboxCode = dropboxCode.replace(/[?&]dl=\d+/g, '');
  
  // 🔧 FIX: Check if URL already has query params (has ?)
  // If yes, use &dl=1, if no, use ?dl=1
  const separator = dropboxCode.includes('?') ? '&' : '?';
  const dropboxUrl = `https://www.dropbox.com/${dropboxCode}${separator}dl=1`;
  
  console.log('Downloading from:', dropboxUrl);

  let decodedData;
  try {
    const response = await fetch(dropboxUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      const errorMsg = `Failed to download file from Dropbox: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    decodedData = await response.text();
    
    if (!decodedData || decodedData.trim().length === 0) {
      throw new Error('Downloaded file is empty');
    }
    
  } catch (error) {
    console.error('Error downloading from Dropbox:', error);
    throw error;
  }

  // Check if we got HTML instead of JSON
  if (decodedData.trim().startsWith('<')) {
    console.error('ERROR: Received HTML instead of JSON. URL:', dropboxUrl);
    throw new Error('Dropbox returned HTML page instead of file content');
  }

  // Validate and Save the credentials
  try {
    const sessionDir = path.join(__dirname, '..', 'sessions');
    mkdirSync(sessionDir, { recursive: true });
    const credsPath = path.join(sessionDir, 'creds.json');

    // Check if the decoded data is valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(decodedData);
    } catch (error) {
      console.error('Invalid JSON format in decoded data:', error);
      console.error('Raw data (first 500 chars):', decodedData.substring(0, 500));
      throw new Error('Invalid JSON format in session data');
    }

    // Save valid JSON data to creds.json
    writeFileSync(credsPath, JSON.stringify(parsedData, null, 2));
    console.log('Credentials saved to creds.json');
    return { success: true, path: credsPath };
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw error;
  }
}

export default PrinceSessionSavedCredentials;
