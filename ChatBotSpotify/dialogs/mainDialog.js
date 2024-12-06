const { ComponentDialog, WaterfallDialog, ChoicePrompt, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { adicionarMusica } = require('./adicionarMusica');
const { consultaUsuarioComPlaylists } = require('./consultarUsuario');
const { criaPlaylist } = require('./criaPlaylist');
const { listarPlaylists } = require('./listarPlaylists');

const WATERFALL_DIALOG = 'waterfallDialog';
const CHOICE_PROMPT = 'choicePrompt';
let welcomeDialogCheck = false;

class MainDialog extends ComponentDialog {
    constructor(id, userState) {
        super(id);

        this.userState = userState;

        // Adiciona prompts e diálogos
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new adicionarMusica('adicionarMusica'));
        this.addDialog(new consultaUsuarioComPlaylists('consultarUsuario'));
       // this.addDialog(new criaPlaylist('criaPlaylist'));
        this.addDialog(new listarPlaylists('listarPlaylists'));

        // Configura o fluxo principal
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.choiceCardStep.bind(this),
            this.processChoiceStep.bind(this),
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Executa o diálogo principal quando nenhuma interação está ativa.
     * @param {TurnContext} turnContext
     * @param {StatePropertyAccessor} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        if (!welcomeDialogCheck) {
            welcomeDialogCheck = true;
            await turnContext.sendActivity(
                'Olá, tudo bem? Sou um assistente virtual e estou aqui para ajudar você. Qualquer dúvida, é só perguntar!'
            );
        }

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Solicita ao usuário que escolha uma opção.
     * @param {WaterfallStepContext} stepContext
     */
    async choiceCardStep(stepContext) {
        console.log('MainDialog.choiceCardStep'); // Log para depuração

        const options = {
            prompt: 'Escolha a opção desejada:',
            retryPrompt: 'Opção inválida. Por favor, selecione uma das opções disponíveis:',
            choices: this.getChoices(),
        };

        return await stepContext.prompt(CHOICE_PROMPT, options);
    }

    /**
     * Processa a escolha do usuário e direciona para o diálogo correspondente.
     * @param {WaterfallStepContext} stepContext
     */
    async processChoiceStep(stepContext) {
        const choice = stepContext.result.value;

        switch (choice) {
            case 'Adicionar Música':
                return await stepContext.beginDialog('adicionarMusica');
            case 'Consultar Usuário':
                return await stepContext.beginDialog('consultarUsuario');
         //   case 'Criar Playlist':
             //   return await stepContext.beginDialog('criaPlaylist');
            case 'Listar Playlists':
                return await stepContext.beginDialog('listarPlaylists');
            default:
                await stepContext.context.sendActivity('Opção não reconhecida.');
                return await stepContext.endDialog();
        }
    }

    /**
     * Configura as opções para o prompt de escolha.
     */
    getChoices() {
        return [
            { value: 'Adicionar Música', synonyms: ['adicionar', 'música', 'add music'] },
            { value: 'Consultar Usuário', synonyms: ['consultar', 'usuário', 'user'] },
         //   { value: 'Criar Playlist', synonyms: ['criar', 'playlist', 'nova playlist'] },
            { value: 'Listar Playlists', synonyms: ['listar', 'playlists', 'ver playlists'] },
        ];
    }
}

module.exports.MainDialog = MainDialog;
