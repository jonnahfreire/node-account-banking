import inquirer from 'inquirer';
import chalk from "chalk";

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


const deposit_values = [
    {
        message: "Informe seu CPF: ",
        name: "cpf_verification",
        type: "input",
        validate: (input) => cpfValidation(input)
    },
    {
        message: "Informe o valor: ",
        name: "deposit_value",
        type: "input",
        validate: (input) => {
            if (input.length == 0) {
              showErrorMessage("Por favor, informe um valor válido.");
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
        type: "input",
        validate: (input) => cpfValidation(input),
    }
];

const createAccount = () => {
// Math.round();
}


const routes = {
    "Criar Conta": () => {
        inquirer_(account_values, (answers) => createAccount(answers));
    },
    "Depositar": () => {
        inquirer_(deposit_values, (answers) => {
            console.log(answers);
            // createAccount(answers);
        });

    },
    "Saldo": () => {
        console.log("Consultar saldo");
    
    },
    "Sacar": () => {
        console.log("Sacar");
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
            showErrorMessage("Desculpe! Não foi possível validar seus dados.");
        }
    });
}


inquirer_(menu_choices, (answers) => routes[answers.menu_choices]())