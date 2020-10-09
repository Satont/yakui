import { onChange, settings } from '../decorators'


class TestSytem {
  @settings()
  test = null

  @onChange('test')
  qweqwe() {
    console.log('change', this.test)
  }
}

export default new TestSytem()
