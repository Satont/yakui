import { Table, Column, Model, DataType, AllowNull, PrimaryKey, ForeignKey, BelongsTo, AutoIncrement } from 'sequelize-typescript'
import User from './User'
 
@Table({
  tableName: 'users_bits',
  timestamps: false,
})
export default class UserBits extends Model<UserBits> {
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
  @Column(DataType.BIGINT)
  public timestamp: number

  @ForeignKey(() => User)
  @Column
  public userId: number

  @BelongsTo(() => User)
  public user: User
}
