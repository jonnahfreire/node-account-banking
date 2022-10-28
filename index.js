import inquirer from 'inquirer';
import chalk from "chalk";
import MD5 from "crypto-js/md5.js";

import fs from 'fs';


const showErrorMessage = (message) => console.log(chalk.red(`\n${message}`));
const showWarningMessage = (message) => console.log(chalk.yellowBright(`\n${message}`));
const showSuccessMessage = (message) => console.log(chalk.greenBright(`\n${message}`));

const cpfValidation = (input) => {
    if (input.length == 0) {
        showErrorMessage("Por favor, informe um CPF.");
    } else if (RegExp(/\D/g).test(input)) {
        showErrorMessage(
            "Insira apenas números."
            );
    } else if (input.length < 11 || input.length > 11) {
        showErrorMessage("Digite um CPF válido.");
    } else {
        return true;
    }
};

const depositInputs = [
    {
        message: "Informe o número da conta em que deseja depositar: ",
        name: "account",
        type: "input",
        validate: (value) => {
            if(value.includes("-")) value = value.replace("-", "");
            if (RegExp(/\D/g).test(value)) {
                showErrorMessage("Insira apenas valores numéricos com dígito separado por "-"");
            } else return true;
        },
    },
    {
        message: "Informe o valor: ",
        name: "deposit",
        type: "input",
        validate: (input) => {
            if (input.length == 0) {
              showErrorMessage("Por favor, informe um valor válido.");

            }  if (parseFloat(input) < 0) {
                showErrorMessage("Por favor, informe um valor positivo.");
            
            } else return true;
        },
    }
];

const accountInputs = [
    {
        message: "Nome: ",
        name: "name",
        type: "input",
        validate: (values) => {
            if (values.length == 0) {
                showErrorMessage("Por favor, informe seu nome completo.");
                return false;
            } else {
                return true;
            }
        },
    },
    {
        message: "CPF: ",
        name: "cpf",
        type: "input",
        validate: (values) => cpfValidation(values),
    }, 
    {
        message: "Crie uma senha de 4 digitos: ",
        name: "password",
        type: "password",
        validate: (value) => {
            if(value.length < 4) {
                showErrorMessage("Insira uma senha numérica de 4 digitos");
            } else if (RegExp(/\D/g).test(value)) {
                showErrorMessage("Insira apenas números.");

            } else return true;
        }
    }
];

const balanceInputs = [
    depositInputs[0],
    {
        message: "Informe sua senha de 4 digitos: ",
        name: "password",
        type: "password",
        validate: (value) => {
            if(value.length < 4) {
                showErrorMessage("Insira uma senha numérica de 4 digitos");
            } else if (RegExp(/\D/g).test(value)) {
                showErrorMessage("Insira apenas números.");

            } else return true;
        }
    }
]

const withDrawInputs = [
    depositInputs[0],
    balanceInputs[1]
]

function getAccountList() {
    const accounts =  fs.readFileSync('accounts.json', "utf8");
    return accounts.length > 0 ? JSON.parse(accounts) : [];
}

function filterAccountBy(value, field) {
    if(field == "account") return getAccountList()
        .filter(acc => value == acc[field]["number"]);
    return getAccountList().filter(acc => value == acc[field]);
}

function createAccount(values) {
    function generateAccountNumber() {
        const digit = Math.round(Math.random() * 10);
        const number = Math.round(Math.random() * 999 * 999 * 999);
        return `${number}-${digit}`;
    }

    showWarningMessage("Verificando contas...");

    if(filterAccountBy(values.cpf, "cpf").length > 0) {
        showErrorMessage("Este CPF já está vinculado a uma conta!");
        return false;
    }

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
    if(filterAccountBy(values.account, "account").length > 0) {

        const accounts = getAccountList().map(acc => {
            if(acc.account.number == values.account) {
                acc.account.balance = parseFloat(values.deposit);
            }
        
            return acc;
        });
    
        fs.writeFileSync('accounts.json', JSON.stringify(accounts));
        showSuccessMessage("Depósito realizado com sucesso! :D");

        return true;
    } else {
        showWarningMessage("Conta não encontrada! Verifique e tente novamente.");
        return false;
    }
}

const routes = {
    "Criar Conta": () => {
        inquirer_(accountInputs, (answers) => {
            createAccount(answers);
            main();
        });
    },
    "Depositar": () => {
        inquirer_(depositInputs, (answers) => {
            deposit(answers);
            main();
        });
    },
    "Saldo": () => {
        inquirer_(balanceInputs, (answers) => {
            console.log(answers);
        });
    },
    "Sacar": () => {
        inquirer_(withDrawInputs, (answers) => {
            console.log(answers);
        });
    },
    "Sair": () => {
        console.log("Sair");
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
            console.log(error);
            showErrorMessage("Desculpe! Não foi possível validar seus dados.");
        }
    });
}

function main() {
    inquirer_(menuChoices, (answers) => routes[answers.menuChoices]());
}

main();
