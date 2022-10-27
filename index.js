import inquirer from 'inquirer';
import chalk from "chalk";

import fs from 'fs';


const showErrorMessage = (message) => console.log(chalk.red(`\n${message}`));


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

const balance_values = [
    {
        message: "Informe seu CPF: ",
        name: "cpf",
        type: "input",
        validate: (input) => cpfValidation(input)
    },
];

const deposit_values = [
    ...balance_values,
    {
        message: "Informe o valor: ",
        name: "deposit_value",
        type: "input",
        validate: (input) => {
            if (input.length == 0) {
              showErrorMessage("Por favor, informe um valor válido.");
            } if (parseFloat(input) < 0) {
                showErrorMessage("Por favor, informe um valor positivo.");
            } else {
              return true;
            }
          },
    }
];

const account_values = [
    {
        message: "Nome: ",
        name: "name",
        type: "input",
        validate: (input) => {
            if (input.length == 0) {
                showErrorMessage("Por favor, informe seu nome completo.");
            } else {
                return true;
            }
        },
    },
    {
        message: "CPF: ",
        name: "cpf",
        type: "number",
        validate: (input) => cpfValidation(input),
    }
];

// const createAccount = (values) => 


const routes = {
    "Criar Conta": () => {
        inquirer_(account_values, (answers) => {
            fs.readFile('accounts.json', "utf8", (err, data) => {
                if(err) {
                    showErrorMessage("Não foi possível verificar contas.");
                    return false;
                }

                const accounts = JSON.parse(data);
                const userExists = accounts.filter(acc => answers.cpf == acc.cpf).length > 0;

                if(userExists) {
                    showErrorMessage("Este CPF já está vinculado a uma conta!");
                    return false;
                }
        
                const userAccount = [
                    {
                        "name": answers.name,
                        "cpf": answers.cpf,
                        "account": answers.name,
                        "balance": 0.0
                    },
                    ...accounts
                ]
                fs.writeFileSync('accounts.json', JSON.stringify(userAccount));
            });
        });
    },
    "Depositar": () => {
        inquirer_(deposit_values, (answers) => {
            fs.readFile('accounts.json', "utf8", (err, data) => {
                if(err) {
                    showErrorMessage("Não foi possível verificar contas.");
                    return;
                }

                const accounts = JSON.parse(data);
                const userExists = accounts.filter(acc => answers.cpf == acc.cpf).length > 0;

                if(userExists) console.log("Usuário encontrado");
            });
        });
    },
    "Saldo": () => {
        inquirer_(balance_values, (answers) => {
            console.log(answers);
        });
    },
    "Sacar": () => {
        inquirer_(balance_values, (answers) => {
            console.log(answers);
        });
    },
    "Sair": () => {
        console.log("Sair");
    },
}


const menu_choices = [
    {
      message: "Selecione uma opção abaixo: ",
      name: "menu_choices",
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


inquirer_(menu_choices, (answers) => routes[answers.menu_choices]());