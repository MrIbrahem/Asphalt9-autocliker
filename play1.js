"auto";
const robot = require('./robot.js');
const profile = require('./profile.js');

var startTime = new Date().getTime();

var routeRegion = [850, 150, 650, 160];

module.exports = {
    // CarHunt
    chse:{
        //----------------------------------------------------------------------
        run(cnt, option) {
                        
            var runTime = new Date().getTime();
            var tries = 0;
            var brkc = 4;
            var chStatus = "";
            var routeTime =  new Date().getTime();
            var nitroTime =  new  Date().getTime();
            var raceStart  = false;
            var raceTime =   null;
 
            //check nav data 
             var route = null;
            if (option.navigation != null)
                route = parseNavigation(option.navigation);
            
            var nitroTick = 200;
            if (option.nitroTick != null)
                nitroTick = option.nitroTick;

            var currentRoute = option.signSet;

            // Check if you have reached the checkout interface
            while (true) {
                var nowTime = new Date().getTime();
                if ((nowTime - runTime) > 240000) {
                    Screenshot("ch-blocked");
                    toastLog("(ch-run)blocked!restart!" + chseCheckState(true));
                    robot.back();
                    sleep(2000);
                    robot.back();
                    sleep(2000);
                    robot.back();
                    sleep(2000);
                    break;
                }
                
                chStatus = chseCheckState();
                // exit conditions
                if (!(chStatus == "unknow" || chStatus == "race")) {
                    // waiting 3 times of no race condition
                    tries++;
                    if (tries > 2)
                    {
                        toastLog("mp-run exit with state = " + chStatus);
                        if (chStatus == "dialog")
                        {
                            robot.back();
                            sleep(2000);
                            robot.back();
                            sleep(2000);
                            robot.back();
                            sleep(2000);
                        }
                        break;
                    }
                }
                // If you have not finished running, you can still click on nitrogen
                else {
                    if (!raceStart && chStatus == "race")
                    {
                        raceStart = true;
                        raceTime =  new Date().getTime();
                    }
                    // reset accidental exit 
                    tries = 0;
                    /*brkc--;
                    if (brkc < 0)
                    {
                        brkc = 2;
                        PressBrake();
                    }*/
                    if (raceStart && route != null)
                    {
                        for (let i = 0; i < route.length; i++) {
                            let item = route[i];
                            if (!item.fire && (nowTime-raceTime) > item.time)
                            {
                                item.fire = true;

                                if (item.type == "drift")
                                    PressBrake(item.dur);

                                if (item.type == "drift-flash")
                                {
                                    PressBrake(item.dur);
                                    sleep(50);
                                    PressNitro();
                                    PressNitro();
                    }

                                if (item.type == "normal-nitro")
                                {
                                    PressNitro();
                                }

                                if (item.type == "perfect-nitro")
                                {
                                    PressNitro();
                                    sleep(750);
                                    PressNitro();
                                }

                                if (item.type == "double-nitro")
                                {
                                    PressNitro();
                                    sleep(300);
                                    PressNitro();
                                }

                                if (item.type == "flash")
                                {
                                    PressNitro();
                    PressNitro();
                                }

                                if (item.type == "360")
                                {
                                    PressBrake();
                                    PressBrake();
                    }

                                if (item.type == "360-flash")
                                {
                                    PressBrake();
                                    PressBrake();
                                    sleep(50);
                                    PressNitro();
                    PressNitro();
                                }

                                if (item.type == "route")
                                    currentRoute = item.path
                            }
                        }
                    }

                    if ((nowTime - nitroTime) > nitroTick)
                    {
                        nitroTime = new Date().getTime();
                        PressNitro();
                    }
                    if (currentRoute && (nowTime - routeTime) > 2000)
                    {
                        var t = SignClicker(currentRoute, routeRegion);
                        if (t)
                        {
                            routeTime =  new Date().getTime();
                    }
                }
                }
                sleep(100);
            }
            toastLog(++cnt + " car hunt done, t.avg" +parseInt((nowTime - startTime)/1000/cnt)+" second.");
        },
        state()
        {   
            return chseCheckState();
        }
    }
}
//------
function chseCheckState(debug) 
{
    var state = "unknow";

    var _img = captureScreen();
    var img = images.copy(_img);
    
    var isToken = isEquals(img, profile.common.token);
    var isCredit = isEquals(img, profile.common.credit);
    
    // Back button
    var isBack = isSimilar(img, profile.common.back, 5) && isSimilar(img, profile.common.backward, 5);
    
    var pageSelected = getMarker(img, profile.common.pagesMarker);
    var isSpecialPage = (pageSelected == profile.specialPage);
    
    //var isEventSelected = isEquals(img, profile.ch.specialSelected);
    var isCarHunt = isEquals(img, profile.ch.specialHunt);

    var isStart = isEquals(img, profile.ch.specialNext);
     
    var racePause = isSimilar(img, profile.common.racePause, 3);
    var raceTD = isSimilar(img, profile.common.raceTD, 3);
    var raceTime = isSimilar(img, profile.common.raceTime, 20);
    var isRace = racePause && raceTD && raceTime; 
    
    // Continue button
    var isNext = isButtonEdge(img, profile.mp.continue1, true) 
              || isButtonEdge(img, profile.mp.continue2, true) 
              || isButtonEdge(img, profile.mp.continue3, true)
              || isButtonEdge(img, profile.mp.continue4, true)
              || isButtonEdge(img, profile.mp.continue5, true)
              || isButtonEdge(img, profile.mp.continue6, true);
              
    // Various dialogs
    var errorleft = isSimilar(img, profile.mp.errorleft, 3);
    var errorright = isSimilar(img, profile.mp.errorright, 3);
    
    var noTicketLeft = isSimilar(img, profile.ch.noTicketLeft, 3);
    var noTicketRight = isSimilar(img, profile.ch.noTicketRight, 3);
    
    var isDialog = (errorleft && errorright) || (noTicketLeft && noTicketRight) ;

    if (debug) 
    {
        var txt = "";
        if (isToken)
            txt += "Token ";

        if (isCredit)
            txt += "Credit ";
        
        if (isBack)
            txt += "Back ";
        
        txt += "Page" + pageSelected + " ";
        //txt += "Event" + eventSelected + " ";
        txt += "spec = " + isSpecialPage + " ";
        if (isStart)
            txt += "Start ";
                
        if (isRace)
            txt += "Race ";    
        
        if (isDialog)
            txt += "Dialog ";
                            
        return txt;
    }
    
    if (isDialog)
        state = "dialog";
        
    else if (isToken && isCredit && !isBack && isSpecialPage /*&& !isEventSelected*/)
        state = "home";

    else if (isToken && isCredit && !isBack && !isSpecialPage)
        state = "index";
    
    else if (isToken && isCredit && !isBack && isSpecialPage /*&& isEventSelected*/ && !isCarHunt)
        state = "events";
    
    else if (isToken && isCredit && isBack && isCarHunt)
        state = "hunt";

    else if (isToken && isCredit && isBack && isStart)
        state = "start";
                
    else if (!isToken && !isCredit && !isBack && isRace)
        state = "race";
        
    else if (isNext && !isCredit && !isToken)
        state = "next";

    return state;              
}
//------
function getMarker(img, data)
{
    for ( let i = 1; i <= 6; i++ )
    { 
        if (isMarker(img, i, data))
        {
            return i;
        }
    }
    return 0;
}
//------
function isMarker(img, num, data)
{
    var x = data.x + (num -1)*data.delta; 
    var p = images.pixel(img, x, data.y);
    //return colors.equals(p, data.color);
    return colors.isSimilar(p, data.color, 6, "diff");
}
//------
function isSimilar(img, point, threshold)
{
    var pixel = images.pixel(img, point.x, point.y);
    return colors.isSimilar(pixel, point.color, threshold, "diff");
}
//------
function isEquals(img, point)
{
    var pixel = images.pixel(img, point.x, point.y);
    return colors.equals(pixel, point.color);
}
//------
function isButtonEdge(img, point, debug)
{
    var pixel = images.pixel(img, point.x, point.y);
    var pixelOut = images.pixel(img, point.x-10, point.y-10);
    if (debug){
        PrintPixel(img, point);
    }
    return colors.equals(pixel, point.color) && !colors.equals(pixelOut, point.color);
}
//------
function SignClicker(filter, region)
{
    //var folder = profile.adCloserFolder;
    if (!filter)
        return false;

    let folder = profile.signsFolder;

    var list = filter.split(',');;
    var len = list.length;
    if(len > 0){
        var _img = captureScreen();
        var imgad = images.copy(_img);
        for(let i = 0; i < len; i++){
            var fileName = files.join(folder, list[i].trim()+'.png');
            //log(fileName);
            var sign = images.read(fileName);
            var pos = null;
            if (region)
                pos = images.findImage(imgad, sign, {threshold:0.8, region: region});
            else
                pos = images.findImage(imgad, sign, {threshold:0.8});    
            width = sign.getWidth();
            height = sign.getHeight();
            sign.recycle();
            if(pos){

                var middle = {
                    x: Math.round(pos.x + width/2), 
                    y: Math.round(pos.y + height/2)
                };
                robot.click(middle.x, middle.y);
                //log('Click button ' + fileName + ' ' + middle.x + ', ' +  middle.y)
                //sleep(2000)
                return true;
            }  

        }
        imgad.recycle();
    }
    return false
}
//------
function PrintPixel(img, point)
{
    var txt = "x: " +  point.x + " y: " +  point.y;
    var color =  images.pixel(img, point.x, point.y);
    return txt + "\ncolor: " + colors.toString(color);
}
//------
function Screenshot(name)
{
    var fn = name || "screencapture";
    // Save to storage
    var time = new Date().getTime();
    var img = captureScreen("/storage/emulated/0/DCIM/Screenshots/"+fn+"-"+time+".png");
}
//------
function PressNitro()
{
    robot.click(profile.mp.goldenPoint.x, profile.mp.goldenPoint.y);
}
//------
function PressBrake(duration) 
{
    if (duration > 0) {
        robot.press(profile.width * 1 / 5, profile.height / 2, duration);
    } else {
        robot.click(profile.width * 1 / 5, profile.height / 2);
    }
}
//------
function parseNavigation(nav)
{
    var res = [];
    if (nav != null)
    {
        for (let i = 0; i < nav.length; i++) {
            let navParams = nav[i].split('|');
            if (navParams[1] == "drift")
            {
                res.push({
                    fire: false, 
                    type:"drift", 
                    time: parseInt(navParams[0], 10), 
                    dur: parseInt(navParams[2], 10)});
            }
            if (navParams[1] == "drift-flash")
            {
                res.push({
                    fire: false, 
                    type:"drift-flash", 
                    time: parseInt(navParams[0], 10), 
                    dur: parseInt(navParams[2], 10)});
            }
            if (navParams[1] == "normal-nitro")
            {
                res.push({
                    fire: false, 
                    type:"normal-nitro", 
                    time: parseInt(navParams[0], 10)});
            }
            if (navParams[1] == "perfect-nitro")
            {
                res.push({
                    fire: false, 
                    type:"perfect-nitro", 
                    time: parseInt(navParams[0], 10)});
            }
            if (navParams[1] == "double-nitro")
            {
                res.push({
                    fire: false, 
                    type:"double-nitro", 
                    time: parseInt(navParams[0], 10)});
            }                    
            if (navParams[1] == "flash")
            {
                res.push({
                    fire: false, 
                    type:"flash", 
                    time: parseInt(navParams[0], 10)});
            }
            if (navParams[1] == "360")
            {
                res.push({
                    fire: false, 
                    type:"360", 
                    time: parseInt(navParams[0], 10)});
            }
            if (navParams[1] == "360-flash")
            {
                res.push({
                    fire: false, 
                    type:"360-flash", 
                    time: parseInt(navParams[0], 10)});
            }
            if (navParams[1] == "route")
            {
                let newSigns = "";
                if (navParams.length >= 3)
                    newSigns = navParams[2];
                res.push({
                    fire: false, 
                    type:"route", 
                    time: parseInt(navParams[0], 10), 
                    path: newSigns});
            }
        }
    }
    return res;
}
//------