const ctx = document.getElementById('hud').getContext('2d')

const crosshair = new Image();

ctx.font = "40px Nunito";
ctx.fillStyle = "white";

function updateHUD() {
    crosshair.src = './images/crosshair.png';
    var ammoCounter = `${ammo}`

    ctx.fillText("Ammo: ", 1150, 670);
    crosshair.onload = () => {
        ctx.clearRect(0, 0, 1920, 1080);
        ctx.drawImage(crosshair, 660, 320, 40, 40);
    };
    ctx.fillText(ammoCounter, 1300, 670)
}

function run() {
    if (ammo >= 0) {
        updateHUD();
        requestAnimationFrame(run);
    }
}

run();