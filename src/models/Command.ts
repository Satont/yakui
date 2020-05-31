import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull } from 'sequelize-typescript'
 
@Table({
  tableName: 'commands',
  timestamps: false,
})
export default class Command extends Model<Command> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string

  @Default([])
  @Column(DataType.JSON)
  public aliases: string[]

  @Column(DataType.INTEGER)
  public cooldown: number

  @Column(DataType.TEXT)
  public description: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  public visible: boolean
}
