class GameManager{
    constructor(iManager){
        this.incomeManager = iManager;

        this.paused = false;
        this.incomeLoop;
    }

    init(){
        console.log("Loading...");                        
        this.showInstructions();
        this.setupIncomeLoop();
        console.log("Loaded!");                        
    }

    setupIncomeLoop(){
        this.incomeLoop = window.setInterval(function(){    
            if(!gameManager.paused){                   
                console.log("Adding income");
                var mult = gameManager.incomeManager.upgrades[1];
                var income = 0;

                for (const i in gameManager.incomeManager.turbines) {
                    var turbine = gameManager.incomeManager.turbines[i];

                    if (turbine.qty > 0) {
                        income += turbine.wattage * turbine.qty * mult.getStat();                                       
                    }                        
                }

                gameManager.incomeManager.changeBanked(income);
                if(income > 0){
                    pulse("income", "success-pulse")   
                }

            } else{
                console.log("income paused");
            }
        }, 10000);
    }

    showInstructions(){
        document.getElementById('instructionsContainer').style.display = "block";
    }

    hideInstructions(){
        document.getElementById('instructionsContainer').style.display = "none";
    }

    clickIncome(){                    
        var perClick = gameManager.incomeManager.upgrades[0];
        var mult = gameManager.incomeManager.upgrades[1];

        this.incomeManager.changeBanked(perClick.getStat() * mult.getStat());
    }
}

class IncomeManager{
    constructor(banked, income){
        this.banked = banked;
        this.income = income;  

        this.upgrades = [
            new Upgrade(function(level){return Math.pow(38, (level - 1) / 15.6) * 2000;}, function(level){return  Math.pow(38, (1.3 * level - 1) /15.6) * 10000;}, "watt"),
            new Upgrade(function(level){return Math.pow(55, (level - 1 ) / 69);}, function(level){return  Math.pow(55, (1.58 * level - 1) / 69) * 20000;}, "efficiency"),
            new Upgrade(function(level){return Math.pow(63.7, (level - 1) / 6) * 50000;}, function(level){return  Math.pow(63.7, (0.5 * level - 1) / 6) * 50000;}, "capacity")
        ]

        this.turbines = [
            new Turbine("ON", 2300000, 10000000, "m2"),
            new Turbine("ON", 3600000, 15000000, "m3"),
            new Turbine("ON", 6000000, 30000000, "cypress6"),
            new Turbine("OFF", 6000000, 40000000, "halide150"),
            new Turbine("OFF", 14000000, 80000000, "halideX")
        ]
    }
        
    changeBanked(qty){
        console.log("qty + this.banked =" + (qty + this.banked));
        console.log(this.upgrades[2].getStat());

        if (qty + this.banked < this.upgrades[2].getStat()){
            this.banked += qty;
            console.log("banked: " + this.banked);
            document.getElementById("bank").textContent = formatMetricPower(this.banked) + "W";

            if(qty > 0){
                pulse("bank", "success-pulse")   

            }else if(qty < 0){
                pulse("bank", "error-pulse")   
            }  

        }else{
            pulse("bank", "error-pulse")  
            alert("You need to upgrade your battery capacity!")                        
        }
    }

    changeIncome(qty){
        this.income += qty;
        document.getElementById("income").textContent = "+" + formatMetricPower(this.income) + "W";
    }   
    
    buyTurbine(index){
        this.turbines[index].buy();
    }

    buyUpgrade(index){
        this.upgrades[index].buy();
    }
}

class Upgrade{
    constructor(statFunc, priceFunc, elemName){                                               
        this.statFunc = statFunc;
        this.priceFunc = priceFunc;
        this.elemName = elemName; 

        this.level = 1;

        document.getElementById(this.elemName + "Price").textContent = formatMetricPower(this.priceFunc(this.level));
        document.getElementById(this.elemName + "Stat").textContent = formatMetricPower(this.statFunc(this.level));
    }

    buy(){
        var incomeManager = gameManager.incomeManager;
        var price = this.priceFunc(this.level);

        if (incomeManager.banked >= price){
            incomeManager.changeBanked(-(price));
            this.level += 1;

            document.getElementById(this.elemName + "Level").textContent = this.level;
            document.getElementById(this.elemName + "Price").textContent = formatMetricPower(this.priceFunc(this.level));
            document.getElementById(this.elemName + "Stat").textContent = formatMetricPower(this.statFunc(this.level));
        }
        else{
            pulse("bank", "caution-pulse")                                                
        }
    }

    getStat(){
        return this.statFunc(this.level);
    }

}

class Turbine{
    constructor(type, wattage, price, elemName){
        this.type = type;
        this.wattage = wattage;
        this.price = price;
        this.elemName = elemName;
        this.qty = 0;

        document.getElementById(this.elemName + "Price").textContent = formatMetricPower(this.price);
    }

    buy(){
        var incomeManager = gameManager.incomeManager;

        if (incomeManager.banked >= this.price){
            incomeManager.changeBanked(-(this.price));
            incomeManager.changeIncome(this.wattage);
            this.qty += 1;

            document.getElementById(this.elemName + "Qty").textContent = this.qty;
        }
        else{
            pulse("bank", "caution-pulse")                                                
        }
    }
}               

function formatMetricPower(n){
        var ranges = [
        { divider: 1e18 , suffix: 'E' },
        { divider: 1e15 , suffix: 'P' },
        { divider: 1e12 , suffix: 'T' },
        { divider: 1e9 , suffix: 'G' },
        { divider: 1e6 , suffix: 'M' },
        { divider: 1e3 , suffix: 'k' }
        ];

        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
            return (Math.round((n / ranges[i].divider)* 10) / 10).toString() + ranges[i].suffix;
            }
        }
        
        return (Math.round(n * 10) / 10).toString();                        
    }

function pulse(elem, pulseClass){
    document.getElementById(elem).classList.add(pulseClass);
    setTimeout(function(){
        document.getElementById(elem).classList.remove(pulseClass);
    }, 500);   
}