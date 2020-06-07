import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, Default } from 'sequelize-typescript'
 
@Table({
  tableName: 'greetings',
  timestamps: false,
})
export default class Greeting extends Model<Greeting> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @Unique
  @Column(DataType.INTEGER)
  public userId: number

  @Unique
  @Column(DataType.STRING)
  public username: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  public message: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  public enabled: boolean
}