import type { NextPage } from 'next'
import Head from 'next/head'
import { HandleAnimateFn, HandleStartFn, PtsCanvas } from 'react-pts-canvas'

const start: HandleStartFn = (bound, space, form) => {
  space.background = '#fff'
}

const animate: HandleAnimateFn = (space, form, time, ftime) => {
  form.point(space.pointer, 10)
  // space.add(() => form.point(space.pointer, 10))
}

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Robot Simulation</title>
      </Head>

      <div className="w-screen h-screen flex items-center justify-center">
        <PtsCanvas
          name="mainView"
          onStart={start}
          onAnimate={animate}
          canvasStyle={{ width: '100%', height: '100%' }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}

export default Home
