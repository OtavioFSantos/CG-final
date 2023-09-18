const ctx = document.getElementById('hud').getContext('2d')

const crosshair = new Image();

ctx.font = "40px Nunito";
ctx.fillStyle = "white";

let startTime = null;
let secondsElapsed = 0;
let showLoseMessage = false;
let loseTimerStart = null;

function updateHUD() {
    crosshair.src = './images/crosshair.png';
    var ammoCounter = `${ammo}`

    ctx.fillText("Ammo: ", 1150, 670);
    crosshair.onload = () => {
        ctx.clearRect(0, 0, 1920, 1080);
        ctx.drawImage(crosshair, 660, 320, 50, 50);
    };
    ctx.fillText(ammoCounter, 1300, 670)
}

function run(time) {
    if (!startTime) {
        startTime = time;
    }
    if (ammo >= 0) {
        updateHUD();
        requestAnimationFrame(run);
    }
}

run(); 