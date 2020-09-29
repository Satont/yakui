import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull, HasOne } from 'sequelize-typescript'
import CommandSound from './CommandSound'

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

  @Default(true)
  @Column(DataType.INTEGER)
  public price: number

  @Default(1)
  @Column(DataType.INTEGER)
  public usage: number

  @Default('viewers')
  @AllowNull(false)
  @Column(DataType.ENUM('viewers', 'followers', 'vips', 'subscribers', 'moderators', 'broadcaster'))
  public permission: any

  @HasOne(() => CommandSound)
  sound: CommandSound
}
