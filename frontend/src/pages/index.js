import Layout from "../components/layout"

import * as React from "react"
import YouTube from "react-youtube"

const IndexPage = () => {
  const videoOptions = {
    playerVars: {
      autoplay: 1,
    },
  }

  return (<Layout>
    <main className="page">
      <h1 className="heading">
        CoopCast.tv
        <br />
        <span className="heading-accent">🐔🐔🐔🐔🐔🐔</span>
      </h1>
      <div className="video-container">
        <YouTube
          videoId="Va4AWbTcJWY"
          opts={videoOptions}
          className="video"
        />
      </div>
    </main>
  </Layout>
  )
}

export default IndexPage

export function Head() {

  const emojiFavicon = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="1em" font-size="100" font-family="sans-serif">🐔</text></svg>`

  return (
    <>
      <title>CoopCast.tv</title>
      <link rel="icon" href={emojiFavicon} />
    </>
  )
}
