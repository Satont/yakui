import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, Default, BeforeCreate } from 'sequelize-typescript'

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

  @BeforeCreate
  static setTimestamp(instance: EventList) {
    instance.timestamp = Date.now()
  }
}
