const DEVICE = require('device.js');
const HUNTT = require('play1.js').chse;
const navs = require('navigations.js');

toast("The program will start running after 3 seconds, please quickly switch to the main interface of the game");
sleep(3000);

DEVICE.checkPermission();
DEVICE.setEventListener();

const chOp = {
    navigation:"",
    nitroTick: 800,  
    signSet: 'bottle2, ramp, ramp_right'
};

HUNTT.run(0, chOp);

toastLog("end script");   
exit();;