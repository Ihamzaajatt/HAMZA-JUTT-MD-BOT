import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createInterface } from 'readline';
import yargs from 'yargs';
import express from 'express';
import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { promises as fsPromises } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// --- HAMZA JUTT CUSTOM HTML ---
const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>HAMZA-JUTT-MD-BOT</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#000;color:#fff;text-align:center;font-family:sans-serif;padding-top:50px}
.box{border:2px solid gold;padding:20px;border-radius:20px;max-width:350px;margin:auto;background:#111}
a{color:gold;text-decoration:none;font-weight:bold;border:1px solid gold;padding:10px 20px;border-radius:10px;display:inline-block;margin:10px}
</style>
</head>
<body>
<h1>👑 HAMZA-JUTT-MD-BOT</h1>
<p>Bot is Running Successfully ✅</p>
<div class="box">
<p>Owner: Hamza Jutt</p>
<p>Version: 7.0.0 QR+PAIR PRO</p>
<a href="https://whatsapp.com/channel/0029VbDh9IP1noz6H4T13v1t" target="_blank">JOIN WHATSAPP CHANNEL</a><br>
<a href="https://github.com/Ihamzaajatt/HAMZA-JUTT-MD-BOT" target="_blank">GITHUB REPO</a>
</div>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(htmlContent);
});

app.get('/status', (req, res) => {
  res.json({ status: true, bot: 'HAMZA-JUTT-MD-BOT', owner: 'Hamza Jutt' });
});

app.listen(port, () => {
  console.log(chalk.green(`🌐 Server running on port ${port} - HAMZA-JUTT-MD`));
});

const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));
const { say } = cfonts;
const rl = createInterface(process.stdin, process.stdout);

say('HAMZA\nJUTT\nMD', {
  font: 'chrome',
  align: 'center',
  gradient: ['yellow', 'red'],
});

say('BY: HAMZA JUTT', {
  font: 'console',
  align: 'center',
  gradient: ['yellow', 'red'],
});

var isRunning = false;

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  const currentFilePath = new URL(import.meta.url).pathname;
  let args = [join(__dirname, file), ...process.argv.slice(2)];

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  let p = fork();

  p.on('message', (data) => {
    switch (data) {
      case 'reset':
        p.process.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  p.on('exit', (_, code) => {
    isRunning = false;
    console.error('⚠️ ERROR ⚠️ >> ', code);
    if (code === 0) return;
    watchFile(args[0], () => {
      unwatchFile(args[0]);
      start('main.js');
    });
  });

  const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
  const packageJsonPath = path.join(path.dirname(currentFilePath), './package.json');

  try {
    const packageJsonData = await fsPromises.readFile(packageJsonPath, 'utf-8');
    const packageJsonObj = JSON.parse(packageJsonData);
    const currentTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(new Date());

    let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》';
    console.log(
      chalk.yellow(`╭${lineM}
┊${chalk.blueBright('╭┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')}${chalk.yellow(`🖥️ ${os.type()}, ${os.release()} - ${os.arch()}`)}
┊${chalk.blueBright('┊')}${chalk.yellow(`💾 Total RAM: ${ramInGB.toFixed(2)} GB`)}
┊${chalk.blueBright('┊')}${chalk.yellow(`💽 Free RAM: ${freeRamInGB.toFixed(2)} GB`)}
┊${chalk.blueBright('╰┅┅┅┅┅┅┅')}
┊${chalk.blueBright('╭┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')} ${chalk.blue.bold(`🟢 HAMZA-JUTT-MD-BOT INFO:`)}
┊${chalk.blueBright('┊')} ${chalk.blueBright('┅┅┅┅┅┅┅')} 
┊${chalk.blueBright('┊')}${chalk.cyan(`👑 Bot Name: HAMZA-JUTT-MD-BOT`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`💫 Version: ${packageJsonObj.version || '7.0.0'}`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`👤 Owner: Hamza Jutt`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`📞 Number: +923262091250`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`🔗 Channel: https://whatsapp.com/channel/0029VbDh9IP1noz6H4T13v1t`)}
┊${chalk.blueBright('┊')}${chalk.blueBright('┅┅┅┅┅┅┅')} 
┊${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')}${chalk.cyan(`⏰ Current Time (PKT):`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`${currentTime}`)}
┊${chalk.blueBright('╰┅┅┅┅┅┅┅')} 
╰${lineM}`)
    );

    setInterval(() => {}, 1000);
  } catch (err) {
    console.error(chalk.red(`❌ Failed to read package.json: ${err}`));
  }

  let opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  if (!opts['test'])
    if (!rl.listenerCount()) rl.on('line', (line) => {
      p.emit('message', line.trim());
    });
}

start('main.js');
