import {Entity} from "../../core/database/game/models/Entity";
import {DraftBotShelterMessageBuilder} from "../../core/messages/DraftBotShelterMessage";
import {Guilds} from "../../core/database/game/models/Guild";
import {ICommand} from "../ICommand";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {EffectsConstants} from "../../core/constants/EffectsConstants";

async function executeCommand(interaction: CommandInteraction, language: string, entity: Entity): Promise<void> {
	const guild = await Guilds.getById(entity.Player.guildId);
	await interaction.reply({embeds: [await new DraftBotShelterMessageBuilder(guild, language).build()]});
}

export const commandInfo: ICommand = {
	slashCommandBuilder: new SlashCommandBuilder()
		.setName("guildshelter")
		.setDescription("Displays the shelter of your guild"),
	executeCommand,
	requirements: {
		disallowEffects: [EffectsConstants.EMOJI_TEXT.BABY, EffectsConstants.EMOJI_TEXT.DEAD],
		guildRequired: true
	},
	mainGuildCommand: false
};
