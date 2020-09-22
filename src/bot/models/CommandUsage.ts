import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript'

@Table({
  tableName: 'commands_usage',
  timestamps: false,
})
export default class CommandUsage extends Model<CommandUsage> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string
}
