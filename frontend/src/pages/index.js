import "./styles.css"

import * as React from "react"
import YouTube from "react-youtube"
import { Helmet } from "react-helmet"

const IndexPage = () => {
  const videoOptions = {
    playerVars: {
      autoplay: 1,
    },
  }

  const emojiFavicon = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="1em" font-size="100" font-family="sans-serif">🐔</text></svg>`

  return (
    <main className="page">
      <Helmet>
        <link rel="icon" href={emojiFavicon} />
      </Helmet>
      <h1 className="heading">
        CoopCast.tv
        <br />
        <span className="heading-accent">🐔🐔🐔</span>
      </h1>
      <div className="video-container">
        <YouTube
          videoId="Va4AWbTcJWY"
          opts={videoOptions}
          className="video"
        />
      </div>
    </main>
  )
}

export default IndexPage

export const Head = () => <title>coopcast.tv</title>
