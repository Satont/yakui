import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique } from 'sequelize-typescript'

@Table({
  tableName: 'widgets',
  timestamps: false,
})
export default class Widget extends Model<Widget> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  public name: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public x: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public y: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public w: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public h: number
}
