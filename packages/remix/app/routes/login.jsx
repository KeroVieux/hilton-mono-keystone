import {Form} from "@remix-run/react"
import {useContext, useState} from 'react'
import {useNavigate} from "react-router-dom"
import {CurrentUserContext} from '../contexts.js'
import {useMutation, useLazyQuery, gql} from '@apollo/client/apollo-client.cjs'

export default function Login() {
	const navigate = useNavigate()
	const {setCurrentUser} = useContext(CurrentUserContext)
	const [form, setForm] = useState({
		email: 'dino@qq.com',
		phone: '',
		name: '',
		password: '',
	})
	const [errorInfo, setErrorInfo] = useState(null)
	const [userExist, setUserExist] = useState(true)
	const GET_USER = gql`
      query User($where: UserWhereUniqueInput!) {
          user(where: $where) {
              id
              name
              phone
              email
              isStaff
          }
      }
	`
	const CREATE_USER = gql`
      mutation CreateUser($data: UserCreateInput!) {
          createUser(data: $data) {
              id
              email
              phone
              name
          }
      }
	`
	const [queryUser] = useLazyQuery(GET_USER, {
		onCompleted(data) {
			if (data.user) {
				setCurrentUser(data.user)
				setUserExist(true)
				return navigate('/list')
			}
			return setUserExist(false)
		},
	})
	const [createUser] = useMutation(CREATE_USER, {
		onCompleted(data) {
			if (data.createUser) {
				setCurrentUser(data.createUser)
				setUserExist(true)
				return navigate('/me')
			}
		},
		onError({graphQLErrors, networkError}) {
			let msg = ''
			if (graphQLErrors) {
				graphQLErrors.forEach(({message}, index) => {
					msg += `[GraphQL error - ${index + 1}]: ${message}. `
				})
			}
			if (networkError) {
				msg += `[Network error]: ${networkError}`
			}
			setErrorInfo(msg)
		}
	})
	const login = () => {
		if (!userExist) {
			console.log('form', form)
			return createUser({
				variables: {
					data: form
				}
			})
		}
		queryUser({
			variables: {
				where: {
					email: form.email,
				}
			}
		})
	}
	return (
		<div className="p-3">
			{errorInfo}
			<div id="loginForm"
			     className="p-6 block w-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
				<Form>
					<div className="mb-6">
						<label htmlFor="email"
						       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
						<input type="email"
						       id="email"
						       name="email"
						       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						       placeholder="name@hilton.com"
						       value={form.email}
						       onChange={e => {
							       setForm({
								       ...form,
								       email: e.target.value
							       });
						       }}
						       required/>
					</div>
					<div className={userExist ? 'hidden' : 'mb-6'}>
						<label htmlFor="name"
						       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
						<input type="text"
						       id="name"
						       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						       placeholder="name"
						       value={form.name}
						       onChange={e => {
							       setForm({
								       ...form,
								       name: e.target.value
							       });
						       }}
						/>
					</div>
					<div className={userExist ? 'hidden' : 'mb-6'}>
						<label htmlFor="password"
						       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
						<input type="password"
						       id="password"
						       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						       value={form.password}
						       onChange={e => {
							       setForm({
								       ...form,
								       password: e.target.value
							       });
						       }}
						/>
					</div>
					<div className={userExist ? 'hidden' : 'mb-6'}>
						<label htmlFor="phone"
						       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Phone</label>
						<input type="text"
						       id="phone"
						       name="phone"
						       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						       value={form.phone}
						       onChange={e => {
							       setForm({
								       ...form,
								       phone: e.target.value
							       });
						       }}/>
					</div>
					<button onClick={login}
					        type="button"
					        className=" bg-yellow-400 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Next
					</button>
				</Form>
			</div>
		</div>

	)
}
