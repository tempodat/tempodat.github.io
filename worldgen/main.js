var canvas, ctx, screen;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = innerWidth - 6; canvas.height = innerHeight - 6;
    ctx = canvas.getContext('2d');
    screen = new Screen(canvas, ctx);

    mouseController.hook(canvas);
}

function tick() {
    update();
    render();

    window.requestAnimationFrame(tick);
}

function update() {

}

function render() {
    screen.draw(canvas, ctx);
}

function main() {
    init();
    tick();
}

main();
