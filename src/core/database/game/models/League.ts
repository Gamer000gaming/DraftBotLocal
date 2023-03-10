import {DataTypes, Model, Op, Sequelize} from "sequelize";
import {format} from "../../../utils/StringFormatter";
import * as moment from "moment";
import {Constants} from "../../../Constants";
import {LeagueInfoConstants} from "../../../constants/LeagueInfoConstants";

export class League extends Model {
	public readonly id!: number;

	public readonly color!: string;

	public readonly minGloryPoints!: number;

	public readonly maxGloryPoints!: number;

	public readonly emoji!: string;

	public readonly fr!: string;

	public readonly en!: string;

	public updatedAt!: Date;

	public createdAt!: Date;

	/**
	 * display the information of the class
	 * @param language
	 */
	public toString(language: string): string {
		return format(LeagueInfoConstants.FIELDS_VALUE, {
			emoji: this.emoji,
			name: this.getName(language)
		});
	}

	/**
	 * get the name of the class in the given language
	 * @param language
	 */
	public getName(language: string): string {
		return language === Constants.LANGUAGE.FRENCH ? this.fr : this.en;
	}

	/**
	 * get the amount of money to award to the player
	 */
	public getMoneyToAward(): number {
		return LeagueInfoConstants.MONEY_TO_AWARD[this.id];
	}

	/**
	 * get the amount of xp to award to the player
	 */
	public getXPToAward(): number {
		return LeagueInfoConstants.XP_TO_AWARD[this.id];
	}

	/**
	 * True if the player will lose glory points at the end of the season
	 */
	public hasPointsReset(): boolean {
		return this.minGloryPoints >= LeagueInfoConstants.GLORY_RESET_THRESHOLD;
	}

	public pointsLostAtReset(currentPoints: number): number {
		if (currentPoints < LeagueInfoConstants.GLORY_RESET_THRESHOLD) {
			return 0;
		}
		return Math.round((currentPoints - LeagueInfoConstants.GLORY_RESET_THRESHOLD) * LeagueInfoConstants.SEASON_END_LOSS_PERCENTAGE);
	}
}

export class Leagues {

	/**
	 * get the league by its id
	 * @param id
	 */
	static getById(id: number): Promise<League | null> {
		return Promise.resolve(League.findOne({
			where: {
				id
			}
		}));
	}

	/**
	 * get the league by its emoji
	 * @param emoji
	 */
	static getByEmoji(emoji: string): Promise<League | null> {
		return Promise.resolve(League.findOne({
			where: {
				emoji
			}
		}));
	}

	static getByGlory(gloryPoints: number): Promise<League | null> {
		return Promise.resolve(League.findOne({
			where: {
				minGloryPoints: {
					[Op.lte]: gloryPoints
				},
				maxGloryPoints: {
					[Op.gte]: gloryPoints
				}
			}
		}));
	}
}

export function initModel(sequelize: Sequelize): void {
	League.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			color: {
				type: DataTypes.STRING
			},
			minGloryPoints: {
				type: DataTypes.INTEGER
			},
			maxGloryPoints: {
				type: DataTypes.INTEGER
			},
			emoji: {
				type: DataTypes.STRING
			},
			fr: {
				type: DataTypes.TEXT
			},
			en: {
				type: DataTypes.TEXT
			},
			updatedAt: {
				type: DataTypes.DATE,
				defaultValue: moment().format("YYYY-MM-DD HH:mm:ss")
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: moment().format("YYYY-MM-DD HH:mm:ss")
			}
		},
		{
			sequelize,
			tableName: "leagues",
			freezeTableName: true
		});

	League.beforeSave(instance => {
		instance.updatedAt = moment().toDate();
	});
}

export default League;