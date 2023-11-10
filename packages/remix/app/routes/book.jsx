import dayjs from 'dayjs'
import {useState, useContext} from 'react'
import {useNavigate, useSearchParams} from "react-router-dom"
import {useQuery, useLazyQuery, useMutation, gql} from '@apollo/client/apollo-client.cjs'
import {CurrentUserContext} from "../contexts.js"

export default function Book() {
	const navigate = useNavigate()
	const {currentUser} = useContext(CurrentUserContext)
	const [searchParams] = useSearchParams()
	if (!currentUser) {
		return navigate('/login')
	}
	const [restaurants, setRestaurants] = useState([])
	const [tables, setTables] = useState([])

	const [form, setForm] = useState({
		table: '',
		restaurant: '',
		expectedTime: dayjs().add(1, 'd').hour(11).minute(30).format('YYYY-MM-DDThh:mm'),
	})

	const [editId] = useState(searchParams.get('id'))

	const GET_RESTAURANTS = gql`
      query Restaurants {
          restaurants {
              id
              name
          }
      }
	`

	const GET_RESERVATION = gql`
      query Reservations($where: ReservationWhereUniqueInput!) {
          reservation(where: $where) {
              id
              expectedTime
              table {
                  id
                  name
              }
              restaurant {
                  id
                  name
              }
          }
      }
	`
	const GET_TABLES = gql`
      query Tables($where: TableWhereInput!) {
          tables(where: $where) {
              id
              name
          }
      }
	`
	const CREATE_RESERVATION = gql`
      mutation Mutation($data: ReservationCreateInput!) {
          createReservation(data: $data) {
              id
          }
      }
	`
	const UPDATE_RESERVATION = gql`
      mutation UpdateReservation($where: ReservationWhereUniqueInput!, $data: ReservationUpdateInput!) {
          updateReservation(where: $where, data: $data) {
              id
          }
      }
	`
	const [createReservation] = useMutation(CREATE_RESERVATION, {
		onCompleted() {
			navigate('/list')
		}
	})
	const [updateReservation] = useMutation(UPDATE_RESERVATION, {
		onCompleted() {
			navigate('/list')
		}
	})
	if (editId) {
		const reservationVariables = {
			where: {
				id: editId
			},
		}
		useQuery(GET_RESERVATION, {
			variables: reservationVariables,
			onCompleted(data) {
				setForm({
					restaurant: data.reservation.restaurant.id,
					table: data.reservation.table.id,
					expectedTime: dayjs(data.reservation.expectedTime).format('YYYY-MM-DDThh:mm')
				})
			},
		})
	}
	useQuery(GET_RESTAURANTS, {
		onCompleted(data) {
			setRestaurants(data.restaurants)
			setForm({
				...form,
				restaurant: data.restaurants[0].id,
			})
			queryTable({
				variables: {
					where: {
						restaurant: {
							id: {
								equals: data.restaurants[0].id,
							},
						}
					},
				},
			})
		},
	})
	const [queryTable] = useLazyQuery(GET_TABLES, {
		onCompleted(data) {
			setTables(data.tables)
			setForm({
				...form,
				table: data.tables[0].id,
			})
		}
	})
	const restaurantChanged = (id) => {
		setForm({
			...form,
			restaurant: id,
		})
		queryTable({
			variables: {
				where: {
					restaurant: {
						id: {
							equals: id,
						},
					}
				},
			},
		})
	}
	const handleBook = async () => {
		if (!editId) {
			return createReservation({
				variables: {
					data: {
						expectedTime: dayjs(form.expectedTime).toISOString(),
						guest: {
							connect: {
								id: currentUser.id
							}
						},
						restaurant: {
							connect: {
								id: form.restaurant
							}
						},
						table: {
							connect: {
								id: form.table
							}
						},
					}
				}
			})
		}
		return updateReservation({
			variables: {
				where: {
					id: editId
				},
				data: {
					expectedTime: dayjs(form.expectedTime).toISOString(),
					restaurant: {
						connect: {
							id: form.restaurant
						}
					},
					table: {
						connect: {
							id: form.table
						}
					}
				}
			}
		})
	}

	return (
		<div className="p-3">
			<form className="p-6 block max-w-sm bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
				<div className="mb-6">
					<label htmlFor="restaurant"
					       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Restaurant</label>
					<select onChange={(e) => {
						restaurantChanged(e.target.value)
					}}
					        id="restaurant"
					        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{restaurants.map((item) => {
							return (
								<option value={item.id}
								        key={item.id}>{item.name}</option>
							)
						})}
					</select>
				</div>
				<div className="mb-6">
					<label htmlFor="table"
					       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Table</label>
					<select onChange={(e) => {
						setForm({
							...form,
							table: e.target.value
						})
					}}
					        id="table"
					        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{tables.map((item) => {
							return (
								<option value={item.id}
								        key={item.id}>{item.name}</option>
							)
						})}
					</select>
				</div>
				<div className="mb-6">
					<label htmlFor=""
					       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Expect Time</label>
					<input type="datetime-local"
					       id="children"
					       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					       value={form?.expectedTime}
					       onChange={e => {
						       setForm({
							       ...form,
							       expectedTime: e.target.value
						       });
					       }}/>
					<div>
					</div>
				</div>
				<div className="text-center">
					<button type="button"
					        className=" bg-yellow-400 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
					        onClick={handleBook}>Book
					</button>
				</div>
			</form>

		</div>
	)
}
