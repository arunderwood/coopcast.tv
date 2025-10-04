import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import "./layout.css"

export default function Layout({ children }) {
    const data = useStaticQuery(graphql`
        query {
            allSitePage(
                filter: {
                    path: { regex: "/^/(?!dev-404-page|404)/" }
                }
                sort: { path: ASC }
            ) {
                nodes {
                    path
                }
            }
        }
    `)

    // Create friendly names for pages
    const getPageName = (path) => {
        if (path === '/') return 'Home'
        // Remove leading/trailing slashes and convert to title case
        return path
            .replace(/^\/|\/$/g, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const pages = data.allSitePage.nodes

    return (
        <div>
            <nav style={{
                backgroundColor: '#663399',
                padding: '1rem 0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {pages.map(({ path }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s ease',
                                fontWeight: '500'
                            }}
                            activeStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            {getPageName(path)}
                        </Link>
                    ))}
                </div>
            </nav>
            <div>{children}</div>
        </div>
    )
}
