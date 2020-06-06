import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, Default } from 'sequelize-typescript'
 
@Table({
  tableName: 'variables',
  timestamps: false,
})
export default class Variable extends Model<Variable> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  public name: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  public response: string

  @Default(true)
  @Column(DataType.BOOLEAN)
  public enabled: boolean
}