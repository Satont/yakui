import { Entity, Index, PrimaryKey, Property, Unique, OneToOne, OneToMany, Collection } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'
import { UserBit } from './UserBit'
import { UserDailyMessages } from './UserDailyMessages'
import { UserTip } from './UserTip'

@Entity({
  tableName: 'users',
})
export class User {

  @Unique({ name: 'users_id_unique' })
  @PrimaryKey()
  id!: number;

  @Index({ name: 'users_username_index' })
  @Property({ length: 255, nullable: true })
  username?: string;

  @Property({ nullable: true })
  messages?: number = 0;

  @Property({ nullable: true, type: MyBigInt })
  watched?: number = 0;

  @Property({ nullable: true })
  points?: number = 0;

  @Property({ type: MyBigInt })
  lastMessagePoints?: number = 0;

  @Property({ type: MyBigInt })
  lastWatchedPoints?: number = 0;

  @OneToOne()
  dailyMessages?: UserDailyMessages

  @OneToMany(() => UserBit, bit => bit.user)
  bits? = new Collection<UserBit>(this)

  @OneToMany(() => UserTip, tip => tip.user)
  tips? = new Collection<UserTip>(this)

  @OneToMany(() => UserDailyMessages, daily => daily.user)
  daily? = new Collection<UserDailyMessages>(this)

  @Property({ persist: false })
  get todayMessages() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (this.daily) {
      return this.daily.toArray().find(o => o.date === startOfDay.getTime())?.count ?? 0
    } else return 0
  }

  @Property({ persist: false })
  get totalTips() {
    if (this.tips.toArray().length) {
      return this.tips.toArray().reduce((previous, current) => previous + Number(current.inMainCurrencyAmount), 0)
    } else return 0
  }

  @Property({ persist: false })
  get totalBits() {
    if (this.bits.toArray().length) {
      return this.bits.toArray().reduce((previous, current) => previous + Number(current.amount), 0)
    } else return 0
  }

  @Property({ persist: false })
  get watchedFormatted() {
    return `${((this.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`
  }
}
