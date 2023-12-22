// -------- Asset Loading -------- //
function preload() {
    font_regular = loadFont("assets/Neucha-Regular.ttf")
    
    // Screens
    tomb_img = loadImage("assets/screens/tomb.png");
    tent_img = loadImage("assets/screens/tent.png");
    empty_camp = loadImage("assets/screens/empty_camp.png");
    flower_camp = loadImage("assets/screens/flower_camp.png");
    stone_circle = loadImage("assets/screens/stone_circle.png");
    stake = loadImage("assets/screens/stake.png");

    // Characters
    you_stand = loadImage("assets/character/you_stand.png");
    you_lstep = loadImage("assets/character/you_lstep.png");
    you_rstep = loadImage("assets/character/you_rstep.png");
    you_sit = loadImage("assets/character/you_sit.png")

    shaman_stand = loadImage("assets/character/shaman_stand.png");
    shaman_lstep = loadImage("assets/character/shaman_lstep.png");
    shaman_rstep = loadImage("assets/character/shaman_rstep.png");
    shaman_sit = loadImage("assets/character/shaman_sit.png")

    old_shaman_stand = loadImage("assets/character/old_shaman_stand.png");

    annie_stand = loadImage("assets/character/annie_stand.png");
    annie_lstep = loadImage("assets/character/annie_lstep.png");
    annie_rstep = loadImage("assets/character/annie_rstep.png");
    
    burning_frames = []; // Burning Particles
    for(let i = 1; i <= 7; i++) {
        burning_frames.push(loadImage("assets/burning_frames/Burning" + i + ".png"));
    }
    // UI
    space_pressed = loadImage("assets/ui/space_pressed.png");
    space_unpressed = loadImage("assets/ui/space_unpressed.png");

    // The Shaman's Campfire 
    fire_frames = [];
    for(let i = -4; i <= 31; i++) {
        fire_frames.push(loadImage("assets/fire_frames/CroppedFireSeeringAnimation" + i + ".png"));
    }

    // The Flower Growing
    flower_frames = [];
    for(let i = 1; i <= 5; i++) {
        flower_frames.push(loadImage("assets/flower_frames/Flower" + i + ".png"));
    }

    // The Shaman Touching the Flower
    touch_frames = [];
    for(let i = 1; i <= 22; i++) {
        touch_frames.push(loadImage("assets/touch_frames/Touch" + i + ".png"));
    }

    // The Shaman Combusting
    combust_frames = [];
    for(let i = 1; i <= 11; i++) {
        combust_frames.push(loadImage("assets/combustion_frames/Combustion" + i + ".png"));
    }

    // The Witch Falling
    fall_frames = [];
    for(let i = 1; i <= 4; i++) {
        fall_frames.push(loadImage("assets/fall_frames/AnnieFall" + i + ".png"));
    }
    
    // The Witch Dying
    skewer_frames = [];
    for(let i = 1; i <= 3; i++) {
        skewer_frames.push(loadImage("assets/skewer_frames/Skewer" + i + ".png"));
    }

    // The Witch Burning
    witch_frames = [];
    for(let i = 1; i <= 30; i++) {
        witch_frames.push(loadImage("assets/witch_frames/StakeBurn" + i + ".png"));
    }

    // The Old Shaman Dying
    shove_frames = [];
    for(let i = 1; i <= 10; i++) {
        shove_frames.push(loadImage("assets/shove_frames/Shove" + i + ".png"));
    }
    
    // The Sacrifice 
    sacrifice_frames = [];
    for(let i = 1; i <= 42; i++) {
        sacrifice_frames.push(loadImage("assets/sacrifice_frames/Sacrifice" + i + ".png"));
    }
    
    // Him appearing 
    rising_frames = [];
    for(let i = 0; i <= 4; i++) {
        rising_frames.push(loadImage("assets/rising_frames/Rising" + i + ".png"));
    }
}

// -------- Canvas Setup -------- //
var CANVAS_WIDTH = 400; // The width of the gray play area
var TOP_X, TOP_Y; // The top left corner of the gray play area
function setup() {
    createCanvas(windowWidth, windowHeight);
    TOP_X = (windowWidth/2 - CANVAS_WIDTH/2);
    TOP_Y = (windowHeight/2 - CANVAS_WIDTH/2);
    frameRate(30);
    textFont(font_regular);
    textSize(15);
    start();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    TOP_X = (windowWidth/2 - CANVAS_WIDTH/2);
    TOP_Y = (windowHeight/2 - CANVAS_WIDTH/2);
}

// -------- Game Definitions -------- //
class Animated {
    frame = 0;
    completed = false; // Has the animation played through all the way once?
    mirrored = false; // Should this animation play mirrored?
    constructor(imgs, w, h, frame_step, on_complete = ()=>{}) {
        this.imgs = imgs; // The imgs to animate through
        this.frame_step = frame_step; // How many frames each img should be displayed
        this.w = w;
        this.h = h;
        this.on_complete = on_complete
    }

    show(x, y) {

        let current_img = this.imgs[0];

        for(let i = 1; i <= this.imgs.length; i++) {
            if(this.frame < this.frame_step * i) {
                current_img = this.imgs[i-1];
                break;
            }
        }
        this.frame++;

        push();
        translate(x,y);
        if(this.mirrored) scale(-1,1);
        else scale(1,1);
        
        image(current_img, this.mirrored ? -this.w : 0, 0, this.w, this.h);
        pop();
        
        if(this.frame >= this.frame_step * this.imgs.length) {
            this.frame = 0;
            this.completed = true;
            this.on_complete();
        }
    }
}

class Dialog {
    active = false;
    frame = 0;
    display_length = 10; // Frames for a message to fully appear / Height of each box
    display_delay = 30; // Frames inbetween messages
    gap = 7 // Pixels in between messages;
    current_msg = 0; // Most recently displayed msg index;
    completed = false;

    constructor(messages) {
        this.messages = messages;
    }

    show(x, y) {
        push();
        let top_y = (this.current_msg * this.display_length + Math.min(this.frame, this.display_length));
        translate(x, y-top_y);
        let index = 0;
        for(let [msg,id] of this.messages) {
            if(index > this.current_msg) continue;
            let xOff;
            if (id == 0) {
                if (index == this.current_msg) fill(255,255,255,255*(this.frame/this.display_length))
                else fill(255);
                xOff = 30;}
            else {
                if (index == this.current_msg) fill(255,190,133,255*(this.frame/this.display_length))
                else fill(255,190,133);
            xOff = 0;};
            let yOff = this.display_length * index;
            let yGap = this.gap * index;
            text(msg,xOff,yOff+yGap);
            index++;
        }
        if(this.current_msg < this.messages.length-1) {
            if(this.frame >= this.display_length + this.display_delay) {
                this.current_msg++;
                this.frame = -1;
            }
        }
        else if(this.current_msg == this.messages.length-1) {
            this.completed = true;
        }
            this.frame++;
        pop();
    }
}

class Player {
    left = false;
    right = false;
    speed = debug ? 6 : 3; 
    frame_step = 3; // How many frames should each step take?
    frame = 0;
    sitting = false;
    sit_timer = 0;

    sit_frame = you_sit;
    rstep_frame = you_rstep;
    lstep_frame = you_lstep;
    stand_frame = you_stand;

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    update() {
        if (this.y < (CANVAS_WIDTH - this.h))
            this.y++;
        if (this.left)
            this.x-= this.speed;
        if (this.right)
            this.x+= this.speed;

        if(in_vision && !insane) {
            this.sit_frame = shaman_sit;
            this.rstep_frame = shaman_rstep;
            this.lstep_frame = shaman_lstep;
            this.stand_frame = shaman_stand;
        } else {
            this.sit_frame = you_sit;
            this.rstep_frame = you_rstep;
            this.lstep_frame = you_lstep;
            this.stand_frame = you_stand;
        }
    }
    
    show() {
        push();
        translate(TOP_X,TOP_Y)
        if(debug) {
            strokeWeight(int);
            stroke(255,0,0);
            fill(51);
            rect(this.x, this.y, this.w, this.h);
        } else {
            noStroke();
        }

        let current_frame = this.stand_frame;
        if(this.sitting) {
            current_frame = this.sit_frame;
            this.sit_timer++;
        }
        if(this.right != this.left) {
            if(this.sitting) {this.sitting = false; this.frame = 0}
            if(this.frame < this.frame_step) current_frame = this.lstep_frame;
            else if(this.frame < this.frame_step*2) current_frame = this.rstep_frame;
            else if(this.frame < this.frame_step*3) current_frame = this.stand_frame;
            else this.frame= -1;
            this.frame++;
        }

        translate(this.x,this.y);
        if(this.left) scale(-1,1);
        else scale(1,1);
        
        image(current_frame, this.left ? -this.w : 0, 7, this.w, this.h);
        pop();
    }
}

// -------- Game -------- //
var debug = false; // If true, render hitboxes & run fast

// Player variables 
var you; // Player 
var screen = 0; // Which screen the player's on
var in_vision = false; // Is the player currently in a vision
var vision_timer = 0; // How long has the player been in the current vision?
var current_dialog; // What point is the player at in the story?
var interact = () => {}; // Function the player can currently trigger by interacting 

// Animations in order
var fire_watching = false; // Is the player currently watching the fire?
var touching = false; // Is the player currently touching the flower?
var annie_x = -(CANVAS_WIDTH + 200) // Annie's x position 
var combusting = false; // Is the player currently spontaneously combusting?
var stake_screen = false; // Can the player currently see the stake?
var annie_y = -200 // Annie's y position
var burning = false; // Is the player currently burning a witch?
var sacrificing = false; // Is the player currently sacrificing someone?
var insane = false; // Can the player see god?

// Init game objects
function start() {
    you = new Player(20,360,20,40);
    first_talk = new Dialog([
            ["I want to see God", 0],
        ["He will see you", 1],
        ["Come in.", 1]]);
    second_talk = new Dialog([
        ["Once wasn't enough?", 1],
            ["I saw you in the flame", 0],
            ["I wanted to see God", 0],
        ["You saw yourself.", 1],
        ["Look again.", 1]]);
    third_talk = new Dialog([
            ["I saw Annie in the flame", 0],
            ["Did you know her?", 0],
        ["No.", 1],
        ["I hardly knew myself", 1],
        ["Until I met Him", 1]]);
    final_talk = new Dialog([
            ["I saw what you did", 0],
            ["You're a monster", 0],
        ["I saw her sins", 1],
        ["He saw my potential", 1],
        ["He sees yours too", 1]]);
    current_dialog = first_talk;

    space_indicator = new Animated([space_unpressed, space_pressed], 20, 10, 15);
    fire_seering = new Animated(fire_frames, CANVAS_WIDTH, CANVAS_WIDTH+242, 5, () =>
        /*|on_complete -> */ {
            fire_watching = false;
            you.sitting = false;
            in_vision = true });
    
    flower_growing = new Animated(flower_frames, 20, 24, 15, () => {});
    shaman_burning = new Animated(burning_frames, 20, 40, 3, () => {});
    shaman_touching = new Animated(touch_frames, 57, 167, 3, () =>
        /*|on_complete -> */ {
            interact = () => {}; touching = false;
            in_vision = false; vision_timer = 0;
            screen = 0; you.x = 20; 
            current_dialog = second_talk;
            fire_seering.completed = false; you.sit_timer = 0});

    annie_walking = new Animated([annie_lstep, annie_rstep, annie_stand], 15, 36, 5, () => {});
    spontaneous_combustion = new Animated(combust_frames, 20, 95, 3, () =>
        /*|on_complete -> */ {
            interact = () => {}; combusting = false;
            in_vision = false; vision_timer = 0;
            screen = 0; you.x = 20; 
            current_dialog = third_talk;
            fire_seering.completed = false; you.sit_timer = 0});

    annie_falling = new Animated(fall_frames, 42, 32, 3, () => {});
    annie_skewer = new Animated(skewer_frames, 40, 52, 3, () => {});
    witch_burning = new Animated(witch_frames, 128, 365, 4, () =>
        /*|on_complete -> */ {
            interact = () => {}; burning = false;
            in_vision = false; vision_timer = 0; stake_screen = false;
            screen = 0; you.x = 20; you.sitting = false;
            current_dialog = final_talk;});

    you_shoving = new Animated(shove_frames, 103, 85, 3, () => {});
    sacrifice = new Animated(sacrifice_frames, CANVAS_WIDTH, CANVAS_WIDTH+64, 4, () => {
        interact = () => {}; sacrificing = false;
        insane = true; in_vision = true;
    });

    him_rising = new Animated(rising_frames, 251, 502, 5, () => {});
}

// Render / game logic loop
function draw() {
    background(255,255,255); // Fill the window with white
    you.update(); // Handle player movement 
    if(fire_watching) {
        fire_seering.show(TOP_X,TOP_Y-138); // play fire seering animation
    }
    else if(in_vision) { 
        vision();
        if(!insane) shaman_burning.show(TOP_X + you.x, TOP_Y + you.y + 1);
        if(!touching && !combusting && !(witch_burning.frame > 1)) you.show();
    }
    else {
        world();
        if(!sacrificing) you.show();
    }
}

// Render / logic for the gray world 
function world() {
    push(); 
    translate(TOP_X, TOP_Y)
    if(debug) {
        strokeWeight(1);
        stroke(255,0,0);
    } else {
        noStroke();
    }
    fill(51,52,54);
    rectMode(CORNER);
    rect(0,0,CANVAS_WIDTH, CANVAS_WIDTH);
    if(current_dialog == third_talk && (annie_x > -CANVAS_WIDTH * 2)) {
        annie_walking.mirrored = true;
        annie_walking.show(annie_x, CANVAS_WIDTH - (annie_walking.h-2));
        annie_x -= 1;
    }
    switch(screen) {
        case 0: // tomb 
            image(tomb_img, 0, 20, CANVAS_WIDTH, CANVAS_WIDTH);
            // Don't let player walk off right side;
            if (you.x > 270) {
                you.x--;
                you.right = false;
            }
            break;
        case -1: // stones
            if(current_dialog == first_talk)
                image(empty_camp, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH+64);
            else if(current_dialog == second_talk)
                image(flower_camp, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH+64);
            else if(current_dialog == third_talk) {
                image(flower_camp, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH+64);
                image(stone_circle, CANVAS_WIDTH/2 - 50, CANVAS_WIDTH+1, 108, 48);
            }
            else /*if(current_dialog == final_talk) */ {
                image(flower_camp, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH+64);
                image(stone_circle, CANVAS_WIDTH/2 - 50, CANVAS_WIDTH+1, 108, 48);
                if(sacrificing) {
                    if(!you_shoving.completed)
                        you_shoving.show(you.x-80, you.y-8);
                    else {
                        if(sacrifice.frame < 112)
                            image(you_shoving.imgs[shove_frames.length-1], you.x-80, you.y-8, you_shoving.w, you_shoving.h);
                        sacrifice.show(0,0);
                    }
                }
                else
                    image(old_shaman_stand, 236, CANVAS_WIDTH - 46, 18, 48);
                
                if(you.x <= 300) {
                    interact = () => {
                        current_dialog.active = true;
                    }
                    if(you.x < 280 && !current_dialog.completed) {
                        you.x++; you.left = false;
                    }
                    else if(you.x < 265) {
                        interact = () => {
                            sacrificing = true;
                            current_dialog.active = false;
                        }
                    }
                    if(you.x < 260) {
                        you.x++; you.left = false;
                    }
                }
                else if(you.x >= 310){ 
                    current_dialog.active = false;
                    interact = () => {};
                }
                if(current_dialog.active)
                    current_dialog.show(250,335);
            }
            break;
        case -2: // tent 
            image(tent_img, -20, 64, CANVAS_WIDTH, CANVAS_WIDTH);
            // Player can only enter tent after talking to the shaman
            if(you.x < 260 && !current_dialog.completed) {
                you.x++;
                you.left = false;
            } else if (you.x < 200) { // And should sit down once hes inside 
                you.x++;
                you.left = false;
                you.sitting = true;
            } else if (you.sitting) { // After 10 frames of sitting, look at the fire
                if(you.sit_timer > you.frame_step*15 + 3 && !fire_seering.completed) {
                    fire_watching = true;
                    you.x -= 10
                }
                /*push(); // Fade in first frame
                tint(255, 255* (you.sit_timer / (you.frame_step*15 + 3) ));
                image(fire_seering.imgs[0], 0, -138, CANVAS_WIDTH, CANVAS_WIDTH+242);
                pop();*/
            }
            // If the player's close enough to the tent, interacting starts dialog
            if(you.x <= 300) {
                if(!current_dialog.active) {
                    space_indicator.show(240, you.y - 10);
                    interact = () => {
                        current_dialog.active = true;
                    }
                }
            }
            // If the player walks away, dialog stops and they can't interact
            else {
                current_dialog.active = false
                interact = () => {};
            }
            
            if(current_dialog.active)
                current_dialog.show(230,345);
            break;
    }


    pop();

    if(you.x + you.w/2 < 0) {
        //Player walked off left side
        screen--;
        you.x = CANVAS_WIDTH - you.w/2;
    }
    else if(you.x + you.w/2 > CANVAS_WIDTH) {
        //Player walked off left side
        screen++;
        you.x = -you.w/2;
    }
}

// Render / logic for the void visions
function vision() {
    push(); 
    translate(TOP_X, TOP_Y)
    if(debug) {
        strokeWeight(1);
        stroke(255,0,0);
    } else {
        noStroke();
    }
    fill(255,255,255);
    rectMode(CORNER);
    rect(0,0,CANVAS_WIDTH, CANVAS_WIDTH);
    
    if(stake_screen) {
        //image(stone_camp,0,0,CANVAS_WIDTH, CANVAS_WIDTH+64);
        if(witch_burning.frame < 104)
            image(stake, 145, 252, 108, 197);
        if(you.x < 225) {
            you.x++;
            you.left = false;
            you.sitting = true;
            if(!witch_burning.completed) interact = () => {burning = true};
        }
    }
    if(vision_timer > 30) {
        if(insane) {
            if(!him_rising.completed)
                him_rising.show(you.x-125, you.y - 185);
            else
                image(him_rising.imgs[rising_frames.length-1], you.x-125, you.y - 185, him_rising.w, him_rising.h);
        }
        // Vision where annie leaves
        else if(shaman_touching.completed && !spontaneous_combustion.completed) {
            if(annie_x < -CANVAS_WIDTH) {
                annie_walking.show(annie_x, CANVAS_WIDTH - (annie_walking.h-2));
                annie_x += 1;
            }
            else
                image(annie_stand, -CANVAS_WIDTH, CANVAS_WIDTH - (annie_walking.h-2), annie_walking.w, annie_walking.h);
            if (you.x < -CANVAS_WIDTH + 45) {
                interact = () => {combusting = true;};
            }
        }
        // Vision where the flower burns
        else if(!flower_growing.completed ) // Show the flower growing
            flower_growing.show(CANVAS_WIDTH*2, CANVAS_WIDTH-flower_growing.h);
        else if(!shaman_touching.completed) { // Or show the fully grown flower
            image(flower_growing.imgs[flower_growing.imgs.length-1],
                 CANVAS_WIDTH*2, CANVAS_WIDTH-flower_growing.h,
                 flower_growing.w, flower_growing.h);
            if (you.x > (CANVAS_WIDTH * 2) - 35) {
                interact = () => {touching = true;};
            }
        }
    }
    vision_timer++;

    // Left and right bounds for player movement (Left bound unlocks after second vision)
    if (!spontaneous_combustion.completed && (you.x < -CANVAS_WIDTH + 30)) {
        you.x++;
        you.left = false;
    }
    if (you.x > (CANVAS_WIDTH * 2) - 25) {
        if(!stake_screen) you.x--;
        you.right = false;
    }
    // If the player walks off the left side
    if(you.x + TOP_X + you.w/2 < 0) {
       you.x = windowWidth - TOP_X - you.w/2;
       stake_screen = true;
    }

    if(touching)
        shaman_touching.show(you.x - 6, you.y - 124);
    if(combusting)
        spontaneous_combustion.show(you.x, you.y-52);
    if(burning) {
        if(!annie_falling.completed) {
            annie_falling.show(170, annie_y);
            annie_y += 36;
        }
        else if(!annie_skewer.completed) {
            annie_skewer.show(170,237);
        }
        else {
            if(witch_burning.frame < 104)
                image(annie_skewer.imgs[skewer_frames.length - 1], 170, 237, annie_skewer.w, annie_skewer.h);
            witch_burning.show(you.x-95, you.y-273); 
        }
    }

    pop();
}

function keyPressed() {
    switch(keyCode) {
        case LEFT_ARROW:
        case 65: // A key
            if(!fire_watching && !touching && !combusting && !burning && !sacrificing)
                you.left = true;
            break;
        case RIGHT_ARROW:
        case 68: // D key
            if(!fire_watching && !touching && !combusting && !burning && !sacrificing)
                you.right = true;
            break;
        case 32: // Space
            if(!fire_watching && !touching && !combusting && !burning && !sacrificing)
                interact();
            break;
        default:
            return false;
    }
}

function keyReleased() {
    switch(keyCode) {
        case LEFT_ARROW:
        case 65: // A key
            you.left = false;
            break;
        case RIGHT_ARROW:
        case 68: // D key
            you.right = false;
            break;
        case 32: // Space
            break;
        default:
            return false;
    }
}