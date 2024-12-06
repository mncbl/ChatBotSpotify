const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const axios = require('axios'); // Importa o axios

const WATERFALL_DIALOG = 'waterfallDialog';
const PLAYLIST_PROMPT = 'playlistPrompt';
const MUSIC_PROMPT = 'musicPrompt';

class adicionarMusica extends ComponentDialog {
    constructor(id) {
        super(id);

        // Adicionar prompts para coletar informações do usuário
        this.addDialog(new TextPrompt(PLAYLIST_PROMPT));
        this.addDialog(new TextPrompt(MUSIC_PROMPT));

        // Configurar o WaterfallDialog com os passos
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptForPlaylistStep.bind(this),
            this.promptForMusicStep.bind(this),
            this.processAdditionStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Solicita o ID da playlist ao usuário
    async promptForPlaylistStep(stepContext) {
        return await stepContext.prompt(PLAYLIST_PROMPT, {
            prompt: 'Por favor, informe o ID da playlist onde deseja adicionar a música:'
        });
    }

    // Passo 2: Solicita o ID da música ao usuário
    async promptForMusicStep(stepContext) {
        stepContext.values.playlistId = stepContext.result;
        return await stepContext.prompt(MUSIC_PROMPT, {
            prompt: 'Agora, informe o ID da música que deseja adicionar:'
        });
    }

    // Passo 3: Faz a chamada à API para adicionar a música
    async processAdditionStep(stepContext) {
        stepContext.values.musicId = stepContext.result;

        const { playlistId, musicId } = stepContext.values;

        try {
            // Faz a chamada ao endpoint da API para adicionar a música à playlist
            const response = await axios.post(`https://spotify-projeto-dxgve4d4eqfjh9b5.canadacentral-01.azurewebsites.net/api/playlists/add-music/${playlistId}`, null, {
                params: { musicId }
            });

            if (response.status === 200) {
                await stepContext.context.sendActivity(`✅ Música com ID **${musicId}** foi adicionada com sucesso à playlist **${playlistId}**!`);
            } else {
                await stepContext.context.sendActivity('❌ Não foi possível adicionar a música. Por favor, verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao adicionar música à playlist:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao tentar adicionar a música. Tente novamente mais tarde.');
        }

        return await stepContext.next();
    }

    // Passo 4: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais alguma coisa, é só pedir!');
        return await stepContext.endDialog();
    }
}

module.exports.adicionarMusica = adicionarMusica;
