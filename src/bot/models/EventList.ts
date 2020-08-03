import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, Default } from 'sequelize-typescript'

@Table({
  tableName: 'eventlist',
  timestamps: false,
})
export default class EventList extends Model<EventList> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  public name: string

  @Default({})
  @Column(DataType.JSON)
  public data: object

  @Default(Date.now())
  @Column(DataType.BIGINT)
  public timestamp: number
}
