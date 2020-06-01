import { Table, Column, Model, DataType, Default, AllowNull, PrimaryKey } from 'sequelize-typescript'
 
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
}
