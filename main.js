const DEVICE = require('device.js');
const HUNT = require('play.js').ch;
const HUNTT = require('play.js').chse;
const base = require('play.js').base;
const navs = require('navigations.js');

toast("The program will start running after 3 seconds, please quickly switch to the main interface of the game");
sleep(3000);

DEVICE.checkPermission();
DEVICE.setEventListener();

var counter = { MP: 0, CH: 0 };
const chOp = {
        //Car hunt position at daily events
        carHuntPosition: 4, // negative values mean from the end
        //Restrictions on the choice of cars
        carPick : ['D4'],
        //Supported mode (flat-abc | up | down | none)
        carPickMode: "flat-abc",
        //Navigation instructions for hunt
        navigation:"",
        //Nitro mode (750-900 for perfect, 100-300 for double)
        nitroTick: 800,  
        signSet: 'bottle2, ramp, ramp_right'
    };

HUNTT.run(counter, chOp);

toastLog("end script");   
exit();;