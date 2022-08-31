import InventoryInfo from "../../../../core/database/game/models/InventoryInfo";
import Entity, {Entities} from "../../../../core/database/game/models/Entity";
import InventorySlot from "../../../../core/database/game/models/InventorySlot";
import Player from "../../../../core/database/game/models/Player";
import MissionSlot from "../../../../core/database/game/models/MissionSlot";
import PlayerMissionsInfo from "../../../../core/database/game/models/PlayerMissionsInfo";
import {CommandInteraction} from "discord.js";
import {ITestCommand} from "../../../../core/CommandsTest";

/**
 * Reset the player
 * @param {("fr"|"en")} language - Language to use in the response
 * @param interaction
 * @return {String} - The successful message formatted
 */
const destroyPlayerTestCommand = async (language: string, interaction: CommandInteraction): Promise<string> => {
	const [entity] = await Entities.getOrRegister(interaction.user.id);
	await MissionSlot.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await PlayerMissionsInfo.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await InventorySlot.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await InventoryInfo.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await MissionSlot.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await PlayerMissionsInfo.destroy({
		where: {
			playerId: entity.Player.id
		}
	});
	await Player.destroy({
		where: {
			entityId: entity.id
		}
	});
	await Entity.destroy({
		where: {
			id: entity.id
		}
	});
	return commandInfo.messageWhenExecuted;
};

export const commandInfo: ITestCommand = {
	name: "destroyplayer",
	aliases: ["destroy"],
	commandFormat: "",
	messageWhenExecuted: "Vous avez été réinitialisé !",
	description: "Réinitialise votre joueur",
	commandTestShouldReply: true,
	execute: destroyPlayerTestCommand
};