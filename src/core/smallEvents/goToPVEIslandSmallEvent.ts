import {SmallEvent} from "./SmallEvent";
import {CommandInteraction} from "discord.js";
import {DraftBotEmbed} from "../messages/DraftBotEmbed";
import {TranslationModule, Translations} from "../Translations";
import Player from "../database/game/models/Player";
import {Maps} from "../maps/Maps";
import {PlayerSmallEvents} from "../database/game/models/PlayerSmallEvent";
import {format} from "../utils/StringFormatter";
import {DraftBotValidateReactionMessage} from "../messages/DraftBotValidateReactionMessage";
import {BlockingUtils} from "../utils/BlockingUtils";
import {BlockingConstants} from "../constants/BlockingConstants";
import {PVEConstants} from "../constants/PVEConstants";
import {NumberChangeReason} from "../constants/LogsConstants";
import {MapLinks} from "../database/game/models/MapLink";
import {LogsReadRequests} from "../database/logs/LogsReadRequests";
import {PlayerMissionsInfos} from "../database/game/models/PlayerMissionsInfo";
import {TravelTime} from "../maps/TravelTime";
import {RandomUtils} from "../utils/RandomUtils";
import {MapCache} from "../maps/MapCache";

async function confirmationCallback(
	player: Player,
	msg: DraftBotValidateReactionMessage,
	tr: TranslationModule,
	emote: string,
	price: number
): Promise<void> {
	const embed = new DraftBotEmbed()
		.setAuthor(msg.sentMessage.embeds[0].author);
	if (msg.isValidated()) {
		const missionInfo = await PlayerMissionsInfos.getOfPlayer(player.id);
		if (missionInfo.gems < price) {
			embed.setDescription(`${emote} ${tr.get("notEnoughGems")}`);
		}
		else {
			await TravelTime.removeEffect(player, NumberChangeReason.SMALL_EVENT);
			await Maps.startTravel(
				player,
				await MapLinks.getById(RandomUtils.draftbotRandom.pick(MapCache.boatMapLinks)),
				msg.sentMessage.createdTimestamp,
				NumberChangeReason.SMALL_EVENT
			);
			await missionInfo.addGems(-price, player.discordUserId, NumberChangeReason.SMALL_EVENT);
			await missionInfo.save();
			embed.setDescription(`${emote} ${tr.get("endStoryAccept")}`);
		}
	}
	else {
		embed.setDescription(`${emote} ${tr.get("endStoryRefuse")}`);
	}
	await msg.sentMessage.channel.send({
		embeds: [embed]
	});
	BlockingUtils.unblockPlayer(player.discordUserId, BlockingConstants.REASONS.PVE_ISLAND);
}

export const smallEvent: SmallEvent = {
	/**
	 * Check if small event can be executed
	 */
	async canBeExecuted(player: Player): Promise<boolean> {
		return player.level >= PVEConstants.MIN_LEVEL &&
			Maps.isNearWater(player) &&
			await player.getMaxCumulativeFightPoint() - player.fightPointsLost >= 0 &&
			await PlayerSmallEvents.playerSmallEventCount(player.id, "goToPVEIsland") === 0 &&
			await LogsReadRequests.getCountPVEIslandThisWeek(player.discordUserId) < PVEConstants.TRAVEL_COST.length;
	},

	/**
	 * Execute small event
	 * @param interaction
	 * @param language
	 * @param player
	 * @param seEmbed
	 */
	async executeSmallEvent(interaction: CommandInteraction, language: string, player: Player, seEmbed: DraftBotEmbed): Promise<void> {
		const tr = Translations.getModule("smallEvents.goToPVEIsland", language);
		let wentCount = await LogsReadRequests.getCountPVEIslandThisWeek(player.discordUserId);
		if (wentCount >= PVEConstants.TRAVEL_COST.length) {
			wentCount = PVEConstants.TRAVEL_COST.length - 1;
		}
		const price = PVEConstants.TRAVEL_COST[wentCount];

		const confirmEmbed = new DraftBotValidateReactionMessage(
			interaction.user,
			(confirmMessage: DraftBotValidateReactionMessage) => {
				confirmationCallback(player, confirmMessage, tr, seEmbed.data.description, price).then();
			}
		);

		// Copy embed data
		Object.assign(confirmEmbed.data, seEmbed.data);

		confirmEmbed.setDescription(
			seEmbed.data.description +
			Translations.getModule("smallEventsIntros", language).getRandom("intro") +
			format(tr.getRandom("stories"), {
				priceText: price === 0 ? tr.get("priceFree") : tr.format("priceMoney", { price })
			}) +
			"\n\n" +
			tr.format("confirm", {
				fightPoints: await player.getCumulativeFightPoint(),
				fightPointsMax: await player.getMaxCumulativeFightPoint()
			})
		);

		await confirmEmbed.editReply(interaction, (collector) => BlockingUtils.blockPlayerWithCollector(player.discordUserId, BlockingConstants.REASONS.PVE_ISLAND, collector));
	}
};