import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript'
 
@Table({
  tableName: 'settings',
  timestamps: false,
})
export default class Settings extends Model<Settings> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: number

  @Column(DataType.STRING)
  public space: string

  @Column(DataType.STRING)
  public name: string

  @Column(DataType.TEXT)
  get value() {
    return JSON.parse(this.getDataValue('value') as string)
  }
  set value(v) {
    this.setDataValue('value', JSON.stringify(v))
  }
}
