import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, AutoIncrement, BelongsTo } from 'sequelize-typescript'
import User from './User'

@Table({
  tableName: 'users_daily_messages',
  timestamps: false,
})
export default class UserDailyMessages extends Model<UserDailyMessages> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @ForeignKey(() => User)
  @Column
  public userId: number

  @Column(DataType.INTEGER)
  public count: number

  @Column(DataType.BIGINT)
  public date: number

  @BelongsTo(() => User)
  public user: User
}
