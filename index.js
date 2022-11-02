import inquirer from 'inquirer';
import chalk from "chalk";
import MD5 from "crypto-js/md5.js";

import fs from 'fs';


const showErrorMessage = (message) => console.log(chalk.redBright(`\n${message}`));
const showWarningMessage = (message) => console.log(chalk.yellowBright(`\n${message}`));
const showSuccessMessage = (message) => console.log(chalk.greenBright(`\n${message}`));

const back = () => {
    inquirer_(
        [
            {
                message: "Pressione enter para voltar ao menu...",
                name: "back",
                type: "input"
            }
        ], 
        () => main());
};

const cpfValidation = (value) => {
    if (value.length == 0) showErrorMessage("Por favor, informe um CPF.");
    else if (RegExp(/\D/g).test(value)) showErrorMessage("Insira apenas números.");
    else if (value.length < 11 || value.length > 11) showErrorMessage("Digite um CPF válido.");
    else return true;
};

const accountValidation = (value) => {
    if(value.includes("-")) value = value.replace("-", "");
    if (RegExp(/\D/g).test(value)) {
        showErrorMessage("Insira apenas valores numéricos com dígito separado por "-"");
    } else return true;
}

const valueValidation = (value) => {
    if (RegExp(/\D/g).test(value)) 
        showErrorMessage("Por favor, informe um valor válido.");
    else if (parseFloat(value) == 0 || !value.length) 
        showErrorMessage("Por favor, informe um valor positivo.");
    else return true;
}

const passwordValidation = (value) => {
    if(value.length < 4) {
        showErrorMessage("Insira uma senha numérica de 4 digitos");
    } else if (RegExp(/\D/g).test(value)) {
        showErrorMessage("Insira apenas números.");
    } else return true;
}

const accountInputs = [
    {
        message: "Nome: ",
        name: "name",
        type: "input",
        validate: (input) => {
            if (!input.length) showErrorMessage("Por favor, informe seu nome completo.");
            else return true;
        },
    },
    {
        message: "CPF: ",
        name: "cpf",
        type: "input",
        validate: (input) => {
            if (filterAccountBy(input, "cpf").length) 
                showWarningMessage("Este CPF Já está vinculado a uma conta!");
            else return cpfValidation(input); 
        },
    }, 
    {
        message: "Crie uma senha de 4 digitos: ",
        name: "password",
        type: "password",
        validate: (input) => passwordValidation(input),
    }
];

const depositInputs = [
    {
        message: "Informe o número da conta em que deseja depositar: ",
        name: "accountNumber",
        type: "input",
        validate: (input) => balanceInputs[0].validate(input),
    },
    {
        message: "Informe o valor: ",
        name: "deposit",
        type: "input",
        validate: (input) => valueValidation(input),
    }
];

const balanceInputs = [
    {
        message: "Informe o número da conta que deseja ver o saldo: ",
        name: "accountNumber",
        type: "input",
        validate: (accountNumber) => {
            if (!filterAccountBy(accountNumber, "account.number").length) 
                showWarningMessage("Conta não encontrada! Verifique e tente novamente");
            else return accountValidation(accountNumber);
        }
    },
    {
        message: "Informe sua senha de 4 digitos: ",
        name: "password",
        type: "password",
        validate: (value) => {
            if (!filterAccountBy(MD5(value).toString(), "password").length){
                showWarningMessage("Senha incorreta! Verifique e tente novamente.");
            } else if(passwordValidation(value)) return true;
            else return true;
        }
    }
]

const withDrawInputs = [
    {
        message: 'Informe o número da conta em que deseja sacar: ',
        name: 'accountNumber',
        type: 'input',
        validate: (input) => balanceInputs[0].validate(input),
    },
    balanceInputs[1],
    {
        message: 'Informe o valor: ',
        name: 'withdraw',
        type: 'input',
        validate: (input) => valueValidation(input),
    },
]

function getAccountList() {
    const accounts =  fs.readFileSync('accounts.json', "utf8");
    return accounts.length > 0 ? JSON.parse(accounts) : [];
}

function filterAccountBy(value, field) {
    return getAccountList().filter(acc => value == eval(`acc.${field}`));
}

function createAccount(values) {
    function generateAccountNumber() {
        const digit = Math.round(Math.random() * 10);
        const number = Math.round(Math.random() * 999 * 999 * 999);
        return `${number}-${digit}`;
    }

    showWarningMessage("Verificando contas...");

    const userAccount = [
        {
            "owner": values.name,
            "cpf": values.cpf,
            "password": MD5(values.password).toString(),
            "account": {
                "number": generateAccountNumber(),
                "balance": 0.0
            }
        },
        ...getAccountList()
    ]

    fs.writeFileSync('accounts.json', JSON.stringify(userAccount));

    showSuccessMessage("Conta criada com sucesso! :D");
    let accountInfo = `Nº: ${userAccount[0].account.number}\n`;
    accountInfo += `Saldo: ${userAccount[0].account.balance.toFixed(2)}\n` 
    showSuccessMessage(accountInfo);

    return true;
}

function deposit(values) {
    const accounts = getAccountList().map(acc => {
        if(acc.account.number == values.accountNumber) {
            acc.account.balance += parseFloat(values.deposit);
        }
    
        return acc;
    });

    fs.writeFileSync('accounts.json', JSON.stringify(accounts));
    showSuccessMessage("Depósito realizado com sucesso! :D");

    return true;
}


function withdraw(values){
    let errors = {error: false, message: null};

    const accounts = getAccountList().map(acc => {
        if(acc.account.number == values.accountNumber) {
            if(acc.account.balance >= parseFloat(values.withdraw)) {
                acc.account.balance -= parseFloat(values.withdraw);
                errors = {error: false, message: null}
            } else 
                errors = {error: true, message: "Saldo insuficiente!"};
        } 
        
        return acc; 
    });

    if(errors.error) { 
        showErrorMessage(`${errors.message}\n`);
        return false;
    } else {
        fs.writeFileSync('accounts.json', JSON.stringify(accounts));
        showSuccessMessage("Saque realizado com sucesso! :D");

        const currentBalance = filterAccountBy(values.accountNumber, "account.number")[0].account.balance;
        showSuccessMessage(`Seu saldo atual é de: R$ ${currentBalance}`);
    
        return true;
    }
}


function balance(values) {
    const currentBalance = filterAccountBy(values.accountNumber, "account.number")[0].account.balance;
    showSuccessMessage(`Saldo atual: R$ ${currentBalance.toFixed(2)}`);
    return true;
}

const routes = {
    "Criar Conta": () => {
        inquirer_(accountInputs, (answers) => {
            createAccount(answers);
            back();
        });
    },
    "Depositar": () => {
        inquirer_(depositInputs, (answers) => {
            deposit(answers);
            back();
        });
    },
    "Saldo": () => {
        inquirer_(balanceInputs, (answers) => {
            balance(answers);
            back();
        });
    },
    "Sacar": () => {
        inquirer_(withDrawInputs, (answers) => {
            withdraw(answers);
            back();
        });
    },
    "Sair": () => {
        inquirer_([
            {
                message: "Tem certeza que deseja sair? ",
                name: "exit",
                type: "list", 
                choices: ["Sim", "Não"]
            }
        ], (answers) => {
            answers.exit == "Não" && main();
            answers.exit == "Sim" &&
            showSuccessMessage("Obrigado por utilizar nossos serviços. Até logo :D");
        });
    },
}


const menuChoices = [
    {
      message: "Selecione uma opção abaixo: ",
      name: "menuChoices",
      type: "list",
      choices: Object.keys(routes),
      validate: (input) => {
        if (input.length == 0) {
          showErrorMessage("Por favor, selecione uma opção.");
        } else {
          return true;
        }
      },
    },
];

function inquirer_(choices, _function) {
    inquirer
    .prompt(choices)
    .then(_function)
    .catch((error) => {
        if (error.isTtyError) {
            showErrorMessage("Desculpe! Houve um erro ao acessar o console.");
        } else {
            showErrorMessage("Desculpe! Não foi possível validar seus dados.");
        }
    });
}

function main() {
    console.clear();

    fs.readFile('accounts.json', (err) => {
        if(err?.code === "ENOENT")
            fs.writeFileSync("accounts.json", JSON.stringify([]));
        
        inquirer_(menuChoices, (answers) => routes[answers.menuChoices]());
    });
}

main();