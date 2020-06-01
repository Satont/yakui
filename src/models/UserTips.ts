import { Table, Column, Model, DataType, AllowNull, PrimaryKey, ForeignKey, BelongsTo, AutoIncrement } from 'sequelize-typescript'
import User from './User'
 
@Table({
  tableName: 'users_tips',
  timestamps: false,
})
export default class UserTips extends Model<UserTips> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public amount: number

  @Column(DataType.TEXT)
  public message: string

  @AllowNull(false)
  @Column(DataType.STRING)
  public currency: string

  @AllowNull(false)
  @Column(DataType.JSON)
  public rates: object

  @AllowNull(false)
  @Column(DataType.STRING)
  public inMainCurrencyAmount: string

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public timestamp: number

  @ForeignKey(() => User)
  @Column
  public userId: number

  @BelongsTo(() => User)
  public user: User
}
