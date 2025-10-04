import * as React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import FamilyTree from '../components/FamilyTree';
import '../components/FamilyTree.css';

const FamilyTreePage = ({ data }) => {
  const chickens = data.allChicken.nodes;
  const families = data.allChickenFamily.nodes;

  return (
    <Layout>
      <div className="family-tree-page">
        <h1 className="family-tree-header">
          🐔 Chicken Family Tree 🐔
        </h1>
        <p className="family-tree-description">
          Explore the lineage of our beloved coop residents.
        </p>
        <FamilyTree chickens={chickens} families={families} />
      </div>
    </Layout>
  );
};

export const Head = () => (
  <>
    <title>Chicken Family Tree - CoopCast.tv</title>
    <meta name="description" content="Explore the genealogy of CoopCast chickens through an interactive family tree" />
  </>
);

export const query = graphql`
  query {
    allChicken {
      nodes {
        id
        gedcomId
        givenName
        surname
        fullName
        gender
        birthDate
        deathDate
        isDeceased
        breed
        notes
        parentFamilyId
        spouseFamilyIds
      }
    }
    allChickenFamily {
      nodes {
        id
        gedcomId
        husband
        wife
        childrenIds
      }
    }
  }
`;

export default FamilyTreePage;
