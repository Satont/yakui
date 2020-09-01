import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'files',
  timestamps: false,
})
export default class File extends Model<File> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string

  @AllowNull(false)
  @Column(DataType.STRING)
  public type: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  public data: string
}
