Tile = {
    color: function(tile) {
        switch(tile.type) {
            case 'water':
                if (tile.specificType == 'sea') {
                    return hsl(Math.min(187-tile.height*43/0.15,230), 70, Math.max(60+tile.height*30/0.15,30));
                }
                break;
            case 'sand':
                if (tile.specificType == 'beach') {
                    return '#D3B297';
                }
                break;
            case 'grass':
                return hsl(114, 50, 38 - (tile.height - 0.05) * 100)
            case 'rock':
                value = Math.min((tile.height-0.20)*200+75, 255);
                return rgb(value, value, value);
        }
        throw Error('Illegal tile type "'+tile.type+'"');
    }
}