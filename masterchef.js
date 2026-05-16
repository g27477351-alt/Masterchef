// =======================
// MASTER CHEF MOD
// =======================

// MONEY
elements.money = {
    color: "#00ff00",
    behavior: behaviors.STURDYPOWDER,
    category: "economy",
    properties: { value: 1000 }
};

// FOODS
elements.burger = {color:"#8B4513", behavior:behaviors.STURDYPOWDER, category:"food"};
elements.fried_noodles = {color:"#c68642", behavior:behaviors.STURDYPOWDER, category:"food"};
elements.juice = {color:"#ff9933", behavior:behaviors.LIQUID, category:"food"};
elements.cake = {color:"#ffcccb", behavior:behaviors.STURDYPOWDER, category:"food"};

// BAD FOOD
elements.spoiled_food = {color:"#556b2f", behavior:behaviors.STURDYPOWDER};
elements.burnt_food = {color:"#111111", behavior:behaviors.STURDYPOWDER};

// CUSTOMER
elements.customer = {
    color: "#ffe0bd",
    behavior: behaviors.WALK,
    category: "life",
    properties: {
        order: null,
        satisfied: false,
        waitTime: 0,
        angry: false
    },

    tick: function(pixel) {

        let orders = ["burger","fried_noodles","juice","cake"];

        if (!pixel.order) {
            pixel.order = orders[Math.floor(Math.random()*orders.length)];
        }

        pixel.waitTime++;

        if (pixel.waitTime > 300) pixel.angry = true;
        if (pixel.waitTime > 600) {
            deletePixel(pixel.x, pixel.y);
            return;
        }

        let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for (let i=0;i<dirs.length;i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];

            if (!isEmpty(x,y,true)) {
                let other = pixelMap[x][y];

                if (other.element === pixel.order && !pixel.satisfied) {

                    deletePixel(x,y);

                    createPixel("money", pixel.x, pixel.y);

                    pixel.satisfied = true;
                }
            }
        }

        pixel.color = pixel.angry ? "#ff0000" : "#ffe0bd";
    }
};

// EMPLOYEE
elements.employee = {
    color: "#00aaff",
    behavior: behaviors.WALK,
    category: "life",

    properties: {
        currentOrder: null,
        paid: false,
        level: 1,
        speed: 1,
        progress: 0
    },

    tick: function(pixel) {

        let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        // get paid
        for (let i=0;i<dirs.length;i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];

            if (!isEmpty(x,y,true)) {
                let other = pixelMap[x][y];

                if (other.element === "money") {
                    deletePixel(x,y);
                    pixel.paid = true;
                }
            }
        }

        // take order
        if (pixel.paid && !pixel.currentOrder) {
            for (let i=0;i<dirs.length;i++) {
                let x = pixel.x + dirs[i][0];
                let y = pixel.y + dirs[i][1];

                if (!isEmpty(x,y,true)) {
                    let other = pixelMap[x][y];

                    if (other.element === "customer" && other.order) {
                        pixel.currentOrder = other.order;
                    }
                }
            }
        }

        // cook
        if (pixel.paid && pixel.currentOrder) {
            pixel.progress++;

            if (pixel.progress > 50) {
                for (let i=0;i<dirs.length;i++) {
                    let x = pixel.x + dirs[i][0];
                    let y = pixel.y + dirs[i][1];

                    if (isEmpty(x,y)) {
                        createPixel(pixel.currentOrder, x, y);
                        break;
                    }
                }
                pixel.progress = 0;
            }
        }

        // deliver
        for (let i=0;i<dirs.length;i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];

            if (!isEmpty(x,y,true)) {
                let other = pixelMap[x][y];

                if (other.element === "customer" && pixel.currentOrder) {

                    createPixel(pixel.currentOrder, other.x, other.y-1);

                    pixel.currentOrder = null;
                    pixel.paid = false;
                }
            }
        }
    }
};

// SPOIL SYSTEM
let foods = ["burger","fried_noodles","cake"];

foods.forEach(f => {
    elements[f].properties = {age:0};

    elements[f].tick = function(pixel) {
        pixel.age++;

        if (pixel.age > 500) {
            changePixel(pixel, "spoiled_food");
        }

        if (pixel.temp > 150) {
            changePixel(pixel, "burnt_food");
        }
    };
});