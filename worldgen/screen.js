function Screen(canvas, ctx, position) {
    this.map = new PerlinMap(128);

    this.canvas = canvas;
    this.ctx = ctx;
    this.position = {x: canvas.width / 2 - this.map.size*3, y: canvas.height / 2 - this.map.size*3, size: 6};

    this.mapToScreen = function(x, y) {
        return {x: this.position.x + x * this.position.size, y: this.position.y + y * this.position.size}
    }

    this.screenToMap = function(x, y) {
        return {x: (x - this.position.x) / this.position.size, y: (y - this.position.y) / this.position.size}
    }

    this.zoom = function(center, size) {
        let factor = size / this.position.size;
        this.position = {x: (this.position.x - center.x) * factor + center.x, y: (this.position.y - center.y) * factor + center.y, size: size};
    }

    this.draw = function () {
        this.map.draw(canvas, ctx, this);
    }
}