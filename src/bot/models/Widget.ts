import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, Default } from 'sequelize-typescript'

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
  public left: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public top: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public width: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public height: number
}
