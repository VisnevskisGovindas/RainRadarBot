const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const config = require('./config.json');
const GIFEncoder = require('gif-encoder-2')
const { createCanvas, Image } = require('canvas')
const { createWriteStream, readdir } = require('fs')
const { promisify } = require('util')
const path = require('path')

const readdirAsync = promisify(readdir)
const imagesFolder = path.join(__dirname, './output/')



var minutes = 15, interval = minutes * 60 * 1000;

var url = 'https://www.met.ie/latest-reports/recent-rainfall-radar/12-hour-rainfall-radar';

const client = new Discord.Client(); //client instance

client.once('ready', () =>  onClientReady());
function onClientReady()
{
    console.log('The Weatherman is Listening');
    pupeteerScreenie();
    client.on('message', message =>{
        if(!message.content.startsWith(config.prefix) || message.author.bot) return;
    
        const args = message.content.slice(config.prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
    
        if(command == 'rain'){
            pupeteerScreenie();
            message.channel.send("Rain Radar", {files: ["./finished/neuquant.gif"]});
        }
    })
    //pupeteerScreenie();
    setInterval(function()
    {
        pupeteerScreenie();
    }, interval);
}
function pupeteerScreenie()
{
   
     (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.setViewport({
            width: 1000,
            height: 1000
        });
        await page.waitFor(2000);
        console.log('waitfordone');
       // fs.unlinkSync('./output/radar.png');
        await page.screenshot({path: './output/radar5.png'});
        console.log('Screenshot 1 taken');
        
        await page.click('button.btn.btn-default.btn-back');
        await page.screenshot({path: './output/radar4.png'});

        await page.click('button.btn.btn-default.btn-back');
        await page.screenshot({path: './output/radar3.png'});

        await page.click('button.btn.btn-default.btn-back');
        await page.screenshot({path: './output/radar2.png'});

        await page.click('button.btn.btn-default.btn-back');
        await page.screenshot({path: './output/radar.png'});
       console.log('All Screenshots taken');
        await browser.close();
        createGif('neuquant');
      })(); 
}

async function createGif(algorithm) {
    return new Promise(async resolve1 => {
        console.log('In CreateGIF');
      const files = await readdirAsync(imagesFolder)
  
      const [width, height] = await new Promise(resolve2 => {
        const image = new Image()
        image.onload = () => resolve2([image.width, image.height])
        image.src = path.join(imagesFolder, files[0])
      })
  
      const dstPath = path.join(__dirname, './finished/', `${algorithm}.gif`)
  
      const writeStream = createWriteStream(dstPath)
  
      writeStream.on('close', () => {
        resolve1()
      })
  
      const encoder = new GIFEncoder(width, height, algorithm)
  
      encoder.createReadStream().pipe(writeStream)
      encoder.start()
      encoder.setDelay(1000)
  
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')
  
      for (const file of files) {
        await new Promise(resolve3 => {
            console.log('In CreateGIF');
          const image = new Image()
          image.onload = () => {
            ctx.drawImage(image, 0, 0)
            encoder.addFrame(ctx)
            resolve3()
          }
          image.src = path.join(imagesFolder, file)
        })
      }
      encoder.finish();
    })
  }

client.login(config.token) // log into bot