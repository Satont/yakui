import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull } from 'sequelize-typescript'
import { CommandPermission } from '../../../typings'
 
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

  @AllowNull(false)
  @Column(DataType.TEXT)
  public response: string

  @Default([])
  @Column(DataType.JSON)
  public aliases: string[]

  @Column(DataType.INTEGER)
  public cooldown: number

  @Column(DataType.TEXT)
  public description: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  public enabled: boolean

  @Default(true)
  @Column(DataType.BOOLEAN)
  public visible: boolean

  @Default('viewers')
  @AllowNull(false)
  @Column(DataType.ENUM('viewers', 'followers', 'vips', 'subscribers', 'moderators', 'broadcaster'))
  public permission: CommandPermission
}
