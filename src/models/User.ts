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

  @HasMany(() => UserBits)
  public bits: UserBits[]

  @HasMany(() => UserTips)
  public tips: UserTips
}
