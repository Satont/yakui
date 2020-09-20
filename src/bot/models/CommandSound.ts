import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Command from './Command'
import File from './File'

@Table({
  tableName: 'commands_sound',
  timestamps: false,
})
export default class CommandSound extends Model<CommandSound> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public id: number

  @AllowNull(false)
  @ForeignKey(() => Command)
  @Column(DataType.INTEGER)
  public commandId: number

  @AllowNull(false)
  @ForeignKey(() => File)
  @Column(DataType.INTEGER)
  public soundId: number

  @Default(50)
  @Column(DataType.INTEGER)
  public volume: number

  @BelongsTo(() => Command)
  public command: Command
}