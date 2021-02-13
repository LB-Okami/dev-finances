const modal = {
    open() {
        // Abrir modal
        // Adicionar a classe active ao modal
        document
        .querySelector('.modal-overlay')
        .classList.add('active')
    }, 
    close() {
        // fechar o modal
        // remover a classe active do modal
        document
        .querySelector('.modal-overlay')
        .classList.remove('active')
    }
} 
 
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances', JSON.stringify(transactions))
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // Pegar todas as transações
        // para cada transação, se ela for > que 0 verificar se a mesma é maior que zero
        // se for maior, somar a uma variável e retornar a variável
        let income = 0 

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },
    
    expenses() {
        let expense = 0 

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
        
    },
    
    total() {
        // entrada - saída
        let total = Transaction.incomes() + Transaction.expenses()

        return total
        
    }
}

// Transferir as transações do JS e passar para o HTML

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index) {     
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        
        const amount = Utils.formatCurrency(transaction.amount) 

        const html = `
        
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML =  Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

// Dark theme toggle

const dark = document.getElementById('chk')

dark.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme')
    console.log('cheguei')
})


//for(let i = 0; i < transactions.length; i++) {
//    console.log()
// }

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '') // /\D/g pega tudo que não for número e muda para ''

        value= Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'

        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value, 
            amount: Form.amount.value, 
            date: Form.date.value,
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount, 
            date
        }
    },

    validadeFields() {
        const { description, amount, date } = Form.getValues()
        
        if(
            description.trim() === '' || 
            amount.trim() === '' || 
            date.trim() === '') {
                throw new Error('Por favor, preencha todos os campos.')
        }
    },
 

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.validadeFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            modal.close()
            // Atualizar a aplicação 
            App.reload()


        } catch (error) {
            alert(error.message)
        }
        
        
    }   
}


const App = {
    init() {
       Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
