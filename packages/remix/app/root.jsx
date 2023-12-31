import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	useLoaderData,
} from "@remix-run/react"
import { useNavigate } from "react-router-dom"
import {useState, useEffect} from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client/apollo-client.cjs'

import styles from "./tailwind.css"
import { CurrentUserContext } from './contexts.js'


export const links = () => [
	{ rel: "stylesheet", href: styles },
]

export async function loader() {
	return process.env.GRAPHQL_URL
}
export default function App() {
	const graphqlUrl = useLoaderData()
	const client = new ApolloClient({
		uri: graphqlUrl,
		cache: new InMemoryCache(),
	})
	const navigate = useNavigate()
	const [currentUser, setCurrentUser] = useState(null)
	useEffect(() => {
		navigate('/login')
	}, [])
	const linkTo = (path) => {
		navigate(path)
	}
	const providerValue = {currentUser, setCurrentUser}
	return (
		<html>
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<Meta />
			<Links />
			<title>Reservation App</title>
		</head>
		<body>
		<ApolloProvider client={client}>
			<CurrentUserContext.Provider value={providerValue}>
				<div id="main" style={{height: '100vh'}} className="w-full mx-auto relative overflow-y-scroll">
					<div className="fixed top-0 left-0 z-50 w-full h-12 text-center bg-yellow-400 items-center justify-center flex text-lg">
						Hilton Reservation
					</div>
					<div style={{paddingBottom: 50}}></div>
					<div className="max-w-sm mx-auto">
						<Outlet />
					</div>
					<div style={{paddingBottom: 60}}></div>
					<div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
						<div className="grid h-full max-w-lg grid-cols-3 mx-auto">
							<button onClick={() => {
								linkTo('/list')
							}} type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
								<svg className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
								</svg>
								<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Records</span>
							</button>
							<button onClick={() => {
								linkTo('/book')
							}} type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
								<svg className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
									<path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
									<path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
								</svg>
								<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Book</span>
							</button>
							<button onClick={() => {
								linkTo('/me')
							}} type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
								<svg className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
									<path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
								</svg>
								<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Me</span>
							</button>
						</div>
					</div>
				</div>
			</CurrentUserContext.Provider>
		</ApolloProvider>,
		<Scripts />
		<LiveReload />
		</body>
		</html>
	);
}
