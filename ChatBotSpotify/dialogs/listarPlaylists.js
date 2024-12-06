const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const axios = require('axios');

const WATERFALL_DIALOG = 'waterfallDialog';
const CPF_PROMPT = 'cpfPrompt';
const PLAYLIST_NAME_PROMPT = 'playlistNamePrompt';

class listarPlaylists extends ComponentDialog {
    constructor(id) {
        super(id);

        // Adiciona os prompts para coletar CPF e nome da playlist
        this.addDialog(new TextPrompt(CPF_PROMPT));
        this.addDialog(new TextPrompt(PLAYLIST_NAME_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptForCpfStep.bind(this),
            this.promptForPlaylistNameStep.bind(this),
            this.getPlaylistsStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Solicita o CPF ao usuário
    async promptForCpfStep(stepContext) {
        return await stepContext.prompt(CPF_PROMPT, {
            prompt: 'Por favor, informe o seu CPF para que eu possa buscar as playlists associadas:'
        });
    }

    // Passo 2: Solicita o nome da playlist ao usuário
    async promptForPlaylistNameStep(stepContext) {
        stepContext.values.cpf = stepContext.result; // Armazena o CPF
        return await stepContext.prompt(PLAYLIST_NAME_PROMPT, {
            prompt: 'Por favor, informe o nome da playlist que deseja consultar:'
        });
    }

    // Passo 3: Chama a API para obter as músicas da playlist
    async getPlaylistsStep(stepContext) {
        stepContext.values.playlistName = stepContext.result; // Armazena o nome da playlist

        const { cpf, playlistName } = stepContext.values;

        try {
            // Faz a chamada à API com os parâmetros necessários
            const response = await axios.get(
                'https://spotify-projeto-dxgve4d4eqfjh9b5.canadacentral-01.azurewebsites.net/api/playlists/get-playlist',
                { params: { cpf, playlistName } }
            );

            const musicas = response.data;

            if (musicas && musicas.length > 0) {
                let mensagem = `🎵 **Músicas na playlist "${playlistName}":**\n\n`;
                musicas.forEach((musica, index) => {
                    mensagem += `🎶 ${index + 1}. **${musica.musicName}**\n`;
                });
                await stepContext.context.sendActivity(mensagem);
            } else {
                await stepContext.context.sendActivity(`❌ Nenhuma música encontrada na playlist "${playlistName}".`);
            }
        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao obter as músicas da playlist.');
        }

        return await stepContext.next();
    }

    // Passo 4: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais alguma coisa, é só pedir!');
        return await stepContext.endDialog();
    }
}

module.exports.listarPlaylists = listarPlaylists;
