import React from 'react'
import { NavLink } from 'react-router-dom'

export function checkFetchStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new Error(response.statusText)
  error.response = response
  throw error
}

export function haveField(data, field) {
  return data.hasOwnProperty(field) && data[field] !== null && data[field] !== ''
}