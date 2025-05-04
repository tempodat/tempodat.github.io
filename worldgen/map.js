function PerlinFrequency(frequency) {
    /// perlin noise generator, adapted from https://github.com/joeiddon/perlin

    this.frequency = frequency;
    this.gradients = {};

    this.rand_vect = function() {
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    };

    this.dot_prod_grid =function(x, y, vx, vy) {
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    };

    this.smootherstep = (x) => (6*x**5 - 15*x**4 + 10*x**3);

    this.interp = (x, a, b) => (a + this.smootherstep(x) * (b-a));

    this.seed = () => { this.gradients = {}; };

    this.get = function(x, y) {
        x = x * frequency; y = y * frequency;
        let xf = Math.floor(x);
        let yf = Math.floor(y);

        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        return this.interp(y-yf, xt, xb);
    };
}

function PerlinNoiseGenerator() {
    this.frequencies = [1, 2, 4, 8, 16];
    this.amplitudes = [0.5, 0.25, 0.125, 0.0625, 0.03];

    this.generators = [];
    for (const freq of this.frequencies) {
        this.generators.push(new PerlinFrequency(freq));
    };

    this.useed = Math.random();

    this.get = function(x, y) {
        value = 0;
        for (var i = 0; i < this.frequencies.length; i++) {
            value += this.amplitudes[i] * this.generators[i].get(x, y);
        }
        return value;
    };

    this.seed = function() {
        this.useed = Math.random();
        for (const generator of this.generators) {
            generator.seed();
        }
    };
}

function DummyNoiseGenerator() {
    this.get = (x, y) => (((x+y)*128)%2);
}

function PerlinMap(size) {
    this.map = {};
    this.size = size;

    this.noise = new PerlinNoiseGenerator();
    this.useed = this.noise.useed;

    this.process = function (x, y) {
        // get value from noise generator, -1
        let value = this.noise.get(x/this.size, y/this.size);
        // choose tile type from value, as heightmap
        if (value < -0.05) {
            return {type: 'water', specificType: 'sea', height: value};
        } else if (value < -0.02) {
            return {type: 'sand', specificType: 'beach'}
        } else if (value < 0.20) {
            return {type: 'grass', height: value}
        } else {
            return {type: 'rock', height: value}
        }
    }

    this.get = function (x, y) {
        // Anticipate map changes
        if (this.useed != this.noise.useed)
            this.map = {};
            this.useed = this.noise.useed;
        // Cache tile if not already cached
        if (this.map[[x,y]] == undefined)
            this.map[[x,y]] = this.process(x, y);
        // Fetch tile from cache
        return this.map[[x,y]];
    };

    this.draw = function(canvas, ctx, screen) {
        tLeft = Math.max(Math.floor(screen.screenToMap(0, 0).x), 0);
        tRight = Math.min(Math.ceil(screen.screenToMap(canvas.width, 0).x), this.size - 1);
        tTop = Math.max(Math.floor(screen.screenToMap(0, 0).y), 0);
        tBottom = Math.min(Math.ceil(screen.screenToMap(0, canvas.height).y), this.size - 1);

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    
        for (var tx = tLeft; tx <= tRight; tx++) {
            for (var ty = tTop; ty <= tBottom; ty++) {
                let color = Tile.color(this.get(tx, ty));
                ctx.fillStyle = color;
                let corner = screen.mapToScreen(tx, ty);
                ctx.fillRect(Math.floor(corner.x), Math.floor(corner.y), screen.position.size, screen.position.size);
            }
        }
    };

}