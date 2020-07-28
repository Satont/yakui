import { Table, Column, Model, DataType, Default, AllowNull, PrimaryKey, HasMany, HasOne } from 'sequelize-typescript'
import UserBits from './UserBits'
import UserTips from './UserTips'
import UserDailyMessages from './UserDailyMessages'

@Table({
  tableName: 'users',
  timestamps: false,
})
export default class User extends Model<User> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public id: number

  @Column(DataType.STRING)
  public username: string

  @Default(0)
  @Column(DataType.INTEGER)
  public messages: number

  @Default(0)
  @Column(DataType.BIGINT)
  public watched: number

  @Default(1)
  @Column(DataType.BIGINT)
  public lastMessagePoints: number

  @Default(1)
  @Column(DataType.BIGINT)
  public lastWatchedPoints: number

  @Default(0)
  @Column(DataType.BIGINT)
  public points: number

  @Column(DataType.VIRTUAL)
  get totalBits() {
    if (this.bits) {
      return this.bits.reduce((previous, current) => previous + Number(current.amount), 0)
    } else return 0
  }

  @Column(DataType.VIRTUAL)
  get watchedFormatted() {
    return `${((this.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`
  }

  @Column(DataType.VIRTUAL)
  get totalTips() {
    if (this.tips) {
      return this.tips.reduce((previous, current) => previous + Number(current.inMainCurrencyAmount), 0)
    } else return 0
  }

  @HasMany(() => UserBits)
  public bits: UserBits[]

  @HasMany(() => UserTips)
  public tips: UserTips[]

  @HasMany(() => UserDailyMessages)
  public daily_messages: UserDailyMessages[]

  @Column(DataType.VIRTUAL)
  get todayMessages() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (this.daily_messages) {
      return this.daily_messages.find(o => o.date === startOfDay.getTime())?.count ?? 0
    } else return 0
  }
}
