import { Table, Column, Model, DataType, Default, AllowNull, PrimaryKey, HasMany } from 'sequelize-typescript'
import UserBits from './UserBits'
import UserTips from './UserTips'
 
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

  @Column(DataType.VIRTUAL)
  get totalBits() {
    if (this.bits) {
      return this.bits.reduce((previous, current) => previous + Number(current.amount), 0)
    } else return 0
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
}
