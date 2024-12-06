const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const axios = require('axios');

const WATERFALL_DIALOG = 'waterfallDialog';
const CPF_PROMPT = 'cpfPrompt';

class consultaUsuarioComPlaylists extends ComponentDialog {
    constructor(id) {
        super(id);

        this.addDialog(new TextPrompt(CPF_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptForCpfStep.bind(this),
            this.processCpfStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Solicita o CPF ao usuário
    async promptForCpfStep(stepContext) {
        return await stepContext.prompt(CPF_PROMPT, {
            prompt: 'Por favor, informe o CPF para buscar os dados do usuário e suas playlists:'
        });
    }

    // Passo 2: Processa o CPF e chama a API
    async processCpfStep(stepContext) {
        const cpf = stepContext.result;

        try {
            // Faz a chamada à API para buscar o UserWithPlaylistsDTO pelo CPF
            const response = await axios.get(`https://spotify-projeto-dxgve4d4eqfjh9b5.canadacentral-01.azurewebsites.net/api/users/${cpf}`);
            const user = response.data;

            if (user) {
                let mensagem = `👤 **Informações do Usuário:**\n\n`;
                mensagem += `👤 **Nome:** ${user.userName}\n`;
                mensagem += `🔹 **CPF:** ${user.cpf}\n`;

                if (user.playlistNames && user.playlistNames.length > 0) {
                    mensagem += `/n🎵 **Playlists:**\n`;
                    user.playlistNames.forEach((playlist, index) => {
                        mensagem += `   ${index + 1}. ${playlist}\n`;
                    });
                } else {
                    mensagem += `🎵 **Playlists:** Nenhuma playlist encontrada.\n`;
                }

                await stepContext.context.sendActivity(mensagem);
            } else {
                await stepContext.context.sendActivity('❌ Nenhum usuário encontrado com o CPF informado.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao buscar os dados do usuário e suas playlists.');
        }

        return await stepContext.next();
    }

    // Passo 3: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais alguma coisa, é só pedir!');
        return await stepContext.endDialog();
    }
}

module.exports.consultaUsuarioComPlaylists = consultaUsuarioComPlaylists;
