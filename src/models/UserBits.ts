import { Table, Column, Model, DataType, AllowNull, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript'
import User from './User'
 
@Table({
  tableName: 'users_bits',
  timestamps: false,
})
export default class UserBits extends Model<UserBits> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public id: number

  @Column(DataType.BIGINT)
  public amount: number

  @Column(DataType.TEXT)
  public message: string

  @Column(DataType.BIGINT)
  public timestamp: number

  @ForeignKey(() => User)
  @Column
  public userId: number

  @BelongsTo(() => User)
  public user: User
}
