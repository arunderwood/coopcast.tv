import * as React from "react"
import { GatsbyImage } from "gatsby-plugin-image"
import { chicken } from "./chickenBio.module.css"

const ChickenBio = ({ chickenData, image }) => {
    return (
        <div className={chicken}>
            <GatsbyImage image={image} alt={`Headshot of ${chickenData.name}`} />
            <div>
                <h2>{chickenData.name}</h2>
                <p>{chickenData.bio}</p>
            </div>
        </div>
    );
};

export default ChickenBio;
