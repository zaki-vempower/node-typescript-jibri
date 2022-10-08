import * as puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const userJibri = process.env.USER_JIBRI ?? '';
const userJibriPassword  = process.env.JIBRI_PASSWORD ?? '';

// Create an async closure, this way we can use await everywhere
(async () => {
  // Create the browser instance. Pass an object to launch to configure the browser instance
  const browser = await puppeteer.launch({
    headless: false,
    args: [ '--use-fake-ui-for-media-stream' ]
  });

  const context = browser.defaultBrowserContext();
  context.clearPermissionOverrides();
  
  
  const RECORDING_URL_OPTIONS = [
      "config.iAmRecorder=true",
      "config.externalConnectUrl=null",
      "config.startWithAudioMuted=true",
      "config.startWithVideoMuted=true",
      "interfaceConfig.APP_NAME=\"Jibri\"",
      "config.analytics.disabled=true",
      "config.p2p.enabled=fals",
      "config.prejoinPageEnabled=false",
      "config.requireDisplayName=false"
    ]
    
    // Create a new page, and navigate to the example site when it's ready
    const page = await browser.newPage();

    const url = 'https://beta.meethour.io'
    const roomName = 'zaki'
    context.overridePermissions(url, ['camera','microphone']);
  const mapToUrl = RECORDING_URL_OPTIONS.reduce((it,p,cI) => {
    console.log('sdsdsd',cI,it,p)
    const url =  `${cI === 1 ? '#' : ''}${it}&${p}`
    return url
  })
  console.log('ffff',url + '/' + roomName + mapToUrl)
  await page.goto(url + '/' + roomName + mapToUrl,{
    waitUntil: 'load'
  });

  await page.evaluate(() => {
    localStorage.setItem('xmpp_username_override',userJibri);
    localStorage.setItem('xmpp_password_override', userJibriPassword);
  });
  // Take a screenshot of the page and save it into the root folder (saves on creating folders)
  await page.screenshot({ path: 'outputs/example.png'  });

  // Run code in the page context, here we return the viewing area and number of divs on the page
  const Config = {
    followNewTab: true,
    fps: 25,
    ffmpeg_Path: null,
    videoFrame: {
      width: 1024,
      height: 768,
    },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black',
    },
    aspectRatio: '4:3',
  };
  const recorder = new PuppeteerScreenRecorder(page,Config);
  const SavePath = './demo.mp4';
  await recorder.start(SavePath);
setTimeout(async() => {
    await recorder.stop();
},100000)

  // Print out the data from the page results. Make sure to do this OUTSIDE page.evaluate's context


  // Close the page, we no longer need it
//   await page.close();

//   // Close the browser, we no longer need it
//   await browser.close();
})();