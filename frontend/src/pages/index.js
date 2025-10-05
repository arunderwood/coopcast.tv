import Layout from "../components/layout"

import * as React from "react"
import { useState, useEffect } from "react"

const IndexPage = () => {
  const [isClient, setIsClient] = useState(false)
  const [YouTube, setYouTube] = useState(null)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import react-youtube only on client-side
    import("react-youtube").then((module) => {
      setYouTube(() => module.default)
    })
  }, [])

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
        {isClient && YouTube && (
          <YouTube
            videoId="PXe3D684sUA"
            opts={videoOptions}
            className="video"
          />
        )}
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
      <meta name="description" content="Watch our live chicken coop stream 24/7. Meet our flock and explore their family tree." />
      <link rel="icon" href={emojiFavicon} />
    </>
  )
}
