import {useContext, useState} from 'react'
import dayjs from 'dayjs'
import {
	Link
} from "@remix-run/react"
import { useNavigate } from "react-router-dom"
import {useQuery, gql} from '@apollo/client/apollo-client.cjs'
import {CurrentUserContext} from "../contexts.js"

export default function List () {
	const {currentUser} = useContext(CurrentUserContext)
	const navigate = useNavigate()
	if (!currentUser) {
	  return navigate('/login')
	}
	let variables = {
		where: {},
		orderBy: [
			{
				expectedTime: 'desc'
			}
		],
	}
	if (!currentUser?.isStaff) {
		variables = {
			...variables,
			where: {
				guest: {
					id: {
						equals: currentUser.id,
					},
				}
			},
		}
	}
	const GET_RESERVATIONS = gql`
      query Reservations($where: ReservationWhereInput!, $orderBy: [ReservationOrderByInput!]!) {
          reservations(where: $where, orderBy: $orderBy) {
              expectedTime
              guest {
                  email
                  id
                  name
                  phone
              }
              id
              remark {
                  document
              }
              restaurant {
                  id
                  name
              }
              table {
                  id
                  name
                  content {
                      document
                  }
              }
              status
          }
      }
	`
	const { data: reservationRes } = useQuery(GET_RESERVATIONS, {
		variables,
	})
	const handleEdit = (id) => {
		navigate(`/book?id=${id}`)
	}
	if (!reservationRes?.reservations?.length) {
		return (
			<div className="p-3">
				<div className="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
					<div className="flex flex-col items-center pb-10 pt-6">
						<h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">You have no reservations.</h5>
						<div className="flex mt-4 space-x-3 md:mt-6">
							<Link to={'/book'}>
								<span className="inline-flex bg-yellow-400 items-center px-4 py-2 text-sm font-medium text-center text-gray-900 rounded-lg">Book</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
			)
	} else {
		return (
			<div className="p-3">
				{
					reservationRes?.reservations?.map((item, index) => {
						return (
							<div onClick={() => {
								handleEdit(item.id)
							}} key={index} className={`mb-3 bg-white relative block w-full border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`}>
								<div className="p-6">
									<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
										<span className="mr-2">{dayjs(item.expectTime).format('YYYY-MM-DD HH:mm')}</span>
									</h5>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										<span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{item.status}</span>
									</p>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										Name: {item.guest.name}
									</p>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										Phone: {item.guest.phone}
									</p>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										Email: {item.guest.email}
									</p>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										Restaurant: {item.restaurant.name}
									</p>
									<p className="font-normal text-gray-700 dark:text-gray-400">
										Table: {item.table.name}
									</p>
								</div>
							</div>
						)
					})
				}
			</div>
		)
	}
}
