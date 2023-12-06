// -------- Asset Loading -------- //
function preload() {
    font_regular = loadFont("assets/Neucha-Regular.ttf")
    
    // Screens
    tomb_img = loadImage("assets/screens/tomb.png");
    tent_img = loadImage("assets/screens/tent.png");
    stones_img = loadImage("assets/screens/stones.png");

    // Character
    you_stand = loadImage("assets/character/you_stand.png");
    you_lstep = loadImage("assets/character/you_lstep.png");
    you_rstep = loadImage("assets/character/you_rstep.png");
    you_sit = loadImage("assets/character/you_sit.png")

    shaman_stand = loadImage("assets/character/shaman_stand.png");
    shaman_lstep = loadImage("assets/character/shaman_lstep.png");
    shaman_rstep = loadImage("assets/character/shaman_rstep.png");
    shaman_sit = loadImage("assets/character/shaman_sit.png")

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

        image(current_img, x, y, this.w, this.h);
        
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

    show() {
        push();
        let top_y = (this.current_msg * this.display_length + Math.min(this.frame, this.display_length));
        translate(230, 350-top_y);
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

        this.sit_frame = !in_vision ? you_sit : shaman_sit;
        this.rstep_frame = !in_vision ? you_rstep : shaman_rstep;
        this.lstep_frame = !in_vision ? you_lstep : shaman_lstep;
        this.stand_frame = !in_vision ? you_stand : shaman_stand;
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
        else if(this.right != this.left) {
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
var you; // Player variable
var screen = 0; // Which screen the player's on
var fire_watching = false; // Is the player currently watching the fire?
var touching = false; // Is the player currently touching the flower?
var in_vision = false; // Is the player currently in a vision
var current_dialog;
var interact = () => {}; // Function the player can currently trigger by interacting 

// Init game objects
function start() {
    you = new Player(20,360,20,40);
    first_talk = new Dialog([
            ["I want to see God", 0],
        ["He will see you", 1],
        ["Come in.", 1]]);
    second_talk = new Dialog([
            ["I saw you in the flame", 0],
            ["Why?", 0],
        ["You saw yourself", 1],
        ["Look again.", 1]]);
    third_talk = new Dialog([
            ["I saw Annie in the flame", 0],
            ["Did you know her?", 0],
        ["No.", 1],
        ["I did't known anyone", 1],
        ["Until I met God", 1]]);
    final_talk = new Dialog([
            ["I saw what you did", 0],
            ["You're a monster", 0],
        ["You're right", 1],
        ["I was", 1],
        ["I hope you see why", 1]]);
    current_dialog = first_talk;

    space_indicator = new Animated([space_unpressed, space_pressed], 20, 10, 20);
    fire_seering = new Animated(fire_frames, CANVAS_WIDTH, CANVAS_WIDTH+242, 5, () =>
        /*|on_complete -> */ { fire_watching = false; you.sitting = false; in_vision = true });
    flower_growing = new Animated(flower_frames, 20, 24, 15, () => {});
    
    shaman_burning = new Animated(burning_frames, 20, 40, 3, () => {});
    shaman_touching = new Animated(touch_frames, 57, 167, 3, () =>
        /*|on_complete -> */ {
            touching = false; in_vision = false;
            screen = 0; you.x = 20; 
            current_dialog = second_talk;
            fire_seering.completed = false; you.sit_timer = 0});
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
        shaman_burning.show(TOP_X + you.x, TOP_Y + you.y + 1);
        if(!touching) you.show();
    }
    else {
        world();
        you.show();
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
    switch(screen) {
        case 0: // tomb 
            image(tomb_img, 0, 20, CANVAS_WIDTH, CANVAS_WIDTH);
            // Don't let player walk off right side;
            if (you.x > 350) {
                you.x--;
                you.right = false;
            }
            break;
        case -1: // stones
            image(stones_img, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH+64);
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
                if(current_dialog.active) {
                    current_dialog.show();
                }
            }
            // If the player walks away, dialog stops and they can't interact
            else {
                current_dialog.active = false
                interact = () => {};
            }
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
    if(!flower_growing.completed ) // Show the flower growing
        flower_growing.show(CANVAS_WIDTH*2, CANVAS_WIDTH-flower_growing.h);
    else // Or show the fully grown flower
        image(flower_growing.imgs[flower_growing.imgs.length-1],
             CANVAS_WIDTH*2, CANVAS_WIDTH-flower_growing.h,
             flower_growing.w, flower_growing.h);
    if (you.x > (CANVAS_WIDTH * 2) - 25) {
        you.x--;
        you.right = false;
    }
    if (you.x > (CANVAS_WIDTH * 2) - 35) {
        interact = () => {touching = true;};
    }
    if(touching)
        shaman_touching.show(you.x - 6, you.y - 124);
    pop();
}

function keyPressed() {
    switch(keyCode) {
        case LEFT_ARROW:
        case 65: // A key
            you.left = true;
            break;
        case RIGHT_ARROW:
        case 68: // D key
            you.right = true;
            break;
        case 32: // Space
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