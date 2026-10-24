import { tmpdir } from 'os';
import path, { join } from 'path';
import fs from 'fs';
import { readdirSync, unlinkSync, rmSync } from 'fs';

let handler = async (m, { conn, __dirname, args }) => {
  m.reply(`✅ The *tmp + sessions* folder was cleaned.`);
  m.react(done);

  try {
    // -- Clean temporary files --
    const tmpDirs = [tmpdir(), join(__dirname, '../tmp')];
    const tmpFiles = [];

    tmpDirs.forEach((dir) => {
      try {
        readdirSync(dir).forEach((file) => tmpFiles.push(join(dir, file)));
      } catch (error) {
        console.error(`Skipping directory ${dir}: ${error.message}`);
      }
    });

    tmpFiles.forEach((file) => {
      try {
        const filePath = file;
        if (fs.lstatSync(filePath).isDirectory()) {
          rmSync(filePath, { recursive: true, force: true });
        } else {
          unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error processing ${file}: ${error.message}`);
      }
    });

    // -- Clean bot sessions --
    const Sessions = "./sessions";
    try {
      readdirSync(Sessions).forEach((file) => {
        const filePath = `${Sessions}/${file}`;
        if (file !== 'creds.json') {
          try {
            if (fs.lstatSync(filePath).isDirectory()) {
              rmSync(filePath, { recursive: true, force: true });
            } else {
              unlinkSync(filePath);
            }
          } catch (error) {
            console.error(`Error processing ${filePath}: ${error.message}`);
          }
        }
      });
    } catch (error) {
      console.error(`Skipping sessions directory: ${error.message}`);
    }

    // -- Clean bebot sessions --
    const bbtSessions = "./bebots";
    try {
      readdirSync(bbtSessions, { withFileTypes: true }).forEach((file) => {
        const filePath = `${bbtSessions}/${file.name}`;
        try {
          if (file.isDirectory()) {
            readdirSync(filePath, { withFileTypes: true }).forEach((subFile) => {
              const subFilePath = `${filePath}/${subFile.name}`;
              try {
                if (subFile.isFile() && subFile.name !== "creds.json") {
                  unlinkSync(subFilePath);
                }
              } catch (error) {
                console.error(`Error processing ${subFilePath}: ${error.message}`);
              }
            });

            // Verify if the folder is empty
            if (readdirSync(filePath).length === 0) {
              rmSync(filePath, { recursive: true, force: true });
            }
          } else if (file.isFile() && file.name !== "creds.json") {
            unlinkSync(filePath);
          }
        } catch (error) {
          console.error(`Error processing ${filePath}: ${error.message}`);
        }
      });
    } catch (error) {
      console.error(`Skipping bebot sessions directory: ${error.message}`);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp|ctmp)$/i;
handler.rowner = true;

export default handler;
