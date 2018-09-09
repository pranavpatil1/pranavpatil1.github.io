// If you have any feedback, send me an email!
// I want to improve this game as much as I can.

frameRate(60);
size(760,520);

angleMode = "radians";

//takes all of the degrees inputs and converts them into radians
var sine = function(input) {

	return sin((input) * (Math.PI / 180));

};

var cosine = function(input) {

	return cos((input) * (Math.PI / 180));

};

var rot = function(input) {

	return rotate((input) * (Math.PI / 180));

};

var page = "menu"; //game, end, menu, settings, achievements, pause?

var player = [240, 280, 18, 40, 0, random(-2, -0.5), false, false, false, false, false]; //0x, 1y, 2w, 3h, 4xvel, 5yvel, 6up 7down 8left 9right (open), 10is jumping

//whether or not the player is being controlled by the user and the game is going
var playing = true;

//yvel of the player 1 frame back
var delayYvel = 0;

var jumpTime = 0;

//if the player can't jump
var noJump = false;

//actually where the aim should be
var aim = [0, 0];

//where the camera is pointed, there is a delay
var cameraAim = [0, 0];

//if player graphics are flipped
var flip = false;

//how much everything shakes after the player falls
var shakeAmt = 0;

//the blocks which the player interacts with
var blocks = [];

//for each block, if it's at the top, bottom, left, or right
var position = [];

//how far into the running motion the player has gone
var amt = 0;

//how far up the player arms have gone
var amt1 = 0;

//if he ran so far
var ran = false;

//if a block is at the top
var top = false;
//if a block is at the bottom
var bottom = false;
//if a block is at the left
var left = false;
//if a block is at the right
var right = false;

//is it the first frame, for (re)loading a level?
var first = true;

// is it the first frame of a level (not for reloading)
var levelFirst = true;

//is the player on some door?
var onDoor = false;

//when a level started
var startTime = 0;

// the fade transition (set to 255 to begin)
var levelTransition = 255;

// set when making levelTransition 255, but it is reset
var transitionColor = color(0, 0, 0);

//player original spot in a level (x, y)
var orig = [0, 0];

var door = [0, 0];

//which level the player is at
var levelNum = 0;

//which world the player is at
var worldNum = 0;

//where the farthest block in the map is
var far = 0;

// optimal golden star color
var starColor = color(163, 135, 23);
var bkgrdColor = color(85, 179, 214);

// the switches, but i like to call them flips
var flips = [];

// the seeds that the player can throw [x, y, xvel, yvel]
var seeds = [];

// 500 frame lifetime tree, with x and y positions 
var trees = null;

// how long the user has held the down key
var upTime = 0;

// after hitting an obstacle how much longer until death!!
var deathCount = 0;

var maxHealth = 50;
var health = maxHealth;

var clouds = [
	[parseFloat(random(0, 600).toFixed(2)), parseFloat(random(150, 350).toFixed(2)), parseFloat((random(0, 2) < 1 ? -1 : 1) * random(0.5, 1).toFixed(2)), parseFloat(random(4, 6).toFixed(2))],
	[parseFloat(random(0, 600).toFixed(2)), parseFloat(random(150, 350).toFixed(2)), parseFloat((random(0, 2) < 1 ? -1 : 1) * random(0.5, 1).toFixed(2)), parseFloat(random(4, 6).toFixed(2))]
];

var deathMessage = [
	["You can use the down arrow to slam down", "Engineers do most of their work in teams to solve problems.", "Engineers design and build things that make a difference and solve real world problems", "Engineers have saved lives through inventions like the pacemaker and Omnipod", "Engineers protect our planet by combating issues like global warming", "Chemical engineers use chemistry, physics, and math to solve problems with chemicals", "Biomedical engineers are awesome!", "Computer engineers are awesome!", "Environmental engineers are awesome!", "Mechanical engineers are awesome!", "Electrical engineers are awesome!", "Software engineers are awesome!"],
	["Mechanical engineering is one of the oldest types of engineering", "Mechanical engineering is solving problems through mechanical devices", "Robotics is a subdiscipline of mechanical engineering", "In the automobile industry, mechanical engineers develop components like gears and engines to make cars more safe and efficient."],
	["There's lots of jobs in computer and software engineering", "Electrical engineers are super important. Electronics are everywhere!", "It's a lot easier to write code now than when computers were invented", "Electrical engineering is newer than mechanical or civil engineering."],
	["Greenhouse gases like carbon dioxide hurt the earth", "Solar power and wind power are types of renewable energy", "Environmental engineers develop tech which won't hurt the environment"]
];
var message; // message storage for death message
var rand = -1; // random storage for death message

var invention = ["diesel engine", "combustion engine", "phonograph", "long lasting lightbulb we see today", "car", "parachute", "bicycle"];
for (var i in invention) {
	deathMessage[1].push("Mechanical engineers invented the " + invention[i]);
}
invention = ["bridges", "dams", "roads", "skyscrapers"];
for (var i in invention) {
	deathMessage[1].push("Civil engineers build " + invention[i]);
}
deathMessage[1].push("Civil engineers built the Eiffel Tower");

invention = ["video games", "software chips", "things with electricity", "smartphones"];
for (var i in invention) {
	deathMessage[2].push("Electrical engineers build " + invention[i]);
}
invention = ["algorithms for self-driving cars", "code", "artificial intelligence"];
for (var i in invention) {
	deathMessage[2].push("Software engineers create " + invention[i]);
}
invention = ["computing devices", "software and hardware", "awesome tech!"];
for (var i in invention) {
	deathMessage[2].push("Computer engineers create " + invention[i]);
}
invention = ["biofiltration", "hybrid cars", "vehicles that don't create greenhouse gases"];
for (var i in invention) {
	deathMessage[3].push("Environmental engineers invented " + invention[i]);
}
/**

KEY for the maps array

0 = start spot
* = platform
D = door
S = big spike
t = two small spikes (use sparingly)
c = star
_ = lower death zone ( use for large area bottom collision )
1-9 = person to talk to
LRTB = edges of a platform (will start on side that is caps)
!@#$ = the switch corresponding to the platform (number these row major)

*/

//an array representing ALL THE LEVELS!
var maps = [
	[
		[
			"                                                               c",
			"",
			"c                                                                 *                                       *********                ",
			"*                                           *                     *                        c            *                          ",
			"*            0      1               *       *         2           *         3         ss   S     s      ____________               D",
			"******************************  *******  ******  ***************************************************************************************",

		],
		[
			"                         *   *   *",
			"                         *   *   *",
			"  0                          *   *",
			"*****                *           *                                   S",
			"    *                *  _*       *                                   *",
			"    * ***   ** *  ****  **  _*                          *********    *",
			"    *                       **                       *               *",
			"    *   _________________________*                *          **      *    c",
			"    *   **********************************      *                    * SSS**************",
			"    *                                        1         c   **          *****",
			"    *                                  *********       *            2           D",
			"    *                  ***                                       ****************************",
			"    *      tt   c   **    *     *",
			"    ** ** **** ****          *** ***",
		],
		[
			"                                                                                             D ",
			"                                               *                                          * ***",
			"                                               *                                    3          ",
			"                                               *                                  ****         ",
			"                                               *                          **   **              ",
			"                                               *                    **                         ",
			"                                            c  *                                               ",
			"                1                         **** *                 c                             ",
			"              ***                      *                         *                             ",
			"            S      **                *                     _     *_                            ",
			" 0         **          **                                  *     **                            ",
			"*****                       **                           *   *         *                       ",
			"       **                       **         S    2     *         *__*         c                 ",
			"                                    ** ** *********             ****        **                 ",
		],
		[
			"                                         c",
			"                                                                S                           *",
			"                                                                *                            *",
			"                                                                *                             *",
			"                                             tt                 *                          *c         S   S   S",
			"                                    ****   *****                                           **         *   *   *",
			"                  tt     *********                                                                    *   *   *",
			"             1 *********                             2          *                                         *",
			"  0      *****                                     *****        *                               *",
			"********                                      *        *****____*                        *      *     *       **  3",
			"                                            Sc*            ********  * S      tt         *      *S    *   *   ******             ttt       D",
			"                                           ****                        **** ******   *****  **  ****  *   *   **********  ****  *****   ******"
		],
		[
			"                                                                             *",
			"                                                                             *",
			"                                                                   c         *",
			"                    S  S                                    ******************",
			"                    *  *                                                                                                            ",
			"                    *  *                                                                                                            ",
			"   c                *  *                                          *********                                                         ",
			"   *                *  *                               *       ****       ***                                   ****                ",
			"                                                    ****   **               ***                                                     ",
			"                                                                              ****  2                        ***   c   3            ",
			" *               *  *  *                     *****                               ****                    *         *  **  **        ",
			"    0  tS           *__*     S   1                                                 *****                ____________________      D",
			"  **************    ******   ***********  **                                           ************************************************",

		],
		[
			"*",
			"*",
			"*",
			"*",
			"* 0",
			"*****",
			"    *",
			"    *",
			"    *",
			"    ******                                               2   SS   t     ",
			"                                        *      S       ******************",
			"c                                     * *************                   *     *****",
			"*                                     *                                 *              *****",
			"**  ***********                       **                                *",
			"              *                                                         *________________________",
			"              *                                                         ********************************      3",
			"              *                                                                                             ****      D",
			"              *   1         t          *     c                                                  c                   ****",
			"              *****    *** ** **  **  **     *                                                 ***  **  ***      ",
		],
	], // world 1 - intro,mechanical,civil
	[
		[
			"                                                        cS                                                         ",
			"                                                        **                               c                         ",
			"                                                    T                                                              ",
			"                    T                            #                S                                                ",
			"                                              ****    *****  SS  ***     2!L   R                                   ",
			"                                             t*             ****     ******     *****    @L    R                   ",
			"           0    1$       S        _      *  ***                                        ***      ****   3        D  ",
			"          ********  c  ****       *    *            B                                                ****  ********",
			"                    b         *** * **                                                                             ",
		],
		[
			"   0 !                                           * c                                                     ",
			"  ****L    R****     @                            *                                                      ",
			"                  ****L    R****    #        1     *                                                     ",
			"                     _________   ****L    R*****    *                                                    ",
			"                     *********_________________     *                                                    ",
			"                             ******************      *                                                   ",
			"                                                   __*                           S                       ",
			"                                                   ****                          *                       ",
			"                                   **_***_****_*****    *         $              *                       ",
			"                                    *** ***  ***         *    *****L    R*****   *                       ",
			"                                                                                 *               T   D   ",
			"                         *                                 *                     *                ****** ",
			"                         *c    *     S   S           2     *                     *   _                   ",
			"                         ***   ********S****  **  *****  **                          *      3 %     c    ",
			"                                      ***                                      *****   **  ****  B ***   ",
		],
		[
			"*     *                                 *                                                                                    c",
			"*     *c                                *                                                                                  S**",
			"*       *                         1     *                                                                                  *  ",
			"*0      *                      S***  T **       T  Tc                                                    3               S*   ",
			"****S     *                    *   &    *                                                             T****              *    ",
			"    *     *                  S*    *  SS*                                                                 *             *     ",
			"     *S     *                *     *  ***                            (     ! 2                      @     *          S*       ",
			"      *     ****           S*      *                   ***   **  *****L T  ****    r****        T*****b    *         *        ",
			"       *S        L       R *       *                                          *     *                              S*         ",
			"        *            #             *  *    $ %  b  B                          *_____*______   ^             *      *      D   ",
			"         ****************          *  **  ****                                ***************** b           *******     ***** ",
			"                                   * b **                               B                                                     ",
		],
		[
			"                                 T                                           S                                                                     ",
			"                                                                            ***                                                                    ",
			"                                                                                                                                                   ",
			"                                                            !*             *                                                                 T     ",
			"                                                        S  ***  L   R                                                                        c     ",
			"c                                                       *     c          *                                                                         ",
			"**                                    __                 L    R          __________                               _                                ",
			" ***                                 ****                 * @       *********************                         *                          b     ",
			"   ***             1L     R S ^                         * ***                                           ******  _                L    %   r      D ",
			"     ***     0 $ ***       ****  b         #  2        _*  **                                3       *          *   _     S          ***     ******",
			"       *********                           ******   ** **                                   *******               * * *********                   ",
		],
		[
			"                                                                T   T   T   T         2   S                            ",
			"                                              S                                  *  *** * * ****                       ",
			"                          T   T   T     ****  *                                 *         *      ***                   ",
			"                                              *                                *          *          ***               ",
			"         S                           **       *                                           *              ***           ",
			"         *                                    * ** **                                     *                  ***       ",
			"       * *                        c           *  ___                        c             *_______________   _   ***   ",
			"    0    *    1   ! @ #                       *  ***   $ % ^ &                            *****************c***        ",
			"   ***   *  ****  *****   B   B   B           *        *******  B   B   B   B                                          ",
			"                                                                                                             D         ",
			"                                                                                                            ***********"
		],
		[
			"                                                                                )     T                          ",
			"                                       T  *  T  *  T  *                     *****          S                     ",
			"                                          *     *     *         2! l     *     R           *           SStDt  c  ",
			"                         1                *     *             ****                          S        S****** *** ",
			"                    T  ***                *           @l         R                          *        *           ",
			"          L      r       *                      (     *                                      S     S*            ",
			"        L      r         *  S             &     *     *                                      *     *             ",
			"      #0 $          B %  * S*S  S   ^     *     *  c  *                                          S*              ",
			"      ****           *** * **** **  *  b  *  b  *  b  *                                          *               ",
			"                                                                                      c        S*                ",
			"                                                                                      b   **  **                 ",
		],
	], // world 2 - electrical, computer science, computer engineering
	[
		[
			"                                                                    c                                ",
			"                                                                    *                * ********      ",
			"                                         S                         *                 *     *         ",
			"                                c        *      SS               S*                  *     *         ",
			"  c                                      *  S   **              **                   *     *   *     ",
			"                                    ****** *******                                   *** **          ",
			"                                                                                         *        ** ",
			"                                                   ***   2                               *           ",
			"                                *****                   ******                           *           ",
			"    0      S  S    S  S                                                              *****      D    ",
			"   ****    **** SS ****  1                                      *****            3 t *         ***   ",
			"       *  *    ****    ***** ***                                         ****  ***** *               "
		],
		[
			"                                                    ***",
			"                                                      *",
			"                                                     c*",
			"                                                    ***",
			"  c                                                                                                      D *       * c",
			"  *                                                                                                    *****  *     ****",
			"  *                             *****    *****   ****",
			"  *                             *                     S S",
			"  * __  __         0   1        *                   tS* *S    2                                      **",
			"  *******************************                   ****** *****  **               **              **",
			"                                                                     **             *S   3       **",
			"                                                                           *****    ********   **",
		],
		[
			"     c",
			"     *",
			"     *",
			"  0  *",
			"  *  *",
			"  ** *",
			"     *",
			"  * **",
			"  *  *",
			"  ** *",
			"     *",
			"  * **",
			"  *  *                      *",
			"  ** *                                                  c                                 S",
			"     *                          ****                                            S         *",
			"  *                                    ****                            S        *         *",
			"  *                       *                                    S       *        *         *",
			"  *        1            ______________________   2             *       *        c       * *      D",
			"  ***************  ************************************   **** * ***** * ****** * ******* * ********"
		],
		[
			"                                                                                        D",
			"                                                    _S_                             c   **",
			"    *                                             c ***                                *",
			"    *                                                *",
			"    *            S                          2        *",
			"    * 0          *                       ******      *                                *",
			"    ********     *                                   *                                   *",
			"                 *                                   *",
			"c               *                                  ***",
			"*      S       *                     ****                      *   *                   *",
			"       *S******                ****                                     **",
			"        *S                                      *                                        *",
			"   *     *                                      *         *   *             *",
			"                         * ***                  *      __________________________    3",
			"     *                                          *****************************************",
			"                  1",
			"       *  ** ** *** * ***",
		],
		[
			"                                                c",
			"",
			"",
			"                                     __                   2                                        c",
			"                     1             ******               *****",
			"                   ****                    _*_*_*_*_*_                                           *",
			"                         ****              ***********                                         *",
			"               *              ***                                       ***   S   ***   3  S *",
			"                                                                  ***        ***       *****     S",
			"             *                                                                                   ***",
			"         SS",
			"        ****                                                                                  S",
			"                                                                                              ****",
			"",
			"      *                                                                                 c          S",
			"                                                                                        ****     ***",
			"    *",
			"  0",
			" ***                                                                                            D",
			"                                                                                              *****"
		],
		[
			"                                                                                           c",
			"",
			"                                                               c                                                                        ",
			"                                                                       ***  *    ****                                                   ",
			"                                                                                          S S                                           ",
			"                                                                                        *** ***                                         ",
			"                                                                     S                    *_*       3                                   ",
			"                                                               ***  ***                   ***     *****                                 ",
			"                                                                                                                                        ",
			"   0                                                                                                       t    S                       ",
			"  ***                                                                                                      ******                       ",
			"    *SSS   1                                 c            S   *                                                                         ",
			"    *************                                        ***                                                         S S                ",
			"                *SSSS                                                                                               *****               ",
			"                **********                                                                                                              ",
			"                         *_S S_S     S_S  S_S SS   2   *                                                                       S        ",
			"                         ****************************  *                                                                      **        ",
			"                                                                                                                                     D  ",
			"                                                                                                                                   *****",
		],
	] // world 3 - something about the environment idk
]; //and just like that (ok maybe a few months of work) many many many many lines of level maps were created

// unlocked levels
var unlocked = [];

var peopleSpeech = [
	[
		[
			["Beginning scene\n\n[ENTER]"],
			["In each world, you'll be given a unique power! You can use your new power to travel this world and meet new people.", "In this world, press SPACE to create a block.", "You can hold the 'UP' arrow or 'W' to jump higher. Keep going!"],
			["The goal of an engineer's work is to make the world a better place.", "Engineers have created fuel-efficient cars to help the environment and artificial retinas to help the blind.", "They've even created more advanced smartphones to make people's everyday lives easier."]
		], // 1-1
		[
			["Hi, I'm an engineer. I work on airplanes... well... the engines. I guess that makes me special.", "There are so many types of engineers: mechanical, environmental, computer, chemical, and more.", "You'll meet quite a few and learn what they do. Also, nice jumps back there!"],
			["An engineer's salary can be anywhere from 80K to 100K or much more; it ranges based on what type of engineer.", "For me, working as part of a team and solving problems is the best part about being an engineer.", "Good luck on your journey!"]
		], // 1-2
		[
			["A mechanical engineer is an engineer who works with things that move (mechanics).", "Mechanical engineers design, develop, and build everything from bicycles, cars, and trains to airplanes and even spaceships."],
			["I'm a robotics engineer, a type of mechanical engineer. Robots are used to do tasks too dangerous for humans.", "We design robots with cool sensors and then build and test them so they can be used in the real world.", "We need to be very precise when making robots, so the job goes to engineers. These robots are saving lives!"],
			["Before creating something, mechanical engineers need to design it.", "We can design 3D models on computers to see what something might look like.", "We can even 3D print our models!"]
		], // 1-3
		[
			["There are two types of mechanical engineers, design engineers and systems engineers.", "As a design engineer, I make sure a product's design will work.", "Then, we test it and improve, and finally others are able to use our invention."],
			["I'm a systems engineer, that's a type of mechanical engineer.", "Systems engineers usually work to maintain or upgrade existing systems. The world changes, so we need to change with it!"],
			["Mechanical engineers can get awesome jobs! They work on building super smart cars and even animating characters at Pixar.", "Some parts of mechanical engineering require calculus or trigonometry, but most calculations can be done by computers."]
		], // 1-4
		[
			["Civil engineering is all about creating buildings, roads, power supplies, and other public structures.", "They design buildings that can survive natural disasters.", "They also build and design roads to take us places without traffic jams."],
			["A civil engineer's work is a bit like mechanical engineers because they use the same skills.", "Civil engineers need to do things like make sure buildings stay up even in the worst case scenarios."],
			["I work on designing water slides so that kids can go fast and have fun, but always stay on the ride.", "I need to make sure everything I make is super safe! People need to trust that the public places they go to are all safe."]
		], // 1-5
		[
			["I design tunnels to run under mountains. I guess people got tired of driving around all the time.", "Those things are super strong! They use a sturdy structure to withstand a mountain's weight."],
			["The Golden Gate Bridge was created by civil engineers like me.", "More than 2 billion vehicles have crossed, and it's the longest suspension bridge."],
			["The Hoover Dam is awesome! And it wasn't built by beavers; it was built by civil engineers.", "It was the largest dam when it was made and it generates 4 billion kilowatt-hours of power per year.", "I guess hydroelectricity really is powerful."]
		], // 1-6
	], // world 1
	[
		[
			["Welcome to the next category of engineering, with all things electrical!", "You have a new power here. Whenever you see a switch, you can power it with a zap of electricity by hitting SPACE.", "You need to zap the switch with an electric current so it can communicate with the platform. I bet they use Bluetooth."],
			["Thomas Edison opened the first power plant in 1882 and began a need for electrical engineering.", "Electrical engineers work with technology and electricity. It's a newer form of engineering."],
			["Electrical engineering is crucial because electronics are everywhere!", "Anything that you plug in or that needs batteries was designed by an electrical engineer.", "The phone, TV, and even parts of video game consoles are created by electrical engineers.", "Are you getting the hang of all these switches and moving platforms?"]
		], // 2-1
		[
			["One of the best things electrical engineers do is work on electric motors.", "These can be used in all sorts of places, like in electric cars!"],
			["Electrical engineering ties into civil engineering too.", "When designing electrical systems in buildings, I make sure electricity safely gets to all the rooms.", "Some of these buildings are REALLY tall!"],
			["Lots of the cool special effects we see are the work of electrical engineers.", "In amusement parks, like Disneyland, these special effects make rides more \"amusing\".", "Electrical engineers get to do lots of awesome stuff!"]
		], // 2-2
		[
			["Software engineers write code to tell computers what to do. We call this software.", "Computers are everywhere and are involved in all professions. That means there's a huge need for computer scientists!"],
			["Anything that an electrical engineer makes needs code behind it. Code is how people tell computers what to do.", "For example, motors in a robot need to be programmed on when to run."],
			["Did you know computers read binary code (0 and 1)?", "There are much easier programming languages where the code reads like a sentence.", "For example, `if (hungry) eat();` is just like \"If you're hungry, eat.\""]
		], // 2-3
		[
			["Modern software engineers work with artificial intelligence (AI) and machine learning.", "Engineers are designing a robot to read your facial expressions.", "WOAH!"],
			["Software engineers also write code for games (like this one). We would call them game developers.", "Old games were 8-bit, like the original Super Mario Bros.", "Modern games like Pokémon Go combine the real and virtual worlds. Awesome!"],
			["Software engineers have created smart systems like autopilot in airplanes or even driverless cars."]
		], // 2-4
		[
			["Software engineers and electrical engineers are both really cool and they're both really important.", "They both work really closely together, so there are some people who do both. We call them computer engineers."],
			["There are two major parts to a computer engineer's work: software and hardware. They're both equally important. ", "The hardware is setting up wires, circuit boards, and other actual physical parts.", "The software is all the code which tells the hardware what to do."]
		], // 2-5
		[
			["There are so many ways for students to get into electrical or computer engineering, such as FIRST", "FIRST has competitions like FRC and FTC for robotics. Google them!"],
			["It's really amazing how software and hardware need to work in sync.", "Knowing how to build a mechanical device isn't super helpful if you can't put motors on it."]
		], // 2-6
	], // world 2
	[
		[
			["Technology helps and hurts the environment. In this sector, you have the power to plant trees!", "Press space to throw a seed and plant a tree. These trees grow instantly and are bouncy!", "This tech is advanced!"],
			["Hi! I'm an environmental engineer.", "There's so much awesome tech in our world, but sometimes it hurts the environment.", "I create tech to help the environment."],
			["Environmental engineering helps to fight issues like global warming, wastewater treatment, and acid rain.", "Existing technology often makes these worse.", "I improve on existing devices or create new things to help this."],
		], // 3-1
		[
			["Environmental engineers have designed all sorts of inventions to help the planet.", "They've created rooftop gardens, pollution monitors, and ", "They even figure out how to clean up oil spills so they don't hurt the fish."],
			["I've studied the atmosphere, and climate change is a growing problem.", "Efficiently producing things like hydrogen fuel cells can help our environment"],
			["Environmental engineers also work in sustainability, on things like renewable energy.", "Engineers work on making different types of renewable energy make sense on a larger scale.", "Wind energy is a new one. Kites can generate electricity!"]
		], // 3-2
		[
			["Hi! I'm a biomedical engineer. I apply engineering and technology to biology.", "That means I'm making things like prosthetic limbs, health monitors, and artificial organs.", "Biomedical engineers make sure people with health problems can live normal lives."],
			["Biomedical engineers are super important in medicine and health.", "There's this new tech called smart pills. It's a tiny computer chip that can figure out why you're sick.", "This is the future!"]
		], // 3-3
		[
			["Hey! I'm a chemical engineer and I have the best job!", "I work with producing chemicals efficiently or making new materials (at a nano level).", "I make sure the gas that fills up your car is efficient and cheap."],
			["I'm just saying, my job is the coolest. I'm a food engineer, a type of chemical engineer.", "I make the yummiest ice creams in the world! It's all chemistry really."],
			["Water from rivers might be called freshwater, but engineers need to filter it (for cheap!)", "Environmental engineers also need to increase the efficiency of generating energy. Solar panels weren't always common!"]
		], // 3-4
		[
			["Engineers design toys, space vehicles, and even optimize ultra HD TVs (hint: nanotech)", "I'm sure you've noticed, engineers are basically everywhere and they work on almost everything!", "This is the world of engineers of course..."],
			["Engineering is about helping people by solving problems with innovation!", "You've seen different types of engineers, but they all are working towards the same goal.", "Their skills may be different, but that's what makes engineering unique!"],
			["My favorite part about being an engineer is seeing the impact of my work.", "New technology inspires the world, and we're creating solutions that are saving lives!"]
		], // 3-5
		[
			["Unbelievable! If you make it to the end, you'll be crowned an engineer.", "The world needs people like you to be engineers!"],
			["Your curiosity is as powerful as my engineering powers.", "We can change the world!"],
			["You're so close!", "Thanks for visiting the World of Engineers!"]
		], // 3-6
	] // world 3
];

for (var i in maps) {

	unlocked.push([]);
	for (var j = 0; j < maps[i].length; j++) {

		// CHANGE THIS TO === 0 TO >= TO 0
		unlocked[unlocked.length - 1].push(j >= 0);

	}

}

var starRecord = [];

for (var i in maps) {

	starRecord.push([]);
	for (var j in maps[i]) {

		starRecord[starRecord.length - 1].push(0);

	}

}

//level count for number of stars
var levelStar = 0;

//how big each star is
var starDisplay = [0, 0, 0];

//array filled with location of stars
var stars = [];

// confetti-like explosion
// [x, y, xvel, yvel, angle, color, time]
var explosion = [];

var pmillis = 0;
var t = 0;

var male = false;
var emojiSwitch = 0;

//scaling for mouse clicks
var sc = width / 600;
mouseReleased = function() {

	if (page === "menu") { //main menu

		//middle button
		if (dist(mouseX, mouseY, width / 2, height * 0.675) < 110) {

			///game page
			page = "worlds";
			levelNum = 0;
			first = true;
			levelFirst = true;

			levelTransition = 255;

		} else if (dist(mouseX, mouseY, width / 600 * 572, width / 600 * 372) < 30) {

			male = !male; // flip binary switch
			emojiSwitch = 220;

		}

	} else if (page === "worlds") {

		if (mouseX > 20 * sc & mouseY > 90 * sc & mouseX < 193 * sc & mouseY < 380 * sc) {

			worldNum = 0;
			page = "levels";

			levelTransition = 255;

		} else if (mouseX > 213 * sc & mouseY > 90 * sc & mouseX < 386 * sc & mouseY < 380 * sc) {

			worldNum = 1;
			page = "levels";

			levelTransition = 255;

		} else if (mouseX > 406 * sc & mouseY > 90 * sc & mouseX < 579 * sc & mouseY < 380 * sc) {

			worldNum = 2;
			page = "levels";

			levelTransition = 255;

		} else if (mouseX > 20 * sc && mouseX < 53 * sc && mouseY > 20 * sc & mouseY < 53 * sc) {

			page = "menu";
			levelTransition = 255;

		}

	} else if (page === "levels") {

		if (mouseX > 20 * sc && mouseX < 53 * sc && mouseY > 20 * sc & mouseY < 53 * sc) {

			page = "worlds";
			levelTransition = 255;

		}

		if (worldNum === 3 && 1 === 3) {

			if (mouseX < 193 * sc & mouseX > 20 * sc & mouseY > 90 * sc & mouseY < 380 * sc) {

				page = "game";
				levelNum = 0;

				levelTransition = 255;
				while (clouds.length > 0) {

					clouds.pop();

				}

			} else if (mouseX < 386 * sc & mouseX > 213 * sc & mouseY > 90 * sc & mouseY < 380 * sc) {

				page = "game";
				levelNum = 1;

				levelTransition = 255;
				while (clouds.length > 0) {

					clouds.pop();

				}

			} else if (mouseX < 479 * sc & mouseX > 406 * sc & mouseY > 90 * sc & mouseY < 380 * sc) {

				page = "game";
				levelNum = 2;

				levelTransition = 255;
				while (clouds.length > 0) {

					clouds.pop();

				}

			}

		} else {

			for (var i = 0; i < 3; i++) {

				for (var j = 0; j < 2; j++) {

					if (mouseX > (20 + 193.3 * i) * sc & mouseX < (193.3 + 193.3 * i) * sc & mouseY > (90 + j * 155) * sc & mouseY < (225 + j * 155) * sc & unlocked[worldNum][i + 3 * j]) {

						levelNum = i + 3 * j;
						page = "game";
						first = true;
						levelFirst = true;

						levelTransition = 255;
						clouds = [];

					}

				}

			}

		}

	} else if (page === "game") {

		if (mouseY > (10 * sc) & mouseY < (40 * sc) && deathCount <= 0) {

			if (mouseX > (560 * sc) & mouseX < (590 * sc)) {
				page = "menu";
				levelTransition = 255;
			} else if (mouseX > (520 * sc) & mouseX < (550 * sc)) {
				page = "levels";
				levelTransition = 255;
			} else if (mouseX > (480 * sc) & mouseX < (510 * sc)) {
				first = true;
			}
		}

	} else if (page === "death") {

		// 270, 310, 60, 60
		if (mouseY > 310 * sc & mouseY < 390 * sc) {

			if (mouseX > 180 * sc & mouseX < 240 * sc) {
				// reset level and go back
				page = "game";
				first = true;
				levelTransition = 255;
			} else if (mouseX > 270 * sc & mouseX < 330 * sc) {
				page = "levels";
				levelTransition = 255;
			} else if (mouseX > 360 * sc & mouseX < 420 * sc) {
				page = "menu";
				levelTransition = 255;
			}

		}

	}

};

//imagize

{

	var grass = createGraphics(40, 20, P2D);

	grass.beginDraw();

	grass.background(97, 63, 16);

	grass.noStroke();

	grass.fill(90, 57, 10);
	grass.rect(0, 0, 20, 20);

	grass.fill(27, 125, 0);
	grass.beginShape();

	grass.vertex(40, 0);
	grass.vertex(40, 10);
	grass.vertex(35, 5);
	grass.vertex(20, 20);
	grass.vertex(20, 0);
	grass.endShape();

	grass.fill(20, 115, 0);
	grass.beginShape();
	grass.vertex(20, 0);
	grass.vertex(20, 20);
	grass.vertex(5, 5);

	grass.vertex(0, 10);
	grass.vertex(0, 0);

	grass.endShape();

	grass.endDraw();
	grass = grass.get();

	var dirt_bl = createGraphics(20, 21, P2D);

	dirt_bl.beginDraw();

	dirt_bl.background(0, 0, 0, 0);
	dirt_bl.noStroke();
	dirt_bl.fill(90, 57, 10);
	dirt_bl.beginShape();

	dirt_bl.vertex(0, 0);

	dirt_bl.vertex(0, 10);
	dirt_bl.vertex(10, 20);
	dirt_bl.vertex(20, 20);
	dirt_bl.vertex(20, 0);

	dirt_bl.endShape(CLOSE);

	dirt_bl.endDraw();
	dirt_bl = dirt_bl.get();

	var dirt_br = createGraphics(20, 21, P2D);

	dirt_br.beginDraw();

	dirt_br.background(0, 0, 0, 0);
	dirt_br.noStroke();
	dirt_br.fill(97, 63, 16);
	dirt_br.beginShape();

	dirt_br.vertex(0, 0);
	dirt_br.vertex(0, 20);
	dirt_br.vertex(10, 20);
	dirt_br.vertex(20, 10);

	dirt_br.vertex(20, 0);

	dirt_br.endShape(CLOSE);

	dirt_br.endDraw();
	dirt_br = dirt_br.get();

	var dirt_bml = createGraphics(20, 21, P2D);

	dirt_bml.beginDraw();

	dirt_bml.background(0, 0, 0, 0);
	dirt_bml.noStroke();
	dirt_bml.fill(90, 57, 10);
	dirt_bml.beginShape();

	dirt_bml.vertex(0, 0);
	dirt_bml.vertex(0, 20);

	dirt_bml.vertex(20, 20);
	dirt_bml.vertex(20, 0);

	dirt_bml.endShape(CLOSE);

	dirt_bml.endDraw();
	dirt_bml = dirt_bml.get();

	var dirt_bmr = createGraphics(20, 21, P2D);

	dirt_bmr.beginDraw();

	dirt_bmr.background(0, 0, 0, 0);
	dirt_bmr.noStroke();
	dirt_bmr.fill(97, 63, 16);
	dirt_bmr.beginShape();

	dirt_bmr.vertex(0, 0);
	dirt_bmr.vertex(0, 20);

	dirt_bmr.vertex(20, 20);
	dirt_bmr.vertex(20, 0);

	dirt_bmr.endShape(CLOSE);

	dirt_bmr.endDraw();
	dirt_bmr = dirt_bmr.get();

	var dirt = createGraphics(20, 20, P2D);

	dirt.beginDraw();

	dirt.background(97, 63, 16);

	dirt.endDraw();
	dirt = dirt.get();

	var dark_dirt = createGraphics(20, 20, P2D);

	dark_dirt.beginDraw();

	dark_dirt.background(90, 57, 10);

	dark_dirt.endDraw();
	dark_dirt = dark_dirt.get();

	var middle = createGraphics(40, 40, P2D);

	middle.beginDraw();

	middle.background(0, 0, 0, 0);

	middle.image(dark_dirt, 0, 0);
	middle.image(dirt, 20, 0);
	middle.image(dark_dirt, 0, 20);
	middle.image(dirt, 20, 20);

	middle.endDraw();
	middle = middle.get();

	var top_image = createGraphics(40, 40, P2D);

	top_image.beginDraw();

	top_image.background(0, 0, 0, 0);

	top_image.image(grass, 0, 0);
	top_image.image(dark_dirt, 0, 20);
	top_image.image(dirt, 20, 20);

	top_image.endDraw();
	top_image = top_image.get();

	var bottom_image = createGraphics(40, 40, P2D);

	bottom_image.beginDraw();

	bottom_image.background(0, 0, 0, 0);

	bottom_image.image(dark_dirt, 0, 0);
	bottom_image.image(dirt, 20, 0);
	bottom_image.image(dirt_bml, 0, 20);
	bottom_image.image(dirt_bmr, 20, 20);

	bottom_image.endDraw();
	bottom_image = bottom_image.get();

	var bottom_left = createGraphics(40, 40, P2D);

	bottom_left.beginDraw();

	bottom_left.background(0, 0, 0, 0);

	bottom_left.image(dark_dirt, 0, 0);
	bottom_left.image(dirt, 20, 0);
	bottom_left.image(dirt_bl, 0, 20);
	bottom_left.image(dirt_bmr, 20, 20);

	bottom_left.endDraw();
	bottom_left = bottom_left.get();

	var bottom_right = createGraphics(40, 40, P2D);

	bottom_right.beginDraw();

	bottom_right.background(0, 0, 0, 0);

	bottom_right.image(dark_dirt, 0, 0);
	bottom_right.image(dirt, 20, 0);
	bottom_right.image(dirt_bml, 0, 20);
	bottom_right.image(dirt_br, 20, 20);

	bottom_right.endDraw();
	bottom_right = bottom_right.get();

	var Xleft = createGraphics(40, 40, P2D);

	Xleft.beginDraw();

	Xleft.background(0, 0, 0, 0);

	Xleft.image(grass, 0, 0);
	Xleft.image(dirt_bl, 0, 20);
	Xleft.image(dirt_bmr, 20, 20);

	Xleft.endDraw();
	Xleft = Xleft.get();

	var Xright = createGraphics(40, 40, P2D);

	Xright.beginDraw();

	Xright.background(0, 0, 0, 0);

	Xright.image(grass, 0, 0);
	Xright.image(dirt_bml, 0, 20);
	Xright.image(dirt_br, 20, 20);

	Xright.endDraw();
	Xright = Xright.get();

	var Xmiddle = createGraphics(40, 40, P2D);

	Xmiddle.beginDraw();

	Xmiddle.background(0, 0, 0, 0);

	Xmiddle.image(grass, 0, 0);
	Xmiddle.image(dirt_bml, 0, 20);
	Xmiddle.image(dirt_bmr, 20, 20);

	Xmiddle.endDraw();
	Xmiddle = Xmiddle.get();

	var alone = createGraphics(40, 40, P2D);

	alone.beginDraw();

	alone.background(0, 0, 0, 0);

	alone.image(grass, 0, 0);
	alone.image(dirt_bl, 0, 20);
	alone.image(dirt_br, 20, 20);

	alone.endDraw();
	alone = alone.get();

	var alone_bottom = createGraphics(40, 40, P2D);

	alone_bottom.beginDraw();

	alone_bottom.background(0, 0, 0, 0);

	alone_bottom.image(dark_dirt, 0, 0);
	alone_bottom.image(dirt, 20, 0);
	alone_bottom.image(dirt_bl, 0, 20);
	alone_bottom.image(dirt_br, 20, 20);

	alone_bottom.endDraw();
	alone_bottom = alone_bottom.get();

	var cloud = createGraphics(300, 180, P2D);

	cloud.beginDraw();

	cloud.background(0, 0, 0, 0);

	cloud.noStroke();
	cloud.fill(200, 209, 209);
	cloud.rect(50, 106, 200, 74);

	cloud.ellipse(50, 130, 100, 100);
	cloud.ellipse(250, 130, 100, 100);
	cloud.ellipse(150, 90, 180, 180);

	cloud.endDraw();
	cloud = cloud.get();

	var lowSpike = createGraphics(40, 10, P2D);

	lowSpike.beginDraw();

	lowSpike.background(0, 0, 0, 0);
	lowSpike.noStroke();

	lowSpike.fill(92, 0, 58);
	lowSpike.triangle(0, 10, 10, 10, 5, 4);
	lowSpike.triangle(30, 10, 40, 10, 35, 4);
	lowSpike.triangle(15, 10, 25, 10, 20, 1);

	lowSpike.fill(110, 14, 14);
	lowSpike.triangle(10, 10, 15, 10, 12.5, 5);
	lowSpike.triangle(25, 10, 30, 10, 27.5, 5);

	lowSpike.endDraw();

	lowSpike = lowSpike.get();

	var fragileBlock = createGraphics(40, 40, P2D);
	fragileBlock.beginDraw();

	fragileBlock.noStroke();
	fragileBlock.background(130, 99, 55);

	fragileBlock.fill(160, 122, 69);
	fragileBlock.beginShape();
	fragileBlock.vertex(3, 8);
	fragileBlock.vertex(3, 3);
	fragileBlock.vertex(8, 3);
	fragileBlock.vertex(20, 15);
	fragileBlock.vertex(32, 3);
	fragileBlock.vertex(37, 3);
	fragileBlock.vertex(37, 8);
	fragileBlock.vertex(25, 20);
	fragileBlock.vertex(37, 32);
	fragileBlock.vertex(37, 37);
	fragileBlock.vertex(32, 37);
	fragileBlock.vertex(20, 25);
	fragileBlock.vertex(8, 37);
	fragileBlock.vertex(3, 37);
	fragileBlock.vertex(3, 32);
	fragileBlock.vertex(15, 20);
	fragileBlock.endShape();

	fragileBlock.beginShape();
	fragileBlock.vertex(3, 12);
	fragileBlock.vertex(11, 20);
	fragileBlock.vertex(3, 28);
	fragileBlock.endShape();

	fragileBlock.beginShape();
	fragileBlock.vertex(12, 3);
	fragileBlock.vertex(20, 11);
	fragileBlock.vertex(28, 3);
	fragileBlock.endShape();

	fragileBlock.beginShape();
	fragileBlock.vertex(37, 12);
	fragileBlock.vertex(29, 20);
	fragileBlock.vertex(37, 28);
	fragileBlock.endShape();

	fragileBlock.beginShape();
	fragileBlock.vertex(12, 37);
	fragileBlock.vertex(20, 29);
	fragileBlock.vertex(28, 37);
	fragileBlock.endShape();

	fragileBlock.endDraw();

	fragileBlock = fragileBlock.get();

}

//function for drawing the player, given the x and y coordinates

var drawPlayer = function (x, y, running, flip, jumping_amt, crown) {
    pushMatrix();
    translate(x + (flip ? 20 : 0), y);
    scale(flip ? -0.5 : 0.5, 0.5); // 40 by 80 scaled to 20 by 40

	var hairColor = color(43, 32, 3); // black
    var skinColor = color(196, 151, 67);
    var shirtColor = male ? color(23, 26, 8): color(70, 11, 77); // black
    var pantsColor = male ? color(3, 31, 66) : color(8, 17, 28); // dark blue
    
    noStroke();
    
    fill (pantsColor);
    var offset = Math.abs(frameCount/1.5 % 15 - 7.5);
    if (!running || jumping_amt > 0) {
        offset = 0;
    }
    rect(8 + offset, 64, 8, 12);
    rect(22 - offset, 64, 8, 12);
    pushMatrix();
	// adds a slight movement to the head
	if (running) {
		translate(cosine(frameCount*11), 1-abs(sine(frameCount*10)));
    }
    fill (hairColor);
    if (!male) {
		rect(-1, 15, 43, 36);
    }
    popMatrix();
    fill (shirtColor);
    if (male) {
        rect(4, 38, 30, 27, 6);
    } else {
        rect(4, 38, 30, 30, 6);
		beginShape();
		vertex(4, 57);
		vertex(34, 57);
		vertex(38, 68);
		vertex(0, 68);
		endShape();
    }
    
	pushMatrix();
	// adds a slight movement to the head
	if (running) {
		translate(cosine(frameCount*11), 1-abs(sine(frameCount*10)));
    }
    
    // draw head
    fill(skinColor);
    rect(0, 0, 40, 40, 20);
    // eyes
    fill (0);
    ellipse(18, 18, 6, 6);
    ellipse(30, 18, 6, 6);
    // mouth
    var w = 7 + jumping_amt/10;
    var h = 2 + jumping_amt/2;
    rect(23 - w/2, 26 - h/3, w, h, 6);
    
    fill (hairColor);
    beginShape();
    if (male) {
        vertex(6, 8);
        vertex(23, 6);
        vertex(38, 8);
        vertex(40, -4);
        vertex(33, 0);
        vertex(29, -5);
        vertex(26, 1);
        vertex(22, -5);
        vertex(19, -1);
        vertex(16, -6);
        vertex(12, 1);
        vertex(4, -1);
        vertex(0, 14);
    } else {
        strokeWeight(1);
		vertex(3, 6);
		vertex(12, 0);
		vertex(20, -1);
		vertex(29, 0);
		vertex(35, 4);
		vertex(42, 14);
		vertex(43, 18);
		vertex(43, 29);
		vertex(45, 37);
		vertex(42, 51);
		vertex(34, 51);
		vertex(42, 38);
		vertex(40, 28);
		vertex(35, 14);
		vertex(28, 9);
		vertex(25, 8);
		vertex(20, 7);
		vertex(11, 13);
		vertex(6, 20);
		vertex(2, 37);
		vertex(-1, 51);
		vertex(-5, 42);
		vertex(-4, 36);
		vertex(-5, 28);
		vertex(-4, 24);
		vertex(-4, 19);
		vertex(-2, 14);
    }
    endShape();
	if (crown) {
        fill(184, 175, 81);
        stroke(184, 175, 81);
        strokeWeight(3);
        beginShape();
        vertex(10, 3);
        vertex(31, 3);
        vertex(32, -7);
        vertex(25, -2);
        vertex(20, -6);
        vertex(15, -2);
        vertex(10, -8);
        vertex(10, 3);
        endShape();
    }
    popMatrix();
    
    // arms
    strokeWeight(8);
    stroke(skinColor);
    if (jumping_amt === 0) {
        var del = cosine(frameCount*10);
        if (running) {
            del = 1.5 * cosine(frameCount*14);
        }
        line(32, 42, 33 + del, 54);
        line(7, 42, 6 - 1.1*del, 54);
    } else {
        var rAng = 95 + jumping_amt*12;
        var lAng = 85 - jumping_amt*12;
        line(32, 42, 32 + 10 * cosine (lAng), 42 + 10 * sine (lAng));
        line(7, 42, 7 + 10 * cosine (rAng), 42 + 10 * sine (rAng));
    }
	strokeWeight(0.1);
	stroke(0);
	fill(0);
	noFill();
	noStroke();
    
    popMatrix();
};

var drawDoor = function(x, y, dark) {

	pushMatrix();

	translate(x, y);
	fill(255, 255, 255);

	//cosine, sine represents curve of door
	noStroke();
	beginShape();
	//top curve of door, not wanted in low graphics mode
	vertex(20 + 20 * cosine(180), 20 * sine(180));
	vertex(20 + 20 * cosine(200), 20 * sine(200));
	vertex(20 + 20 * cosine(220), 20 * sine(220));
	vertex(20 + 20 * cosine(240), 20 * sine(240));
	vertex(20 + 20 * cosine(260), 20 * sine(260));
	vertex(20 + 20 * cosine(280), 20 * sine(280));
	vertex(20 + 20 * cosine(300), 20 * sine(300));
	vertex(20 + 20 * cosine(320), 20 * sine(320));
	vertex(20 + 20 * cosine(340), 20 * sine(340));
	vertex(20 + 20 * cosine(360), 20 * sine(360));
	vertex(40, 40);
	vertex(0, 40); //bottom of door

	endShape();
	popMatrix();

};

var drawBlock = function(x, y, i) {

	if (top & bottom & left & right) {

		image(alone, x, y);

	} else if (top & !bottom) {

		image(top_image, x, y);

	} else if (bottom & !top) {

		if (left & right) {

			image(alone_bottom, x, y);

		} else if (left) {

			image(bottom_left, x, y);

		} else if (right) {

			image(bottom_right, x, y);

		} else {

			image(bottom_image, x, y);

		}

	} else if (!bottom & !top) {

		image(middle, x, y);

	} else {

		if (left) {

			image(Xleft, x, y);

		} else if (right) {

			image(Xright, x, y);

		} else {

			image(Xmiddle, x, y);

		}

	}

};

var drawCloud = function(x, y, big) {

	pushMatrix();
	translate(x, y);
	scale(big / 10);
	translate(-200, -246);
	image(cloud, 0, 0);
	popMatrix();

};

//163, 135, 23 < optimal gold star coloring
var drawStar = function(x, y, size, clr) {

	fill(clr);
	beginShape();
	for (var i = 0; i < 5; i++) {

		vertex(x + size / 2.46276957 * cos(i * 0.4 * PI - 0.3 * PI), y + size / 2.46276957 * sin(i * 0.4 * PI - 0.3 * PI));
		vertex(x + size * cos(i * 0.4 * PI - PI / 10), y + size * sin(i * 0.4 * PI - PI / 10));

	}
	endShape();

};

var drawGear = function(x, y, size, fillColor) {
	noStroke();
	fill(fillColor);
	beginShape();
	for (var i = 0; i < 360; i += 11.25) {
		vertex(x + (i % 45 < 22.5 ? size * 25 / 32 : size) * cosine(i), y + (i % 45 < 22.5 ? size * 25 / 32 : size) * sine(i));
	}
	endShape(CLOSE);
};

//function to draw a lock (rectangular shape)
var drawLock = function(x, y, size) {

	var dark_gray = color(120, 120, 120);
	var light_gray = color(219, 229, 246);

	pushMatrix();

	translate(x, y); //moves it to the proper spot
	scale(size / 500);

	drawGear(250, 250, 400, dark_gray); //a big rectangle providing background for the lock
	fill(light_gray);
	ellipse(250, 250, 400, 400);
	fill(dark_gray);
	ellipse(250, 215, 170, 183); //the outside lock circle part
	fill(light_gray);
	ellipse(250, 215, 100, 108); //the inside circle negative space
	fill(dark_gray);
	rect(140, 227, 220, 138); //rectangle at the bottom, main lock

	popMatrix();

};

//function to draw a arrow
var drawArrow = function(x, y, size) {

	pushMatrix();

	translate(x, y); //moves it to the proper spot
	scale(size / 500);

	fill(219, 229, 246);
	rect(0, 0, 500, 500); //a big rectangle providing background for the arrow

	translate(-1, 5);
	fill(bkgrdColor);
	rect(302, 121, 100, 275); //the vertical line
	rect(155, 121, 200, 100); //the horizontal line

	translate(27, 0); //arrow shift right
	triangle(47, 170, 157, 70, 157, 270); //arrow

	popMatrix();

};

// draws a random person based on given characteristics
var drawCharacter = function(x, y, male, hair, hairColor, skinColor, shirtColor, pantsColor, glasses, tie, talking, flip) {
	pushMatrix();
	if (flip) {
		translate(x + 20, y);
		scale(-0.5, 0.5); // 40 by 80 scaled to 20 by 40
	} else {
		translate(x, y);
		scale(0.5, 0.5); // 40 by 80 scaled to 20 by 40
	}
	
	// based on number, redefine colors to actual color values
	hairColor %= 3;
	switch (hairColor) {
		case 0:
			hairColor = color(43, 32, 3); // black
			break;
		case 1:
			hairColor = color(105, 89, 46); // brown
			break;
		case 2:
			hairColor = color(217, 62, 20); // red
			break;
	}
	skinColor %= 4;
	switch (skinColor) {
		case 0:
			skinColor = color(234, 192, 134); //lightest
			break;
		case 1:
			skinColor = color(224, 172, 105);
			break;
		case 2:
			skinColor = color(196, 151, 67);
			break;
		case 3:
			skinColor = color(171, 130, 53); // to darkest
			break;
	}
	shirtColor %= 4;
	if (male) {
		switch (shirtColor) {
			case 0:
				shirtColor = color(135, 15, 2); // red
				break;
			case 1:
				shirtColor = color(155, 151, 29); // weird yellow
				break;
			case 2:
				shirtColor = color(17, 24, 120); // blue
				break;
			case 3:
				shirtColor = color(8, 61, 11); // green
				break;
		}
	} else {
		switch (shirtColor) {
			case 0:
				shirtColor = color(179, 68, 88); // pink
				break;
			case 1:
				shirtColor = color(109, 30, 95); // purple
				break;
			case 2:
				shirtColor = color(34, 32, 114); // blue
				break;
			case 3:
				shirtColor = color(8, 61, 11); // green
				break;
		}
	}
	
	pantsColor %= 2;
	switch (pantsColor) {
		case 0:
			pantsColor = color(18, 17, 14); // black
			break;
		case 1:
			pantsColor = color(21, 40, 56); // dark blue
			break;
	}

	noStroke();

	pushMatrix();

	// adds a slight movement to the head
	if (!talking) {
		translate(cosine(frameCount * 5), 1 - abs(sine(frameCount * 5)));
	}

	hair %= 4;
	// background on the hair
	fill(hairColor);
	if (!male) {
		if (hair === 0) {
			rect(-1, 15, 42, 36);
			rect(9, 13, 32, 5);
		} else if (hair === 1) {
			rect(-1, 15, 43, 36);
		} else if (hair === 2) {
			rect(-1, 15, 43, 22);
		}
	}

	popMatrix();

	fill(shirtColor);
	// shirt
	if (male) {
		rect(4, 38, 30, 30, 6);
	} else {
		rect(4, 38, 30, 30, 6);
		beginShape();
		vertex(4, 58);
		vertex(34, 58);
		vertex(38, 70);
		vertex(0, 70);
		endShape();
	}

	if (tie) {
		fill(0);
		beginShape();
		vertex(16, 38);
		vertex(22, 38);
		vertex(20, 41);
		vertex(21, 52);
		vertex(19, 54);
		vertex(17, 52);
		vertex(18, 41);
		endShape();
	}

	noStroke();

	fill(pantsColor);
	// pants
	if (male) {
		rect(8, 68, 8, 12);
		rect(22, 68, 8, 12);
	} else {
		rect(8, 70, 8, 10);
		rect(22, 70, 8, 10);
	}

	pushMatrix();

	// adds a slight movement to the head
	if (!talking) {
		translate(cosine(frameCount * 5), 1 - abs(sine(frameCount * 5)));
	}

	// draw head
	fill(skinColor);
	rect(0, 0, 40, 40, 20);

	// eyes
	fill(0);
	ellipse(18, 18, 6, 6);
	ellipse(30, 18, 6, 6);

	// mouth
	var w = talking ? 2 * sine(frameCount * 14) + 7 : 8;
	rect(23 - w / 2, 26, w, talking ? sine(frameCount * 14) + 3 : 2, 6);

	fill(hairColor);
	// draw hair (different based on gender)
	hair %= 4;

	beginShape();
	if (male) {
		switch (hair) {
			case 0:
				vertex(6, 8);
				vertex(20, 6);
				vertex(38, 8);
				vertex(40, 7);
				vertex(30, 0);
				vertex(20, 0);
				vertex(12, 1);
				vertex(4, 5);
				vertex(0, 14);
				break;
			case 1:
				vertex(21, 3);
				vertex(16, 1);
				vertex(18, -13);
				vertex(21, 3);
				vertex(24, -24);
				vertex(25, 8);
				break;
			case 2:
				vertex(6, 8);
				vertex(23, 6);
				vertex(38, 8);
				vertex(40, -4);
				vertex(33, 0);
				vertex(29, -5);
				vertex(26, 1);
				vertex(22, -5);
				vertex(19, -1);
				vertex(16, -6);
				vertex(12, 1);
				vertex(4, -1);
				vertex(0, 14);
				break;
				// case 3 is bald
		}
	} else {
		switch (hair) {
			case 0:
				vertex(3, 6);
				vertex(12, 0);
				vertex(29, 0);
				vertex(35, 4);
				vertex(42, 14);
				vertex(28, 9);
				vertex(25, 8);
				vertex(20, 7);
				vertex(11, 13);
				vertex(6, 20);
				vertex(2, 37);
				vertex(-1, 51);
				vertex(-3, 36);
				vertex(-1, 14);
				break;
			case 1:
				strokeWeight(1);
				vertex(3, 6);
				vertex(12, 0);
				vertex(20, -1);
				vertex(29, 0);
				vertex(35, 4);
				vertex(42, 14);
				vertex(43, 18);
				vertex(43, 29);
				vertex(45, 37);
				vertex(42, 51);
				vertex(34, 51);
				vertex(42, 38);
				vertex(40, 28);
				vertex(35, 14);
				vertex(28, 9);
				vertex(25, 8);
				vertex(20, 7);
				vertex(11, 13);
				vertex(6, 20);
				vertex(2, 37);
				vertex(-1, 51);
				vertex(-5, 42);
				vertex(-4, 36);
				vertex(-5, 28);
				vertex(-4, 24);
				vertex(-4, 19);
				vertex(-2, 14);
				break;
			case 2:
				strokeWeight(1);
				vertex(3, 6);
				vertex(12, 0);
				vertex(20, -1);
				vertex(29, 0);
				vertex(35, 4);
				vertex(42, 14);
				vertex(43, 18);
				vertex(43, 29);
				vertex(45, 37);
				vertex(42, 37);
				vertex(40, 28);
				vertex(35, 14);
				vertex(28, 9);
				vertex(25, 8);
				vertex(20, 7);
				vertex(11, 13);
				vertex(6, 20);
				vertex(2, 37);
				vertex(-4, 37);
				vertex(-5, 28);
				vertex(-4, 24);
				vertex(-4, 19);
				vertex(-2, 14);
				break;
			case 3:
				break;
		}
	}
	endShape();

	popMatrix();


	// arms
	strokeWeight(8);
	stroke(skinColor);
	if (talking) {
		line(32, 42, 33 + 2 * cosine(frameCount * 5), 54);
		line(7, 42, 6 - 2 * cosine(frameCount * 5), 54);
	} else {
		var angle = abs(330 - frameCount * 2 % 660) - 90;
		var ang = angle;
		if (angle < -60) {
			ang = -60 - (angle + 60);
		} else if (angle === 90) {
			ang = 90;
		} else if (angle > 85) {
			ang = 85;
		}
		// -60 -30 70 100
		line(32, 42, 32 + 12 * cosine(ang), 42 + 12 * sine(ang));
		line(7, 42, 6, 54);
	}


	popMatrix();
};

/**
 function drawGSymbol draws a male or female gender symbol
 x - position
 y - position
 male - boolean for which symbol to draw
 alpha - opacity/transparency of symbol (aka RGBA coloring)
 */
var drawGSymbol  = function (x, y, male, alpha) {
	
	pushMatrix();
	translate (x, y);
	scale(2/3);
	
	if (male) {
		// blue circle
		stroke (255, 255, 255, alpha);
		strokeWeight(3);
		
		fill(50, 111, 217, alpha);
		ellipse(35, 35, 60, 60);

		// white male symbol
		strokeWeight(5);
		noFill();

		ellipse(30, 40, 22, 22);
		line(40, 30, 49, 21);
		line(40, 20, 49, 21);
		line(50, 29, 49, 21);
	} else {
		// pink circle
		noStroke();
		stroke (255, 255, 255, alpha);
		strokeWeight(3);
		
		fill(242, 131, 153, alpha);
		ellipse(35, 35, 60, 60);

		// white female symbol
		noFill();
		strokeWeight(5);

		ellipse(35, 28, 22, 22);
		line(35, 41, 35, 54);
		line(30, 49, 40, 49);
	}
	popMatrix();
}

var genExplosion = function(x, y, power, color, amt) {
	for (var i = 0; i < amt; i++) {
		explosion.push([x, y, random(-1, 1) * power, random(-2.5, -0.5) * power, random(0, 2 * PI), color, 255]);
	}
};

//triggers a death, no args needed
var death = function(damage) {

	if (deathCount <= 0) {
		// time until playing again
		deathCount = 150;

		// a big shake on damage
		shakeAmt = 10;

		// decrease health
		health -= damage;

		// makes a red flash
		levelTransition = 150;
		transitionColor = color(255, 0, 0);

		// sends to game over
		if (health <= 0) {
			health = 0;
			shakeAmt = 0; // no shake needed if game over
			genExplosion(player[0] + player[2] / 2, player[1] + player[3] / 2, 1.5, color(200, 50, 10), 10);
		}
	}

};

//deals with pressing and releasing keys

//becomes true when key is pressed, false when released
var keys = [];

void keyPressed ()
{
	//remapping WASD to arrow key keyCodes
	if (keyCode === 65) { //A

		keys[37] = true; //left

	} else if (keyCode === 68) { //D

		keys[39] = true; //RIGHT

	} else if (keyCode === 87) { //W

		keys[38] = true; //UP

	} else if (keyCode === 83) { //S

		keys[40] = true; //DOWN

	} else {

		keys[keyCode] = true; //if not just WASD, then normal

	}

};

var checkOpen = function(lx, ly) {
	// if a block is already there
	var valid = true;
	for (var i in blocks) {
		if (lx === blocks[i][0] && ly === blocks[i][1]) {
			valid = false;
		}
        if (blocks[i][2] === 2 && lx === blocks[i][0] && (ly === blocks[i][1] - 10 || ly === blocks[i][1] - 25)) {
			valid = false;
		}
	}
	// within the screen
	if (lx < 0 || lx > far) {
		valid = false;
	}
	return valid;
};

void keyReleased ()
{

	// hit space and build a block
	if (keyCode === 32) {
		if (worldNum === 0) {
			if (blocks[blocks.length - 1][2] === 3) {
			    blocks.pop();
			}
			// where to potentially place block
			var lx;
			if (flip) {
				lx = Math.floor(player[0] / 40) * 40 - 40;
			} else {
				lx = Math.ceil((player[0] + player[2]) / 40) * 40;
			}
			var ly = Math.floor(player[1] / 40) * 40;

			// if a block is already there
			var valid = checkOpen(lx, ly);
			// otherwise add it
			if (valid) {
				// block at x and y, type is 3, and it will last for 200 frames (~4 seconds)
				blocks.push([lx, ly, 3, millis()]);
			} else {
				if (flip) {
					lx = Math.ceil((player[0] + player[2]) / 40) * 40;
				} else {
					lx = Math.floor((player[0]) / 40) * 40 - 40;
				}
				// if a block is already there
				var valid = checkOpen(lx, ly);
				// otherwise add it
				if (valid) {
					// block at x and y, type is 3, and it will last for 200 frames (~4 seconds)
					blocks.push([lx, ly, 3, 400]);
				} else {
					lx = Math.floor(player[0] / 40) * 40;
					// if a block is already there
					var valid = checkOpen(lx, ly) && checkOpen(lx, ly - 40);
					// otherwise add it
					if (valid) {
						// block at x and y, type is 3, and it will last for 200 frames (~4 seconds)
						blocks.push([lx, ly, 3, 400]);
						player[1] -= 40;
					}
				}
			}
		} else if (worldNum === 2 && seeds.length === 0) {
			// throw a seed, with slight player velocity influence
			if (flip) {
				seeds.push([player[0] - 2, player[1] + 20, -4, -5 + player[5]/2]);
			} else {
				seeds.push([player[0] + 25, player[1] + 20, 4, -5 + player[5]/2]);
			}
		}
	} else if (keyCode === 10) { // ENTER
		for (var i in blocks) {
			if (blocks[i][2] === 5) {
				if (blocks[i][5] !== -1 && player[0] > blocks[i][0] - player[2] - 60) { // if in range
					blocks[i][5]++;
				}
			}
		}
	}
	//same thing but false on release
	if (keyCode === 65) {
		keys[37] = false;
	} else if (keyCode === 68) {
		keys[39] = false;
	} else if (keyCode === 87) {
		keys[38] = false;
	} else if (keyCode === 83) {
		keys[40] = false;
	} else {
		keys[keyCode] = false;
	}
};

noStroke();

void draw ()
{
	// removes any persistent stroke or drawing glitches
	strokeWeight(0.1);
	stroke(0);
	fill(0);
	noFill();
	noStroke();
	
	// resets font to bold (from normal)
	textFont(createFont("Century Gothic Bold"));
	
	// goes into the split between different pages
	
	if (page === "menu") { //main menu page

		pushMatrix();

		scale(sc);

		background(bkgrdColor);

		var m = 0;

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			noStroke();

			beginShape();

			vertex(i, 300);
			vertex(i + 150, 100);
			vertex(i + 150, 800);
			vertex(i, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 150, 100);
			vertex(i + 300, 300);
			vertex(i + 300, 800);
			vertex(i + 150, 800);

			endShape();

		}

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 350, 800);
			vertex(i - 100, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 800, 800);
			vertex(i + 350, 800);

			endShape();

		}

		for (var i in clouds) {

			drawCloud(clouds[i][0], clouds[i][1], clouds[i][3]);

			clouds[i][0] += clouds[i][2];

			if (clouds[i][0] < -150 & clouds[i][2] < 0) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}
			if (clouds[i][0] > 600 + 150) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}

		}

		popMatrix();

		noStroke();

		//document.body.style.backgroundColor = "black";

		textFont(createFont("Century Gothic Bold"));
		textAlign(CENTER, CENTER);

		fill(255, 255, 255);
		textSize(height / 10);
		text("the world of", width / 2, height * 0.24); //main title
		textSize(height / 6);
		text("ENGINEERS", width / 2, height * 0.36); //main title

		fill(255, 255, 255, 130);
		beginShape();

		for (var i = 0; i <= 2 * PI; i += PI / 3) {

			vertex(width / 2 + 100 * cos(i), height * 0.725 + 100 * sin(i));

		}

		vertex(width / 2 + 50 * cosine(0), height * 0.725 + 50 * sine(0));
		vertex(width / 2 + 50 * cosine(240), height * 0.725 + 50 * sine(240));
		vertex(width / 2 + 50 * cosine(120), height * 0.725 + 50 * sine(120));
		vertex(width / 2 + 50 * cosine(0), height * 0.725 + 50 * sine(0));
		
		endShape();

		emojiSwitch /= 1.175;
		
		fill(255, 255, 255, 400 - frameCount);
		textSize(height/24);
		
		text("Click to switch: ", width * 0.825, height * 0.93);
		
		// boy emoji
		drawGSymbol(width * 0.955 - 20, height * 0.93 - 20, true, male ? 220 - emojiSwitch : emojiSwitch);
		// girl emoji
		drawGSymbol(width * 0.955 - 20, height * 0.93 - 20, false, !male ? 220 - emojiSwitch : emojiSwitch);

	} else if (page === "worlds") {

		pushMatrix();

		scale(sc);

		background(bkgrdColor);

		var m = 0;

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			noStroke();

			beginShape();

			vertex(i, 300);
			vertex(i + 150, 100);
			vertex(i + 150, 800);
			vertex(i, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 150, 100);
			vertex(i + 300, 300);
			vertex(i + 300, 800);
			vertex(i + 150, 800);

			endShape();

		}

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 350, 800);
			vertex(i - 100, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 800, 800);
			vertex(i + 350, 800);

			endShape();

		}

		for (var i in clouds) {

			drawCloud(clouds[i][0], clouds[i][1], clouds[i][3]);

			clouds[i][0] += clouds[i][2];

			if (clouds[i][0] < -150 & clouds[i][2] < 0) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}
			if (clouds[i][0] > 600 + 150) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}

		}

		noStroke();

		textAlign(CENTER, CENTER);
		textFont(createFont("Century Gothic Bold"));

		fill(255, 255, 255);
		textSize(400 / 10);
		text("SECTORS", 600 / 2, 400 * 0.115); //main title

		fill(255, 255, 255, 200);
		rect(20, 90, 173, 290);
		rect(213, 90, 173, 290);
		rect(406, 90, 173, 290);

		fill(0, 0, 0, 200);
		textSize(40);
		text("build\n\n1", 20 + 173 / 2, 150 * 1.5);
		text("zap\n\n2", 213 + 173 / 2, 150 * 1.5);
		text("grow\n\n3", 406 + 173 / 2, 150 * 1.5);

		drawArrow(20, 20, 33);

		popMatrix();

	} else if (page === "levels") {

		pushMatrix();

		scale(sc);

		background(bkgrdColor);
		var m = 0;

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			noStroke();

			beginShape();

			vertex(i, 300);
			vertex(i + 150, 100);
			vertex(i + 150, 800);
			vertex(i, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 150, 100);
			vertex(i + 300, 300);
			vertex(i + 300, 800);
			vertex(i + 150, 800);

			endShape();

		}

		for (var i = m - 400; i <= m + 600 + 450; i += 400) {

			fill(87, 104, 145);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 350, 800);
			vertex(i - 100, 800);

			endShape();

			fill(102, 119, 160);
			beginShape();

			vertex(i + 350, 180 + 50);
			vertex(i + 800, 800);
			vertex(i + 350, 800);

			endShape();

		}

		for (var i in clouds) {

			drawCloud(clouds[i][0], clouds[i][1], clouds[i][3]);

			clouds[i][0] += clouds[i][2];

			if (clouds[i][0] < -150 & clouds[i][2] < 0) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}
			if (clouds[i][0] > 600 + 150) {

				clouds[i][2] *= -1;
				clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

			}

		}

		noStroke();

		textAlign(CENTER, CENTER);
		textFont(createFont("Century Gothic Bold"));

		if (worldNum === 3) {

			fill(255, 255, 255);
			textSize(400 / 10);
			text("AERODYNAMIC", 600 / 2, 400 * 0.12); //main title

			fill(255, 255, 255, 200);
			for (var i = 0; i < 3; i++) {
				fill(255, 255, 255, 200);
				rect(20 + 193 * i, 90, 173, 290);
				fill(0, 0, 0, 200);
				textSize(40);
				text((i + 1).toString(), 20 + 193 * i + 173 / 2, 90 + 290 / 2);
			}

		} else {

			fill(255, 255, 255);
			textSize(400 / 10);
			var title = "SECTOR " + (worldNum + 1);
			
			if (worldNum === 0) {
				title = "SECTOR 1: BUILD";
			} else if (worldNum === 1) {
				title = "SECTOR 2: ZAP";
			} else if (worldNum === 2) {
				title = "SECTOR 3: GROW";
			}
			
			text(title, 600 / 2, 400 * 0.12); //main title

			for (var i = 0; i < 3; i++) {

				for (var j = 0; j < 2; j++) {

					fill(255, 255, 255, 200);
					rect(20 + 193.3 * i, 90 + j * 155, 173.3, 135);
					if (unlocked[worldNum][3 * j + i]) {
						fill(0, 0, 0, 200);
						textSize(40);
						text((i + 1 + 3 * j).toString(), 20 + 193.3 * i + 173.3 / 2, 90 + j * 155 + 37);
						for (var k = 0; k < 3; k++) {
							drawStar(20 + 193.3 * i + 173.3 / 2 + 20 * cos(k * 2 * PI / 3 - PI / 6 + 4 * PI / 3),
								90 + j * 155 + 2 * 135 / 3 + 15 * sin(k * 2 * PI / 3 - PI / 6 + 4 * PI / 3),
								15, (k < starRecord[worldNum][3 * j + i] ? starColor : color(0, 0, 0, 100)));
						}
					} else {
						drawLock(20 + 193.3 * i + 173.3 / 2 - 30, 90 + j * 155 + 135 / 2 - 30, 60);
					}

				}

			}

		}

		drawArrow(20, 20, 33);

		popMatrix();

	} else if (first) {
		// link("http://pranavpatil.tk/games/cyber-champion.html", "_blank");
		blocks = [];
		stars = [];
		flips = [];
		seeds = [];
		trees = null;
		delayYvel = 0;
		far = 0;
		flip = false;
		
		// how many platforms found so far
		var pCount = 0;
		
		//go through maps array
		for (var i = 0; i < maps[worldNum][levelNum].length; i++) {
			for (var j = 0; j < maps[worldNum][levelNum][i].length; j++) {
				var item = maps[worldNum][levelNum][i][j]; //takes value
				var x = j * 40;
				var y = 400 - (maps[worldNum][levelNum].length - i) * 40; //reverse y value because of vertically scrolling UP
				if (item === "*") { //normal block
					blocks.push([x, y, 1]);
					if (x > far) {
						far = x;
					}
				} else if (item === "S") {
					blocks.push([x, y + 10, 2, 40, 30]);
				} else if (item === "t") {
					blocks.push([x, y + 25, 2, 20, 15]);
					blocks.push([x + 20, y + 25, 2, 20, 15]);
				} else if (item === "_") {
					blocks.push([x, y, 4]);
				} else if (item === "0") { //player start
					player = [x, y, player[2], player[3], 0, random(-2, -0.5), false, false, false, false, false];
					orig = [x, y]; //can reset to this
					amt = 0; //RESETS VALUES
					amt1 = 50;
					cameraAim = [-x + 300, -y + 200];
					if (worldNum == 0 && levelNum == 0 && levelFirst) {
						player[1] -= 400;
						cameraAim[1] += 120;
					}
				} else if (item === "D") { //player end
					door = [x, y];
				} else if (item === "c") { //stars
					stars.push([x, y, 0]);
				} else if (parseInt(item,10) >= 1 && parseInt(item,10) <= 9) {
					// x, y, type, which person, if talking, current speech num, m/f?, hair style, hair color, skin color
					// shirt color, pants color, glasses?, tie?
					var dude = random(1) < 0.492;
					var hair = 0;
					if (dude) {
						if (random(1) < 0.1) {
							hair = 1; // exciting and rare mohawk
						} else {
							hair = 2 * floor(random(2));
						}
					} else {
						hair = floor(random(3));
					}
					blocks.push([x, y, 5, parseInt(item), false, 0, dude, hair, random(1) < 0.7 ? 0 : (random(1) < 0.6 ? 1 : 2),
						floor(random(4)), floor(random(4)), floor(random(3)), random(1) < 0.4, random(1) < 0.6, true
					]);
				} else if (item.toLowerCase() === "r") {
					// right endpt to a horizontally moving platform
					pCount ++;
					
					var foundPos = 0;
					for (var k = j; k >= 0; k --) {
						if (maps[worldNum][levelNum][i][k].toLowerCase() === "l") {
							foundPos = k * 40; // the x value of the left side of the platform
							k = 0;
						}
					}
					// weird bug but too late to fix - '~' never used since pCount starts at 1
					var flipChar = "~!@#$%^&()"[pCount];
					for (var a = 0; a < maps[worldNum][levelNum].length; a ++) {
						var index = maps[worldNum][levelNum][a].indexOf(flipChar);
						if (index !== -1) {
							// [x, y, active]
							flips.push([index * 40, 400 - (maps[worldNum][levelNum].length - a) * 40, false]);
							a = maps[worldNum][levelNum].length;
						}
					}
					// [x,y,6,ID,bound1,bound2,vel,vert?]
					blocks.push([item === "R" ? x : foundPos, y, 6, pCount - 1, foundPos, x, 2, false]);
				} else if (item.toLowerCase() === "b") {
					// bottom endpt to a vertically moving platform
					pCount ++;
					
					var foundPos = 0;
					for (var k = i; k >= 0; k --) {
						if (maps[worldNum][levelNum][k][j].toLowerCase() === "t") {
							foundPos = 400 - (maps[worldNum][levelNum].length - k) * 40; // the y value of the top of the platform
							k = 0;
						}
					}
					var flipChar = "~!@#$%^&()"[pCount];
					for (var a = 0; a < maps[worldNum][levelNum].length; a ++) {
						var index = maps[worldNum][levelNum][a].indexOf(flipChar);
						if (index !== -1) {
							// [x, y, active]
							flips.push([index * 40, 400 - (maps[worldNum][levelNum].length - a) * 40, false]);
							a = maps[worldNum][levelNum].length;
						}
					}
					// [x,y,6,ID,bound1,bound2,vel,vert?]
					blocks.push([x, item === "B" ? y : foundPos, 6, pCount - 1, foundPos, y, 2, true]);
				} else if (item !== " ") { //not empty space
					//ADD SOMETHING HERE!!!
				}

			}

		}

		if (clouds.length === 0) {
			for (var i = 0; i < far / 600; i++) {
				clouds.push([parseFloat(random(0, far).toFixed(2)),
					parseFloat(random(-200, 200).toFixed(2)),
					parseFloat((random(0, 2) < 1 ? -1 : 1) * random(0.5, 1).toFixed(2)),
					parseFloat(random(4, 6).toFixed(2))
				]);
			}
		}

		position = [];

		//resets values
		startTime = frameCount;
		levelStar = 0;
		starDisplay = [0, 0, 0];
		health = maxHealth;
		deathCount = 0;
		playing = true;
		rand = -1;

		//draws blocks
		for (var i in blocks) {

			top = true;

			//goes through blocks to see if anything is directly above it
			for (var j in blocks) {

				if (i !== j & blocks[i][0] === blocks[j][0] & blocks[i][1] === (blocks[j][1] + 40) & blocks[i][2] === blocks[j][2]) {

					top = false;

				}

			}

			bottom = true;

			//goes through blocks to see if anything is directly below it
			for (var j in blocks) {

				if (i !== j & blocks[i][0] === blocks[j][0] & blocks[i][1] === (blocks[j][1] - 40) & blocks[i][2] === blocks[j][2]) {

					bottom = false;

				}

			}

			left = true;

			//goes through blocks to see if anything is directly below it
			for (var j in blocks) {

				if (i !== j & blocks[i][1] === blocks[j][1] & blocks[i][0] === (blocks[j][0] + 40) & blocks[i][2] === blocks[j][2]) {

					left = false;

				}

			}

			right = true;

			//goes through blocks to see if anything is directly below it
			for (var j in blocks) {

				if (i !== j & blocks[i][1] === blocks[j][1] & blocks[i][0] === (blocks[j][0] - 40) & blocks[i][2] === blocks[j][2]) {

					right = false;

				}

			}

			position.push([top, bottom, left, right]);

		}
		first = false;
		levelFirst = false;
	} else

		//game page is separate from all the rest so that it goes in the same frame as first
		if (page === "game" & !first) {

			pushMatrix();

			scale(sc);
			background(bkgrdColor);
			noStroke();

			pushMatrix();

			aim = [-constrain(player[0] - 250, 0, far + 40 - 600), -constrain(player[1] - 200, -10000, -50) - 50];

			if (levelTransition < 10) {

				cameraAim[0] -= (cameraAim[0] - aim[0]) / 40;
				cameraAim[1] -= (cameraAim[1] - aim[1]) / 40;

				if (player[0] < -cameraAim[0] + 100 | player[0] > -cameraAim[0] + 500 | player[1] < -cameraAim[1] + 100 | player[1] > -cameraAim[1] + 300) {

					cameraAim[0] -= (cameraAim[0] - aim[0]) / 80;
					cameraAim[1] -= (cameraAim[1] - aim[1]) / 80;

				}

			}

			if (shakeAmt > 2) {
				shakeAmt -= 0.5;
			}
			else {
				shakeAmt = 0;
            }
			if (playing && deathCount > 0) {
				deathCount--;
			}

			translate(cameraAim[0] + random(-shakeAmt, shakeAmt), cameraAim[1] + random(-shakeAmt, shakeAmt));

			var m = -cameraAim[0] + cameraAim[0] % 400;

			for (var i = m - 400; i <= m + 600 + 450; i += 400) {

				fill(87, 104, 145);
				noStroke();

				beginShape();

				vertex(i, 300);
				vertex(i + 150, 100);
				vertex(i + 150, 800);
				vertex(i, 800);

				endShape();

				fill(102, 119, 160);
				beginShape();

				vertex(i + 150, 100);
				vertex(i + 300, 300);
				vertex(i + 300, 800);
				vertex(i + 150, 800);

				endShape();

			}

			for (var i = m - 400; i <= m + 600 + 450; i += 400) {

				fill(87, 104, 145);
				beginShape();

				vertex(i + 350, 180 + 50);
				vertex(i + 350, 800);
				vertex(i - 100, 800);

				endShape();

				fill(102, 119, 160);
				beginShape();

				vertex(i + 350, 180 + 50);
				vertex(i + 800, 800);
				vertex(i + 350, 800);

				endShape();

			}
			for (var i in clouds) {

				drawCloud(clouds[i][0], clouds[i][1], clouds[i][3]);

				clouds[i][0] += clouds[i][2];

				if (clouds[i][0] < -250 & clouds[i][2] < 0) {

					clouds[i][2] *= -1;
					clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

				}
				if (clouds[i][0] > far + 250 & clouds[i][2] > 0) {

					clouds[i][2] *= -1;
					clouds[i][1] = parseFloat(random(150, 350).toFixed(2));

				}

			}

			player[6] = true; //up is open
			player[7] = true; //down is open
			player[8] = true; //left is open
			player[9] = true; //right is open

			noJump = false;

			//collision
			for (var i in blocks) {

				// makes sure it's remotely close to player
				if (blocks[i][1] > -aim[1] - 50 & blocks[i][1] < -aim[1] + 450 & blocks[i][0] > -aim[0] - 25 & blocks[i][0] < -aim[0] + 625) {

					/**

					REMEMBER!

					0 - x
					1 - y
					2 - w
					3 - h

					6 to 9 = if sides are open up down left right
					*/


					if (blocks[i][2] === 1 || (worldNum === 0 && blocks[i][2] === 3)) { // normal block and created block

						var gap = 5;

						if (player[1] > (blocks[i][1] - player[3] + gap) & player[1] < (blocks[i][1] + 40 - gap) &
							player[0] < (blocks[i][0] + 40) & player[0] > (blocks[i][0] + 40 - 4)) {

							player[8] = false; //left is closed
							player[0] = blocks[i][0] + 40;
							player[4] = 0;

						}
						if (player[1] > (blocks[i][1] - player[3] + gap) & player[1] < (blocks[i][1] + 40 - gap) &&
							player[0] < (blocks[i][0] - player[2] + 4) & player[0] > (blocks[i][0] - player[2])) {

							player[9] = false; //right is closed
							player[0] = blocks[i][0] - player[2];
							player[4] = 0;

						}
						if (player[5] >= 0 & player[0] > (blocks[i][0] - player[2]) & player[0] < (blocks[i][0] + 40) &
							player[1] <= (blocks[i][1]) & player[1] >= (blocks[i][1] - player[3] - player[5])) {

							if (shakeAmt === 0 & abs(player[5]) > 10) {
								shakeAmt = abs(player[5]) / 3;
							}
							if (blocks[i][2] === 3) {
								blocks[i][3] += 25;
								if (abs(player[5]) > 10) {
									blocks[i][3] = 0;
								}
							}

							player[7] = false; //down is closed
							player[1] = blocks[i][1] - player[3] + 0.01;
							player[5] = 0;
							player[10] = false;

						}
						if (player[5] <= 0 && player[0] > (blocks[i][0] - player[2]) & player[0] < (blocks[i][0] + 40) &
							player[1] <= (blocks[i][1] + 40) & player[1] >= (blocks[i][1] + 40 + player[5])) {

							if (blocks[i][2] === 3) {
								blocks[i][3] = 0;
							} else {
								player[6] = false; //up is closed
								player[5] = 0;
								player[1] = blocks[i][1] + 40 + 0.01;
							}

						}

						//if under a block, you cant jump
						if (player[0] > (blocks[i][0] - player[2] + 1) & player[0] < (blocks[i][0] + 40 - 1) &
							player[1] >= (blocks[i][1] + 39.7) & player[1] < (blocks[i][1] + 41.3)) {
							noJump = true;
						}
						
						for (var j = 0; j < seeds.length; j ++) {
							if (seeds[j][0] > blocks[i][0] && seeds[j][0] < blocks[i][0] + 40 && seeds[j][1] > blocks[i][1] && seeds[j][1] < blocks[i][1] + 40)
							{ // COME BACK
								if (position[i][0]) // if at top
								{
									var validSpot = true;
									for (var a = 0; a < blocks.length; a ++) {
										if (blocks[a][0] === blocks[i][0]) {
											if (blocks[a][2] === 4 && blocks[i][1] === blocks[a][1] + 40 ||  blocks[a][2] === 2 && blocks[i][1] === blocks[a][1] + blocks[a][4] || blocks[a][2] === 5 && blocks[i][1] === blocks[a][1] + 40) {// tries to hit all cases of spikes
												validSpot = false;
											}
										}
									}
									if (validSpot && (trees === null || trees[0] !== blocks[i][0] || trees[1] !== blocks[i][1])) {
										if (trees !== null) {
											genExplosion(trees[0] + 20, trees[1] - 55, 1.5, color(100, 230, 100), 3);
											genExplosion(trees[0] + 20, trees[1] - 35, 1.5, color(100, 230, 100), 3);
											genExplosion(trees[0] + 20, trees[1] - 15, 1.5, color(100, 230, 100), 3);
										}
										trees = [blocks[i][0], blocks[i][1], 250];
									} else if (trees !== null && trees[0] === blocks[i][0] && trees[1] === blocks[i][1]) {
										trees[2] = 200;
									}
								}
								seeds.splice(j, 1);
								j--;
							}
						}

					} else if (blocks[i][2] === 2) { // triangle spike

						if ((player[0] + player[2]) > blocks[i][0] + blocks[i][3] / 2 - (player[1] + player[3] - blocks[i][1]) * (blocks[i][3] / 2) / blocks[i][4] &
							player[1] < blocks[i][1] + blocks[i][4] &
							player[0] < blocks[i][0] + blocks[i][3] / 2 + (player[1] + player[3] - blocks[i][1]) * (blocks[i][3] / 2) / blocks[i][4]) {
							if (player[0] > blocks[i][0] - player[2] && player[0] < blocks[i][0] + blocks[i][3]) {
								death(20);
							}
						}

					} else if (blocks[i][2] === 4) { // tiny spike layer

						if (player[0] > blocks[i][0] - player[2] && player[0] < blocks[i][0] + 40 &&
							player[1] > blocks[i][1] + 30 - player[3] && player[1] < blocks[i][1] + 40) {
							death(15);
						}

					} else if (blocks[i][2] === 6) { // moving platform
						
						if (player[5] >= 0 & player[0] > (blocks[i][0] - player[2]) & player[0] < (blocks[i][0] + 40) &
							player[1] + player[3] <= blocks[i][1] + 2 & player[1] >= (blocks[i][1] - player[3] - Math.abs(player[5])) && player[5] > 0) {
							
							player[7] = false;
							player[1] = blocks[i][1] - player[3] + 0.01;
							player[5] = 0;
							player[10] = false;
							
						}
					}
				}

				// now only the player-made fragile block
				if (blocks[i][2] === 3) {
					if (millis() - blocks[i][3] > 3200) {
						genExplosion(blocks[i][0] + 20, blocks[i][1] + 20, 2, color(124, 83, 41), 20);
						blocks.splice(i, 1);
						i--;
						continue;
					}
				}
				if (blocks[i][2] === 6) {
					// vertical movement
					if (blocks[i][7]) {
						if (blocks[i][1] > blocks[i][5] && blocks[i][6] > 0) {
							blocks[i][6] *= -1;
						}
						if (blocks[i][1] < blocks[i][4] && blocks[i][6] < 0) {
							blocks[i][6] *= -1;
						}
					} else { // horizontal movement
						if (blocks[i][0] > blocks[i][5] && blocks[i][6] > 0) {
							blocks[i][6] *= -1;
						}
						if (blocks[i][0] < blocks[i][4] && blocks[i][6] < 0) {
							blocks[i][6] *= -1;
						}
					}
					if (flips[blocks[i][3]][2]) {
						blocks[i][blocks[i][7] ? 1 : 0] += blocks[i][6];
					}
				}

			}
			if (playing) {

				var upVel = -5.5;

				//controls
				if (keys[UP] & !player[7] & player[6] & !noJump) {

					player[5] = upVel;
					player[10] = true;
					ran = false;

				} else if (keys[DOWN] & player[7]) {

					player[5] = 12;

				}

				if (keys[UP] & player[6]) {
					upTime++;
				} else {
					upTime = 0;
				}

				if (player[5] === (upVel + 0.31) && upTime < 10 && upTime !== 0) {
					player[5] = upVel;
				}

				//movements are not sudden!
				if (keys[LEFT] & !keys[RIGHT]) {

					player[4] -= 0.15;

				} else if (keys[RIGHT] & !keys[LEFT]) {

					player[4] += 0.15;

				} else if (abs(player[4]) > 0.01) { //doesnt slice for inf

					player[4] /= 1.1;

				} else {

					player[4] = 0; //resets

				}

			}

			//constraint on horizontal movement
			player[4] = constrain(player[4], -3, 3);

			if (playing) {

				//applies gravity!!!
				player[5] += 0.31;

			}

			if (player[0] > -cameraAim[0] - 50 & player[0] < -cameraAim[0] + 650 & playing) {

				//moves player
				player[0] += player[4];
				player[1] += player[5];

			}

			//constrains player to be on the screen
			player[0] = constrain(player[0], 0, 40 - player[2] + far);

			//if player fell off
			if (player[1] > 1200) {

				death(health); // death and remove all health points
				page = "death";

			}

			//if he's on the edge
			if (player[0] === 0 | player[0] === (600 - player[2])) {

				player[4] = 0; //no x movement

			}

			// hit a door
			if (player[0] > (door[0]) & player[0] < (door[0] + 40 - player[2]) & player[1] > (door[1] - 10) & player[1] < (door[1] + 45 - player[3])) {

				if (levelStar > starRecord[worldNum][levelNum]) {
					starRecord[worldNum][levelNum] = levelStar;
				}

				first = true;
				levelFirst = true;
				
				levelNum = (levelNum + 1) % maps[worldNum].length;
				unlocked[worldNum][levelNum] = true;

				starDisplay = [0, 0, 0];

				if (levelNum === 0) {

					page = "levels";

				}
				page = "levels";

				while (clouds.length > 0) {

					clouds.pop();

				}

				levelTransition = 255;

			}

			//draws the door
			drawDoor(door[0], door[1]);

			if (player[4] > 0) {

				flip = false;

			}
			if (player[4] < 0) {

				flip = true;

			}
			
			//draws blocks
			for (var i in blocks) {

				// sets position (if its at the top, bottom, etc)
				if (i < position.length) {
					top = position[i][0];
					bottom = position[i][1];
					left = position[i][2];
					right = position[i][3];
				}

				//if the block is within the y translate
				if (blocks[i][1] > -cameraAim[1] - 50 & blocks[i][1] < -cameraAim[1] + 450 & blocks[i][0] > -cameraAim[0] - 50 & blocks[i][0] < -cameraAim[0] + 650) {

					switch (blocks[i][2]) {
						case 1:
							//draws a more complex block
							drawBlock(blocks[i][0], blocks[i][1], i);
							break;
						case 2:
							fill(61, 61, 61);
							noStroke();
							triangle(blocks[i][0], blocks[i][1] + blocks[i][4], blocks[i][0] + blocks[i][3] / 2, blocks[i][1], blocks[i][0] + blocks[i][3], blocks[i][1] + blocks[i][4]);
							fill(56, 56, 56);
							triangle(blocks[i][0], blocks[i][1] + blocks[i][4], blocks[i][0] + blocks[i][3] / 2, blocks[i][1], blocks[i][0] + blocks[i][3] / 2, blocks[i][1] + blocks[i][4]);
							break;
						case 3:
							var maxShake = 100;
							var divShake = maxShake / 3;
							var shakeX = constrain(maxShake - blocks[i][3], 0, maxShake) * random(-1, 1) / divShake;
							var shakeY = constrain(maxShake - blocks[i][3], 0, maxShake) * random(-1, 1) / divShake;
							image(fragileBlock, blocks[i][0] + shakeX, blocks[i][1] + shakeY);
							break;
						case 4:
							image(lowSpike, blocks[i][0], blocks[i][1] + 30);
							break;
						case 5:
							drawCharacter (blocks[i][0], blocks[i][1], blocks[i][6], blocks[i][7], blocks[i][8], blocks[i][9], blocks[i][10], blocks[i][11], blocks[i][12], blocks[i][13], blocks[i][4], ! blocks[i][14]);
							break;
						case 6:
							/*
							strokeWeight(3);
							stroke(127);
							// [x,y,6,ID,bound1,bound2,vel,vert?]
							if (blocks[i][7]) {
								line (blocks[i][0] + 17, blocks[i][4], blocks[i][0] + 17, blocks[i][5]);
								line (blocks[i][0] + 23, blocks[i][4], blocks[i][0] + 23, blocks[i][5]);
								line (blocks[i][0] + 17, blocks[i][4], blocks[i][0] + 23, blocks[i][4]);
								line (blocks[i][0] + 17, blocks[i][5], blocks[i][0] + 23, blocks[i][5]);
								noStroke();
								fill (127);
								ellipse(blocks[i][0] + 20, blocks[i][4], 8, 8);
								ellipse(blocks[i][0] + 20, blocks[i][5], 8, 8);
							} else {
								line (blocks[i][4], blocks[i][1] + 20, blocks[i][5], blocks[i][1] + 20);
							}
							*/
							noStroke();
							strokeWeight(0);
							// moving platform
							pushMatrix();
							translate(blocks[i][0], blocks[i][1]);
							fill(24, 38, 38);
							rect(0, 0, 40, 20);

							fill(84, 112, 112);
							beginShape();
							vertex(0, 0);
							vertex(40, 0);
							vertex(30, 10);
							vertex(10, 10);
							endShape();

							fill(53, 77, 77);
							beginShape();
							vertex(0, 20);
							vertex(40, 20);
							vertex(30, 10);
							vertex(10, 10);
							endShape();
							popMatrix();
							
							noStroke();
							strokeWeight(0);
							break;
						default:
							fill(255, 0, 0);
							rect(blocks[i][0], blocks[i][1], 40, 40);
							break;
					}

				}

			}
			
			for (var i in flips) {
				var inRange = player[0] + player[2] >= flips[i][0] && player[0] <= flips[i][0] + 40 && player[1] + player[3] >= flips[i][1] & player[1] <= flips[i][1] + 40;
				if (inRange) {
					fill(10);
					textSize(10);
					textAlign(CENTER, CENTER);
					textFont(createFont("Century Gothic Bold"));
					text("[SPACE]", flips[i][0] + 52, flips[i][1] + 30);
				}
				if (keys[32] && inRange) {
					flips[i][2] = true;
				} else {
					flips[i][2] = false;
				}
				pushMatrix();
				
				translate(flips[i][0] + 8, flips[i][1] + 16);
				scale(0.6);
				fill(161, 81, 2);
				beginShape();
				vertex(0, 40);
				vertex(40, 40);
				vertex(33, 32);
				vertex(7, 32);
				endShape();

				var pos = flips[i][2] ? -9 : 9;

				fill(61, 41, 10);
				beginShape();
				vertex(17, 32);
				vertex(23, 32);
				vertex(23 + pos, 12);
				vertex(17 + pos, 12);
				endShape();

				ellipse(20 + pos, 12, 12, 12);
				
				popMatrix();
			}
			
			for (var i = 0; i < seeds.length; i ++) {
				seeds[i][3] += 0.31;
				seeds[i][0] += seeds[i][2];
				seeds[i][1] += seeds[i][3];
				
				noStroke();
				fill(139,69,19);
				ellipse(seeds[i][0], seeds[i][1], 10, 10);
				
				if (seeds[i][1] > 420) {
					seeds.splice(i, 1);
					i --;
				}
			}
			if (trees !== null) {
				// draw the tree
				pushMatrix();
				translate(trees[0], trees[1] - 70);
				scale(0.2);
				noStroke();
				fill(102, 60, 28);
				rect (80, 250, 40, 100);
				fill (91, 175, 98);
				rect(0, 0, 200, 310, 40);
				fill (78, 156, 95);
				rect(0, 0, 100, 310, 40);
				rect(50, 0, 50, 310);
				popMatrix();

				var x = trees[0];
				var y = trees[1] - 70;
				if (player[5] >= 0 & player[0] > (x - player[2]) & player[0] < (x + 40) &
					player[1] + player[3] <= y + 2 & player[1] >= (y - player[3] - Math.abs(player[5])) && player[5] > 0) {

					player[7] = false;
					player[1] = y - player[3] + 0.01;
					player[5] = -8;
					player[10] = false;

				}				

				// continue time, check if tree is dead
				trees[2] --;
				if (trees[2] <= 0) {
					genExplosion(trees[0] + 20, trees[1] - 55, 1.5, color(100, 230, 100), 3);
					genExplosion(trees[0] + 20, trees[1] - 35, 1.5, color(100, 230, 100), 3);
					genExplosion(trees[0] + 20, trees[1] - 15, 1.5, color(100, 230, 100), 3);
					trees = null;
				}
			}
			
			for (var i in stars) {

				pushMatrix();
				translate(stars[i][0] + 20, stars[i][1] + 20);
				rot(frameCount * 2);
				drawStar(0, 0, stars[i][2], starColor);
				popMatrix();

				var x = stars[i][0] + 20;
				var y = stars[i][1] + 20;

				if (stars[i][2] <= 13) {

					stars[i][2] += (13.15 - stars[i][2]) / 10;

				}

				if (player[0] >= (x - player[2] - 13) & player[0] <= (x + 13) & player[1] >= (y - player[3] - 13) & player[1] <= (y + 13)) {

					levelStar++;

					// x, y, power, color, how many to make
					genExplosion(x, y, 2, color(220, 150, 40, 200), 8);

					stars.splice(i, 1);

				}

			}

			for (var i in explosion) {

				pushMatrix();

				translate(explosion[i][0], explosion[i][1]);
				rotate(explosion[i][4]);
				fill(color(explosion[i][5], explosion[i][6]));
				rect(-1.5, -3.5, 3, 7);

				popMatrix();

				explosion[i][4] += 0.2;

				explosion[i][3] += 0.31;

				explosion[i][0] += explosion[i][2];
				explosion[i][1] += explosion[i][3];

				if (explosion[i][6] > 0) {
					explosion[i][6] -= 3;
					if (explosion[i][1] > 420) {
						explosion.splice(i, 1);
					}
				} else {
					explosion.splice(i, 1);
				}
			}

			noStroke();
			// draw the people speech bubbles
			for (var i in blocks) {
				if (blocks[i][2] === 5) { // non-player character
					// x, y, type, which person, if talking, current speech num
					// blocks.push([x,y,5,parseInt(item), false,0]);
					// if not done talking
					if (blocks[i][0] > player[0] + player[2]) {
						blocks[i][14] = false;
					}
					if (blocks[i][0] < player[0] - 20) {
						blocks[i][14] = true;
					}
					if (blocks[i][5] !== -1) {
						player[0] = constrain(player[0], 0, blocks[i][0] - player[2] - 20);
						if (player[0] === blocks[i][0] - player[2] - 20) {
							player[4] = 0;
						}
						if (player[0] > blocks[i][0] - player[2] - 60) {
							// world 1-1, first person!
							if (worldNum === 0 && levelNum === 0 && blocks[i][3] === 1) {
								// says different things based on how long this person has been talking for
								if (blocks[i][5] <= 3) {
									var dialogue = "";
									var jim = false;
									if (blocks[i][5] === 0) {
										blocks[i][4] = false;
										// dialogue = "Hi, I'm " + (male ? "Jim" : "Jill") + ". I think I'm lost, but I'm on a mission. Where am I? What is this place?";
										dialogue = "Woah, what is this place? I'm " + (male ? "Jim" : "Jill") + " by the way.";
										jim = true;
									} else if (blocks[i][5] === 1) {
										blocks[i][4] = true;
										dialogue = "Hi " + (male ? "Jim" : "Jill") + ". You've found the World of Engineers, a stronghold for curious minds! I'm an engineer, and so are all the people here.";
									} else if (blocks[i][5] === 2) {
										blocks[i][4] = false;
										dialogue = "Wow! I want to learn about engineering. Where can I go?";
										jim = true;
									} else {
										blocks[i][4] = true;
										dialogue = "Engineers are people who solve problems through their creativity. You'll meet many types of engineers and hear their stories. So be curious, explore!";
									}
									//speech bubble
									pushMatrix();
									fill(245);
									if (jim) {
										translate(blocks[i][0] - 250, blocks[i][1] - 90);
									} else {
										translate(blocks[i][0] + 10, blocks[i][1] - 90);
									}
									rect(0, 0, 240, 80, 20);
									beginShape();
									if (jim) {
										vertex(178, 78);
										vertex(166, 78);
										vertex(186, 95);
									} else {
										vertex(32, 78);
										vertex(44, 78);
										vertex(24, 95);
									}
									endShape(CLOSE);
									popMatrix();
									fill(10);
									textSize(11);
									textAlign(CENTER, CENTER);
									textFont(createFont("Century Gothic Bold"));
									text(dialogue, blocks[i][0] + (jim ? -235 : 25), blocks[i][1] - 87.5, 210, 70);
									text("Press [ENTER]", blocks[i][0] + (jim ? -175 : 170), blocks[i][1]);
								} else {
									blocks[i][5] = -1;
								}
								// when done
								// blocks[i][5] = -1;
							} else {
								blocks[i][4] = true;
								if (blocks[i][5] >= peopleSpeech[worldNum][levelNum][blocks[i][3] - 1].length) {
									blocks[i][5] = -1; // signal that it's done talking
								} else {
									//speech bubble
									pushMatrix();
									translate(blocks[i][0] + 10, blocks[i][1] - 90);
									fill(245);
									rect(0, 0, 240, 80, 20);
									beginShape();
									vertex(32, 78);
									vertex(44, 78);
									vertex(24, 95);
									endShape(CLOSE);
									popMatrix();
									fill(10);
									textSize(11);
									textAlign(CENTER, CENTER);
									textFont(createFont("Century Gothic Bold"));
									text(peopleSpeech[worldNum][levelNum][blocks[i][3] - 1][blocks[i][5]], blocks[i][0] + 25, blocks[i][1] - 87.5, 210, 70);
									text("Press [ENTER]", blocks[i][0] + 170, blocks[i][1]);
								}
							}
						}
					}
					if (blocks[i][4] && blocks[i][5] === -1 || player[0] <= blocks[i][0] - player[2] - 60) { // if mouth is still moving
						blocks[i][4] = false;
					}
				}
			}
			onDoor = false;
			
			if (jumpTime < 10 && player[7]) {
				jumpTime ++;
			} else if (!player[7]) {
				jumpTime = 0;
			}

			if (deathCount % 20 < 10 && health > 0) {
				//draws the player
				drawPlayer(player[0], player[1] + 2, Math.abs(player[4]) > 0.1, flip, jumpTime, starRecord[2][5] > 0);
			}

			popMatrix();

			noStroke();

			fill(255, 255, 255, 200);
			// home
			rect(560, 10, 30, 30);
			// level select
			rect(520, 10, 30, 30);
			// restart
			rect(480, 10, 30, 30);

			// details
			fill(27, 125, 0);

			// level select squares
			pushMatrix();
			translate(520, 10);
			rect(5, 5, 7.5, 7.5);
			rect(17, 17, 7.5, 7.5);
			rect(17, 5, 7.5, 7.5);
			rect(5, 17, 7.5, 7.5);
			popMatrix();

			pushMatrix();
			translate(560, 10);
			rect(9, 14, 4, 10);
			rect(17, 14, 4, 10);
			rect(9, 14, 12, 6);
			triangle(15, 6, 5, 16, 25, 16);
			popMatrix();

			// restart swirl
			stroke(27, 125, 0);
			strokeWeight(4);

			pushMatrix();
			translate(480, 10);
			line(22, 6, 8, 6);
			line(8, 6, 8, 14);
			line(5, 13, 8, 16);
			line(11, 13, 8, 16);

			line(8, 24, 22, 24);
			line(22, 24, 22, 16);
			line(22, 14, 19, 17);
			line(22, 14, 25, 17);
			popMatrix();

			noStroke();

			// star background
			fill(0);
			rect(8, 10, 90, 30);

			// draws three stars in the top right
			for (var i = 0; i < 3; i++) {

				if (i < levelStar) {

					if (starDisplay[i] < 10) {

						starDisplay[i] += (10.15 - starDisplay[i]) / 15;

					} else {

						starDisplay[i] = 10;

					}

				} else {

					if (starDisplay[i] > 0) {

						starDisplay[i] -= (starDisplay[i] + 0.15) / 15;

					} else {

						starDisplay[i] = 0;

					}

				}

				pushMatrix();

				translate(26 + 27 * i, 26);
				rotate(starDisplay[i] * PI / 5);
				drawStar(0, 0, 11, color(222 - starDisplay[i] * 2.5, 226 - starDisplay[i] * 6.5, 235 - starDisplay[i] * 20.6, 200 + starDisplay[i] * 5.5));

				popMatrix();

			}

			var percent = constrain(health / maxHealth, 0, 1);
			fill(100);
			rect(110, 10, 358, 30);
			fill(510 * (1 - percent), 510 * percent, 0);
			rect(113, 13, 352 * percent, 24);

			if (health <= 0) {
				health -= 0.01;
				playing = false;
				if (health < -2) {
					page = "death";
					levelTransition = 150;
					transitionColor = color(255, 0, 0);
				}
			}

			popMatrix();

		} else if (page === "death") {

		pushMatrix();
		scale(sc);
		textFont(createFont("Century Gothic Bold"));
		background(0, 0, 0);
		fill(255, 255, 255);
		textSize(40);
		textAlign(CENTER);
		text("GAME OVER", 300, 100);

		if (rand === -1) {
			if (random(4) < 1) {
				message = deathMessage[0][floor(random(deathMessage[0].length))]; // generic message
			} else {
				message = deathMessage[worldNum + 1][floor(random(deathMessage[worldNum + 1].length))]; // world specific message
			}
			rand = 0;
		}
		textFont(createFont("Century Gothic"));
		textSize(20);
		fill(255);
		text("Did you know?", 300, 200);
		textSize(15);
		text(message, 100, 220, 400, 100);

		fill(255, 255, 255);
		rect(360, 310, 60, 60);
		rect(270, 310, 60, 60);
		rect(180, 310, 60, 60);

		// buttons
		fill(0, 0, 0);

		// level select squares
		pushMatrix();
		translate(270, 310);
		scale(2);
		rect(5, 5, 7.5, 7.5);
		rect(17, 17, 7.5, 7.5);
		rect(17, 5, 7.5, 7.5);
		rect(5, 17, 7.5, 7.5);
		popMatrix();

		// home
		pushMatrix();
		translate(360, 310);
		scale(2);
		rect(9, 14, 4, 10);
		rect(17, 14, 4, 10);
		rect(9, 14, 12, 6);
		triangle(15, 6, 5, 16, 25, 16);
		popMatrix();

		// restart swirl
		stroke(0, 0, 0);
		strokeWeight(4);

		pushMatrix();
		translate(180, 310);
		scale(2);
		line(22, 6, 8, 6);
		line(8, 6, 8, 14);
		line(5, 13, 8, 16);
		line(11, 13, 8, 16);

		line(8, 24, 22, 24);
		line(22, 24, 22, 16);
		line(22, 14, 19, 17);
		line(22, 14, 25, 17);
		popMatrix();

		noStroke();

		popMatrix();

	}

	if (levelTransition > 0) {

		//deals with the screen change fade in
		noStroke();

		fill(color(transitionColor, levelTransition));
		rect(0, 0, width, height);
		levelTransition -= 10;

	} else {
		levelTransition = 0;
		transitionColor = color(0, 0, 0);
	}

	if (frameCount % 20 === 0) {

		t = (1000 / (millis() - pmillis)).toFixed(1);

	}
	fill(0, 0, 0);
	textSize(15);
	textAlign(LEFT);
	// text(t, 20, 15); //uncomment if you want frameRate to appear
	pmillis = millis();
};
