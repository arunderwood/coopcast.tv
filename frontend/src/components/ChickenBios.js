import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { getImage } from "gatsby-plugin-image"
import ChickenBio from "./ChickenBio"
import { chickenBios } from "./chickenBios.module.css"

const ChickenBios = ({ chickens }) => {
    const data = useStaticQuery(graphql`
        query {
            allFile(filter: { sourceInstanceName: { eq: "chickens" } }) {
                nodes {
                    name
                    childImageSharp {
                        gatsbyImageData(width: 200, layout: CONSTRAINED)
                    }
                }
            }
            defaultImage: file(relativePath: { eq: "default-chicken.png" }) {
                childImageSharp {
                    gatsbyImageData(width: 200, layout: CONSTRAINED)
                }
            }
        }
    `);

    const images = data.allFile.nodes;

    return (
        <div className={chickenBios}>
            {chickens.map((chicken) => {
                const imageNode = images.find((img) => img.name === chicken.imgName);
                const image = imageNode ? imageNode.childImageSharp.gatsbyImageData : data.defaultImage.childImageSharp.gatsbyImageData;
                return <ChickenBio key={chicken.name} chickenData={chicken} image={getImage(image)} />;
            })}
        </div>
    );
};

export default ChickenBios;
