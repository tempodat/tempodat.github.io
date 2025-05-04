mouseController = {
    wheel: function(e) {
        let center = {x: e.clientX, y: e.clientY};
        if (e.deltaY == 3 && screen.position.size > 1) {
            screen.zoom(center, screen.position.size - 1);
        } else if (e.deltaY == -3) {
            screen.zoom(center, screen.position.size + 1)
        }
    },

    hook: function(canvas) {
        canvas.addEventListener('wheel',function(e){
            mouseController.wheel(e);
            return false; 
        }, false);
    }
}