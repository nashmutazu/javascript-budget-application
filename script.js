var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calculatePercentage = function(totalInccome){
        if (totalInccome> 0){
            this.percentage = Math.round((this.value / totalInccome)* 100)  
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    var Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    var calculateTotal = function(type){
        var sum = 0;

        data.allTransactions[type].forEach(function(cur){
            sum += cur.value
        })
        data.total[type] = sum
    }

    var data = {
        allTransactions: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID

            // creating a new id position in the allTransactions array 
            if (data.allTransactions[type].length > 0) {
                ID = data.allTransactions[type][data.allTransactions[type].length - 1].id + 1;
            } else {
                ID = 0
            }
            // creating a new item to store in array 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Pushin the data structure 
            data.allTransactions[type].push(newItem)

            // Returning the new element 
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index

            ids = data.allTransactions[type].map(function(current){
                return current
            })

            index = ids.indexOf(id)

            if (index !== -1){
                data.allTransactions[type].splice(index, 1)
            }

        },

        calculateBudget: function(){
        
            // 1. Calculate total income and expenses 
            calculateTotal('exp')
            calculateTotal('inc')
            // 2. Calculate the budget: income - expenses 
            data.budget = data.total.inc - data.total.exp
            // 3. Calculate the percentage of income that we spent 
            if (data.total.inc > 0){
                data.percentage = Math.round(( data.total.exp / data.total.inc ) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentage: function(){
            data.allTransactions.exp.forEach(function(cur){
                cur.calculatePercentage(data.total.inc)
            })
        },

        getPercentage: function(){
            var allPerc = data.allTransactions.exp.map(function(cur){
                return cur.getPercentage()
            })

            return allPerc
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        }
    }
})()

var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, inte, deci, type

        num = Math.abs(num)
        num = num.toFixed(2)

        numSplit = num.split('.')

        inte = numSplit[0]
        if (inte.length > 3 ){
            inte = inte.substr(0, inte.length - 3) + ',' + inte.substr(inte.length - 3, 3)
        }
        deci = numSplit[1]

        return (type === 'exp' ? '-': '+') + ' £'+inte + '.' + deci
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.descriptionType).value,
                value: parseFloat(document.querySelector(DOMstrings.valueType).value)
            }
        },

        addListItem: function (obj, type) {
            var html, element, newHtml

            // Create HTML string with placeholder text 
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }

            // Replace the placeholder text with some actual data 

            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            // Insert the HTML onto the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearField: function(){
            var fields, fieldsArr

            fields = document.querySelectorAll(DOMstrings.descriptionType +', '+ DOMstrings.valueType)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            })

            fieldsArr[0].focus()
        },

        displayBudget: function(obj){
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            // display the budget, total income, total expense and percentage 
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp')
            

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = 0 + "%"
            }
        },

        displayPerecentages: function(percentage){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

            nodeListForEach(fields, function(current, index){
                if (percentage[index] >0){
                    current.textContent = percentage[index] + '%'
                } else {
                    current.textContent = '----'
                }

            })
        },

        displayMonth: function(){
            var now, year, month

            now = new Date()
            
            year = now.getFullYear();
            month = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = month[now.getMonth()]
            day = now.getDay()

            document.querySelector(DOMstrings.dateLabel).textContent =  month + ' ' + year
        },

        changeType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+ DOMstrings.descriptionType + ',' + DOMstrings.valueType)

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        getDOMstrings: function () {
            return DOMstrings
        }
    }
})()

var controller = (function (budgetContrl, UIContrl) {

    var setupEventListeners = function () {
        var _DOM = UIController.getDOMstrings()
        document.querySelector(_DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        }),

        document.querySelector(_DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(_DOM.inputType).addEventListener('change', UIContrl.changeType)
    }

    var updateBudget = function(){
        var budget

        // 1. Calculate the budget 
        budgetContrl.calculateBudget()
        // 2. Return the budget 
        budget = budgetContrl.getBudget()
        // 3. Display the budget on the UI 
        UIContrl.displayBudget(budget)
    }

    var updatePercentages = function(){
        var percentages

        // 1. Calculate percentages 
        budgetContrl.calculatePercentage()
        // 2. Read percentages 
        percentages = budgetContrl.getPercentage()

        // 3. Update the UI with the new percentages 
        UIContrl.displayPerecentages(percentages)
    }

    var ctrlAddItem = function () {
        var input, newItem
        // 1. Get the filled input data 
        input = UIContrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetContrl.addItem(input.type, input.description, input.value)

            // 3. Add the item to the UI
            UIContrl.addListItem(newItem, input.type)

            // 4. Clear fields
            UIContrl.clearField()

            // 5. Calculate and update budget
            updateBudget()

            // 6. Calculate and update percentages 
            updatePercentages()
        }

    }


    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id 

        if (itemID){
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            // 1. Delete item from the data structure 
            budgetContrl.deleteItem(type, ID)
            // 2. Delete the item from the UI 
            UIContrl.deleteListItem(itemID)
            // 3. Update and show the new budget 
            updateBudget();
            // 4. Calculate and update percentages 
            updatePercentages()
        }
    }

    return {
        init: function () {
            console.log('Application has started')
            UIContrl.displayMonth()
            UIContrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners()
            
        }

    }
})(budgetController, UIController)

controller.init()