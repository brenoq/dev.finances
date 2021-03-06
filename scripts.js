const Modal = {
    amount: document.querySelector('input#amount'),
    // Código antigo

    // open(){
    //     //Abrir modal
    //     //Adicionar a class active ao modal
    //     document
    //         .querySelector('.modal-overlay')
    //         .classList
    //         .add('active');
    // },
    // close(){
    //     //Fechar Modal
    //     //Remover class active do modal
    //     document
    //         .querySelector('.modal-overlay')
    //         .classList
    //         .remove('active');
    // }

    change() {
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active');
        
        Form.clearFields();

        document
            .getElementById('snackbar')
            .classList
            .remove('show');

        Modal.check()
    },

    value() {
        const transactionType = document.getElementById('expense').checked;

        let convertAmount = Modal.amount.value.replace("-", "");

        if (transactionType) {
            Modal.amount.value = "-" + convertAmount;
        } else {
            Modal.amount.value = convertAmount;
        };
    },

    check() {
        let radio = document.getElementsByName('tipo');

        if (Modal.amount.value !== '') {
            radio.forEach(i => i.disabled = false);
        } else {
            radio.forEach(i => i.disabled = true)
        };

    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    },
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        app.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        app.reload();
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            };
        });

        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            };
        });

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" class="remove">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    },
};

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100;
        
        return value;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return (signal + value);
    },

    formatDate(value) {
        const splittedDate = value.split("-");
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
};

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

    validateFields() {
        const { description, amount, date } = Form.getValues();
        
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos!');
        };
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues();

            Transaction.add(transaction);

            Form.clearFields();

            Modal.change();
        } catch (error) {
            snackbar.show(error.message);
        }
    }
};

const app = {
    init() {
        //Código antigo

        // Transaction.all.forEach((transaction, index) => {
        //     DOM.addTransaction(transaction, index);
        // });

        Transaction.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransaction();
        app.init();
    },
};

const snackbar = {
    show (inf) {
        let message = document.getElementById('snackbar_message');
        const x = document.getElementById('snackbar');
    
        message.innerHTML = inf;
        x.className = 'show';

        setTimeout(() => x.classList.remove('show'), 5000);
    },
  }

app.init();

