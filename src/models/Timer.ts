import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull } from 'sequelize-typescript'
 
@Table({
  tableName: 'timers',
  timestamps: false,
})
export default class Timer extends Model<Timer> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  public enabled: boolean

  @Default([])
  @Column(DataType.JSON)
  public responses: string[]

  @Default(0)
  @Column(DataType.INTEGER)
  public last: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public interval: number

  @Default(0)
  @Column(DataType.BIGINT)
  public triggerTimeStamp: number
}
