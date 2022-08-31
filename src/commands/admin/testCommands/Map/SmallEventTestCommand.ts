import {CommandInteraction} from "discord.js";
import {format} from "../../../../core/utils/StringFormatter";
import {Constants} from "../../../../core/Constants";
import {Translations} from "../../../../core/Translations";
import {ITestCommand} from "../../../../core/CommandsTest";
import {Entities} from "../../../../core/database/game/models/Entity";
import {CommandsManager} from "../../../CommandsManager";

let stringDesc: string = null;

/**
 * Force an small event with a given event name
 * @param {("fr"|"en")} language - Language to use in the response
 * @param interaction
 * @param {String[]} args=[] - Additional arguments sent with the command
 * @return {String} - The successful message formatted
 */
const smallEventTestCommand = async (language: string, interaction: CommandInteraction, args: string[]): Promise<string> => {
	const smallEventsModules = Translations.getSubModules("smallEvents");
	if (stringDesc === null) {
		stringDesc = "Force un type de mini event parmis ceux-ci :\n";
		smallEventsModules.forEach(seName => {
			stringDesc += "\n - " + seName;
		});
	}
	if (!smallEventsModules.includes(args[0])) {
		throw new Error("Erreur smallEvent : le mini-event " + args[0] + " n'existe pas. Veuillez vous référer à la commande \"test help smallEvent\" pour plus d'informations");
	}
	const [entity] = await Entities.getOrRegister(interaction.user.id);
	await CommandsManager.executeCommandWithParameters("report", interaction, language, entity, null, args[0]);
	return format(commandInfo.messageWhenExecuted, {name: args[0]});
};

export const commandInfo: ITestCommand = {
	name: "smallEvent",
	commandFormat: "<seName>",
	typeWaited: {
		seName: Constants.TEST_VAR_TYPES.STRING
	},
	messageWhenExecuted: "Mini event `{name}` forcé !",
	description: stringDesc,
	commandTestShouldReply: false,
	execute: smallEventTestCommand
};