export class Bank {
    constructor() {
        this.loadData();
        this.minBalance = 500;
        this.dailyTransferLimit = 50000;
    }

    loadData() {
        try {
            const accountsData = localStorage.getItem('accounts');
            const transactionsData = localStorage.getItem('transactions');
            this.accounts = accountsData ? JSON.parse(accountsData) : [];
            this.transactions = transactionsData ? JSON.parse(transactionsData) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            this.accounts = [];
            this.transactions = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem('accounts', JSON.stringify(this.accounts));
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving data:', error);
            throw new Error('Failed to save data');
        }
    }

    validateAccountNumber(accountNumber) {
        if (accountNumber.toString().length !== 6) {
            throw new Error('Account number must be 6 digits');
        }
        return true;
    }

    addAccount(accountNumber, balance, customerName) {
        this.validateAccountNumber(accountNumber);
        
        if (balance < this.minBalance) {
            throw new Error(`Minimum initial balance should be ${this.minBalance}`);
        }

        if (this.accounts.find(acc => acc.accountNumber === accountNumber)) {
            throw new Error('Account number already exists');
        }

        const newAccount = {
            accountNumber,
            balance,
            customerName,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        this.accounts.push(newAccount);
        
        const transaction = {
            id: Date.now(),
            fromAccount: null,
            toAccount: accountNumber,
            amount: balance,
            type: 'DEPOSIT',
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveData();
        return true;
    }

    transfer(fromAccountNumber, toAccountNumber, amount) {
        if (fromAccountNumber === toAccountNumber) {
            throw new Error('Cannot transfer to same account');
        }

        const fromAccount = this.accounts.find(acc => acc.accountNumber === fromAccountNumber);
        const toAccount = this.accounts.find(acc => acc.accountNumber === toAccountNumber);

        if (!fromAccount || !toAccount) {
            throw new Error('One or both accounts not found');
        }

        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }

        if (amount > this.dailyTransferLimit) {
            throw new Error(`Amount exceeds daily transfer limit of ${this.dailyTransferLimit}`);
        }

        if (fromAccount.balance - amount < this.minBalance) {
            throw new Error(`Transfer would breach minimum balance of ${this.minBalance}`);
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        const transaction = {
            id: Date.now(),
            fromAccount: fromAccountNumber,
            toAccount: toAccountNumber,
            amount,
            type: 'TRANSFER',
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);
        
        fromAccount.lastUpdated = new Date().toISOString();
        toAccount.lastUpdated = new Date().toISOString();
        
        this.saveData();
        return true;
    }

    getTransactionHistory(accountNumber) {
        const account = this.accounts.find(acc => acc.accountNumber === accountNumber);
        if (!account) {
            throw new Error('Account not found');
        }
        return this.transactions.filter(
            trans => trans.fromAccount === accountNumber || trans.toAccount === accountNumber
        );
    }

    getAccountDetails(accountNumber) {
        const account = this.accounts.find(acc => acc.accountNumber === accountNumber);
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    }

    getAllAccounts() {
        return this.accounts;
    }
}