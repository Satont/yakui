import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Default } from 'sequelize-typescript'

@Table({
  tableName: 'overlays',
  timestamps: false,
})
export default class Overlay extends Model<Overlay> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string

  @Column(DataType.TEXT)
  public data: string

  @Column(DataType.STRING)
  public css: string

  @Default([])
  @Column(DataType.JSON)
  public js: string[]
}
